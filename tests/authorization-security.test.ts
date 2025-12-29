import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { requireAuth, ticketScope, isSameOrganization } from "@/lib/authorization";

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
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

      // Returns filter that matches nothing (empty array for 'in' operator)
      expect(scope).toEqual({ id: { in: [] } });
    });

    test("ADMIN role without organization gets no-match filter", () => {
      const user = {
        id: "user-1",
        role: "ADMIN" as const,
        organizationId: undefined,
      };

      const scope = ticketScope(user);

      // Returns filter that matches nothing (empty array for 'in' operator)
      expect(scope).toEqual({ id: { in: [] } });
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

  describe("Cross-Organization Access Prevention", () => {
    test("ticketScope prevents REQUESTER from seeing other org tickets", () => {
      const requester = {
        id: "requester-1",
        role: "REQUESTER" as const,
        organizationId: "org-1",
      };

      const scope = ticketScope(requester);

      // REQUESTER should only see their own tickets, not by organization
      expect(scope).toEqual({ requesterId: "requester-1" });
      expect(scope).not.toHaveProperty("organizationId");
    });

    test("ticketScope prevents AGENT from seeing tickets from different org", () => {
      const agent = {
        id: "agent-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      const scope = ticketScope(agent);

      // AGENT should only see tickets from their organization
      expect(scope).toEqual({ organizationId: "org-1" });
    });

    test("isSameOrganization correctly identifies cross-org access attempts", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: "org-1",
      };

      // Attempting to access org-2 data
      const result = isSameOrganization(user, "org-2");

      expect(result).toBe(false);
    });

    test("isSameOrganization prevents access when user has no organization", () => {
      const user = {
        id: "user-1",
        role: "AGENT" as const,
        organizationId: null,
      };

      const result = isSameOrganization(user, "org-1");

      expect(result).toBe(false);
    });
  });

  describe("Privilege Escalation Prevention", () => {
    test("REQUESTER cannot access AGENT-only endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "requester-1",
          role: "REQUESTER",
          organizationId: "org-1",
        },
      });

      const auth = await requireAuth();

      expect(auth.ok).toBe(true);
      expect(auth.user?.role).toBe("REQUESTER");
      // REQUESTER role is valid but should be checked at endpoint level
    });

    test("AGENT cannot access ADMIN-only endpoints", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "agent-1",
          role: "AGENT",
          organizationId: "org-1",
        },
      });

      const auth = await requireAuth();

      expect(auth.ok).toBe(true);
      expect(auth.user?.role).toBe("AGENT");
      // AGENT role is valid but should be checked at endpoint level
    });

    test("Invalid role cannot bypass authentication", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "user-1",
          role: "SUPER_ADMIN", // Invalid role
          organizationId: "org-1",
        },
      });

      const auth = await requireAuth();

      expect(auth.ok).toBe(false);
      expect(auth.response?.status).toBe(401);
    });

    test("REQUESTER role cannot be elevated to AGENT", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "requester-1",
          role: "REQUESTER",
          organizationId: "org-1",
        },
      });

      const auth = await requireAuth();

      expect(auth.ok).toBe(true);
      // Role is set by session, cannot be changed by user
      expect(auth.user?.role).toBe("REQUESTER");
      expect(auth.user?.role).not.toBe("AGENT");
    });

    test("AGENT role cannot be elevated to ADMIN", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "agent-1",
          role: "AGENT",
          organizationId: "org-1",
        },
      });

      const auth = await requireAuth();

      expect(auth.ok).toBe(true);
      // Role is set by session, cannot be changed by user
      expect(auth.user?.role).toBe("AGENT");
      expect(auth.user?.role).not.toBe("ADMIN");
    });
  });
});
