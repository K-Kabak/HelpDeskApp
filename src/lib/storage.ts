import { randomUUID } from "crypto";

type PresignedUpload = {
  uploadUrl: string;
  storagePath: string;
};

const baseUrl =
  process.env.STORAGE_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000/uploads";

export function createPresignedUpload(fileName: string, visibility: "public" | "internal"): PresignedUpload {
  const key = randomUUID();
  const storagePath = `${visibility}/${key}/${encodeURIComponent(fileName)}`;
  const uploadUrl = `${baseUrl}/${storagePath}`;

  // In a real integration this would include signed query params and limited TTL.
  return { uploadUrl, storagePath };
}
