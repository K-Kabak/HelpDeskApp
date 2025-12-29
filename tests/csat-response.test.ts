import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tickets/[id]/csat/route";
import { Role } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  ticket: {
    findUnique: vi.fn(),
  },
  csatResponse: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

const mockRequireAuth = vi.hoisted(() => vi.fn());
const mockIsSameOrganization = vi.hoisted(() => vi.fn(() => true));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/authorization", () => ({
  requireAuth: mockRequireAuth,
  isSameOrganization: mockIsSameOrganization,
}));
vi.mock("@/lib/logger", () => ({
  createRequestLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe("POST /api/tickets/[id]/csat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSameOrganization.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: new Response(null, { status: 401 }),
    });

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when ticket not found", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 403 when requester is not ticket owner", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "u2",
      organizationId: "org1",
    });

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(403);
  });

  it("returns 409 when response already exists", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "u1",
      organizationId: "org1",
    });
    mockPrisma.csatResponse.findUnique.mockResolvedValue({
      id: "r1",
      ticketId: "t1",
      score: 4,
    });

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already submitted");
  });

  it("returns 400 when score is out of range", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "u1",
      organizationId: "org1",
    });
    mockPrisma.csatResponse.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 6 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(400);
  });

  it("creates CSAT response successfully", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "u1",
      organizationId: "org1",
    });
    mockPrisma.csatResponse.findUnique.mockResolvedValue(null);
    mockPrisma.csatResponse.create.mockResolvedValue({
      id: "r1",
      ticketId: "t1",
      score: 5,
      comment: "Great service",
      createdAt: new Date(),
    });

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 5, comment: "Great service" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.response.score).toBe(5);
    expect(body.response.comment).toBe("Great service");
    expect(mockPrisma.csatResponse.create).toHaveBeenCalledWith({
      data: {
        ticketId: "t1",
        score: 5,
        comment: "Great service",
      },
    });
  });

  it("creates CSAT response without comment", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: { id: "u1", organizationId: "org1", role: Role.REQUESTER },
    });
    mockPrisma.ticket.findUnique.mockResolvedValue({
      id: "t1",
      requesterId: "u1",
      organizationId: "org1",
    });
    mockPrisma.csatResponse.findUnique.mockResolvedValue(null);
    mockPrisma.csatResponse.create.mockResolvedValue({
      id: "r1",
      ticketId: "t1",
      score: 3,
      comment: null,
      createdAt: new Date(),
    });

    const req = new Request("http://localhost/api/tickets/t1/csat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: 3 }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "t1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.response.score).toBe(3);
    expect(body.response.comment).toBeNull();
  });
});

