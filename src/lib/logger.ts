import { randomUUID } from "crypto";

type RequestLoggerOptions = {
  route: string;
  method: string;
  userId?: string;
};

type LogLevel = "info" | "warn" | "error";

function writeLog(level: LogLevel, message: string, context: RequestLoggerOptions & { requestId: string }, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    requestId: context.requestId,
    route: context.route,
    method: context.method,
    userId: context.userId,
    ...(meta ?? {}),
  };

  console.log(JSON.stringify(payload));
}

export function createRequestLogger(options: RequestLoggerOptions) {
  const requestId = randomUUID();
  const context = { ...options, requestId };

  return {
    requestId,
    info: (message: string, meta?: Record<string, unknown>) =>
      writeLog("info", message, context, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
      writeLog("warn", message, context, meta),
    error: (message: string, meta?: Record<string, unknown>) =>
      writeLog("error", message, context, meta),
  };
}
