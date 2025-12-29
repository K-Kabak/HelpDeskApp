import { retrieveFile, verifySignedUrl } from "@/lib/storage";
import { createRequestLogger } from "@/lib/logger";

/**
 * GET /api/download
 * 
 * Serves file downloads using signed URLs with token verification.
 * 
 * Query parameters:
 * - path: Storage path to the file (URL-encoded)
 * - token: Signed token for verification
 * - expires: Expiration timestamp (Unix epoch seconds)
 * 
 * Returns the file with appropriate Content-Type headers.
 */
export async function GET(req: Request) {
  const logger = createRequestLogger({
    route: "/api/download",
    method: req.method,
  });

  const { searchParams } = new URL(req.url);
  const storagePath = searchParams.get("path");
  const token = searchParams.get("token");
  const expiresParam = searchParams.get("expires");

  if (!storagePath || !token || !expiresParam) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const decodedPath = decodeURIComponent(storagePath);
  const expires = Number.parseInt(expiresParam, 10);

  if (Number.isNaN(expires)) {
    return NextResponse.json({ error: "Invalid expires parameter" }, { status: 400 });
  }

  // Verify signed URL
  if (!verifySignedUrl(decodedPath, token, expires)) {
    logger.warn("invalid download token", { storagePath: decodedPath });
    return NextResponse.json({ error: "Invalid or expired download URL" }, { status: 403 });
  }

  try {
    // Retrieve file from storage
    const fileBuffer = await retrieveFile(decodedPath);
    
    // Determine Content-Type from file extension or default to application/octet-stream
    const extension = decodedPath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = extension ? mimeTypes[extension] ?? "application/octet-stream" : "application/octet-stream";

    // Extract filename from path for Content-Disposition header
    const fileName = decodedPath.split("/").pop() ?? "download";
    const decodedFileName = decodeURIComponent(fileName);

    logger.info("file downloaded", { storagePath: decodedPath, sizeBytes: fileBuffer.length });

    // Return file with appropriate headers
    // Use Response with Buffer (Buffer is compatible with Response body)
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${decodedFileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("failed to retrieve file", { storagePath: decodedPath, error });
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

