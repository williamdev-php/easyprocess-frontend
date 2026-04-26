import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import BusinessNameGenerator from "@/components/tools/business-name-generator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../../../messages/${locale}.json`)).default;
  const t = messages.nameGenerator;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}/tools/business-name-generator`,
      languages: {
        sv: "/sv/tools/business-name-generator",
        en: "/en/tools/business-name-generator",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      type: "website",
      siteName: "Qvicko",
      url: `${baseUrl}/${locale}/tools/business-name-generator`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: locale === "sv" ? "Företagsnamn Generator" : "Business Name Generator",
    description:
      locale === "sv"
        ? "Generera kreativa företagsnamn med AI"
        : "Generate creative business names with AI",
    url: `https://qvicko.com/${locale}/tools/business-name-generator`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SEK",
    },
    creator: {
      "@type": "Organization",
      name: "Qvicko",
      url: "https://qvicko.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BusinessNameGenerator />
    </>
  );
}
