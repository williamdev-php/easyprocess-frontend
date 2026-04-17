"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";

type AlertType = "paymentFailed" | "expiringPlan" | "siteDeletion" | null;

export default function SubscriptionAlert() {
  const t = useTranslations("subscriptionAlert");
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  // Don't show on account page
  if (pathname === "/dashboard/account") return null;

  // TODO: Replace with real subscription status from API/context
  const alertType: AlertType = null;
  const daysLeft = 5;

  if (!alertType || dismissed) return null;

  const messages: Record<NonNullable<AlertType>, string> = {
    paymentFailed: t("paymentFailed"),
    expiringPlan: t("expiringPlan", { days: daysLeft }),
    siteDeletion: t("siteDeletion", { days: daysLeft }),
  };

  const colors: Record<NonNullable<AlertType>, string> = {
    paymentFailed: "bg-amber-50 border-amber-200 text-amber-800",
    expiringPlan: "bg-amber-50 border-amber-200 text-amber-800",
    siteDeletion: "bg-red-50 border-red-200 text-red-800",
  };

  const iconColors: Record<NonNullable<AlertType>, string> = {
    paymentFailed: "text-amber-500",
    expiringPlan: "text-amber-500",
    siteDeletion: "text-red-500",
  };

  return (
    <div
      className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 animate-slide-down ${colors[alertType]}`}
    >
      <svg
        className={`h-5 w-5 shrink-0 ${iconColors[alertType]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <p className="flex-1 text-sm font-medium">{messages[alertType]}</p>
      <Link
        href="/dashboard/billing"
        className="shrink-0 rounded-lg bg-primary-deep px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
      >
        {t("action")}
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5"
        aria-label={t("dismiss")}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
