"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AVAILABLE_PLANS, MY_PAYMENT_METHODS, MY_SUBSCRIPTION } from "@/graphql/queries";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const stripePromise =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

// ---------------------------------------------------------------------------
// Inline Card Setup Form
// ---------------------------------------------------------------------------

function CardForm({
  onSuccess,
  t,
}: {
  onSuccess: () => void;
  t: (key: string) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        return_url: window.location.href,
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
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button variant="primary" size="sm" type="submit" disabled={loading || !stripe} fullWidth>
        {loading ? t("processing") : t("addCard")}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Subscribe Dialog
// ---------------------------------------------------------------------------

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubscribed: () => void;
}

export default function SubscribeDialog({ open, onClose, onSubscribed }: SubscribeDialogProps) {
  const t = useTranslations("billing");

  const { data: plansData, loading: plansLoading } = useQuery<any>(AVAILABLE_PLANS, { skip: !open });
  const { data: methodsData, loading: methodsLoading, refetch: refetchMethods } = useQuery<any>(MY_PAYMENT_METHODS, { skip: !open });
  const { refetch: refetchSub } = useQuery<any>(MY_SUBSCRIPTION, { skip: !open });
  const queriesLoading = plansLoading || methodsLoading;

  const plans = (plansData?.availablePlans || []).filter((p: any) => p.key !== "free");
  const paymentMethods = methodsData?.myPaymentMethods || [];
  const hasCard = paymentMethods.length > 0;

  const [step, setStep] = useState<"plan" | "card">("plan");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPlan(null);
      setClientSecret(null);
      setLoadingSecret(false);
      setSubscribing(false);
      setError(null);
      // Don't set step here — wait for queries to load
    }
  }, [open]);

  // Set initial step once payment methods query has loaded
  useEffect(() => {
    if (open && methodsData) {
      const cards = methodsData.myPaymentMethods || [];
      if (cards.length > 0) {
        setStep("plan");
      } else if (!clientSecret && !loadingSecret) {
        setStep("card");
        fetchSetupIntent();
      }
    }
  }, [open, methodsData]); // eslint-disable-line react-hooks/exhaustive-deps

  const getToken = useCallback(async () => {
    const { getAccessToken } = await import("@/lib/auth-context");
    return getAccessToken();
  }, []);

  const fetchSetupIntent = async () => {
    setLoadingSecret(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_URL}/api/billing/setup-intent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setClientSecret(data.client_secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cardSetupFailed"));
    } finally {
      setLoadingSecret(false);
    }
  };

  const handleCardSuccess = async () => {
    await refetchMethods();
    setClientSecret(null);
    setStep("plan");
  };

  const handleSelectPlan = (planKey: string) => {
    setSelectedPlan(planKey);
    if (hasCard) {
      handleSubscribe(planKey);
    } else {
      setStep("card");
      if (!clientSecret && !loadingSecret) {
        fetchSetupIntent();
      }
    }
  };

  const handleSubscribe = async (planKey: string) => {
    setSubscribing(true);
    setError(null);
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
      await refetchSub();
      onSubscribed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubscribing(false);
    }
  };

  if (!open) return null;

  const selectedPlanData = plans.find((p: any) => p.key === selectedPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-border-light bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-primary-deep">
              {step === "card" ? t("step1AddCard") : t("choosePlan")}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {step === "card" ? t("addCardToSubscribe") : t("subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-primary-deep/5 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading queries */}
          {queriesLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Step: Add card */}
          {!queriesLoading && step === "card" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#326586", borderRadius: "8px" },
                },
                locale: "sv",
              }}
            >
              <CardForm onSuccess={handleCardSuccess} t={t} />
            </Elements>
          )}

          {!queriesLoading && step === "card" && !clientSecret && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              {loadingSecret && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {!loadingSecret && error && (
                <Button variant="outline" size="sm" onClick={fetchSetupIntent}>
                  {t("cancel") === "Avbryt" ? "Försök igen" : "Try again"}
                </Button>
              )}
            </div>
          )}

          {/* Step: Choose plan */}
          {!queriesLoading && step === "plan" && (
            <div className="space-y-3">
              {/* Show current card */}
              {hasCard && paymentMethods[0] && (
                <div className="flex items-center gap-3 rounded-xl border border-border-light p-3">
                  <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary-deep to-primary">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-primary-deep">
                      {paymentMethods[0].brand.toUpperCase()} **** {paymentMethods[0].last4}
                    </span>
                    <span className="ml-2 text-text-muted">
                      {String(paymentMethods[0].expMonth).padStart(2, "0")}/{paymentMethods[0].expYear}
                    </span>
                  </div>
                </div>
              )}

              {/* Plan cards */}
              {plans.map((plan: any) => (
                <div
                  key={plan.key}
                  className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-white to-primary/[0.03] p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-primary-deep">{plan.name}</h4>
                      <p className="text-xl font-bold text-primary">
                        {(plan.priceSek / 100).toFixed(0)} <span className="text-sm font-medium">kr/mån</span>
                      </p>
                      {plan.trialDays > 0 && (
                        <p className="mt-0.5 text-xs text-text-muted">
                          {plan.trialDays} {t("trialDaysFree")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={subscribing}
                      onClick={() => handleSelectPlan(plan.key)}
                    >
                      {subscribing && selectedPlan === plan.key ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {t("processing")}
                        </span>
                      ) : (
                        t("choosePlan")
                      )}
                    </Button>
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
