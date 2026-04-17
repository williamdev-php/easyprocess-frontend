"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale() {
    const next = locale === "sv" ? "en" : "sv";
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      onClick={switchLocale}
      className="rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white/10"
      aria-label="Switch language"
    >
      {locale === "sv" ? "EN" : "SV"}
    </button>
  );
}
