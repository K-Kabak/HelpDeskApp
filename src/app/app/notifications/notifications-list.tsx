"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import type { Prisma } from "@prisma/client";

type Notification = {
  id: string;
  subject: string | null;
  body: string | null;
  data: Prisma.JsonValue | null;
  readAt: Date | null;
  createdAt: Date;
};

type NotificationFilter = "all" | "ticketUpdate" | "commentUpdate" | "assignment" | "slaBreach";

type Props = {
  initialNotifications: Notification[];
};

export function NotificationsList({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [pending, startTransition] = useTransition();

  const fetchNotifications = async (type: NotificationFilter) => {
    startTransition(async () => {
      try {
        const url = type === "all" 
          ? "/api/notifications" 
          : `/api/notifications?type=${type}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Błąd podczas pobierania powiadomień");
      }
    });
  };

  const handleFilterChange = (newFilter: NotificationFilter) => {
    setFilter(newFilter);
    fetchNotifications(newFilter);
  };

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

  const filterOptions: { value: NotificationFilter; label: string }[] = [
    { value: "all", label: "Wszystkie" },
    { value: "ticketUpdate", label: "Aktualizacje zgłoszeń" },
    { value: "commentUpdate", label: "Komentarze" },
    { value: "assignment", label: "Przypisania" },
    { value: "slaBreach", label: "Naruszenia SLA" },
  ];

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

      {/* Filter Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="notification-filter" className="text-sm font-medium text-slate-700">
          Filtruj:
        </label>
        <select
          id="notification-filter"
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as NotificationFilter)}
          disabled={pending}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">Brak powiadomień</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "all"
              ? "Nie masz żadnych powiadomień."
              : `Nie masz powiadomień typu "${filterOptions.find(f => f.value === filter)?.label}".`
            }
          </p>
          {filter !== "all" && (
            <button
              onClick={() => handleFilterChange("all")}
              className="mt-3 text-sm text-sky-600 hover:text-sky-500"
            >
              Pokaż wszystkie powiadomienia
            </button>
          )}
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
                    className="ml-4 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 min-h-[36px]"
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
