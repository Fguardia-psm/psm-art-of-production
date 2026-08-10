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
};

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: LeadPayload) => data)
  .handler(async ({ data }) => {
    // Best-effort persist for preview/demo; never block the unlock UX.
    try {
      const dir = path.join(process.cwd(), "data");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, "leads.jsonl");
      await appendFile(file, `${JSON.stringify(data)}\n`, "utf8");
    } catch (err) {
      console.warn("[leads] persist skipped:", err);
    }
    console.info("[leads] captured", {
      email: data.email,
      npn: data.npn,
      state: data.state,
      archetype: data.archetype,
      bookStage: data.bookStage,
    });
    return { ok: true as const };
  });
