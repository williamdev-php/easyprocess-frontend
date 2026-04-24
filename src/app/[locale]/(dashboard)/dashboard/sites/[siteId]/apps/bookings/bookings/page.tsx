"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { GET_BOOKINGS } from "@/graphql/queries";
import { UPDATE_BOOKING_STATUS } from "@/graphql/mutations";
import { Tooltip } from "@/components/ui/tooltip";

interface Booking {
  id: string;
  siteId: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export default function BookingsListPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("bookings");

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filter: Record<string, unknown> = { page, pageSize };
  if (statusFilter !== "ALL") filter.status = statusFilter;
  if (search) filter.search = search;

  const { data, loading, refetch } = useQuery<{
    bookings: { items: Booking[]; total: number; page: number; pageSize: number };
  }>(GET_BOOKINGS, {
    variables: { siteId, filter },
    fetchPolicy: "cache-and-network",
  });

  const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS);

  const bookings = data?.bookings.items ?? [];
  const total = data?.bookings.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  async function handleStatusChange(bookingId: string, newStatus: string) {
    const msg =
      newStatus === "CANCELLED"
        ? t("confirmCancel")
        : newStatus === "CONFIRMED"
        ? t("confirmConfirm")
        : t("confirmComplete");
    if (!window.confirm(msg)) return;
    await updateStatus({
      variables: { input: { siteId, bookingId, status: newStatus } },
    });
    refetch();
  }

  const statusBadge: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("statusPending"), color: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: t("statusConfirmed"), color: "bg-green-100 text-green-700" },
    COMPLETED: { label: t("statusCompleted"), color: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: t("statusCancelled"), color: "bg-red-100 text-red-700" },
  };

  const paymentBadge: Record<string, { label: string; color: string }> = {
    PAID: { label: t("paid"), color: "bg-green-100 text-green-700" },
    UNPAID: { label: t("unpaid"), color: "bg-gray-100 text-gray-600" },
    REFUNDED: { label: t("refunded"), color: "bg-red-100 text-red-700" },
  };

  const statusTabLabels: Record<string, string> = {
    ALL: t("all"),
    PENDING: t("statusPending"),
    CONFIRMED: t("statusConfirmed"),
    COMPLETED: t("statusCompleted"),
    CANCELLED: t("statusCancelled"),
  };

  return (
    <div className="space-y-4 animate-page-enter">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{t("bookings")}</h2>
        <Tooltip text={t("bookingsListTooltip")} />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === tab
                ? "bg-primary-deep text-white"
                : "bg-white text-text-secondary border border-border-light hover:bg-primary-deep/5"
            }`}
          >
            {statusTabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={t("searchBookings")}
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
      />

      {/* Table */}
      {loading && bookings.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-border-light bg-white/80 p-8 text-center shadow-sm">
          <p className="text-text-muted">{t("noBookings")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border-light bg-white/80 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light text-left text-text-muted">
                <th className="px-4 py-3 font-medium">{t("customer")}</th>
                <th className="px-4 py-3 font-medium">{t("service")}</th>
                <th className="px-4 py-3 font-medium">{t("date")}</th>
                <th className="px-4 py-3 font-medium">{t("status")}</th>
                <th className="px-4 py-3 font-medium">{t("payment")}</th>
                <th className="px-4 py-3 font-medium">{t("amount")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {bookings.map((booking) => {
                const sBadge = statusBadge[booking.status] ?? statusBadge.PENDING;
                const pBadge = paymentBadge[booking.paymentStatus] ?? paymentBadge.UNPAID;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{booking.customerName}</p>
                      <p className="text-xs text-text-muted">{booking.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{booking.serviceName}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(booking.bookingDate).toLocaleDateString("sv")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sBadge.color}`}>
                        {sBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${pBadge.color}`}>
                        {pBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {booking.amount} {booking.currency}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                            className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                          >
                            {t("confirm")}
                          </button>
                        )}
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <button
                            onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                            className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            {t("cancel")}
                          </button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleStatusChange(booking.id, "COMPLETED")}
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            {t("complete")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &larr;
          </button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
