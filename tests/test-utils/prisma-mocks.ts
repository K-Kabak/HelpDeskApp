/**
 * Mock Prisma structure type.
 * Use this type for typing your mock Prisma instances.
 */
export type MockPrisma = {
  ticket: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
  };
  slaPolicy: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
  };
  user: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
  };
  team: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
  };
  auditEvent: {
    create: ReturnType<typeof import("vitest").vi.fn>;
  };
  comment: {
    create: ReturnType<typeof import("vitest").vi.fn>;
  };
  automationRule: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
  };
};


/**
 * Resets all mocks in a Prisma mock object.
 * Useful for beforeEach hooks.
 */
export function resetMockPrisma(mockPrisma: MockPrisma) {
  if (!mockPrisma) return;
  Object.values(mockPrisma).forEach((group) => {
    if (typeof group === "object" && group !== null) {
      Object.values(group).forEach((fn) => {
        if (typeof fn === "function" && "mockReset" in fn) {
          (fn as { mockReset: () => void }).mockReset();
        }
      });
    }
  });
}

