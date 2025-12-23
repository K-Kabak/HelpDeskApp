import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { EmailAdapterStub } from "@/lib/email-adapter";
import { EmailAdapterReal } from "@/lib/email-adapter-real";

describe("EmailAdapterStub", () => {
  it("returns queued status and generated ID", async () => {
    const adapter = new EmailAdapterStub();
    const result = await adapter.send({
      to: "user@example.com",
      subject: "Test",
      body: "Hello",
    });

    expect(result.status).toBe("queued");
    expect(result.id).toMatch(/^email-\d+$/);
  });

  it("handles template ID and data", async () => {
    const adapter = new EmailAdapterStub();
    const result = await adapter.send({
      to: "user@example.com",
      subject: "Test",
      templateId: "welcome",
      data: { name: "John" },
    });

    expect(result.status).toBe("queued");
    expect(result.id).toBeDefined();
  });
});

describe("EmailAdapterReal", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws error when SMTP credentials are missing", () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;

    expect(() => new EmailAdapterReal()).toThrow(
      "EmailAdapterReal requires SMTP_HOST, SMTP_USER, and SMTP_PASSWORD"
    );
  });

  it("initializes with environment variables", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "password";
    process.env.SMTP_FROM = "noreply@example.com";

    const adapter = new EmailAdapterReal();
    expect(adapter).toBeDefined();
  });

  it("initializes with config object", () => {
    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 465,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    expect(adapter).toBeDefined();
  });

  it("sends email and returns sent status", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 587,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    const result = await adapter.send({
      to: "recipient@example.com",
      subject: "Test Subject",
      body: "Test Body",
    });

    expect(result.status).toBe("sent");
    expect(result.id).toBeDefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[EmailAdapterReal] Sending email"),
      expect.objectContaining({
        to: "recipient@example.com",
        subject: "Test Subject",
      })
    );

    consoleSpy.mockRestore();
  });

  it("handles template ID and data parameters", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 587,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
    });

    const result = await adapter.send({
      to: "user@example.com",
      subject: "Welcome",
      templateId: "welcome-template",
      data: { name: "Alice", link: "https://example.com" },
    });

    expect(result.status).toBe("sent");
    expect(result.id).toBeDefined();

    consoleSpy.mockRestore();
  });
});

describe("Email adapter selection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses stub adapter when EMAIL_ENABLED is not set", async () => {
    delete process.env.EMAIL_ENABLED;

    // Dynamic import to test adapter selection
    const { emailAdapter } = await import("@/lib/email-adapter");
    const result = await emailAdapter.send({
      to: "test@example.com",
      subject: "Test",
    });

    expect(result.status).toBe("queued");
  });

  it("uses stub adapter when EMAIL_ENABLED is false", async () => {
    process.env.EMAIL_ENABLED = "false";

    const { emailAdapter } = await import("@/lib/email-adapter");
    const result = await emailAdapter.send({
      to: "test@example.com",
      subject: "Test",
    });

    expect(result.status).toBe("queued");
  });

  it("falls back to stub when EMAIL_ENABLED is true but SMTP config missing", async () => {
    process.env.EMAIL_ENABLED = "true";
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { emailAdapter } = await import("@/lib/email-adapter");
    const result = await emailAdapter.send({
      to: "test@example.com",
      subject: "Test",
    });

    expect(result.status).toBe("queued");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to initialize real email adapter"),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });
});
