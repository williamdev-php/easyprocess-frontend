"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MY_DOMAINS, MY_SITES } from "@/graphql/queries";
import {
  ADD_DOMAIN,
  REMOVE_DOMAIN,
  ASSIGN_DOMAIN_TO_SITE,
  VERIFY_DOMAIN,
  SET_SITE_SUBDOMAIN,
} from "@/graphql/mutations";

function normalizeDomain(input: string): string {
  let d = input.trim();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.replace(/\/+$/, "");
  return d;
}

function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  return /^[a-zA-Z0-9åäöÅÄÖ-]+(\.[a-zA-Z0-9åäöÅÄÖ-]+)+$/.test(domain);
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
}

interface SiteItem {
  id: string;
  businessName: string | null;
  subdomain: string | null;
  status: string;
  siteData: Record<string, unknown>;
}

export default function DomainPage() {
  const { user } = useAuth();
  const t = useTranslations("userDomain");

  const [visible, setVisible] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [normalizedDomain, setNormalizedDomain] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [selectedSiteForDomain, setSelectedSiteForDomain] = useState("");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [selectedSiteForSubdomain, setSelectedSiteForSubdomain] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Queries
  const { data: domainsData, refetch: refetchDomains } = useQuery(MY_DOMAINS);
  const { data: sitesData } = useQuery(MY_SITES);

  // Mutations
  const [addDomain, { loading: adding }] = useMutation(ADD_DOMAIN);
  const [removeDomain] = useMutation(REMOVE_DOMAIN);
  const [assignDomainToSite] = useMutation(ASSIGN_DOMAIN_TO_SITE);
  const [verifyDomain] = useMutation(VERIFY_DOMAIN);
  const [setSiteSubdomain, { loading: settingSubdomain }] = useMutation(SET_SITE_SUBDOMAIN);

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
      await addDomain({
        variables: {
          input: {
            domain: normalizedDomain,
            siteId: selectedSiteForDomain || null,
          },
        },
      });
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
      await verifyDomain({ variables: { domainId } });
      refetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
  };

  const handleSetSubdomain = async () => {
    if (!subdomainInput.trim() || !selectedSiteForSubdomain) return;
    try {
      await setSiteSubdomain({
        variables: {
          siteId: selectedSiteForSubdomain,
          subdomain: subdomainInput.trim(),
        },
      });
      setSubdomainInput("");
      showMessage("success", t("subdomainSet"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      showMessage("error", msg);
    }
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

      {/* Subdomain section */}
      <div className="rounded-2xl border border-border-light bg-white p-6 transition-shadow hover:shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-primary-deep">{t("subdomainSection")}</h3>
        <p className="mb-4 text-sm text-text-muted">{t("subdomainDesc")}</p>

        {/* Existing subdomains */}
        {sitesWithSubdomain.length > 0 && (
          <div className="mb-4 space-y-2">
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
        )}

        {/* Set subdomain form */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedSiteForSubdomain}
            onChange={(e) => setSelectedSiteForSubdomain(e.target.value)}
            className="flex-1 rounded-xl border border-border-light bg-white px-3 py-2 text-sm text-primary-deep focus:border-primary focus:outline-none"
          >
            <option value="">{t("selectSite")}</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.businessName || site.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <div className="flex flex-1 items-center gap-1">
            <Input
              value={subdomainInput}
              onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder={t("subdomainPlaceholder")}
              className="flex-1"
            />
            <span className="text-sm text-text-muted whitespace-nowrap">.qvicko.se</span>
          </div>
          <Button
            variant="primary"
            disabled={!subdomainInput.trim() || !selectedSiteForSubdomain || settingSubdomain}
            onClick={handleSetSubdomain}
          >
            {settingSubdomain ? t("settingSubdomain") : t("setSubdomain")}
          </Button>
        </div>
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

      {/* DNS setup instructions (always visible when there are pending domains) */}
      {domains.some((d) => d.status === "PENDING") && (
        <div className="rounded-2xl border border-border-light bg-white p-6 animate-slide-down">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("dnsSetup")}</h3>
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
                        <span className="text-text-muted">Value:</span> <span>proxy.qvicko.se</span>
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
