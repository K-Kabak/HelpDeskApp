import { describe, expect, it, vi } from "vitest";

import { avFixtures, runAttachmentScan, type AvScanResult } from "./av-scanner";

const updateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    attachment: {
      update: updateMock,
    },
  },
}));

describe("runAttachmentScan", () => {
  it("persists clean status and fixtures metadata", async () => {
    const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
      status: "clean",
    });

    const result = await runAttachmentScan("att-1", avFixtures.clean, scanner);

    expect(result).toEqual({ status: "clean" });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "att-1" },
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          avStatus: "clean",
          avSignature: null,
          fixtures: avFixtures,
        }),
      }),
    });
  });

  it("stores signature when infected", async () => {
    const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
      status: "infected",
      signature: "EICAR_TEST_FILE",
    });

    await runAttachmentScan("att-2", avFixtures.infected, scanner);

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            avStatus: "infected",
            avSignature: "EICAR_TEST_FILE",
          }),
        }),
      }),
    );
  });
});
