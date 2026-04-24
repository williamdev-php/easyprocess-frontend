"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { GET_BOOKING_STATS, GET_BOOKINGS } from "@/graphql/queries";
import { Tooltip } from "@/components/ui/tooltip";

interface BookingStats {
  totalBookings: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  currency: string;
}

interface Booking {
  id: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  bookingDate: string;
  createdAt: string;
}

export default function BookingsOverviewPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("bookings");

  const { data: statsData, loading: statsLoading } = useQuery<{ bookingStats: BookingStats }>(
    GET_BOOKING_STATS,
    { variables: { siteId }, fetchPolicy: "cache-and-network" }
  );

  const { data: bookingsData, loading: bookingsLoading } = useQuery<{
    bookings: { items: Booking[]; total: number };
  }>(GET_BOOKINGS, {
    variables: { siteId, filter: { page: 1, pageSize: 10 } },
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData?.bookingStats;
  const recentBookings = bookingsData?.bookings.items ?? [];
  const loading = statsLoading || bookingsLoading;

  const statusBadge: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("statusPending"), color: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: t("statusConfirmed"), color: "bg-green-100 text-green-700" },
    COMPLETED: { label: t("statusCompleted"), color: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: t("statusCancelled"), color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">{t("overview")}</h2>
          <Tooltip text={t("overviewTooltip")} />
        </div>
        <Link
          href={`/dashboard/sites/${siteId}/apps/bookings/bookings` as "/dashboard"}
          className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
        >
          {t("viewAllBookings")}
        </Link>
      </div>

      {/* Stats cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border-light bg-white/80 p-4 shadow-sm">
            <p className="text-sm text-text-muted">{t("totalBookings")}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stats?.totalBookings ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-white/80 p-4 shadow-sm">
            <p className="text-sm text-text-muted">{t("statusPending")}</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats?.pendingCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-white/80 p-4 shadow-sm">
            <p className="text-sm text-text-muted">{t("statusConfirmed")}</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats?.confirmedCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-white/80 p-4 shadow-sm">
            <p className="text-sm text-text-muted">{t("revenue")}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {stats ? `${stats.totalRevenue.toLocaleString("sv")} ${stats.currency}` : "0 SEK"}
            </p>
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">{t("recentBookings")}</h3>
        {loading && recentBookings.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="rounded-xl border border-border-light bg-white/80 p-8 text-center shadow-sm">
            <p className="text-text-muted">{t("noBookings")}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border-light bg-white/80 shadow-sm">
            <div className="divide-y divide-border-light">
              {recentBookings.map((booking) => {
                const badge = statusBadge[booking.status] ?? statusBadge.PENDING;
                return (
                  <div key={booking.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary">{booking.customerName}</p>
                      <p className="text-xs text-text-muted">
                        {booking.serviceName} &middot; {new Date(booking.bookingDate).toLocaleDateString("sv")}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="shrink-0 text-sm font-medium text-text-primary">
                      {booking.amount} {booking.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
