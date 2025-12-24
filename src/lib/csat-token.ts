import { createHmac, timingSafeEqual } from "crypto";

const CSAT_SECRET = process.env.CSAT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production";

/**
 * Generate a signed token for CSAT request.
 * Token format: base64(ticketId:expiresAt:signature)
 * Signature: HMAC-SHA256(ticketId:expiresAt, secret)
 */
export function generateCsatToken(ticketId: string, expiresInDays: number = 30): string {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const payload = `${ticketId}:${expiresAt}`;
  
  const signature = createHmac("sha256", CSAT_SECRET)
    .update(payload)
    .digest("base64url");
  
  const token = `${payload}:${signature}`;
  return Buffer.from(token).toString("base64url");
}

/**
 * Validate and parse a CSAT token.
 * Returns ticketId and expiresAt if valid, null otherwise.
 */
export function validateCsatToken(token: string): { ticketId: string; expiresAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [ticketId, expiresAtStr, signature] = decoded.split(":");
    
    if (!ticketId || !expiresAtStr || !signature) {
      return null;
    }
    
    const expiresAt = Number.parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt)) {
      return null;
    }
    
    // Check expiry
    if (Date.now() > expiresAt) {
      return null;
    }
    
    // Verify signature
    const payload = `${ticketId}:${expiresAt}`;
    const expectedSignature = createHmac("sha256", CSAT_SECRET)
      .update(payload)
      .digest("base64url");
    
    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }
    
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }
    
    return { ticketId, expiresAt };
  } catch {
    return null;
  }
}



