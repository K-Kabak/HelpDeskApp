import { EmailAdapterReal } from "./email-adapter-real";

export interface EmailAdapter {
  send(params: {
    to: string;
    subject: string;
    body?: string;
    templateId?: string;
    data?: Record<string, unknown>;
  }): Promise<{ id: string; status: "sent" | "queued" }>;
}

export class EmailAdapterStub implements EmailAdapter {
  async send(): Promise<{ id: string; status: "sent" | "queued" }> {
    // Stub implementation - does not send emails
    return {
      id: `email-${Date.now()}`,
      status: "queued",
    };
  }
}

/**
 * Creates the appropriate email adapter based on EMAIL_ENABLED flag.
 * If EMAIL_ENABLED=true, uses real SMTP adapter.
 * Otherwise, uses stub adapter (safe default).
 */
function createEmailAdapter(): EmailAdapter {
  const emailEnabled = process.env.EMAIL_ENABLED === "true";

  if (emailEnabled) {
    try {
      return new EmailAdapterReal();
    } catch (error) {
      console.warn(
        "[EmailAdapter] Failed to initialize real email adapter, falling back to stub:",
        error
      );
      return new EmailAdapterStub();
    }
  }

  return new EmailAdapterStub();
}

export const emailAdapter: EmailAdapter = createEmailAdapter();
export const defaultEmailAdapter = emailAdapter;

