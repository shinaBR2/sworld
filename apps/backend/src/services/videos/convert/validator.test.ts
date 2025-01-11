import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { verifySignature } from "./validator";

const mockWebhookSecret = "test-secret";

vi.mock("src/utils/envConfig", () => ({
  envConfig: {
    webhookSignature: "test-secret",
  },
}));

describe("verifySignature", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return true when signature matches webhook secret", () => {
    expect(verifySignature(mockWebhookSecret)).toBe(true);
  });

  it("should return false when signature does not match webhook secret", () => {
    expect(verifySignature("wrong-secret")).toBe(false);
  });
});
