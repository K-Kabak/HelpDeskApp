import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketPriority } from "@prisma/client";
import { vi } from "vitest";

import TicketForm from "@/app/app/ticket-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("TicketForm SLA preview", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    fetchMock.mockImplementation((input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            categories: [{ id: "cat-1", name: "Network" }],
          }),
        } as Response);
      }

      if (url.includes("/api/sla/preview")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            preview: {
              firstResponseDue: "2024-01-01T12:00:00.000Z",
              resolveDue: "2024-01-02T00:00:00.000Z",
            },
            policy: {
              priority: TicketPriority.SREDNI,
              firstResponseHours: 12,
              resolveHours: 24,
            },
          }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response);
    });
  });

  it("renders SLA preview matching returned policy", async () => {
    render(<TicketForm />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/sla/preview"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    expect(await screen.findByText(/Podgląd SLA/i)).toBeInTheDocument();
    expect(screen.getByText(/~12h/)).toBeInTheDocument();
    expect(screen.getByText(/~24h/)).toBeInTheDocument();
  });

  it("requests preview again when priority changes", async () => {
    render(<TicketForm />);

    const prioritySelect = await screen.findByLabelText(/Priorytet/i);
    await userEvent.selectOptions(prioritySelect, TicketPriority.WYSOKI);

    await waitFor(() => {
      const calls = fetchMock.mock.calls.filter((call) =>
        (call[0] as string).includes("/api/sla/preview"),
      );
      expect(calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
