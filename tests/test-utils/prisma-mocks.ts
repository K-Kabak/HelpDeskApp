/**
 * Mock Prisma structure type.
 * Use this type for typing your mock Prisma instances.
 * 
 * This type includes commonly used Prisma models and their methods.
 * Add additional models as needed for your tests.
 */
export type MockPrisma = {
  ticket: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
    groupBy: ReturnType<typeof import("vitest").vi.fn>;
    count: ReturnType<typeof import("vitest").vi.fn>;
  };
  slaPolicy: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
    delete: ReturnType<typeof import("vitest").vi.fn>;
  };
  user: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
    delete: ReturnType<typeof import("vitest").vi.fn>;
  };
  team: {
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
    delete: ReturnType<typeof import("vitest").vi.fn>;
  };
  auditEvent: {
    create: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
  };
  comment: {
    create: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
  };
  automationRule: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    findFirst: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
    delete: ReturnType<typeof import("vitest").vi.fn>;
  };
  category: {
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
  };
  tag: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
  };
  attachment: {
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    delete: ReturnType<typeof import("vitest").vi.fn>;
  };
  notificationPreference: {
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
  };
  inAppNotification: {
    create: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    update: ReturnType<typeof import("vitest").vi.fn>;
  };
  csatResponse: {
    findUnique: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
  };
  adminAudit: {
    create: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
  };
  teamMembership: {
    createMany: ReturnType<typeof import("vitest").vi.fn>;
    deleteMany: ReturnType<typeof import("vitest").vi.fn>;
    findMany: ReturnType<typeof import("vitest").vi.fn>;
  };
  slaEscalationLevel: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
  };
  $transaction: ReturnType<typeof import("vitest").vi.fn>;
};

/**
 * Resets all mocks in a Prisma mock object.
 * Useful for beforeEach hooks to ensure test isolation.
 * 
 * @param mockPrisma - The mock Prisma instance to reset
 * 
 * @example
 * ```typescript
 * beforeEach(() => {
 *   resetMockPrisma(mockPrisma);
 * });
 * ```
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
    } else if (typeof group === "function" && "mockReset" in group) {
      (group as { mockReset: () => void }).mockReset();
    }
  });
}

/**
 * Creates a minimal mock Prisma instance with all common models.
 * Useful as a starting point for tests that need multiple models.
 * 
 * Note: This function should be used with vi.hoisted() to ensure
 * mocks are available before module imports.
 * 
 * @param vi - The vitest vi object for creating mocks
 * @returns A mock Prisma instance with all methods mocked
 * 
 * @example
 * ```typescript
 * const mockPrisma = vi.hoisted(() => createMockPrisma(vi));
 * vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
 * ```
 */
export function createMockPrisma(vi: typeof import("vitest").vi): MockPrisma {
  return {
    ticket: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    slaPolicy: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    team: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    automationRule: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    attachment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notificationPreference: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    inAppNotification: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    csatResponse: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    adminAudit: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    teamMembership: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    slaEscalationLevel: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

