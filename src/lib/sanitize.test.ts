import { describe, expect, it } from "vitest";

import { sanitizeMarkdown } from "./sanitize";

describe("sanitizeMarkdown", () => {
  it("removes script blocks", () => {
    const input = "Hello <script>alert('bad')</script> world";
    const sanitized = sanitizeMarkdown(input);

    expect(sanitized).toBe("Hello  world");
  });

  it("strips event handlers and javascript urls", () => {
    const input = '<img src="javascript:alert(1)" onerror="alert(2)" />';
    const sanitized = sanitizeMarkdown(input);

    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("javascript:");
  });
});
