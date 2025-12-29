import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import type { SessionWithUser } from "@/lib/session-types";
import Link from "next/link";
import CommentForm from "./comment-form";
import TicketActions from "./ticket-actions";
import { SafeMarkdown } from "@/components/safe-markdown";
import { AttachmentPicker } from "./attachment-picker";
import { AttachmentVisibility } from "@prisma/client";
import { suggestAssigneeByLoad } from "@/lib/assignment-suggest";
import { AuditTimeline } from "./audit-timeline";
import { EmptyComments } from "@/components/ui/empty-state";
import { getSlaStatus } from "@/lib/sla-status";
import { getPriorityColors } from "@/lib/priority-colors";

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

const roleLabels: Record<Role, string> = {
  REQUESTER: "Requester",
  AGENT: "Agent",
  ADMIN: "Admin",
};

const roleColors: Record<Role, string> = {
  REQUESTER: "bg-sky-100 text-sky-700", // sky
  AGENT: "bg-emerald-100 text-emerald-700", // green
  ADMIN: "bg-indigo-100 text-indigo-700", // indigo
};

export default async function TicketPage({
  params,
}: {
  params: { id: string };
}) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    redirect("/login");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
        include: { uploader: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) return notFound();
  if (
    session.user.role === "REQUESTER" &&
    ticket.requesterId !== session.user.id
  ) {
    return notFound();
  }

  const [agents, teams, suggestion]: [
    { id: string; name: string; role: Role }[],
    { id: string; name: string }[],
    { suggestedAgentId: string | null }
  ] =
    session.user.role === "REQUESTER"
      ? [[], [], { suggestedAgentId: null }]
      : await Promise.all([
          prisma.user.findMany({
            where: {
              organizationId: session.user.organizationId,
              role: { in: ["AGENT", "ADMIN"] },
            },
            orderBy: { name: "asc" },
            select: { id: true, name: true, role: true },
          }),
          prisma.team.findMany({
            where: { organizationId: session.user.organizationId },
            orderBy: { name: "asc" },
            select: { id: true, name: true },
          }),
          suggestAssigneeByLoad(
            session.user.organizationId ?? "",
            ticket.id
          ).then((s) => ({ suggestedAgentId: s.suggestedAgentId })),
        ]);

  const visibleComments =
    session.user.role === "REQUESTER"
      ? ticket.comments.filter((c) => !c.isInternal)
      : ticket.comments;

  const lastActivityDate = (
    visibleComments[visibleComments.length - 1]?.createdAt ?? ticket.updatedAt
  ).toLocaleString();

  const canSeeInternal = session.user.role !== "REQUESTER";

  const visibleAttachments =
    session.user.role === "REQUESTER"
      ? ticket.attachments.filter(
          (att) => att.visibility === AttachmentVisibility.PUBLIC
        )
      : ticket.attachments;

  const attachmentItems = visibleAttachments.map((att) => ({
    id: att.id,
    fileName: att.fileName,
    mimeType: att.mimeType,
    sizeBytes: att.sizeBytes,
    visibility: att.visibility,
    createdAt: att.createdAt.toISOString(),
    uploaderName: att.uploader?.name ?? "Nieznany",
  }));

  const attachmentsEnabled =
    process.env.NEXT_PUBLIC_ATTACHMENTS_ENABLED !== "false";

  const sla = getSlaStatus(ticket);
  const showSla = ticket.status !== "ZAMKNIETE" && ticket.status !== "ROZWIAZANE";

  return (
    <div className="max-w-5xl space-y-4 sm:space-y-6">
      <Link 
        href="/app" 
        className="inline-block text-xs sm:text-sm text-sky-700 underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded min-h-[44px] flex items-center hover:text-sky-800 transition-colors"
        aria-label="Powrót do listy zgłoszeń"
      >
        ← Powrót do listy
      </Link>
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <p className="text-xs font-semibold text-slate-500">#{ticket.number}</p>
              {showSla && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      sla.state === "breached"
                        ? "bg-red-100 text-red-700 ring-2 ring-red-200 animate-pulse"
                        : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                  >
                    {sla.state === "breached" ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        SLA naruszone
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {sla.label}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 mb-3 break-words">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
              <span className="font-medium">Zgłaszający:</span>
              <span className="break-words">{ticket.requester.name}</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="font-medium">Utworzono:</span>
              <span className="whitespace-nowrap">{ticket.createdAt.toLocaleString("pl-PL")}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
              {ticket.assigneeTeam && (
                <>
                  <span className="font-medium">Zespół:</span>
                  <span>{ticket.assigneeTeam.name}</span>
                </>
              )}
              {ticket.assigneeUser && (
                <>
                  {ticket.assigneeTeam && <span className="text-slate-300">•</span>}
                  <span className="font-medium">Agent:</span>
                  <span>{ticket.assigneeUser.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:flex-shrink-0">
            <span className={`rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold whitespace-nowrap ${getPriorityColors(ticket.priority)}`}>
              {priorityLabels[ticket.priority]}
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-white whitespace-nowrap" aria-label={`Status: ${statusLabels[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
          </div>
        </header>
        <section className="mt-4 prose prose-sm max-w-none" aria-label="Opis zgłoszenia">
          <SafeMarkdown>{ticket.descriptionMd}</SafeMarkdown>
        </section>
        <dl className="mt-4 grid gap-3 text-xs sm:text-sm text-slate-600 grid-cols-1 sm:grid-cols-2" aria-label="Szczegóły zgłoszenia">
          <div>
            <dt className="font-semibold text-slate-700">Kategoria</dt>
            <dd>{ticket.category ?? "Brak"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Przypisany zespół</dt>
            <dd>{ticket.assigneeTeam?.name ?? "Brak"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Przypisany agent</dt>
            <dd>{ticket.assigneeUser?.name ?? "Brak"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Utworzono</dt>
            <dd>{ticket.createdAt.toLocaleString()}</dd>
          </div>
        </dl>
      </article>

      <TicketActions
        ticketId={ticket.id}
        initialStatus={ticket.status}
        initialAssigneeTeamId={ticket.assigneeTeamId}
        initialAssigneeUserId={ticket.assigneeUserId}
        role={session.user.role as Role}
        isOwner={ticket.requesterId === session.user.id}
        agents={agents.map((agent) => ({ id: agent.id, name: agent.name }))}
        teams={teams}
        suggestedAgentId={suggestion.suggestedAgentId}
      />

      <AttachmentPicker
        ticketId={ticket.id}
        initialAttachments={attachmentItems}
        canUploadInternal={session.user.role !== "REQUESTER"}
        canSeeInternal={canSeeInternal}
        attachmentsEnabled={attachmentsEnabled}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="comments-heading">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 id="comments-heading" className="text-base sm:text-lg font-semibold">
            Komentarze ({visibleComments.length})
          </h2>
          <p className="text-xs text-slate-500" aria-live="polite">
            Ostatnia aktywność: {lastActivityDate}
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" aria-hidden />
          <div className="space-y-6">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="relative flex gap-3 sm:gap-4 pl-10 sm:pl-12">
                <div className={`absolute left-0 top-0 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-white text-xs sm:text-sm font-semibold shadow-md flex-shrink-0 ${
                  comment.isInternal
                    ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
                    : "bg-slate-100 text-slate-700 ring-2 ring-slate-200"
                }`}>
                  {comment.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div
                  className={`w-full min-w-0 rounded-lg border-2 p-3 sm:p-4 shadow-sm transition-shadow ${
                    comment.isInternal
                      ? "border-amber-300 bg-amber-50/50 hover:shadow-md"
                      : "border-slate-200 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {comment.author.name}
                      </span>
                      <span
                        className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${roleColors[comment.author.role]}`}
                      >
                        {roleLabels[comment.author.role]}
                      </span>
                      {comment.isInternal && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white ring-1 ring-amber-600 whitespace-nowrap">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Wewnętrzny
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                      {comment.createdAt.toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="prose prose-sm mt-3 max-w-none">
                    <SafeMarkdown>{comment.bodyMd}</SafeMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {visibleComments.length === 0 && (
              <div className="pl-12 py-8">
                <EmptyComments canSeeInternal={canSeeInternal} />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <CommentForm ticketId={ticket.id} allowInternal={session.user.role !== "REQUESTER"} />
        </div>
      </section>

      <AuditTimeline ticketId={ticket.id} />
    </div>
  );
}
