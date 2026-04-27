"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from "@/graphql/mutations";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TYPE_ICONS: Record<string, string> = {
  TICKET_CREATED: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  TICKET_REPLIED: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  TICKET_STATUS_CHANGED: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182",
};

function formatRelative(d: string) {
  const now = Date.now();
  const then = new Date(d).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "nu";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationBell() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    fetchPolicy: "cache-and-network",
    pollInterval: 60000, // Poll every 60s for new notifications
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications = (data as any)?.myNotifications?.items || [];
  const unreadCount = (data as any)?.myNotifications?.unreadCount || 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkAllRead() {
    await markAllRead();
    refetch();
  }

  async function handleNotifClick(notif: any) {
    if (!notif.isRead) {
      await markRead({ variables: { notificationId: notif.id } });
      refetch();
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep"
        aria-label={t("title")}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border-light bg-white shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
            <h3 className="text-sm font-semibold text-primary-deep">{t("title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-primary-deep transition-colors"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-light">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="mt-2 text-xs text-text-muted">{t("empty")}</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <Link
                  key={notif.id}
                  href={(notif.link || "/dashboard/contact") as "/dashboard"}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-primary-deep/[0.02] ${
                    !notif.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    !notif.isRead ? "bg-primary-deep/10 text-primary-deep" : "bg-border-light text-text-muted"
                  }`}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[notif.type] || TYPE_ICONS.TICKET_CREATED} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!notif.isRead ? "font-semibold text-primary-deep" : "font-medium text-text-secondary"}`}>
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{notif.body}</p>
                    )}
                    <p className="text-[10px] text-text-muted mt-1">{formatRelative(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
