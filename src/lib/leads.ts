import { createServerFn } from "@tanstack/react-start";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  npn: string;
  state: string;
  bookStage: string;
  focus?: string;
  consented: boolean;
  submittedAt: string;
  archetype: string;
  /** Full recruiter brief — attached for CRM / Zapier handoff */
  recruiterBrief: string;
  recruiterOpenWith: string;
  recruiterProofAngle: string;
  recruiterAvoid: string;
  nineFacesScore?: number;
  chapterResults?: Record<string, string>;
  source?: string;
};

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
  .validator((data: LeadPayload) => data)
  .handler(async ({ data }) => {
    const record = {
      ...data,
      kind: "art-of-production-lead",
      source: data.source ?? "art-of-production",
      // Explicit CRM-friendly fields
      recruiterContext: {
        archetype: data.archetype,
        openWith: data.recruiterOpenWith,
        proofAngle: data.recruiterProofAngle,
        avoid: data.recruiterAvoid,
        nineFacesScore: data.nineFacesScore,
        brief: data.recruiterBrief,
      },
    };

    try {
      const dir = path.join(process.cwd(), "data");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.jsonl");
      await appendFile(file, `${JSON.stringify(record)}\n`, "utf8");

      // Also store a standalone brief file for ops paste into CRM notes
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
    } catch (err) {
      console.warn("[leads] persist skipped:", err);
    }

    const webhook = await deliverWebhook(record);

    console.info("[leads] captured with recruiter brief", {
      email: data.email,
      npn: data.npn,
      state: data.state,
      archetype: data.archetype,
      bookStage: data.bookStage,
      openWith: data.recruiterOpenWith,
      webhook,
    });

    return {
      ok: true as const,
      archetype: data.archetype,
      webhook,
    };
  });
