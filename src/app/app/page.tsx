import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { TicketStatus, TicketPriority } from "@prisma/client";
import TicketForm from "./ticket-form";

const statusLabels: Record<TicketStatus, string> = {
  NOWE: "Nowe",
  W_TOKU: "W toku",
  OCZEKUJE_NA_UZYTKOWNIKA: "Oczekuje na użytkownika",
  WSTRZYMANE: "Wstrzymane",
  ROZWIAZANE: "Rozwiązane",
  ZAMKNIETE: "Zamknięte",
  PONOWNIE_OTWARTE: "Ponownie otwarte",
};

const priorityLabels: Record<TicketPriority, string> = {
  NISKI: "Niski",
  SREDNI: "Średni",
  WYSOKI: "Wysoki",
  KRYTYCZNY: "Krytyczny",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const tickets = await prisma.ticket.findMany({
    where:
      session.user.role === "REQUESTER"
        ? { requesterId: session.user.id }
        : { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Zgłoszenia</h1>
          <p className="text-sm text-slate-600">
            Role: {session.user.role} · Wyświetlane {tickets.length} zgłoszeń
          </p>
        </div>
        <Link
          href="/app/tickets/new"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Nowe zgłoszenie
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/app/tickets/${ticket.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                #{ticket.number}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {priorityLabels[ticket.priority]}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 line-clamp-2">
              {ticket.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">{statusLabels[ticket.status]}</p>
            <p className="text-xs text-slate-500 mt-2">
              Zgłaszający: {ticket.requester.name}
            </p>
            {ticket.assigneeUser && (
              <p className="text-xs text-slate-500">Przypisany: {ticket.assigneeUser.name}</p>
            )}
            {ticket.assigneeTeam && (
              <p className="text-xs text-slate-500">Zespół: {ticket.assigneeTeam.name}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Utworzono: {ticket.createdAt.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Szybkie zgłoszenie</h2>
        <TicketForm />
      </div>
    </div>
  );
}
