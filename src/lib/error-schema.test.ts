import { describe, expect, it } from "vitest";

import { buildErrorResponse, errorResponseSchema, validateErrorResponse } from "./error-schema";

describe("error schema", () => {
  it("validates a standard error response shape", () => {
    const payload = { error: "Bad Request", code: "BAD_REQUEST", details: { field: "title" } };
    const parsed = errorResponseSchema.safeParse(payload);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(payload);
    }
  });

  it("builds an error response object", () => {
    const response = buildErrorResponse("Unauthorized", "UNAUTH", { reason: "no session" });

    expect(response).toEqual({
      error: "Unauthorized",
      code: "UNAUTH",
      details: { reason: "no session" },
    });
    expect(validateErrorResponse(response).success).toBe(true);
  });

  it("fails validation when error message missing", () => {
    const result = validateErrorResponse({ code: "NO_ERROR_FIELD" });

    expect(result.success).toBe(false);
  });
});
