"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MY_DOMAINS, MY_SITES, SEARCH_DOMAIN, MY_PURCHASED_DOMAINS } from "@/graphql/queries";
import {
  ADD_DOMAIN,
  REMOVE_DOMAIN,
  ASSIGN_DOMAIN_TO_SITE,
  VERIFY_DOMAIN,
  PREPARE_DOMAIN_TRANSFER,
  LOCK_DOMAIN,
  TOGGLE_DOMAIN_AUTO_RENEW,
  RENEW_PURCHASED_DOMAIN,
} from "@/graphql/mutations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const stripePromise =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

function normalizeDomain(input: string): string {
  let d = input.trim();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.replace(/\/+$/, "");
  return d;
}

function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain);
}

interface VercelVerification {
  verified?: boolean;
  verification?: Array<{ type: string; domain: string; value: string }>;
  configured?: boolean;
  misconfigured?: boolean;
  instructions?: string;
}

interface DomainItem {
  id: string;
  domain: string;
  siteId: string | null;
  status: string;
  siteSubdomain: string | null;
  siteBusinessName: string | null;
  verifiedAt: string | null;
  createdAt: string;
  vercelVerification: VercelVerification | null;
}

interface SiteItem {
  id: string;
  businessName: string | null;
  subdomain: string | null;
  status: string;
  siteData: Record<string, unknown>;
}

interface DomainSearchResultData {
  available: boolean;
  domain: string;
  priceSek: number;
  priceSekDisplay: number;
  priceUsd: number;
  period: number;
}

interface DomainPurchaseItem {
  id: string;
  domain: string;
  priceSek: number;
  status: string;
  periodYears: number;
  autoRenew: boolean;
  isLocked: boolean;
  expiresAt: string | null;
  purchasedAt: string | null;
  createdAt: string;
}

interface TransferInfo {
  domain: string;
  authCode: string | null;
  instructions: string;
}

