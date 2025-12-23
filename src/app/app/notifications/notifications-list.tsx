"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

type Notification = {
  id: string;
  subject: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
};

type Props = {
  initialNotifications: Notification[];
};

export function NotificationsList({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [pending, startTransition] = useTransition();

  const markAsRead = async (notificationId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
          method: "PATCH",
        });

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, readAt: new Date() }
              : notif
          )
        );

        toast.success("Powiadomienie oznaczone jako przeczytane");
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Błąd podczas oznaczania powiadomienia jako przeczytanego");
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">
          Wszystkie powiadomienia
        </h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
            {unreadCount} nieprzeczytanych
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          Brak powiadomień
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 transition-colors ${
                notification.readAt
                  ? "border-slate-200 bg-slate-50"
                  : "border-slate-300 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {notification.subject && (
                    <h3 className={`font-medium ${
                      notification.readAt ? "text-slate-700" : "text-slate-900"
                    }`}>
                      {notification.subject}
                    </h3>
                  )}
                  {notification.body && (
                    <p className={`mt-1 text-sm ${
                      notification.readAt ? "text-slate-600" : "text-slate-700"
                    }`}>
                      {notification.body}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDistanceToNow(notification.createdAt, {
                      addSuffix: true,
                      locale: pl
                    })}
                  </p>
                </div>
                {!notification.readAt && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    disabled={pending}
                    className="ml-4 rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Oznacz jako przeczytane
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
