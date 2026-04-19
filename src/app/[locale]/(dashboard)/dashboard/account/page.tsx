"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { CountrySelect } from "@/components/ui/country-select";
import { MediaPickerField } from "@/components/media-picker";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      fullName
      companyName
      orgNumber
      phone
      country
      avatarUrl
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
  const { user, isLoading } = useAuth();
  const t = useTranslations("userAccount");
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [orgNumber, setOrgNumber] = useState(user?.orgNumber || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");

  // Sync form state when user data arrives (e.g. after auth refresh on page reload)
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setCompanyName(user.companyName || "");
      setOrgNumber(user.orgNumber || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      prevValues.current = {
        fullName: user.fullName || "",
        companyName: user.companyName || "",
        orgNumber: user.orgNumber || "",
        phone: user.phone || "",
        country: user.country || "",
      };
    }
  }, [user]);

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
  ];

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
          <p className="mt-1 text-text-muted">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border-light bg-white p-6">
          <Skeleton className="mb-5 h-4 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {error && <Alert variant="error">{t("saveFailed")}</Alert>}

      {/* Avatar */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("avatar")}</h3>
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || ""}
              className="h-16 w-16 rounded-full object-cover border border-border-light"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
              {(user.fullName || user.email || "?")[0].toUpperCase()}
            </div>
          )}
          <MediaPickerField
            value={user.avatarUrl || ""}
            onChange={async (url) => {
              try {
                await updateProfile({
                  variables: { input: { avatarUrl: url || null } },
                });
              } catch { /* handled by error state */ }
            }}
            label=""
            folder="avatar"
          />
        </div>
      </div>

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

          {/* Country dropdown */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("country")}
            </label>
            <div className="relative">
              <CountrySelect
                value={country}
                onChange={setCountry}
              />
              {savingField === "country" && <FieldSpinner />}
              {savedField === "country" && <SavedCheck />}
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted">{t("autoSaveHint")}</p>
      </div>
    </div>
  );
}
