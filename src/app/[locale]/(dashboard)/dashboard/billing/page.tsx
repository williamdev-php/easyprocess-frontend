"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { useAuth } from "@/lib/auth-context";
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
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
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

export default function BillingPage() {
  const { user } = useAuth();
  const t = useTranslations("billing");

  // GraphQL queries
  const { data: subData, refetch: refetchSub } = useQuery(MY_SUBSCRIPTION);
  const { data: paymentsData, refetch: refetchPayments } = useQuery(MY_PAYMENTS, {
    variables: { limit: 10, offset: 0 },
  });
  const { data: billingData, refetch: refetchBilling } = useQuery(MY_BILLING_DETAILS);
  const { data: methodsData, refetch: refetchMethods } = useQuery(MY_PAYMENT_METHODS);
  const { data: plansData } = useQuery(AVAILABLE_PLANS);

  // GraphQL mutations
  const [updateBillingMut] = useMutation(UPDATE_BILLING_DETAILS);
  const [cancelSubMut] = useMutation(CANCEL_SUBSCRIPTION);
  const [reactivateSubMut] = useMutation(REACTIVATE_SUBSCRIPTION);

  const subscription = subData?.mySubscription;
  const payments = paymentsData?.myPayments?.items || [];
  const billingDetails = billingData?.myBillingDetails;
  const paymentMethods = methodsData?.myPaymentMethods || [];
  const plans = plansData?.availablePlans || [];

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

  // Get access token from auth context for REST calls
  const getToken = useCallback(async () => {
    const { getAccessToken } = await import("@/lib/auth-context");
    return getAccessToken();
  }, []);

  // Start card setup flow
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

  // After card is added, create subscription if none exists
  const handleCardSuccess = async () => {
    setShowCardForm(false);
    setClientSecret(null);
    await refetchMethods();

    if (!subscription) {
      setSubscribing(true);
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/billing/subscribe`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Subscribe failed");
        }
        await refetchSub();
      } catch (err) {
        console.error("Subscribe error:", err);
      } finally {
        setSubscribing(false);
      }
    }
  };

  // Save billing details
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

  // Cancel subscription
  const handleCancel = async () => {
    try {
      await cancelSubMut();
      await refetchSub();
      setCancelConfirm(false);
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Reactivate subscription
  const handleReactivate = async () => {
    try {
      await reactivateSubMut();
      await refetchSub();
    } catch (err) {
      console.error("Reactivate error:", err);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sv-SE");
  };

  // Status badge
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      TRIALING: "bg-blue-100 text-blue-800",
      PAST_DUE: "bg-yellow-100 text-yellow-800",
      CANCELED: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      ACTIVE: t("statusActive"),
      TRIALING: t("statusTrialing"),
      PAST_DUE: t("statusPastDue"),
      CANCELED: t("statusCanceled"),
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Subscription status */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">
          {t("subscriptionStatus")}
        </h3>

        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-primary-deep">
                  Qvicko — 199 kr/mån
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {statusBadge(subscription.status)}
                  {subscription.cancelAtPeriodEnd && (
                    <span className="text-xs text-text-muted">
                      {t("cancelsAt")} {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {subscription.status === "TRIALING" && subscription.trialEnd && (
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                {t("trialInfo")} <strong>{formatDate(subscription.trialEnd)}</strong>.{" "}
                {t("trialInfoAfter")}
              </div>
            )}

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

            <div className="pt-2">
              {subscription.cancelAtPeriodEnd ? (
                <Button variant="outline" size="sm" onClick={handleReactivate}>
                  {t("reactivateSubscription")}
                </Button>
              ) : cancelConfirm ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-error">{t("confirmCancel")}</p>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    {t("yesCancel")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCancelConfirm(false)}>
                    {t("noKeep")}
                  </Button>
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
          <div className="space-y-4">
            {plans.map((plan: { key: string; name: string; priceSek: number; trialDays: number; features: string[] }) => (
              <div
                key={plan.key}
                className="rounded-2xl border-2 border-primary-deep bg-primary-deep/5 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-primary-deep">{plan.name}</h4>
                    <p className="text-xl font-bold text-primary">
                      {(plan.priceSek / 100).toFixed(0)} kr/mån
                    </p>
                    <p className="text-xs text-text-muted">
                      {plan.trialDays} {t("trialDaysFree")}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                      <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {subscribing && (
              <Alert variant="info">{t("creatingSubscription")}</Alert>
            )}

            {!subscription && paymentMethods.length === 0 && (
              <p className="text-sm text-text-muted">{t("addCardToSubscribe")}</p>
            )}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">
          {t("paymentMethod")}
        </h3>

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
                  colorPrimary: "#4F46E5",
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
            <Button variant="outline" size="sm" onClick={handleShowCardForm}>
              {t("addCard")}
            </Button>
          </div>
        )}
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">
            {t("paymentHistory")}
          </h3>
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
                            ? "bg-green-100 text-green-800"
                            : p.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p.status === "SUCCEEDED" ? t("paid") : p.status === "FAILED" ? t("failed") : p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.invoiceUrl && (
                        <a
                          href={p.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
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
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">
          {t("billingDetails")}
        </h3>

        {billingError && <Alert variant="error" className="mb-4">{t("billingSaveFailed")}</Alert>}
        {billingSaved && <Alert variant="success" className="mb-4">{t("billingSaved")}</Alert>}

        {/* Company details */}
        <p className="mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">
          {t("companyDetails")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingCompany")}
            </label>
            <Input value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingOrgNumber")}
            </label>
            <Input value={billingOrgNumber} onChange={(e) => setBillingOrgNumber(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingVatNumber")}
            </label>
            <Input value={billingVatNumber} onChange={(e) => setBillingVatNumber(e.target.value)} placeholder="SE123456789001" />
          </div>
        </div>

        {/* Contact details */}
        <p className="mt-6 mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">
          {t("contactDetails")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingName")}
            </label>
            <Input value={billingName} onChange={(e) => setBillingName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingEmail")}
            </label>
            <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingPhone")}
            </label>
            <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} />
          </div>
        </div>

        {/* Billing address */}
        <p className="mt-6 mb-3 text-xs font-medium text-text-muted uppercase tracking-wide">
          {t("billingAddress")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingAddressLine1")}
            </label>
            <Input value={billingAddressLine1} onChange={(e) => setBillingAddressLine1(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingAddressLine2")}
            </label>
            <Input value={billingAddressLine2} onChange={(e) => setBillingAddressLine2(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingZip")}
            </label>
            <Input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingCity")}
            </label>
            <Input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("billingCountry")}
            </label>
            <Input value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} />
          </div>
        </div>

        <div className="mt-5">
          <Button
            variant="primary"
            onClick={handleSaveBilling}
            disabled={savingBilling}
          >
            {savingBilling ? t("savingBilling") : t("saveBilling")}
          </Button>
        </div>
      </div>
    </div>
  );
}
