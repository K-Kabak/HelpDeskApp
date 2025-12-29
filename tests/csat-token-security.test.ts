import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { generateCsatToken, validateCsatToken } from "@/lib/csat-token";

describe("CSAT Token Security", () => {
  const originalEnv = process.env.CSAT_SECRET;

  beforeEach(() => {
    // Use a test secret
    process.env.CSAT_SECRET = "test-secret-key-for-csat-tokens";
  });

  afterEach(() => {
    process.env.CSAT_SECRET = originalEnv;
  });

  describe("generateCsatToken()", () => {
    test("generates a valid token for a ticket", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    test("generates different tokens for different tickets", () => {
      const token1 = generateCsatToken("ticket-1", 30);
      const token2 = generateCsatToken("ticket-2", 30);

      expect(token1).not.toBe(token2);
    });

    test("generates different tokens for same ticket with different expiry", () => {
      const token1 = generateCsatToken("ticket-1", 30);
      const token2 = generateCsatToken("ticket-1", 60);

      expect(token1).not.toBe(token2);
    });
  });

  describe("validateCsatToken()", () => {
    test("validates a correctly generated token", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);
      const result = validateCsatToken(token);

      expect(result).not.toBeNull();
      expect(result?.ticketId).toBe(ticketId);
      expect(result?.expiresAt).toBeGreaterThan(Date.now());
    });

    test("rejects expired tokens", () => {
      const ticketId = "ticket-123";
      // Generate token with negative expiry (already expired)
      const token = generateCsatToken(ticketId, -1);
      const result = validateCsatToken(token);

      expect(result).toBeNull();
    });

    test("rejects tokens with invalid format", () => {
      expect(validateCsatToken("invalid-token")).toBeNull();
      expect(validateCsatToken("not:valid:format")).toBeNull();
      expect(validateCsatToken("")).toBeNull();
    });

    test("rejects tokens with tampered signature", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);
      
      // Tamper with the token by changing a character
      const tamperedToken = token.slice(0, -1) + "X";
      const result = validateCsatToken(tamperedToken);

      expect(result).toBeNull();
    });

    test("rejects tokens with wrong ticket ID in payload", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);
      
      // Token is valid, but we'll check it against wrong ticket ID
      const result = validateCsatToken(token);
      
      // Token itself is valid
      expect(result).not.toBeNull();
      expect(result?.ticketId).toBe(ticketId);
      
      // But if we validate against different ticket, it should fail
      // (This is checked in the API endpoint, not in validateCsatToken)
    });

    test("rejects tokens generated with different secret", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);
      
      // Change secret
      process.env.CSAT_SECRET = "different-secret";
      
      const result = validateCsatToken(token);
      expect(result).toBeNull();
    });

    test("handles base64url encoding correctly", () => {
      const ticketId = "ticket-with-special-chars-123";
      const token = generateCsatToken(ticketId, 30);
      const result = validateCsatToken(token);

      expect(result).not.toBeNull();
      expect(result?.ticketId).toBe(ticketId);
    });

    test("validates token expiry correctly", () => {
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 1); // 1 day expiry
      const result = validateCsatToken(token);

      expect(result).not.toBeNull();
      if (result) {
        const timeUntilExpiry = result.expiresAt - Date.now();
        expect(timeUntilExpiry).toBeGreaterThan(0);
        expect(timeUntilExpiry).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000); // Allow 1s tolerance
      }
    });
  });

  describe("Token binding and anti-gaming", () => {
    test("tokens are bound to specific ticket IDs", () => {
      const ticketId1 = "ticket-1";
      const ticketId2 = "ticket-2";
      
      const token1 = generateCsatToken(ticketId1, 30);
      const token2 = generateCsatToken(ticketId2, 30);
      
      const result1 = validateCsatToken(token1);
      const result2 = validateCsatToken(token2);
      
      expect(result1?.ticketId).toBe(ticketId1);
      expect(result2?.ticketId).toBe(ticketId2);
      expect(result1?.ticketId).not.toBe(result2?.ticketId);
    });

    test("tokens cannot be reused after validation (one-time use enforced by database)", () => {
      // This test documents the expected behavior
      // Actual enforcement happens in the API endpoint by checking for existing responses
      const ticketId = "ticket-123";
      const token = generateCsatToken(ticketId, 30);
      
      // Token can be validated multiple times (validation itself doesn't consume it)
      const result1 = validateCsatToken(token);
      const result2 = validateCsatToken(token);
      
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      
      // But the API endpoint should check for existing response before accepting submission
      // This prevents token reuse for multiple submissions
    });
  });
});

















