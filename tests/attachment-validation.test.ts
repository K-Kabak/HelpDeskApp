import { describe, expect, it } from "vitest";
import { isMimeAllowed, isSizeAllowed, uploadRequestSchema } from "@/lib/attachment-validation";

describe("uploadRequestSchema", () => {
  it("defaults visibility to public", () => {
    const parsed = uploadRequestSchema.parse({
      fileName: "file.png",
      mimeType: "image/png",
      sizeBytes: 1000,
    });

    expect(parsed.visibility).toBe("public");
  });
});

describe("isMimeAllowed", () => {
  it("allows exact match", () => {
    expect(isMimeAllowed("image/png", ["image/png", "image/jpeg"])).toBe(true);
  });

  it("supports wildcards", () => {
    expect(isMimeAllowed("image/svg+xml", ["image/*"])).toBe(true);
    expect(isMimeAllowed("application/json", ["image/*"])).toBe(false);
  });
});

describe("isSizeAllowed", () => {
  it("rejects sizes above max", () => {
    expect(isSizeAllowed(5, 4)).toBe(false);
  });

  it("accepts sizes within limit", () => {
    expect(isSizeAllowed(3, 4)).toBe(true);
  });
});
