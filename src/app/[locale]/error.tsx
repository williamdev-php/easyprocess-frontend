"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-4">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-primary-deep">{t("title")}</h1>
      <p className="mt-2 text-text-muted max-w-md">{t("description")}</p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
      >
        {t("retry")}
      </button>
    </main>
  );
}
