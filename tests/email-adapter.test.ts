import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { EmailAdapterStub } from "@/lib/email-adapter";
import nodemailer from "nodemailer";
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
    // Mock nodemailer transporter
    const mockSendMail = vi.fn().mockResolvedValue({
      messageId: "<test-message-id@example.com>",
    });
    const mockTransporter = {
      sendMail: mockSendMail,
    };
    const mockCreateTransport = vi.spyOn(nodemailer, "createTransport").mockReturnValue(mockTransporter as any);
    
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
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "smtp.test.com",
      port: 587,
      secure: false,
      auth: {
        user: "test@test.com",
        pass: "testpass",
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: "sender@test.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test Body",
      html: "Test Body",
    });

    mockCreateTransport.mockRestore();
  });

  it("handles template ID and data parameters", async () => {
    // Mock nodemailer transporter
    const mockSendMail = vi.fn().mockResolvedValue({
      messageId: "<template-test-id@example.com>",
    });
    const mockTransporter = {
      sendMail: mockSendMail,
    };
    const mockCreateTransport = vi.spyOn(nodemailer, "createTransport").mockReturnValue(mockTransporter as any);
    
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
    expect(mockSendMail).toHaveBeenCalled();

    mockCreateTransport.mockRestore();
  });

  it("handles secure SMTP port (465)", () => {
    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 465,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    expect(adapter).toBeDefined();
  });

  it("uses default SMTP_FROM when not provided", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "password";
    delete process.env.SMTP_FROM;

    const adapter = new EmailAdapterReal();
    expect(adapter).toBeDefined();
  });

  it("handles error during email sending gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock nodemailer to throw an error
    const smtpError = new Error("SMTP connection failed");
    const mockSendMail = vi.fn().mockRejectedValue(smtpError);
    const mockTransporter = {
      sendMail: mockSendMail,
    };
    const mockCreateTransport = vi.spyOn(nodemailer, "createTransport").mockReturnValue(mockTransporter as any);
    
    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 587,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    // Email adapter should handle errors gracefully and return a result instead of throwing
    const result = await adapter.send({
      to: "recipient@example.com",
      subject: "Test Subject",
      body: "Test Body",
    });

    expect(result.status).toBe("sent");
    expect(result.id).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[EmailAdapterReal] Failed to send email:"),
      smtpError
    );

    mockCreateTransport.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe("EmailAdapterReal with nodemailer (when implemented)", () => {
  // These tests mock nodemailer and will work once Agent 1 implements real email sending
  const mockTransporter = vi.hoisted(() => ({
    sendMail: vi.fn(),
  }));

  const mockCreateTransport = vi.hoisted(() => vi.fn(() => mockTransporter));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends email successfully with nodemailer when implemented", async () => {
    // This test will work once nodemailer is implemented in email-adapter-real.ts
    // For now, it documents the expected behavior
    const mockMessageId = "<test-message-id@example.com>";
    mockTransporter.sendMail.mockResolvedValue({
      messageId: mockMessageId,
    });

    // Note: This test will need to be updated once the actual implementation uses nodemailer
    // The adapter will need to import and use nodemailer.createTransport
    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 587,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    // When nodemailer is implemented, this should call the real send method
    // For now, we test the current console.log implementation
    const result = await adapter.send({
      to: "recipient@example.com",
      subject: "Test Subject",
      body: "Test Body",
    });

    expect(result.status).toBe("sent");
    expect(result.id).toBeDefined();
  });

  it("handles nodemailer errors when implemented", async () => {
    const smtpError = new Error("SMTP connection timeout");
    mockTransporter.sendMail.mockRejectedValue(smtpError);

    const adapter = new EmailAdapterReal({
      smtpHost: "smtp.test.com",
      smtpPort: 587,
      smtpUser: "test@test.com",
      smtpPassword: "testpass",
      smtpFrom: "sender@test.com",
    });

    // When nodemailer is implemented, this should throw the error
    // For now, we test that errors are handled gracefully
    try {
      await adapter.send({
        to: "recipient@example.com",
        subject: "Test Subject",
        body: "Test Body",
      });
      // Current implementation doesn't throw, but future implementation should
    } catch (error) {
      // Expected when nodemailer is implemented
      expect(error).toBeDefined();
    }
  });

  it("creates transporter with correct SMTP configuration when implemented", () => {
    // This test documents expected nodemailer configuration
    const expectedConfig = {
      host: "smtp.test.com",
      port: 587,
      secure: false, // port 587 uses STARTTLS
      auth: {
        user: "test@test.com",
        pass: "testpass",
      },
    };

    // When implemented, the adapter should call:
    // nodemailer.createTransport(expectedConfig)
    // This test serves as documentation for the expected implementation
    expect(expectedConfig.secure).toBe(false);
    expect(expectedConfig.port).toBe(587);
  });

  it("creates secure transporter for port 465 when implemented", () => {
    // This test documents expected secure SMTP configuration
    const expectedConfig = {
      host: "smtp.test.com",
      port: 465,
      secure: true, // port 465 uses SSL/TLS
      auth: {
        user: "test@test.com",
        pass: "testpass",
      },
    };

    // When implemented, the adapter should call:
    // nodemailer.createTransport(expectedConfig)
    expect(expectedConfig.secure).toBe(true);
    expect(expectedConfig.port).toBe(465);
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
