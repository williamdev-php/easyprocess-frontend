import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import Providers from "@/components/providers";
import TrackingProvider from "@/components/tracking-provider";
import PasswordGate from "@/components/password-gate";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: {
      default: messages.metadata.title,
      template: `%s | Qvicko`,
    },
    description: messages.metadata.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        sv: "/sv",
        en: "/en",
      },
    },
    icons: {
      icon: "/favicon.png",
    },
    openGraph: {
      title: messages.metadata.title,
      description: messages.metadata.description,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      type: "website",
      siteName: "Qvicko",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "sv" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <TrackingProvider>
          <PasswordGate>
            <div className="bg-background text-text-theme min-h-full flex flex-col" lang={locale}>
              {children}
            </div>
          </PasswordGate>
        </TrackingProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
