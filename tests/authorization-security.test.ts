import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { requireAuth, ticketScope, isSameOrganization } from "@/lib/authorization";
import { getServerSession } from "next-auth/next";

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

const mockAuthOptions = {};
vi.mock("@/lib/auth", () => ({
  authOptions: mockAuthOptions,
}));

beforeEach(() => {
  mockGetServerSession.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Authorization Security Tests", () => {
  describe("requireAuth()", () => {
    test("rejects when session is null", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("rejects when session.user is null", async () => {
      mockGetServerSession.mockResolvedValue({});

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("rejects when role is null", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: null,
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("rejects when role is undefined", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: undefined,
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("rejects when role is invalid", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "INVALID_ROLE",
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("rejects when role is empty string", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "",
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      expect(result.response?.status).toBe(401);
    });

    test("accepts valid REQUESTER role", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "REQUESTER",
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(true);
      expect(result.user).toEqual({
        id: "user-1",
        role: "REQUESTER",
        organizationId: "org-1",
      });
    });

    test("accepts valid AGENT role", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "AGENT",
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(true);
      expect(result.user).toEqual({
        id: "user-1",
        role: "AGENT",
        organizationId: "org-1",
      });
    });

    test("accepts valid ADMIN role", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "ADMIN",
          organizationId: "org-1",
        },
      });

      const result = await requireAuth();

      expect(result.ok).toBe(true);
      expect(result.user).toEqual({
        id: "user-1",
        role: "ADMIN",
        organizationId: "org-1",
      });
    });
  });

  describe("ticketScope()", () => {
    test("REQUESTER role gets requesterId filter", () => {
      const user = {
        id: "user-1",
        role: "REQUESTER" as const,
        organizationId: "org-1",
      };

      const scope = ticketScope(user);

      expect(scope).toEqual({ requesterId: "user-1" });
    });

    test("AGENT role with organization gets organizationId filter", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      const scope = ticketScope(user);

      expect(scope).toEqual({ organizationId: "org-1" });
    });

    test("ADMIN role with organization gets organizationId filter", () => {
      const user = {
        id: "user-1",
        role: "ADMIN" as const,
        organizationId: "org-1",
      };

      const scope = ticketScope(user);

      expect(scope).toEqual({ organizationId: "org-1" });
    });

    test("AGENT role without organization gets no-match filter", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: null,
      };

      const scope = ticketScope(user);

      expect(scope).toEqual({ id: null });
    });

    test("ADMIN role without organization gets no-match filter", () => {
      const user = {
        id: "user-1",
        role: "ADMIN" as const,
        organizationId: undefined,
      };

      const scope = ticketScope(user);

      expect(scope).toEqual({ id: null });
    });
  });

  describe("isSameOrganization()", () => {
    test("returns true when organization IDs match", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      const result = isSameOrganization(user, "org-1");

      expect(result).toBe(true);
    });

    test("returns false when organization IDs don't match", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      const result = isSameOrganization(user, "org-2");

      expect(result).toBe(false);
    });

    test("returns false when user has null organizationId", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: null,
      };

      const result = isSameOrganization(user, "org-1");

      expect(result).toBe(false);
    });

    test("returns false when user has undefined organizationId", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: undefined,
      };

      const result = isSameOrganization(user, "org-1");

      expect(result).toBe(false);
    });

    test("returns false when target organizationId is different", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      const result = isSameOrganization(user, "different-org");

      expect(result).toBe(false);
    });
  });
});
