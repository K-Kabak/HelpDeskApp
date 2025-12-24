"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AttachmentVisibility } from "@prisma/client";

type AttachmentItem = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  visibility: AttachmentVisibility;
  createdAt: string;
  uploaderName: string;
};

type ProgressState =
  | { stage: "idle" }
  | { stage: "preparing" }
  | { stage: "uploading"; percent: number }
  | { stage: "done" }
  | { stage: "error"; message: string };

type AttachmentPickerProps = {
  ticketId: string;
  initialAttachments: AttachmentItem[];
  canUploadInternal: boolean;
  canSeeInternal: boolean;
  attachmentsEnabled: boolean;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

async function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };
    xhr.onload = () => resolve(new Response(null, { status: xhr.status } as ResponseInit));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}

export function AttachmentPicker({
  ticketId,
  initialAttachments,
  canUploadInternal,
  canSeeInternal,
  attachmentsEnabled,
}: AttachmentPickerProps) {
  const router = useRouter();
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<"public" | "internal">("public");
  const [progress, setProgress] = useState<ProgressState>({ stage: "idle" });
  const [submitting, setSubmitting] = useState(false);

  const visibleAttachments = useMemo(
    () =>
      canSeeInternal
        ? attachments
        : attachments.filter((att) => att.visibility === "PUBLIC"),
    [attachments, canSeeInternal]
  );

  const disabled =
    submitting || !attachmentsEnabled || !file;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Najpierw wybierz plik do przesłania, klikając przycisk 'Wybierz plik'.");
      return;
    }
    setSubmitting(true);
    setProgress({ stage: "preparing" });

    const payload = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      visibility,
    };

    const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setProgress({ stage: "error", message: "Nie udało się przygotować przesłania." });
      setSubmitting(false);
      toast.error("Nie udało się utworzyć przesłania pliku.");
      return;
    }

    const { attachment, uploadUrl } = await res.json();

    try {
      setProgress({ stage: "uploading", percent: 5 });
      const uploadResp = await uploadWithProgress(uploadUrl, file, (percent) =>
        setProgress({ stage: "uploading", percent })
      );

      if (!uploadResp.ok) {
        throw new Error("Upload error");
      }

      const normalized: AttachmentItem = {
        id: attachment.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        visibility: attachment.visibility,
        createdAt: attachment.createdAt ?? new Date().toISOString(),
        uploaderName: attachment.uploader?.name ?? "Ty",
      };

      setAttachments((prev) => [normalized, ...prev]);
      setProgress({ stage: "done" });
      setFile(null);
      toast.success("Plik przesłany.");
      router.refresh();
    } catch {
      // Attempt cleanup of orphaned attachment entry
      await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId: attachment.id }),
      }).catch(() => undefined);
      setProgress({ stage: "error", message: "Upload nie powiódł się." });
      toast.error("Upload nie powiódł się.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Załączniki</h2>
          <p className="text-xs text-slate-500">
            Pliki widoczne zgodnie z ustawioną widocznością i rolą użytkownika.
          </p>
        </div>
        {!attachmentsEnabled && (
          <span className="text-xs font-semibold text-amber-600">
            Uploady wyłączone (flaga środowiskowa).
          </span>
        )}
      </div>

      <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleUpload}>
        <div className="grid gap-2 sm:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            Wybierz plik
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting || !attachmentsEnabled}
            className="block w-full text-sm text-slate-700"
          />
          {file && (
            <p className="text-xs text-slate-500">
              {file.name} • {formatBytes(file.size)} • {file.type || "application/octet-stream"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Widoczność</label>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                disabled={submitting || !attachmentsEnabled}
              />
              Publiczny (widoczny dla wszystkich z dostępem do zgłoszenia)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value="internal"
                checked={visibility === "internal"}
                onChange={() => setVisibility("internal")}
                disabled={!canUploadInternal || submitting || !attachmentsEnabled}
              />
              Wewnętrzny (tylko agenci/admin)
            </label>
          </div>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "Przesyłanie..." : "Prześlij plik"}
          </button>
          {progress.stage === "uploading" && (
            <div className="text-xs text-slate-600">
              Upload: {progress.percent}%
            </div>
          )}
          {progress.stage === "preparing" && (
            <div className="text-xs text-slate-600">Przygotowanie przesłania...</div>
          )}
          {progress.stage === "error" && (
            <div className="text-xs text-red-600">{progress.message}</div>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {visibleAttachments.length === 0 ? (
          <p className="text-sm text-slate-500">Brak załączników.</p>
        ) : (
          visibleAttachments.map((att) => (
            <div
              key={att.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">{att.fileName}</span>
                <span className="text-xs text-slate-500">
                  {formatBytes(att.sizeBytes)} • {att.mimeType} • {new Date(att.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    att.visibility === "PUBLIC"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {att.visibility === "PUBLIC" ? "Publiczny" : "Wewnętrzny"}
                </span>
                <span className="text-xs text-slate-500">Przesłane przez {att.uploaderName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
