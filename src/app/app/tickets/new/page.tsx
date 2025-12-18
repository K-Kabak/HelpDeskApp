import TicketForm from "../../ticket-form";
import Link from "next/link";

export default function NewTicketPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/app" className="text-sm text-sky-700 underline">
        ← Powrót
      </Link>
      <h1 className="text-2xl font-semibold">Nowe zgłoszenie</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <TicketForm />
      </div>
    </div>
  );
}
