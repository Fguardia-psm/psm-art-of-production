import { createServerFn } from "@tanstack/react-start";
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
});

export type LeadPayload = z.infer<typeof LeadSchema>;

async function deliverWebhook(payload: LeadPayload & { kind: string }) {
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
    console.warn("[leads] webhook failed:", err);
    return { delivered: false as const, reason: "webhook_error" as const };
  }
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => LeadSchema.parse(data))
  .handler(async ({ data }) => {
    const record = {
      ...data,
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
    } catch (err) {
      // Expected on Vercel serverless (ephemeral FS) — webhook is the real path
      console.warn("[leads] file persist skipped:", err);
    }

    const webhook = await deliverWebhook(record);

    console.info("[leads] captured with recruiter brief", {
      email: data.email,
      npn: data.npn,
      state: data.state,
      archetype: data.archetype,
      bookStage: data.bookStage,
      openWith: data.recruiterOpenWith,
      fileOk,
      webhook,
    });

    // Client still unlocks; ops must set LEAD_WEBHOOK_URL on Vercel for durable CRM
    return {
      ok: true as const,
      archetype: data.archetype,
      webhook,
      fileOk,
      durable: Boolean(webhook.delivered || fileOk),
      opsNote: webhook.delivered
        ? undefined
        : fileOk
          ? "stored_local_only"
          : "set_LEAD_WEBHOOK_URL",
    };
  });
