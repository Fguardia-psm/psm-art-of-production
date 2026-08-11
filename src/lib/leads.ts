import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().regex(/^\d{10,15}$/),
  npn: z.string().regex(/^\d{5,10}$/),
  state: z.string().trim().min(2).max(2),
  bookStage: z.string().trim().min(1).max(40),
  focus: z.string().trim().max(200).optional(),
  consented: z.literal(true),
  submittedAt: z.string().min(1).max(40),
  archetype: z.string().trim().min(1).max(40),
  recruiterBrief: z.string().min(1).max(12000),
  recruiterOpenWith: z.string().min(1).max(500),
  recruiterProofAngle: z.string().min(1).max(500),
  recruiterAvoid: z.string().min(1).max(500),
  nineFacesScore: z.number().int().min(0).max(9).optional(),
  chapterResults: z.record(z.string(), z.string()).optional(),
  source: z.string().max(80).optional(),
  /** Bot trap — must be empty/absent */
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type LeadPayload = z.infer<typeof LeadSchema>;

/** Per-instance abuse throttle (serverless: soft protection, not global). */
const hitBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 8;

function clientKey(): string {
  try {
    const ip = getRequestIP({ xForwardedFor: true });
    if (ip) return ip.slice(0, 80);
  } catch {
    /* fall through */
  }
  try {
    const xf = getRequestHeader("x-forwarded-for");
    if (xf) return xf.split(",")[0]!.trim().slice(0, 80);
  } catch {
    /* not in request context */
  }
  return "unknown";
}

function rateLimit(
  key: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const row = hitBuckets.get(key);
  if (!row || now >= row.resetAt) {
    hitBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (row.count >= RATE_MAX) {
    return { ok: false, retryAfterSec: Math.ceil((row.resetAt - now) / 1000) };
  }
  row.count += 1;
  return { ok: true };
}

function redactEmail(email: string) {
  const [u, d] = email.split("@");
  if (!u || !d) return "[redacted]";
  return `${u.slice(0, 1)}***@${d}`;
}

function redactNpn(npn: string) {
  if (npn.length <= 4) return "****";
  return `${"*".repeat(npn.length - 4)}${npn.slice(-4)}`;
}

function isProdLike() {
  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    process.env.REQUIRE_LEAD_WEBHOOK === "1"
  );
}

async function deliverWebhook(payload: Record<string, unknown>) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { delivered: false as const, reason: "no_webhook" as const };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-source": "art-of-production",
      },
      body: JSON.stringify(payload),
    });
    return {
      delivered: res.ok,
      status: res.status,
    };
  } catch (err) {
    console.warn(
      "[leads] webhook failed:",
      err instanceof Error ? err.message : "error",
    );
    return { delivered: false as const, reason: "webhook_error" as const };
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => LeadSchema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot: bots fill hidden companyWebsite
    if (data.companyWebsite) {
      return {
        ok: true as const,
        archetype: data.archetype,
        durable: true as const,
        webhook: { delivered: true as const, status: 204 },
        fileOk: false,
        opsNote: "honeypot",
      };
    }

    const submitted = Date.parse(data.submittedAt);
    if (!Number.isFinite(submitted)) {
      throw new Error("Invalid submission timestamp");
    }
    const skew = Date.now() - submitted;
    if (skew > 2 * 60 * 60 * 1000 || skew < -5 * 60 * 1000) {
      throw new Error("Submission expired — refresh and try again");
    }

    const rl = rateLimit(clientKey());
    if (!rl.ok) {
      throw new Error(
        `Too many submissions. Try again in ${rl.retryAfterSec}s.`,
      );
    }

    const { companyWebsite: _hp, ...clean } = data;
    const record = {
      ...clean,
      kind: "art-of-production-lead",
      source: data.source ?? "art-of-production",
      recruiterContext: {
        archetype: data.archetype,
        openWith: data.recruiterOpenWith,
        proofAngle: data.recruiterProofAngle,
        avoid: data.recruiterAvoid,
        nineFacesScore: data.nineFacesScore,
        brief: data.recruiterBrief,
      },
    };

    let fileOk = false;
    try {
      const dir = path.join(process.cwd(), "data");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.jsonl");
      await appendFile(file, `${JSON.stringify(record)}\n`, "utf8");

      const briefFile = path.join(dir, "recruiter-briefs.jsonl");
      await appendFile(
        briefFile,
        `${JSON.stringify({
          submittedAt: data.submittedAt,
          email: data.email,
          npn: data.npn,
          archetype: data.archetype,
          brief: data.recruiterBrief,
        })}\n`,
        "utf8",
      );
      fileOk = true;
    } catch {
      // Expected on Vercel serverless (ephemeral FS)
    }

    const webhook = await deliverWebhook(record);
    const durable = Boolean(webhook.delivered || fileOk);

    // Production without webhook = CRM black hole. Fail closed so kit unlock
    // does not imply "we got your NPN" when we didn't keep it.
    if (!durable && isProdLike() && process.env.ALLOW_EPHEMERAL_LEADS !== "1") {
      console.error("[leads] REJECTED: no durable sink", {
        email: redactEmail(data.email),
        npn: redactNpn(data.npn),
        archetype: data.archetype,
        webhookReason: "reason" in webhook ? webhook.reason : webhook.status,
      });
      throw new Error(
        "Lead capture is temporarily unavailable. Please try again later or contact your PSM field leader directly.",
      );
    }

    console.info("[leads] captured", {
      email: redactEmail(data.email),
      npn: redactNpn(data.npn),
      state: data.state,
      archetype: data.archetype,
      bookStage: data.bookStage,
      fileOk,
      webhookDelivered: webhook.delivered,
      durable,
    });

    return {
      ok: true as const,
      archetype: data.archetype,
      webhook,
      fileOk,
      durable,
      opsNote: webhook.delivered
        ? undefined
        : fileOk
          ? "stored_local_only"
          : "set_LEAD_WEBHOOK_URL",
    };
  });
