"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { useTranslations } from "next-intl";
import { GET_BOOKING_PAYMENT_METHODS, GET_CONNECTED_ACCOUNT } from "@/graphql/queries";
import { UPDATE_BOOKING_PAYMENT_METHODS } from "@/graphql/mutations";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";

interface PaymentMethods {
  id: string;
  siteId: string;
  stripeConnectEnabled: boolean;
  onSiteEnabled: boolean;
  klarnaEnabled: boolean;
  swishEnabled: boolean;
}

interface ConnectedAccount {
  id: string;
  siteId: string;
  stripeAccountId: string;
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  country: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

export default function PaymentMethodsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const t = useTranslations("bookings");

  const onboardingComplete = searchParams.get("onboarding") === "complete";
  const [successMsg, setSuccessMsg] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    if (onboardingComplete) {
      setSuccessMsg(t("stripeConnected"));
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, t]);

  const { data: pmData, loading: pmLoading, refetch: refetchPm } = useQuery<{
    bookingPaymentMethods: PaymentMethods;
  }>(GET_BOOKING_PAYMENT_METHODS, {
    variables: { siteId },
    fetchPolicy: "cache-and-network",
  });

  const { data: accountData, loading: accountLoading, refetch: refetchAccount } = useQuery<{
    connectedAccount: ConnectedAccount | null;
  }>(GET_CONNECTED_ACCOUNT, {
    variables: { siteId },
    fetchPolicy: "cache-and-network",
  });

  const [updatePaymentMethods] = useMutation(UPDATE_BOOKING_PAYMENT_METHODS);

  const pm = pmData?.bookingPaymentMethods;
  const account = accountData?.connectedAccount;
  const isConnected = account?.chargesEnabled === true;
  const isPending = account && !account.chargesEnabled && account.detailsSubmitted;
  const loading = pmLoading || accountLoading;

  async function handleToggle(field: string, value: boolean) {
    if (!pm) return;
    await updatePaymentMethods({
      variables: {
        input: {
          siteId,
          stripeConnectEnabled: field === "stripeConnectEnabled" ? value : pm.stripeConnectEnabled,
          onSiteEnabled: field === "onSiteEnabled" ? value : pm.onSiteEnabled,
          klarnaEnabled: field === "klarnaEnabled" ? value : pm.klarnaEnabled,
          swishEnabled: field === "swishEnabled" ? value : pm.swishEnabled,
        },
      },
    });
    refetchPm();
  }

  async function handleConnectStripe() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/payments/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setConnectLoading(false);
    }
  }

  async function handleCompleteOnboarding() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/payments/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setConnectLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{t("paymentMethods")}</h2>
        <Tooltip text={t("paymentMethodsTooltip")} />
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 animate-slide-down">
          {successMsg}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !pm ? (
        <div className="space-y-4 animate-stagger">
          <Skeleton className="h-36" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          {/* Stripe Connect Section */}
          <div className="rounded-xl border border-border-light bg-white/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">Stripe Connect</h3>
              <Tooltip text={t("stripeConnectTooltip")} />
            </div>
            <p className="text-sm text-text-muted">{t("stripeConnectDesc")}</p>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-700">{t("stripeStatusConnected")}</span>
                {account?.country && (
                  <span className="text-xs text-text-muted">({account.country})</span>
                )}
              </div>
            ) : isPending ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm font-medium text-amber-700">{t("stripeStatusPending")}</span>
                </div>
                <button
                  onClick={handleCompleteOnboarding}
                  disabled={connectLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {connectLoading ? t("loading") : t("completeRegistration")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectStripe}
                disabled={connectLoading}
                className="rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#5046e5] disabled:opacity-50"
              >
                {connectLoading ? t("loading") : t("connectStripe")}
              </button>
            )}
          </div>

          {/* Payment method toggles */}
          <div className="rounded-xl border border-border-light bg-white/80 shadow-sm divide-y divide-border-light">
            {/* Stripe card payments */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="font-medium text-text-primary">{t("cardPayment")}</p>
                  <p className="text-xs text-text-muted">{t("cardPaymentDesc")}</p>
                </div>
                <Tooltip text={t("cardPaymentTooltip")} />
              </div>
              <Switch
                checked={pm?.stripeConnectEnabled ?? false}
                onChange={(e) => handleToggle("stripeConnectEnabled", e.target.checked)}
                disabled={!isConnected}
                disabledReason={!isConnected ? t("stripeRequiredShort") : undefined}
              />
            </div>

            {/* Klarna */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="font-medium text-text-primary">Klarna</p>
                  <p className="text-xs text-text-muted">{t("klarnaDesc")}</p>
                </div>
                <Tooltip text={t("klarnaTooltip")} />
              </div>
              <Switch
                checked={pm?.klarnaEnabled ?? false}
                onChange={(e) => handleToggle("klarnaEnabled", e.target.checked)}
                disabled={!isConnected}
                disabledReason={!isConnected ? t("stripeRequiredShort") : undefined}
              />
            </div>

            {/* Swish */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="font-medium text-text-primary">Swish</p>
                  <p className="text-xs text-text-muted">{t("swishDesc")}</p>
                </div>
                <Tooltip text={t("swishTooltip")} />
              </div>
              <Switch
                checked={pm?.swishEnabled ?? false}
                onChange={(e) => handleToggle("swishEnabled", e.target.checked)}
                disabled={!isConnected}
                disabledReason={!isConnected ? t("stripeRequiredShort") : undefined}
              />
            </div>

            {/* On-site payment */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="font-medium text-text-primary">{t("onSitePayment")}</p>
                  <p className="text-xs text-text-muted">{t("onSitePaymentDesc")}</p>
                </div>
                <Tooltip text={t("onSitePaymentTooltip")} />
              </div>
              <Switch
                checked={pm?.onSiteEnabled ?? false}
                onChange={(e) => handleToggle("onSiteEnabled", e.target.checked)}
              />
            </div>
          </div>

          {!isConnected && (
            <p className="text-xs text-text-muted">
              {t("stripeRequiredNote")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
