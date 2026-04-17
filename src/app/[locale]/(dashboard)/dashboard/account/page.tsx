"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      fullName
      companyName
      orgNumber
      phone
    }
  }
`;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function FieldSpinner() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function SavedCheck() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  const t = useTranslations("userAccount");
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [orgNumber, setOrgNumber] = useState(user?.orgNumber || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");

  // Track which field is currently saving / just saved
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const debouncedFullName = useDebounce(fullName, 1500);
  const debouncedCompanyName = useDebounce(companyName, 1500);
  const debouncedOrgNumber = useDebounce(orgNumber, 1500);
  const debouncedPhone = useDebounce(phone, 1500);
  const debouncedCountry = useDebounce(country, 1500);

  const initialMount = useRef(true);
  const prevValues = useRef({ fullName, companyName, orgNumber, phone, country });

  const save = useCallback(
    async (field: string) => {
      setSavingField(field);
      setSavedField(null);
      setError(false);
      try {
        await updateProfile({
          variables: {
            input: {
              fullName: field === "fullName" ? debouncedFullName : prevValues.current.fullName,
              companyName: field === "companyName" ? debouncedCompanyName : prevValues.current.companyName,
              orgNumber: field === "orgNumber" ? debouncedOrgNumber : prevValues.current.orgNumber,
              phone: field === "phone" ? debouncedPhone : prevValues.current.phone,
              country: field === "country" ? debouncedCountry : prevValues.current.country,
            },
          },
        });
        prevValues.current = {
          ...prevValues.current,
          [field]:
            field === "fullName"
              ? debouncedFullName
              : field === "companyName"
                ? debouncedCompanyName
                : field === "orgNumber"
                  ? debouncedOrgNumber
                  : field === "phone"
                    ? debouncedPhone
                    : debouncedCountry,
        };
        setSavingField(null);
        setSavedField(field);
        setTimeout(() => setSavedField((prev) => (prev === field ? null : prev)), 2000);
      } catch {
        setSavingField(null);
        setError(true);
      }
    },
    [debouncedFullName, debouncedCompanyName, debouncedOrgNumber, debouncedPhone, debouncedCountry, updateProfile]
  );

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      prevValues.current = { fullName, companyName, orgNumber, phone, country };
      return;
    }
    if (debouncedFullName !== prevValues.current.fullName) save("fullName");
  }, [debouncedFullName]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialMount.current) return;
    if (debouncedCompanyName !== prevValues.current.companyName) save("companyName");
  }, [debouncedCompanyName]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialMount.current) return;
    if (debouncedOrgNumber !== prevValues.current.orgNumber) save("orgNumber");
  }, [debouncedOrgNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialMount.current) return;
    if (debouncedPhone !== prevValues.current.phone) save("phone");
  }, [debouncedPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialMount.current) return;
    if (debouncedCountry !== prevValues.current.country) save("country");
  }, [debouncedCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  const fields = [
    { key: "fullName", label: t("name"), value: fullName, onChange: setFullName },
    { key: "email", label: t("email"), value: user?.email || "", disabled: true },
    { key: "companyName", label: t("company"), value: companyName, onChange: setCompanyName },
    { key: "orgNumber", label: t("orgNumber"), value: orgNumber, onChange: setOrgNumber },
    { key: "phone", label: t("phone"), value: phone, onChange: setPhone },
    { key: "country", label: t("country"), value: country, onChange: setCountry },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {error && <Alert variant="error">{t("saveFailed")}</Alert>}

      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">{t("personalInfo")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                {field.label}
              </label>
              <div className="relative">
                <Input
                  value={field.value}
                  onChange={field.onChange ? (e) => field.onChange!(e.target.value) : undefined}
                  disabled={field.disabled}
                  className={savingField === field.key || savedField === field.key ? "pr-10" : ""}
                />
                {savingField === field.key && <FieldSpinner />}
                {savedField === field.key && <SavedCheck />}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-muted">{t("autoSaveHint")}</p>
      </div>
    </div>
  );
}
