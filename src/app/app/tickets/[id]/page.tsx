import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CommentForm from "./comment-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    },
  });

  if (!ticket) return notFound();
  if (
    session.user.role === "REQUESTER" &&
    ticket.requesterId !== session.user.id
  ) {
    return notFound();
  }

  const visibleComments =
    session.user.role === "REQUESTER"
      ? ticket.comments.filter((c) => !c.isInternal)
      : ticket.comments;

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/app" className="text-sm text-sky-700 underline">
        ← Powrót do listy
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">#{ticket.number}</p>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <p className="text-sm text-slate-500">
              Zgłaszający: {ticket.requester.name}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {priorityLabels[ticket.priority]}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
              {statusLabels[ticket.status]}
            </span>
          </div>
        </div>
        <div className="mt-4 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {ticket.descriptionMd}
          </ReactMarkdown>
        </div>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Komentarze</h2>
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-slate-200 p-3 bg-slate-50"
            >
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{comment.author.name}</span>
                <span>{comment.createdAt.toLocaleString()}</span>
              </div>
              {comment.isInternal && (
                <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900">
                  Wewnętrzny
                </span>
              )}
              <div className="prose prose-sm max-w-none mt-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {comment.bodyMd}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {visibleComments.length === 0 && (
            <p className="text-sm text-slate-500">Brak komentarzy.</p>
          )}
        </div>
        <div className="mt-4">
          <CommentForm ticketId={ticket.id} allowInternal={session.user.role !== "REQUESTER"} />
        </div>
      </div>
    </div>
  );
}
