import { prisma } from "@/lib/prisma";

export type AvStatus = "clean" | "infected";

export type AvScanResult = {
  status: AvStatus;
  signature?: string;
};

export type AvScanner = (filePath: string) => Promise<AvScanResult>;

const DEFAULT_FIXTURES = {
  clean: "attachments/clean-sample.txt",
  infected: "attachments/eicar-sample.txt",
};

const defaultScanner: AvScanner = async () => ({
  status: "clean",
});

/**
 * Runs AV scan stub against a file path and persists status on the attachment row.
 * Replace `defaultScanner` with a real scanner integration (e.g., ClamAV HTTP, SaaS API).
 */
export async function runAttachmentScan(
  attachmentId: string,
  filePath: string,
  scanner: AvScanner = defaultScanner,
) {
  const result = await scanner(filePath);

  await prisma.attachment.update({
    where: { id: attachmentId },
    data: {
      metadata: {
        avStatus: result.status,
        avSignature: result.signature ?? null,
        avCheckedAt: new Date().toISOString(),
        fixtures: DEFAULT_FIXTURES,
      },
    },
  });

  return result;
}

export const avFixtures = DEFAULT_FIXTURES;
