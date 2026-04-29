"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useQuery } from "@apollo/client/react";
import { MY_SUBSCRIPTION } from "@/graphql/queries";

type AlertType = "paymentFailed" | "expiringPlan" | "siteDeletion" | null;

interface SubscriptionData {
  mySubscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
  } | null;
}

export default function SubscriptionAlert() {
  const t = useTranslations("subscriptionAlert");
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery<SubscriptionData>(MY_SUBSCRIPTION, {
    fetchPolicy: "cache-first",
  });

  // Don't show on account/billing pages
  if (pathname === "/dashboard/account" || pathname === "/dashboard/billing") return null;

  const sub = data?.mySubscription;
  let alertType: AlertType = null;
  let daysLeft = 0;

  if (sub) {
    // Payment failed
    if (sub.status === "PAST_DUE") {
      alertType = "paymentFailed";
    }

    // Trial ending soon (7 days or less)
    if (sub.status === "TRIALING" && sub.trialEnd) {
      const days = Math.ceil(
        (new Date(sub.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (days <= 7 && days > 0) {
        alertType = "expiringPlan";
        daysLeft = days;
      }
    }

    // Cancellation scheduled — site will be deleted
    if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
      const days = Math.ceil(
        (new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (days <= 14 && days > 0) {
        alertType = "siteDeletion";
        daysLeft = days;
      }
    }
  }

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
      role="alert"
      className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 animate-slide-down ${colors[alertType]}`}
    >
      <svg
        className={`h-5 w-5 shrink-0 ${iconColors[alertType]}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
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
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
