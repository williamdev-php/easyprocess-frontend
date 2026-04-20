"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/lib/auth-context";
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { GET_ADMIN_SUBSCRIPTION } from "@/graphql/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────── Skeleton ──────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Status config ──────────────── */

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIALING: "bg-violet-100 text-violet-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  CANCELED: "bg-red-100 text-red-700",
  INCOMPLETE: "bg-gray-100 text-gray-600",
};

/* ──────────────── Helpers ──────────────── */

function formatSek(ore: number): string {
  return `${(ore / 100).toLocaleString("sv-SE")} kr`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ──────────────── Info Row ──────────────── */

function InfoRow({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border-light last:border-0">
      <span className="text-sm font-medium text-text-muted shrink-0">{label}</span>
      <span className={`text-sm text-primary-deep text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function SubscriptionDetailPage() {
  const t = useTranslations("adminSubscriptions.detail");
  const tStatus = useTranslations("adminSubscriptions");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Redirect non-superusers
  if (!authLoading && (!user || !user.isSuperuser)) {
    router.push("/dashboard");
    return null;
  }

  const { data, loading } = useQuery<any>(GET_ADMIN_SUBSCRIPTION, {
    variables: { id },
    skip: !user?.isSuperuser || !id,
  });

  const sub = data?.adminSubscription;

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  if (!sub) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/subscriptions" className="text-sm text-primary hover:underline">
          &larr; {t("back")}
        </Link>
        <p className="text-text-muted">{tStatus("noSubscriptions")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/subscriptions" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-deep transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t("back")}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[sub.status] || STATUS_COLORS.INCOMPLETE}`}>
          {tStatus(sub.status === "PAST_DUE" ? "pastDue" : sub.status.toLowerCase() as any)}
        </span>
        {sub.cancelAtPeriodEnd && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700">
            {t("cancelAtPeriodEnd")}
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Info */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary-deep">{t("subscriptionInfo")}</h3>
          <div>
            <InfoRow label={t("stripeId")} value={sub.stripeSubscriptionId} mono />
            <InfoRow label={t("stripeCustomerId")} value={sub.stripeCustomerId} mono />
            <InfoRow
              label={t("cancelAtPeriodEnd")}
              value={
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.cancelAtPeriodEnd ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                  {sub.cancelAtPeriodEnd ? t("yes") : t("no")}
                </span>
              }
            />
            <InfoRow label={t("paymentsCount")} value={String(sub.paymentsCount)} />
            <InfoRow label={t("totalPaidSek")} value={formatSek(sub.totalPaidSek)} />
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary-deep">{t("customerInfo")}</h3>
          <div>
            <InfoRow label={t("name")} value={sub.userName || "—"} />
            <InfoRow label={t("email")} value={sub.userEmail || "—"} />
            <InfoRow label={t("company")} value={sub.companyName || "—"} />
            <div className="mt-4">
              <Link
                href={`/dashboard/users/${sub.userId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-deep/5 px-4 py-2 text-sm font-medium text-primary-deep hover:bg-primary-deep/10 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {t("viewUser")}
              </Link>
            </div>
          </div>
        </div>

        {/* Billing Period */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-primary-deep">{t("periodInfo")}</h3>
          <div>
            <InfoRow label={t("periodStart")} value={formatDateTime(sub.currentPeriodStart)} />
            <InfoRow label={t("periodEnd")} value={formatDateTime(sub.currentPeriodEnd)} />
            <InfoRow label={t("createdAt")} value={formatDateTime(sub.createdAt)} />
            <InfoRow label={t("updatedAt")} value={formatDateTime(sub.updatedAt)} />
          </div>
        </div>

        {/* Trial Info */}
        {(sub.trialStart || sub.trialEnd) && (
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-primary-deep">{t("trialInfo")}</h3>
            <div>
              <InfoRow label={t("trialStart")} value={formatDateTime(sub.trialStart)} />
              <InfoRow label={t("trialEnd")} value={formatDateTime(sub.trialEnd)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
