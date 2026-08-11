import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

/** Mirror of src/lib/leads LeadSchema for unit verification without SSR imports. */
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
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

const good = {
  name: "Test Agent",
  email: "agent@example.com",
  phone: "5551234567",
  npn: "1234567",
  state: "TX",
  bookStage: "growing",
  consented: true,
  submittedAt: new Date().toISOString(),
  archetype: "illuminator",
  recruiterBrief: "brief",
  recruiterOpenWith: "open",
  recruiterProofAngle: "proof",
  recruiterAvoid: "avoid",
  companyWebsite: "",
};

test("accepts valid lead", () => {
  assert.equal(LeadSchema.safeParse(good).success, true);
});

test("rejects short NPN", () => {
  assert.equal(
    LeadSchema.safeParse({ ...good, npn: "12" }).success,
    false,
  );
});

test("rejects invalid email", () => {
  assert.equal(
    LeadSchema.safeParse({ ...good, email: "not-an-email" }).success,
    false,
  );
});

test("rejects missing consent", () => {
  assert.equal(
    LeadSchema.safeParse({ ...good, consented: false }).success,
    false,
  );
});

test("rejects honeypot fill", () => {
  assert.equal(
    LeadSchema.safeParse({ ...good, companyWebsite: "https://spam.example" })
      .success,
    false,
  );
});