// Stripe payment form for domain purchase
function DomainPaymentForm({
  clientSecret,
  domain,
  priceSekDisplay,
  onSuccess,
  onCancel,
  t,
}: {
  clientSecret: string;
  domain: string;
  priceSekDisplay: number;
  onSuccess: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || t("paymentFailed"));
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary-deep">{domain}</span>
          <span className="text-lg font-bold text-primary">{priceSekDisplay} kr/{t("year")}</span>
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={!stripe || processing} className="flex-1">
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("processing")}
            </span>
          ) : (
            t("confirmPurchase")
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={processing}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

export default function DomainPage() {
  const { user } = useAuth();
  const t = useTranslations("userDomain");

  const [visible, setVisible] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [normalizedDomain, setNormalizedDomain] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [selectedSiteForDomain, setSelectedSiteForDomain] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [latestVercelInfo, setLatestVercelInfo] = useState<VercelVerification | null>(null);

  // Domain purchase state
  const [buyDomainInput, setBuyDomainInput] = useState("");
  const [searchResult, setSearchResult] = useState<DomainSearchResultData | null>(null);
  const [searching, setSearching] = useState(false);
  const [purchaseClientSecret, setPurchaseClientSecret] = useState<string | null>(null);
  const [purchaseDomain, setPurchaseDomain] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [selectedSiteForPurchase, setSelectedSiteForPurchase] = useState("");

  // Queries
  const { data: domainsData, refetch: refetchDomains } = useQuery<{ myDomains: DomainItem[] }>(MY_DOMAINS);
  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES);
  const { data: purchasedData, refetch: refetchPurchased } = useQuery<{ myPurchasedDomains: DomainPurchaseItem[] }>(MY_PURCHASED_DOMAINS);
  const [searchDomainQuery] = useLazyQuery<{ searchDomain: DomainSearchResultData }>(SEARCH_DOMAIN);

  // Mutations
  const [addDomain, { loading: adding }] = useMutation<{ addDomain: DomainItem }>(ADD_DOMAIN);
  const [removeDomain] = useMutation(REMOVE_DOMAIN);
  const [assignDomainToSite] = useMutation(ASSIGN_DOMAIN_TO_SITE);
  const [verifyDomain] = useMutation<{ verifyDomain: DomainItem }>(VERIFY_DOMAIN);
  const [prepareDomainTransfer] = useMutation<{ prepareDomainTransfer: TransferInfo }>(PREPARE_DOMAIN_TRANSFER);
  const [lockDomainMutation] = useMutation(LOCK_DOMAIN);
  const [toggleAutoRenew] = useMutation(TOGGLE_DOMAIN_AUTO_RENEW);
  const [renewDomain] = useMutation(RENEW_PURCHASED_DOMAIN);

  const domains: DomainItem[] = domainsData?.myDomains || [];
  const sites: SiteItem[] = sitesData?.mySites || [];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const normalized = normalizeDomain(domainInput);
    setNormalizedDomain(normalized);
    setIsValid(isValidDomain(normalized));
  }, [domainInput]);

  // Auto-clear message after 4 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  const handleAddDomain = async () => {
    if (!isValid) return;
    try {
      const result = await addDomain({
        variables: {
          input: {
            domain: normalizedDomain,
            siteId: selectedSiteForDomain || null,
          },
        },
      });
      const vercelInfo = result.data?.addDomain?.vercelVerification;
      if (vercelInfo) {
        setLatestVercelInfo(vercelInfo);
      }
      setDomainInput("");
      setSelectedSiteForDomain("");
      showMessage("success", t("domainAdded"));
      refetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    try {
      await removeDomain({ variables: { domainId } });
      showMessage("success", t("domainRemoved"));
      refetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleAssignDomain = async (domainId: string, siteId: string) => {
    try {
      await assignDomainToSite({
        variables: { input: { domainId, siteId } },
      });
      showMessage("success", t("domainAssigned"));
      refetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const result = await verifyDomain({ variables: { domainId } });
      const vercelInfo = result.data?.verifyDomain?.vercelVerification;
      if (vercelInfo) {
        setLatestVercelInfo(vercelInfo);
      }
      if (result.data?.verifyDomain?.status === "ACTIVE") {
        showMessage("success", t("domainVerified"));
      }
      refetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const purchasedDomains: DomainPurchaseItem[] = purchasedData?.myPurchasedDomains || [];
  const [transferInfo, setTransferInfo] = useState<TransferInfo | null>(null);
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);

  const handlePrepareTransfer = async (domainId: string) => {
    try {
      const result = await prepareDomainTransfer({ variables: { domainId } });
      if (result.data?.prepareDomainTransfer) {
        setTransferInfo(result.data.prepareDomainTransfer);
      }
      refetchPurchased();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleLockDomain = async (domainId: string) => {
    try {
      await lockDomainMutation({ variables: { domainId } });
      setTransferInfo(null);
      showMessage("success", t("domainLocked"));
      refetchPurchased();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleToggleAutoRenew = async (domainId: string, autoRenew: boolean) => {
    try {
      await toggleAutoRenew({ variables: { domainId, autoRenew } });
      refetchPurchased();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleRenewDomain = async (domainId: string) => {
    try {
      await renewDomain({ variables: { domainId } });
      showMessage("success", t("domainRenewed"));
      refetchPurchased();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleSearchDomain = useCallback(async () => {
    const domain = normalizeDomain(buyDomainInput);
    if (!isValidDomain(domain)) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const result = await searchDomainQuery({ variables: { domain } });
      if (result.data?.searchDomain) {
        setSearchResult(result.data.searchDomain);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    } finally {
      setSearching(false);
    }
  }, [buyDomainInput, searchDomainQuery]);

  const handleStartPurchase = async () => {
    if (!searchResult?.available) return;

    try {
      const { getAccessToken } = await import("@/lib/auth-context");
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/billing/domain/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain: searchResult.domain,
          site_id: selectedSiteForPurchase || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Purchase failed");
      }

      const data = await res.json();
      setPurchaseClientSecret(data.client_secret);
      setPurchaseDomain(data.domain);
      setPurchasePrice(data.price_sek_display);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handlePurchaseSuccess = () => {
    setPurchaseClientSecret(null);
    setPurchaseDomain("");
    setPurchasePrice(0);
    setBuyDomainInput("");
    setSearchResult(null);
    setSelectedSiteForPurchase("");
    showMessage("success", t("domainPurchased"));
    refetchDomains();
    refetchPurchased();
  };

  const handleCancelPurchase = () => {
    setPurchaseClientSecret(null);
    setPurchaseDomain("");
    setPurchasePrice(0);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      FAILED: "bg-red-50 text-red-700 border-red-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: t("verified"),
      PENDING: t("pending"),
      FAILED: t("failed"),
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Find sites with subdomains for preview
  const sitesWithSubdomain = sites.filter((s) => s.subdomain);

  return (
    <div className={`space-y-6 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm animate-slide-down ${
          message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Active subdomains (read-only, auto-assigned) */}
      {sitesWithSubdomain.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-white p-6 transition-shadow hover:shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-primary-deep">{t("subdomainSection")}</h3>
          <p className="mb-4 text-sm text-text-muted">{t("subdomainDesc")}</p>
          <div className="space-y-2">
            {sitesWithSubdomain.map((site) => (
              <div key={site.id} className="flex items-center gap-3 rounded-xl border border-border-light bg-primary-deep/[0.02] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-deep">
                    {site.businessName || "Hemsida"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {t("subdomainPreview")}{" "}
                    <span className="font-mono font-medium text-primary">
                      {site.subdomain}.qvicko.se
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy domain section */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-primary/[0.03] p-6 transition-shadow hover:shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <h3 className="text-sm font-semibold text-primary-deep">{t("buyDomainSection")}</h3>
        </div>
        <p className="mb-4 text-sm text-text-muted">{t("buyDomainDesc")}</p>

        {/* Search form */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              value={buyDomainInput}
              onChange={(e) => {
                setBuyDomainInput(e.target.value);
                setSearchResult(null);
              }}
              placeholder={t("buyDomainPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && handleSearchDomain()}
            />
          </div>
          <Button
            variant="primary"
            disabled={!isValidDomain(normalizeDomain(buyDomainInput)) || searching}
            onClick={handleSearchDomain}
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("searching")}
              </span>
            ) : (
              t("searchDomain")
            )}
          </Button>
        </div>

        {/* Search result */}
        {searchResult && (
          <div className="mt-4 animate-slide-down">
            {searchResult.available ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-emerald-800">{searchResult.domain}</span>
                      <span className="text-xs text-emerald-600">{t("available")}</span>
                    </div>
                    <p className="mt-1 text-sm text-emerald-700">
                      {searchResult.priceSekDisplay} kr/{t("year")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSiteForPurchase}
                      onChange={(e) => setSelectedSiteForPurchase(e.target.value)}
                      className="rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-xs text-primary-deep focus:border-primary focus:outline-none"
                    >
                      <option value="">{t("selectSiteOptional")}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.businessName || site.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                    <Button variant="primary" onClick={handleStartPurchase}>
                      {t("buyDomain")}
                    </Button>
                  </div>
                </div>

                {/* Stripe payment form */}
                {purchaseClientSecret && (
                  <div className="mt-4 border-t border-emerald-200 pt-4">
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: purchaseClientSecret,
                        appearance: { theme: "stripe", variables: { colorPrimary: "#1a3a4a" } },
                        locale: "sv",
                      }}
                    >
                      <DomainPaymentForm
                        clientSecret={purchaseClientSecret}
                        domain={purchaseDomain}
                        priceSekDisplay={purchasePrice}
                        onSuccess={handlePurchaseSuccess}
                        onCancel={handleCancelPurchase}
                        t={t}
                      />
                    </Elements>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium text-red-800">{searchResult.domain}</span>
                  <span className="text-xs text-red-600">{t("notAvailable")}</span>
                </div>
                <p className="mt-1 text-sm text-red-600">{t("tryAnother")}</p>
              </div>
            )}
          </div>
        )}

        {/* Purchased domains list */}
        {purchasedDomains.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{t("purchasedDomains")}</p>
            {purchasedDomains.map((dp) => (
              <div key={dp.id} className="rounded-lg border border-border-light bg-white">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary-deep/[0.01] transition-colors"
                  onClick={() => setExpandedDomainId(expandedDomainId === dp.id ? null : dp.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary-deep text-sm">{dp.domain}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      dp.status === "PURCHASED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : dp.status === "PENDING_PAYMENT"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {dp.status === "PURCHASED" ? t("active") : dp.status === "PENDING_PAYMENT" ? t("pendingPayment") : dp.status}
                    </span>
                    {dp.isLocked && (
                      <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {dp.expiresAt && (
                      <span className="text-xs text-text-muted">
                        {t("expiresAt")}: {new Date(dp.expiresAt).toLocaleDateString("sv-SE")}
                      </span>
                    )}
                    <svg className={`h-4 w-4 text-text-muted transition-transform ${expandedDomainId === dp.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded management panel */}
                {expandedDomainId === dp.id && dp.status === "PURCHASED" && (
                  <div className="border-t border-border-light p-3 space-y-3 animate-slide-down">
                    {/* Auto-renewal toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary-deep">{t("autoRenewal")}</p>
                        <p className="text-xs text-text-muted">{t("autoRenewalDesc")}</p>
                      </div>
                      <button
                        onClick={() => handleToggleAutoRenew(dp.id, !dp.autoRenew)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          dp.autoRenew ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dp.autoRenew ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>

                    {/* Manual renewal */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary-deep">{t("manualRenewal")}</p>
                        <p className="text-xs text-text-muted">{t("manualRenewalDesc")}</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleRenewDomain(dp.id)}>
                        {t("renewNow")}
                      </Button>
                    </div>

                    {/* Transfer section */}
                    <div className="border-t border-border-light pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-primary-deep">{t("transferDomain")}</p>
                          <p className="text-xs text-text-muted">{t("transferDomainDesc")}</p>
                        </div>
                        {dp.isLocked ? (
                          <Button variant="secondary" size="sm" onClick={() => handlePrepareTransfer(dp.id)}>
                            {t("unlockAndTransfer")}
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleLockDomain(dp.id)}>
                            {t("lockDomain")}
                          </Button>
                        )}
                      </div>

                      {/* Transfer info panel */}
                      {transferInfo && transferInfo.domain === dp.domain && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2 animate-slide-down">
                          <p className="text-xs text-amber-800">{transferInfo.instructions}</p>
                          {transferInfo.authCode && (
                            <div className="rounded-lg bg-white p-2">
                              <p className="text-xs text-text-muted mb-1">{t("authCode")}:</p>
                              <code className="block text-sm font-mono font-bold text-primary-deep select-all break-all">
                                {transferInfo.authCode}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom domains section */}
      <div className="rounded-2xl border border-border-light bg-white p-6 transition-shadow hover:shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-primary-deep">{t("customDomainSection")}</h3>
        <p className="mb-4 text-sm text-text-muted">{t("customDomainDesc")}</p>

        {/* Add domain form */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder={t("domainPlaceholder")}
              className={domainInput && !isValid ? "border-error" : ""}
            />
            {domainInput && (
              <div className="mt-2 flex items-center gap-2">
                {isValid ? (
                  <>
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-emerald-600">{normalizedDomain}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-error">{t("invalidDomain")}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <select
            value={selectedSiteForDomain}
            onChange={(e) => setSelectedSiteForDomain(e.target.value)}
            className="rounded-xl border border-border-light bg-white px-3 py-2 text-sm text-primary-deep focus:border-primary focus:outline-none"
          >
            <option value="">{t("selectSite")}</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.businessName || site.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            disabled={!isValid || adding}
            onClick={handleAddDomain}
          >
            {adding ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("connecting")}
              </span>
            ) : (
              t("addDomain")
            )}
          </Button>
        </div>
        <p className="mt-3 text-xs text-text-muted">{t("formatHint")}</p>
      </div>

      {/* Domain list */}
      {domains.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-white p-6 transition-shadow hover:shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("myDomains")}</h3>
          <div className="space-y-3">
            {domains.map((domain) => (
              <div key={domain.id} className="flex flex-col gap-3 rounded-xl border border-border-light p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="font-medium text-primary-deep">{domain.domain}</span>
                    {statusBadge(domain.status)}
                  </div>
                  {domain.siteId && domain.siteSubdomain && (
                    <p className="mt-1 text-xs text-text-muted">
                      {t("site")}: {domain.siteBusinessName || domain.siteSubdomain}
                    </p>
                  )}
                  {!domain.siteId && (
                    <p className="mt-1 text-xs text-text-muted">{t("unassigned")}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Assign to site dropdown */}
                  {!domain.siteId && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignDomain(domain.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="rounded-lg border border-border-light bg-white px-2 py-1.5 text-xs text-primary-deep focus:border-primary focus:outline-none"
                    >
                      <option value="">{t("assignToSite")}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.businessName || site.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Verify button */}
                  {domain.status !== "ACTIVE" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleVerifyDomain(domain.id)}
                    >
                      {t("verify")}
                    </Button>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveDomain(domain.id)}
                    className="rounded-lg px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {t("removeDomain")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS setup instructions (visible when there are pending/failed domains) */}
      {domains.some((d) => d.status !== "ACTIVE") && (
        <div className="rounded-2xl border border-border-light bg-white p-6 animate-slide-down">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("dnsSetup")}</h3>

          {/* Per-domain Vercel verification records (TXT) */}
          {(() => {
            const pendingDomains = domains.filter((d) => d.status !== "ACTIVE");
            const domainWithVerification = pendingDomains.find(
              (d) => d.vercelVerification?.verification?.length
            );
            const verificationSource = domainWithVerification?.vercelVerification || latestVercelInfo;
            const txtRecords = verificationSource?.verification || [];

            return txtRecords.length > 0 ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-amber-800">{t("verificationRequired")}</p>
                {txtRecords.map((rec, i) => (
                  <div key={i} className="mt-2 rounded-lg bg-white p-3 font-mono text-xs text-primary-deep">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Type:</span> <span>{rec.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Name:</span> <span>{rec.domain || "_vercel"}</span>
                    </div>
                    <div className="flex justify-between break-all">
                      <span className="text-text-muted">Value:</span> <span className="ml-2 text-right">{rec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          <div className="space-y-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-deep text-xs font-bold text-white">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-deep">
                    {t(`step${step}Title`)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                    {t(`step${step}Desc`)}
                  </p>
                  {step === 2 && (
                    <div className="mt-2 rounded-lg bg-primary-deep/[0.03] p-3 font-mono text-xs text-primary-deep">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Type:</span> <span>CNAME</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Name:</span> <span>@</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Value:</span> <span>cname.vercel-dns.com</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-800">{t("dnsWait")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
