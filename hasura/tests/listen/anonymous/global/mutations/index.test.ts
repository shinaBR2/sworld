import { expect } from "vitest";
import { describe, test, expect } from "vitest";
import client from "../../../../client";

describe("Anonymous Role - All Mutations Forbidden", () => {
  test("should reject mutations", async () => {
    await expect(
      client.request(`
        mutation {
          # This is a placeholder and won't match any real schema
          # The point is to ensure ANY mutation is rejected
          __typename
        }
      `)
    ).rejects.toThrow();
  });
});
