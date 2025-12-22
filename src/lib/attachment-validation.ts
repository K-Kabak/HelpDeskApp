import { z } from "zod";

const defaultAllowed = (process.env.ATTACH_ALLOWED_MIME ?? "image/png,image/jpeg,application/pdf,text/plain")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const defaultMaxBytes = Number.parseInt(process.env.ATTACH_MAX_BYTES ?? "26214400", 10);

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  visibility: z.enum(["public", "internal"]).default("public"),
});

export function isMimeAllowed(mimeType: string, allowed = defaultAllowed) {
  return allowed.some((pattern) => {
    if (pattern === "*/*") return true;
    if (pattern.endsWith("/*")) {
      const prefix = pattern.split("/")[0];
      return mimeType.startsWith(`${prefix}/`);
    }
    return pattern === mimeType;
  });
}

export function isSizeAllowed(sizeBytes: number, maxBytes = defaultMaxBytes) {
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}
