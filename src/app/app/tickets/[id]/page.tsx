import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CommentForm from "./comment-form";
import TicketActions from "./ticket-actions";
import { SafeMarkdown } from "@/components/safe-markdown";
import { AttachmentPicker } from "./attachment-picker";
import { AttachmentVisibility } from "@prisma/client";
import { suggestAssigneeByLoad } from "@/lib/assignment-suggest";
import { AuditTimeline } from "./audit-timeline";

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
  const session = await getServerSession(authOptions);
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

  return (
    <div className="max-w-5xl space-y-6">
      <Link 
        href="/app" 
        className="text-sm text-sky-700 underline focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded"
        aria-label="Powrót do listy zgłoszeń"
      >
        ← Powrót do listy
      </Link>
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">#{ticket.number}</p>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{ticket.createdAt.toLocaleString()}</span>
              <span className="text-slate-300">•</span>
              <span>Zespół: {ticket.assigneeTeam?.name ?? "Brak"}</span>
              <span className="text-slate-300">•</span>
              <span>Agent: {ticket.assigneeUser?.name ?? "Brak"}</span>
            </div>
            <p className="text-sm text-slate-500">Zgłaszający: {ticket.requester.name}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {priorityLabels[ticket.priority]}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white" aria-label={`Status: ${statusLabels[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
          </div>
        </header>
        <section className="mt-4 prose prose-sm max-w-none" aria-label="Opis zgłoszenia">
          <SafeMarkdown>{ticket.descriptionMd}</SafeMarkdown>
        </section>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2" aria-label="Szczegóły zgłoszenia">
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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="comments-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="comments-heading" className="text-lg font-semibold">
            Komentarze ({visibleComments.length})
          </h2>
          <p className="text-xs text-slate-500" aria-live="polite">
            Ostatnia aktywność: {lastActivityDate}
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
          <div className="space-y-6">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="relative flex gap-3 pl-12">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm ring-2 ring-slate-200">
                  {comment.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div
                  className={`w-full rounded-lg border ${
                    comment.isInternal
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  } p-4 shadow-sm`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {comment.author.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${roleColors[comment.author.role]}`}
                      >
                        {roleLabels[comment.author.role]}
                      </span>
                      {comment.isInternal && (
                        <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                          Wewnętrzny
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {comment.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <div className="prose prose-sm mt-3 max-w-none">
                    <SafeMarkdown>{comment.bodyMd}</SafeMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {visibleComments.length === 0 && (
              <div className="pl-12 py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">Brak komentarzy do tego zgłoszenia.</p>
                <p className="text-xs text-slate-400">Dodaj pierwszy komentarz poniżej.</p>
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
