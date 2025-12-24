import { TicketPriority, TicketStatus } from "@prisma/client";

/**
 * Escape CSV field value to prevent injection and handle special characters
 */
function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  // Replace markdown-style line breaks with spaces
  const cleaned = stringValue.replace(/[\r\n]+/g, " ").trim();
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (cleaned.includes(",") || cleaned.includes('"') || cleaned.includes("\n")) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

/**
 * Generates CSV content from ticket data for export.
 * 
 * Escapes special characters and handles null values properly.
 * Includes all ticket metadata: number, title, status, priority, category,
 * requester/assignee information, and timestamps.
 * 
 * @param tickets - Array of tickets with required fields for export
 * @returns CSV-formatted string with headers and data rows
 */
export function generateTicketCsv(
  tickets: Array<{
    number: number;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string | null;
    requester: { email: string; name: string | null } | null;
    assigneeUser: { email: string; name: string | null } | null;
    assigneeTeam: { name: string } | null;
    createdAt: Date;
    firstResponseAt: Date | null;
    resolvedAt: Date | null;
    closedAt: Date | null;
    updatedAt: Date;
  }>,
): string {
  const headers = [
    "Number",
    "Title",
    "Status",
    "Priority",
    "Category",
    "Requester Email",
    "Requester Name",
    "Assignee Email",
    "Assignee Name",
    "Team",
    "Created At",
    "First Response At",
    "Resolved At",
    "Closed At",
    "Updated At",
  ];

  const rows = tickets.map((ticket) => [
    ticket.number.toString(),
    escapeCsvField(ticket.title),
    ticket.status,
    ticket.priority,
    escapeCsvField(ticket.category),
    escapeCsvField(ticket.requester?.email),
    escapeCsvField(ticket.requester?.name),
    escapeCsvField(ticket.assigneeUser?.email),
    escapeCsvField(ticket.assigneeUser?.name),
    escapeCsvField(ticket.assigneeTeam?.name),
    ticket.createdAt.toISOString(),
    ticket.firstResponseAt?.toISOString() || "",
    ticket.resolvedAt?.toISOString() || "",
    ticket.closedAt?.toISOString() || "",
    ticket.updatedAt.toISOString(),
  ]);

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ];

  return csvLines.join("\n");
}

