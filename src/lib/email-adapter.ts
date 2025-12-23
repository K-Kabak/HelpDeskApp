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
  async send(params: {
    to: string;
    subject: string;
    body?: string;
    templateId?: string;
    data?: Record<string, unknown>;
  }): Promise<{ id: string; status: "sent" | "queued" }> {
    // Stub implementation - does not send emails
    return {
      id: `email-${Date.now()}`,
      status: "queued",
    };
  }
}

export const emailAdapter: EmailAdapter = new EmailAdapterStub();

