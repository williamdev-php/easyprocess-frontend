"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const plans = [
  {
    key: "free" as const,
    price: "freePriceLabel",
    desc: "freeDesc",
    features: "freeFeatures",
  },
  {
    key: "starter" as const,
    price: "starterPriceLabel",
    desc: "starterDesc",
    features: "starterFeatures",
    popular: true,
  },
  {
    key: "pro" as const,
    price: "proPriceLabel",
    desc: "proDesc",
    features: "proFeatures",
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const t = useTranslations("billing");

  const [selectedPlan, setSelectedPlan] = useState("free");
  const [hasCard, setHasCard] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Billing details pre-filled from account data
  const [billingName, setBillingName] = useState(user?.fullName || "");
  const [billingCompany, setBillingCompany] = useState(user?.companyName || "");
  const [billingOrgNumber, setBillingOrgNumber] = useState(user?.orgNumber || "");
  const [billingVatNumber, setBillingVatNumber] = useState("");
  const [billingEmail, setBillingEmail] = useState(user?.email || "");
  const [billingPhone, setBillingPhone] = useState(user?.phone || "");
  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState(user?.country || "");

  const [savingBilling, setSavingBilling] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);
  const [billingError, setBillingError] = useState(false);

  const handleSaveBilling = async () => {
    setSavingBilling(true);
    setBillingSaved(false);
    setBillingError(false);
    try {
      // TODO: Save billing details via API
      await new Promise((r) => setTimeout(r, 800));
      setSavingBilling(false);
      setBillingSaved(true);
      setTimeout(() => setBillingSaved(false), 3000);
    } catch {
      setSavingBilling(false);
      setBillingError(true);
    }
  };

  const handleAddCard = () => {
    // TODO: Integrate with payment provider
    setHasCard(true);
    setShowCardForm(false);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Plan selection */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">
          {t("currentPlan")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary-deep bg-primary-deep/5 shadow-md"
                    : "border-border-light bg-white hover:border-primary/30 hover:shadow-sm"
                }`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-deep px-3 py-0.5 text-[10px] font-semibold text-white">
                    Populär
                  </div>
                )}
                <h4 className="text-lg font-bold text-primary-deep">
                  {t(plan.key)}
                </h4>
                <p className="mt-1 text-xl font-bold text-primary">
                  {t(plan.price)}
                </p>
                <p className="mt-1 text-xs text-text-muted">{t(plan.desc)}</p>
                <ul className="mt-4 space-y-2">
                  {t(plan.features)
                    .split(", ")
                    .map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-xs text-text-secondary"
                      >
                        <svg
                          className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-text-muted"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                </ul>
                <div className="mt-4">
                  {isSelected ? (
                    <div className="w-full rounded-xl bg-primary-deep/10 py-2 text-center text-xs font-semibold text-primary-deep">
                      {t("selected")}
                    </div>
                  ) : (
                    <button className="w-full rounded-xl border border-primary-deep/20 py-2 text-xs font-semibold text-primary-deep transition-colors hover:bg-primary-deep/5">
                      {t("selectPlan")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">
          {t("paymentMethod")}
        </h3>
        {hasCard ? (
          <div className="flex items-center justify-between rounded-xl border border-border-light p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-primary-deep to-primary">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-deep">
                  **** **** **** 4242
                </p>
                <p className="text-xs text-text-muted">12/27</p>
              </div>
            </div>
            <button
              onClick={() => setHasCard(false)}
              className="text-xs font-medium text-error transition-colors hover:text-error/80"
            >
              {t("removeCard")}
            </button>
          </div>
        ) : showCardForm ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                {t("cardNumber")}
              </label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("cardExpiry")}
                </label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  {t("cardCvc")}
                </label>
                <Input
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="primary" size="sm" onClick={handleAddCard}>
                {t("addCard")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCardForm(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border-light py-8">
            <svg
              className="h-8 w-8 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
            <p className="text-sm text-text-muted">{t("noCard")}</p>
            <Button variant="outline" size="sm" onClick={() => setShowCardForm(true)}>
              {t("addCard")}
            </Button>
          </div>
        )}
      </div>

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
