import { describe, expect, it } from "vitest";
import { FOUNDATION_POLICY, FoundationPolicySchema } from "../../src/contracts/index.js";

describe("immutable foundation policy", () => {
  it("contains only explicit disabled capabilities, DEMO execution and UNKNOWN quota", () => {
    expect(FOUNDATION_POLICY).toEqual({
      workersEnabled: false, paidApiEnabled: false, providerConnectionsEnabled: false,
      skillExecutionEnabled: false, executionMode: "demo", quotaStatus: "UNKNOWN",
    });
    expect(FoundationPolicySchema.safeParse(FOUNDATION_POLICY).success).toBe(true);
  });

  it.each([
    "workersEnabled", "paidApiEnabled", "providerConnectionsEnabled", "skillExecutionEnabled",
  ])("rejects enabling %s", (capability) => {
    expect(FoundationPolicySchema.safeParse({ ...FOUNDATION_POLICY, [capability]: true }).success).toBe(false);
  });

  it.each([
    { ...FOUNDATION_POLICY, executionMode: "real" },
    { ...FOUNDATION_POLICY, quotaStatus: "UNLIMITED" },
    { ...FOUNDATION_POLICY, paidApiEnabled: "false" },
    { ...FOUNDATION_POLICY, fallbackProvider: "token-billed" },
    { ...FOUNDATION_POLICY, quotaPercent: 100 },
    {},
  ])("rejects coercion, missing constants or unknown configuration %#", (input) => {
    expect(FoundationPolicySchema.safeParse(input).success).toBe(false);
  });

  it("freezes both the exported constant and separately parsed policies", () => {
    const parsed = FoundationPolicySchema.parse(FOUNDATION_POLICY);
    expect(Object.isFrozen(FOUNDATION_POLICY)).toBe(true);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Reflect.set(parsed, "paidApiEnabled", true)).toBe(false);
    expect(Reflect.set(FOUNDATION_POLICY, "workersEnabled", true)).toBe(false);
    expect(parsed.paidApiEnabled).toBe(false);
    expect(FOUNDATION_POLICY.workersEnabled).toBe(false);
  });
});
