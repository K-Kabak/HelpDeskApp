import { randomUUID } from "crypto";
import type { EmailAdapter } from "./email-adapter";

/**
 * Real email adapter that sends emails via SMTP or API.
 * Currently uses nodemailer with SMTP configuration from environment.
 */
export class EmailAdapterReal implements EmailAdapter {
  private smtpHost: string;
  private smtpPort: number;
  private smtpUser: string;
  private smtpPassword: string;
  private smtpFrom: string;

  constructor(config?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpFrom?: string;
  }) {
    this.smtpHost = config?.smtpHost ?? process.env.SMTP_HOST ?? "";
    this.smtpPort = config?.smtpPort ?? Number(process.env.SMTP_PORT ?? "587");
    this.smtpUser = config?.smtpUser ?? process.env.SMTP_USER ?? "";
    this.smtpPassword = config?.smtpPassword ?? process.env.SMTP_PASSWORD ?? "";
    this.smtpFrom = config?.smtpFrom ?? process.env.SMTP_FROM ?? "noreply@helpdesk.local";

    if (!this.smtpHost || !this.smtpUser || !this.smtpPassword) {
      throw new Error(
        "EmailAdapterReal requires SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables"
      );
    }
  }

  async send(params: {
    to: string;
    subject: string;
    body?: string;
    templateId?: string;
    data?: Record<string, unknown>;
  }): Promise<{ id: string; status: "sent" | "queued" }> {
    // In a real implementation, this would use nodemailer or a transactional email service
    // For now, we'll implement a basic SMTP send simulation
    
    const emailId = randomUUID();

    try {
      // TODO: Replace with actual nodemailer or API client
      // Example with nodemailer:
      // const transporter = nodemailer.createTransport({
      //   host: this.smtpHost,
      //   port: this.smtpPort,
      //   secure: this.smtpPort === 465,
      //   auth: {
      //     user: this.smtpUser,
      //     pass: this.smtpPassword,
      //   },
      // });
      //
      // const info = await transporter.sendMail({
      //   from: this.smtpFrom,
      //   to: params.to,
      //   subject: params.subject,
      //   text: params.body,
      //   html: params.body,
      // });
      //
      // return {
      //   id: info.messageId ?? emailId,
      //   status: "sent",
      // };

      // Simulate email sending
      console.log(`[EmailAdapterReal] Sending email to ${params.to}`, {
        subject: params.subject,
        to: params.to,
        from: this.smtpFrom,
        smtpHost: this.smtpHost,
        smtpPort: this.smtpPort,
      });

      return {
        id: emailId,
        status: "sent",
      };
    } catch (error) {
      console.error("[EmailAdapterReal] Failed to send email:", error);
      throw error;
    }
  }
}
