import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HealthResponse = {
  database: boolean;
  redis?: boolean;
  minio?: boolean;
  timestamp: string;
};

/**
 * GET /api/health
 * 
 * Health check endpoint that verifies connectivity to:
 * - Database (PostgreSQL via Prisma) - required
 * - Redis (via BullMQ) - optional, checked if REDIS_URL is set
 * - MinIO (via HTTP health endpoint) - optional, checked if MINIO_ENDPOINT is set
 * 
 * Returns:
 * - 200 OK if all checked services are healthy
 * - 503 Service Unavailable if any required service is unhealthy
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const health: HealthResponse = {
    database: false,
    timestamp,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = true;
  } catch {
    health.database = false;
    return NextResponse.json(health, { status: 503 });
  }

  // Check Redis (optional)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      // Dynamically import bullmq to handle cases where it might not be available
      const { Queue } = await import("bullmq");
      const queueName = process.env.BULLMQ_QUEUE ?? "helpdesk-default";
      const prefix = process.env.BULLMQ_PREFIX ?? "helpdesk";
      const connection = {
        host: new URL(redisUrl).hostname,
        port: Number.parseInt(new URL(redisUrl).port || "6379", 10),
      };
      const queue = new Queue(queueName, { connection, prefix });
      
      // Test connection by getting job counts
      await queue.getJobCounts();
      await queue.close();
      health.redis = true;
    } catch {
      health.redis = false;
      // Redis is optional, so we don't fail the health check
    }
  }

  // Check MinIO (optional)
  const minioEndpoint = process.env.MINIO_ENDPOINT;
  if (minioEndpoint) {
    try {
      // MinIO health endpoint: /minio/health/live
      const healthUrl = `${minioEndpoint.replace(/\/$/, "")}/minio/health/live`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "HelpDeskApp-HealthCheck/1.0",
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        health.minio = true;
      } else {
        health.minio = false;
      }
    } catch {
      health.minio = false;
      // MinIO is optional, so we don't fail the health check
    }
  }

  // Return 200 if database is healthy (required service)
  // Optional services (redis, minio) can be false without failing the check
  const status = health.database ? 200 : 503;
  return NextResponse.json(health, { status });
}

