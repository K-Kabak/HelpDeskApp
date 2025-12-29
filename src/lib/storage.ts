import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";

const baseUrl =
  process.env.STORAGE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000/uploads";

// Storage directory for local filesystem storage
const STORAGE_DIR = process.env.STORAGE_DIR ?? join(process.cwd(), "uploads");

/**
 * Ensures the storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch {
    // Directory might already exist, ignore
  }
}

/**
 * Generates a unique storage path for a file
 */
export function generateStoragePath(fileName: string, visibility: "public" | "internal"): string {
  const key = randomUUID();
  const sanitizedFileName = encodeURIComponent(fileName);
  return `${visibility}/${key}/${sanitizedFileName}`;
}

/**
 * Stores a file buffer to local filesystem storage
 */
export async function storeFile(
  storagePath: string,
  fileBuffer: Buffer
): Promise<void> {
  await ensureStorageDir();
  const fullPath = join(STORAGE_DIR, storagePath);
  const dir = dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, fileBuffer);
}

/**
 * Retrieves a file from local filesystem storage
 */
export async function retrieveFile(storagePath: string): Promise<Buffer> {
  const fullPath = join(STORAGE_DIR, storagePath);
  return await fs.readFile(fullPath);
}

/**
 * Deletes a file from local filesystem storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const fullPath = join(STORAGE_DIR, storagePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File might not exist, ignore
  }
}

/**
 * Generates a signed download URL with expiry (1 hour default)
 * For local storage, this generates a time-limited token-based URL
 * The URL points to /api/download which serves the file after token verification
 */
export function generateSignedDownloadUrl(
  storagePath: string,
  expirySeconds: number = 3600
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expirySeconds;
  const token = createHash("sha256")
    .update(`${storagePath}:${expiresAt}:${process.env.NEXTAUTH_SECRET ?? "secret"}`)
    .digest("hex")
    .slice(0, 16);
  
  // URL-encode the storage path for use in query params
  const encodedPath = encodeURIComponent(storagePath);
  const apiBaseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? baseUrl.replace("/uploads", "");
  return `${apiBaseUrl}/api/download?path=${encodedPath}&token=${token}&expires=${expiresAt}`;
}

/**
 * Verifies a signed download URL token
 */
export function verifySignedUrl(
  storagePath: string,
  token: string,
  expires: number
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    return false; // URL expired
  }

  const expectedToken = createHash("sha256")
    .update(`${storagePath}:${expires}:${process.env.NEXTAUTH_SECRET ?? "secret"}`)
    .digest("hex")
    .slice(0, 16);

  return token === expectedToken;
}

/**
 * Resolves a download URL (non-signed, for backward compatibility)
 * @deprecated Use generateSignedDownloadUrl instead
 */
export function resolveDownloadUrl(storagePath: string): string {
  return `${baseUrl}/${storagePath}`;
}

/**
 * Legacy function for presigned uploads (client-side upload pattern)
 * @deprecated Use server-side multipart/form-data uploads instead
 */
export function createPresignedUpload(fileName: string, visibility: "public" | "internal"): {
  uploadUrl: string;
  storagePath: string;
} {
  const storagePath = generateStoragePath(fileName, visibility);
  const uploadUrl = `${baseUrl}/${storagePath}`;
  return { uploadUrl, storagePath };
}
