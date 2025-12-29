import { describe, expect, it, vi } from "vitest";

const jsonMock = vi.hoisted(() =>
  vi.fn((body, init?: { status?: number }) => ({
    body,
    status: init?.status ?? 200,
  })),
);

vi.mock("next/server", () => ({
  NextResponse: {
    json: jsonMock,
  },
}));

const mockGetServerSession = vi.hoisted(() => vi.fn());

vi.mock("next-auth/next", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { isAgentOrAdmin, isSameOrganization, requireAuth, ticketScope, type AuthenticatedUser } from "./authorization";

describe("authorization helpers", () => {
  const requester: AuthenticatedUser = {
    id: "user-1",
    role: "REQUESTER",
    organizationId: "org-1",
  };

  const agent: AuthenticatedUser = {
    id: "user-2",
    role: "AGENT",
    organizationId: "org-2",
  };

  it("derives ticket scope for requester", () => {
    expect(ticketScope(requester)).toEqual({ requesterId: "user-1" });
  });

  it("derives ticket scope for agent/admin by organization", () => {
    expect(ticketScope(agent)).toEqual({ organizationId: "org-2" });
  });

  it("detects agent or admin roles", () => {
    expect(isAgentOrAdmin(agent)).toBe(true);
    expect(
      isAgentOrAdmin({
        id: "admin-1",
        role: "ADMIN",
        organizationId: "org-1",
      }),
    ).toBe(true);
    expect(isAgentOrAdmin(requester)).toBe(false);
  });

  it("checks organization match only when present", () => {
    expect(isSameOrganization(agent, "org-2")).toBe(true);
    expect(isSameOrganization(agent, "org-3")).toBe(false);
    expect(
      isSameOrganization(
        {
          id: "user-3",
          role: "AGENT",
          organizationId: undefined,
        },
        "org-3",
      ),
    ).toBe(false);
  });

  it("returns unauthorized response when session missing", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const result = await requireAuth();

    expect(result.ok).toBe(false);
    expect(result.response.status).toBe(401);
    expect(result.response.body).toEqual({ error: "Unauthorized" });
  });

  it("returns authenticated user when session present", async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: {
        id: "user-10",
        role: "ADMIN",
        organizationId: "org-9",
      },
    });

    const result = await requireAuth();

    expect(result.ok).toBe(true);
    expect(result.user).toEqual({
      id: "user-10",
      role: "ADMIN",
      organizationId: "org-9",
    });
  });
});
