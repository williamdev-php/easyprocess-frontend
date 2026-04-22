"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_ADMIN_USER } from "@/graphql/queries";
import { ADMIN_UPDATE_USER } from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────── Skeleton ──────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

/* ──────────────── Helpers ──────────────── */

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("sv-SE", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatRelative(d: string | null | undefined) {
  if (!d) return "—";
  const now = Date.now();
  const then = new Date(d).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

const AUDIT_EVENT_LABELS: Record<string, { label: string; color: string }> = {
  LOGIN: { label: "Login", color: "bg-green-100 text-green-700" },
  LOGIN_FAILED: { label: "Login failed", color: "bg-red-100 text-red-700" },
  LOGOUT: { label: "Logout", color: "bg-gray-100 text-gray-600" },
  REGISTER: { label: "Register", color: "bg-blue-100 text-blue-700" },
  PASSWORD_CHANGE: { label: "Password changed", color: "bg-amber-100 text-amber-700" },
  PASSWORD_RESET_REQUEST: { label: "Password reset requested", color: "bg-amber-100 text-amber-700" },
  PASSWORD_RESET_COMPLETE: { label: "Password reset completed", color: "bg-green-100 text-green-700" },
  EMAIL_CHANGE: { label: "Email changed", color: "bg-purple-100 text-purple-700" },
  EMAIL_VERIFICATION_SENT: { label: "Verification sent", color: "bg-blue-100 text-blue-700" },
  EMAIL_VERIFIED: { label: "Email verified", color: "bg-green-100 text-green-700" },
  TWO_FACTOR_ENABLE: { label: "2FA enabled", color: "bg-green-100 text-green-700" },
  TWO_FACTOR_DISABLE: { label: "2FA disabled", color: "bg-amber-100 text-amber-700" },
  ACCOUNT_LOCKED: { label: "Account locked", color: "bg-red-100 text-red-700" },
  ACCOUNT_UNLOCKED: { label: "Account unlocked", color: "bg-green-100 text-green-700" },
  SESSION_REVOKED: { label: "Session revoked", color: "bg-amber-100 text-amber-700" },
  PROFILE_UPDATE: { label: "Profile updated", color: "bg-blue-100 text-blue-700" },
  BILLING_ADDRESS_CHANGE: { label: "Billing updated", color: "bg-purple-100 text-purple-700" },
  DOMAIN_CHANGE: { label: "Domain changed", color: "bg-indigo-100 text-indigo-700" },
};

const SITE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  PURCHASED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
  PAUSED: "bg-orange-100 text-orange-700",
};

/* ──────────────── Edit Form ──────────────── */

function EditForm({ user, onSave, saving }: { user: any; onSave: (data: any) => void; saving: boolean }) {
  const t = useTranslations("adminUserDetail");
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    companyName: user.companyName || "",
    orgNumber: user.orgNumber || "",
    phone: user.phone || "",
    locale: user.locale || "sv",
    role: user.role || "USER",
    isActive: user.isActive,
    isVerified: user.isVerified,
    isSuperuser: user.isSuperuser,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      userId: user.id,
      ...form,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border-light bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("editProfile")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("fullName")}</label>
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("email")}</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("company")}</label>
          <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("orgNumber")}</label>
          <Input value={form.orgNumber} onChange={(e) => setForm({ ...form, orgNumber: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("phone")}</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("locale")}</label>
          <select
            value={form.locale}
            onChange={(e) => setForm({ ...form, locale: e.target.value })}
            className="w-full rounded-xl border border-border-theme bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="sv">Svenska</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("permissions")}</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { key: "isActive", label: t("active"), color: "accent-emerald-600" },
            { key: "isVerified", label: t("verified"), color: "accent-blue-600" },
            { key: "isSuperuser", label: t("superuser"), color: "accent-purple-600" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              <span className="text-sm text-text-secondary">{label}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">{t("role")}</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-xl border border-border-theme bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const t = useTranslations("adminUserDetail");

  const { data, loading, refetch } = useQuery<any>(GET_ADMIN_USER, {
    variables: { id: userId },
  });

  const [updateUser, { loading: saving }] = useMutation(ADMIN_UPDATE_USER);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const user = data?.adminUser;

  async function handleSave(formData: any) {
    try {
      await updateUser({ variables: { input: formData } });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refetch();
    } catch {
      // Error handled by Apollo
    }
  }

  if (loading) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">{t("notFound")}</p>
        <Link href="/dashboard/users" className="mt-4 inline-block text-sm text-primary hover:underline">
          {t("backToUsers")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-deep transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t("backToUsers")}
      </Link>

      {/* User header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep/10 text-xl font-bold text-primary-deep">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            user.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary-deep">{user.fullName || user.email}</h2>
            <div className="flex gap-1.5">
              {user.isSuperuser && (
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">Admin</span>
              )}
              {user.hasSubscription && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{t("subscribed")}</span>
              )}
              {!user.isActive && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">{t("inactive")}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("saved")}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("sites"), value: user.sitesCount, icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
          { label: t("activeSessions"), value: user.sessions?.length || 0, icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" },
          { label: t("lastLogin"), value: formatRelative(user.lastLoginAt), icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: t("memberSince"), value: new Date(user.createdAt).toLocaleDateString("sv-SE"), icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-muted">{card.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
                <svg className="h-[18px] w-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-primary-deep">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Edit form + Account details */}
        <div className="lg:col-span-2 space-y-6">
          <EditForm user={user} onSave={handleSave} saving={saving} />

          {/* Account details */}
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("accountDetails")}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: t("twoFactor"), value: user.twoFactorEnabled ? t("enabled") : t("disabled") },
                { label: t("failedAttempts"), value: String(user.failedLoginAttempts) },
                { label: t("lockedUntil"), value: user.lockedUntil ? formatDate(user.lockedUntil) : t("notLocked") },
                { label: t("passwordChanged"), value: formatDate(user.passwordChangedAt) },
                { label: t("stripeId"), value: user.stripeCustomerId || "—" },
                { label: t("locale"), value: user.locale === "sv" ? "Svenska" : "English" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border-light p-3">
                  <span className="text-xs font-medium text-text-muted">{item.label}</span>
                  <p className="text-sm font-medium text-primary-deep truncate">{item.value}</p>
                </div>
              ))}
            </div>
            {/* Billing address */}
            {(user.billingStreet || user.billingCity) && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">{t("billingAddress")}</h4>
                <div className="rounded-xl border border-border-light p-3 text-sm text-text-secondary">
                  {user.billingStreet && <p>{user.billingStreet}</p>}
                  {(user.billingZip || user.billingCity) && <p>{[user.billingZip, user.billingCity].filter(Boolean).join(" ")}</p>}
                  {user.billingCountry && <p>{user.billingCountry}</p>}
                </div>
              </div>
            )}
          </div>

          {/* User's sites */}
          {user.recentSites && user.recentSites.length > 0 && (
            <div className="rounded-2xl border border-border-light bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("userSites")}</h3>
              <div className="space-y-2">
                {user.recentSites.map((site: any) => (
                  <div key={site.id} className="flex items-center justify-between rounded-xl border border-border-light p-3 transition-colors hover:bg-primary-deep/[0.02]">
                    <div>
                      <p className="text-sm font-medium text-primary-deep">{site.businessName || site.subdomain || site.id}</p>
                      <p className="text-xs text-text-muted">
                        {site.subdomain ? `${site.subdomain}.qvicko.com` : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{site.views} views</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SITE_STATUS_COLORS[site.status] || "bg-gray-100"}`}>
                        {site.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Sessions + Audit log */}
        <div className="space-y-6">
          {/* Active sessions */}
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-primary-deep">
              {t("activeSessions")}
              <span className="ml-2 rounded-full bg-primary-deep/10 px-2 py-0.5 text-xs">{user.sessions?.length || 0}</span>
            </h3>
            {(!user.sessions || user.sessions.length === 0) ? (
              <p className="text-sm text-text-muted">{t("noSessions")}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {user.sessions.map((session: any) => (
                  <div key={session.id} className="rounded-xl border border-border-light p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary-deep">{session.ipAddress || "—"}</span>
                      <span className="text-[10px] text-text-muted">{formatRelative(session.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">{session.userAgent || "—"}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {t("expires")}: {formatDate(session.expiresAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit log */}
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-primary-deep">
              {t("auditLog")}
              <span className="ml-2 rounded-full bg-primary-deep/10 px-2 py-0.5 text-xs">{user.auditLog?.length || 0}</span>
            </h3>
            {(!user.auditLog || user.auditLog.length === 0) ? (
              <p className="text-sm text-text-muted">{t("noAuditLog")}</p>
            ) : (
              <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
                {user.auditLog.map((log: any) => {
                  const event = AUDIT_EVENT_LABELS[log.eventType] || { label: log.eventType, color: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={log.id} className="flex items-center justify-between gap-2 rounded-lg border border-border-light/50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${event.color}`}>
                          {event.label}
                        </span>
                        <span className="text-[11px] text-text-muted truncate">{log.ipAddress || ""}</span>
                      </div>
                      <span className="shrink-0 text-[10px] text-text-muted">{formatRelative(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
