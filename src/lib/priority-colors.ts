import { TicketPriority } from "@prisma/client";

/**
 * Returns Tailwind CSS classes for priority badges
 */
export function getPriorityColors(priority: TicketPriority): string {
  switch (priority) {
    case "NISKI":
      return "bg-slate-100 text-slate-700";
    case "SREDNI":
      return "bg-blue-100 text-blue-700";
    case "WYSOKI":
      return "bg-orange-100 text-orange-700";
    case "KRYTYCZNY":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

