"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { useAuth } from "@/lib/auth-context";
import { trackEvent } from "@/lib/tracking";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  MY_SUBSCRIPTION,
  MY_PAYMENTS,
  MY_BILLING_DETAILS,
  MY_PAYMENT_METHODS,
  AVAILABLE_PLANS,
} from "@/graphql/queries";
import {
  UPDATE_BILLING_DETAILS,
  CANCEL_SUBSCRIPTION,
  REACTIVATE_SUBSCRIPTION,
} from "@/graphql/mutations";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const stripePromise =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

// ---------------------------------------------------------------------------
// Card Setup Form (inside Stripe Elements)
// ---------------------------------------------------------------------------

function CardSetupForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("billing");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || t("cardSetupFailed"));
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/billing`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || t("cardSetupFailed"));
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2 pt-1">
        <Button variant="primary" size="sm" type="submit" disabled={loading || !stripe}>
          {loading ? t("processing") : t("addCard")}
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Billing Page
// ---------------------------------------------------------------------------

interface PlanData {
  key: string;
  name: string;
  priceSek: number;
  trialDays: number;
  features: string[];
}

export default function BillingPage() {
  const { user } = useAuth();
  const t = useTranslations("billing");

  // GraphQL queries
  const { data: subData, loading: subLoading, refetch: refetchSub } = useQuery<any>(MY_SUBSCRIPTION);
  const { data: paymentsData, loading: paymentsLoading } = useQuery<any>(MY_PAYMENTS, {
    variables: { limit: 10, offset: 0 },
  });
  const { data: billingData, loading: billingLoading } = useQuery<any>(MY_BILLING_DETAILS);
  const { data: methodsData, loading: methodsLoading, refetch: refetchMethods } = useQuery<any>(MY_PAYMENT_METHODS);
  const { data: plansData, loading: plansLoading } = useQuery<any>(AVAILABLE_PLANS);

  const loading = subLoading || paymentsLoading || billingLoading || methodsLoading || plansLoading;

  // GraphQL mutations
  const [updateBillingMut] = useMutation(UPDATE_BILLING_DETAILS);
  const [cancelSubMut] = useMutation(CANCEL_SUBSCRIPTION);
  const [reactivateSubMut] = useMutation(REACTIVATE_SUBSCRIPTION);

  const subscription = subData?.mySubscription;
  const payments = paymentsData?.myPayments?.items || [];
  const billingDetails = billingData?.myBillingDetails;
  const paymentMethods = methodsData?.myPaymentMethods || [];
  const plans: PlanData[] = plansData?.availablePlans || [];

  // Separate free and paid plans
  const freePlan = plans.find((p) => p.key === "free");
  const paidPlans = plans.filter((p) => p.key !== "free");

  // Card setup state
  const [showCardForm, setShowCardForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  // Billing details form state
  const [billingName, setBillingName] = useState("");
  const [billingCompany, setBillingCompany] = useState("");
  const [billingOrgNumber, setBillingOrgNumber] = useState("");
  const [billingVatNumber, setBillingVatNumber] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  const [savingBilling, setSavingBilling] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  // Track billing page view
  useEffect(() => {
    trackEvent("billing_page_viewed");
  }, []);

  // Pre-fill billing details when data loads
  useEffect(() => {
    if (billingDetails) {
      setBillingName(billingDetails.billingName || user?.fullName || "");
      setBillingCompany(billingDetails.billingCompany || user?.companyName || "");
      setBillingOrgNumber(billingDetails.billingOrgNumber || "");
      setBillingVatNumber(billingDetails.billingVatNumber || "");
      setBillingEmail(billingDetails.billingEmail || user?.email || "");
      setBillingPhone(billingDetails.billingPhone || user?.phone || "");
      setBillingAddressLine1(billingDetails.addressLine1 || "");
      setBillingAddressLine2(billingDetails.addressLine2 || "");
      setBillingZip(billingDetails.zip || "");
      setBillingCity(billingDetails.city || "");
      setBillingCountry(billingDetails.country || "");
    } else if (user) {
      setBillingName(user.fullName || "");
      setBillingCompany(user.companyName || "");
      setBillingEmail(user.email || "");
      setBillingPhone(user.phone || "");
    }
  }, [billingDetails, user]);

  const getToken = useCallback(async () => {
    const { getAccessToken } = await import("@/lib/auth-context");
    return getAccessToken();
  }, []);

  const handleShowCardForm = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/billing/setup-intent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create setup intent");
      const data = await res.json();
      setClientSecret(data.client_secret);
      setShowCardForm(true);
    } catch (err) {
      console.error("Setup intent error:", err);
    }
  };

  const handleCardSuccess = async () => {
    setShowCardForm(false);
    setClientSecret(null);
    await refetchMethods();
  };

  const handleSubscribe = async (planKey: string) => {
    if (paymentMethods.length === 0) return;
    setSubscribing(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/billing/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planKey }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Subscribe failed");
      }
      const subRes = await res.json().catch(() => ({}));
      await refetchSub();
      // Track subscription event — determine if trial or direct paid
      if (subRes.status === "trialing" || subRes.trial_end) {
        trackEvent("trial_started", { plan: planKey });
      } else {
        trackEvent("subscription_created", { plan: planKey });
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleSaveBilling = async () => {
    setSavingBilling(true);
    setBillingSaved(false);
    setBillingError(false);
    try {
      await updateBillingMut({
        variables: {
          input: {
            billingName,
            billingCompany,
            billingOrgNumber,
            billingVatNumber,
            billingEmail,
            billingPhone,
            addressLine1: billingAddressLine1,
            addressLine2: billingAddressLine2,
            zip: billingZip,
            city: billingCity,
            country: billingCountry,
          },
        },
      });
      setBillingSaved(true);
      setTimeout(() => setBillingSaved(false), 3000);
    } catch {
      setBillingError(true);
    } finally {
      setSavingBilling(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubMut();
      await refetchSub();
      setCancelConfirm(false);
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateSubMut();
      await refetchSub();
    } catch (err) {
      console.error("Reactivate error:", err);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("sv-SE");

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      TRIALING: "bg-blue-50 text-blue-700 border-blue-200",
      PAST_DUE: "bg-amber-50 text-amber-700 border-amber-200",
      CANCELED: "bg-red-50 text-red-700 border-red-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: t("statusActive"),
      TRIALING: t("statusTrialing"),
      PAST_DUE: t("statusPastDue"),
      CANCELED: t("statusCanceled"),
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const hasCard = paymentMethods.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
          <p className="mt-1 text-text-muted">{t("subtitle")}</p>
        </div>

        {/* Current Plan skeleton */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="rounded-xl border-2 border-border-light p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>

        {/* Payment method skeleton */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="rounded-xl border border-border-light p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-14 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Billing details skeleton */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <Skeleton className="mb-5 h-4 w-32" />
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="mb-1.5 h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 mb-3 h-3 w-28" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="mb-1.5 h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-enter space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("currentPlan")}</h3>

        {subscription ? (
          <div className="space-y-4">
            {/* Active plan display */}
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-primary-deep">Basic</h4>
                    {statusBadge(subscription.status)}
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary">199 kr/{t("perMonth").split("/")[0].trim() ? "" : ""}mån</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <p className="mt-2 text-xs text-text-muted">
                  {t("cancelsAt")} {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
            </div>

            {/* Trial info */}
            {subscription.status === "TRIALING" && subscription.trialEnd && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                {t("trialInfo")} <strong>{formatDate(subscription.trialEnd)}</strong>. {t("trialInfoAfter")}
              </div>
            )}

            {/* Period info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {subscription.currentPeriodStart && (
                <div>
                  <span className="text-text-muted">{t("periodStart")}:</span>{" "}
                  <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                </div>
              )}
              {subscription.currentPeriodEnd && (
                <div>
                  <span className="text-text-muted">{t("periodEnd")}:</span>{" "}
                  <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              )}
            </div>

            {/* Cancel/reactivate */}
            <div className="pt-1">
              {subscription.cancelAtPeriodEnd ? (
                <Button variant="outline" size="sm" onClick={handleReactivate}>
                  {t("reactivateSubscription")}
                </Button>
              ) : cancelConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-error">{t("confirmCancel")}</p>
                  <Button variant="outline" size="sm" onClick={handleCancel}>{t("yesCancel")}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setCancelConfirm(false)}>{t("noKeep")}</Button>
                </div>
              ) : (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="text-xs font-medium text-text-muted hover:text-error transition-colors"
                >
                  {t("cancelSubscription")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Free plan - current */}
            <div className="rounded-xl border-2 border-border-light bg-primary-deep/[0.02] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-primary-deep">{t("freePlan")}</h4>
                    <span className="inline-flex items-center rounded-full border border-border-light bg-white px-2.5 py-0.5 text-xs font-medium text-text-muted">
                      {t("selectedPlan")}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-text-muted">{t("freePlanPrice")}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-deep/5">
                  <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </div>
              {freePlan && (
                <ul className="mt-3 space-y-1.5">
                  {freePlan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                      <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Upgrade section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-primary-deep">{t("availablePlans")}</h4>

              {!hasCard && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {t("requiresCard")}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {paidPlans.map((plan) => (
                  <div
                    key={plan.key}
                    className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-white to-primary/[0.03] p-5 transition-shadow hover:shadow-md"
                  >
                    <h4 className="text-lg font-bold text-primary-deep">{plan.name}</h4>
                    <p className="text-2xl font-bold text-primary">
                      {(plan.priceSek / 100).toFixed(0)} <span className="text-sm font-medium">kr/mån</span>
                    </p>
                    {plan.trialDays > 0 && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {plan.trialDays} {t("trialDaysFree")}
                      </p>
                    )}
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((f: string) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                          <svg className="h-3.5 w-3.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={!hasCard || subscribing}
                        onClick={() => handleSubscribe(plan.key)}
                      >
                        {subscribing ? t("processing") : t("choosePlan")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("paymentMethod")}</h3>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((pm: { id: string; brand: string; last4: string; expMonth: number; expYear: number }) => (
              <div
                key={pm.id}
                className="flex items-center justify-between rounded-xl border border-border-light p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-primary-deep to-primary">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-deep">
                      {pm.brand.toUpperCase()} **** {pm.last4}
                    </p>
                    <p className="text-xs text-text-muted">
                      {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleShowCardForm}>
              {t("changeCard")}
            </Button>
          </div>
        ) : showCardForm && clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#326586",
                  borderRadius: "8px",
                },
              },
              locale: "sv",
            }}
          >
            <CardSetupForm
              onSuccess={handleCardSuccess}
              onCancel={() => {
                setShowCardForm(false);
                setClientSecret(null);
              }}
            />
          </Elements>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border-light py-8">
            <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <p className="text-sm text-text-muted">{t("noCard")}</p>
            <Button variant="primary" size="sm" onClick={handleShowCardForm}>
              {t("addCard")}
            </Button>
          </div>
        )}
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("paymentHistory")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light text-left text-xs text-text-muted">
                  <th className="pb-2 font-medium">{t("date")}</th>
                  <th className="pb-2 font-medium">{t("amount")}</th>
                  <th className="pb-2 font-medium">{t("paymentStatus")}</th>
                  <th className="pb-2 font-medium">{t("invoice")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: { id: string; amountSek: number; currency: string; status: string; invoiceUrl: string | null; createdAt: string }) => (
                  <tr key={p.id} className="border-b border-border-light/50">
                    <td className="py-3">{formatDate(p.createdAt)}</td>
                    <td className="py-3 font-medium">
                      {(p.amountSek / 100).toFixed(0)} {p.currency.toUpperCase()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "SUCCEEDED"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "FAILED"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.status === "SUCCEEDED" ? t("paid") : p.status === "FAILED" ? t("failed") : p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.invoiceUrl && (
                        <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {t("viewInvoice")}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing details */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">{t("billingDetails")}</h3>

        {billingError && <Alert variant="error" className="mb-4">{t("billingSaveFailed")}</Alert>}
        {billingSaved && <Alert variant="success" className="mb-4">{t("billingSaved")}</Alert>}

        <p className="mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">{t("companyDetails")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingCompany")}</label>
            <Input value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingOrgNumber")}</label>
            <Input value={billingOrgNumber} onChange={(e) => setBillingOrgNumber(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingVatNumber")}</label>
            <Input value={billingVatNumber} onChange={(e) => setBillingVatNumber(e.target.value)} placeholder="SE123456789001" />
          </div>
        </div>

        <p className="mt-6 mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">{t("contactDetails")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingName")}</label>
            <Input value={billingName} onChange={(e) => setBillingName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingEmail")}</label>
            <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingPhone")}</label>
            <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} />
          </div>
        </div>

        <p className="mt-6 mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">{t("billingAddress")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingAddressLine1")}</label>
            <Input value={billingAddressLine1} onChange={(e) => setBillingAddressLine1(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingAddressLine2")}</label>
            <Input value={billingAddressLine2} onChange={(e) => setBillingAddressLine2(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingZip")}</label>
            <Input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingCity")}</label>
            <Input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("billingCountry")}</label>
            <Input value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
          </div>
        </div>

        <div className="mt-5">
          <Button variant="primary" onClick={handleSaveBilling} disabled={savingBilling}>
            {savingBilling ? t("savingBilling") : t("saveBilling")}
          </Button>
        </div>
      </div>
    </div>
  );
}
