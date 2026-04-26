import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ColorPaletteGenerator from "@/components/tools/color-palette-generator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../../../messages/${locale}.json`)).default;
  const t = messages.colorPalette;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}/tools/color-palette-generator`,
      languages: {
        sv: "/sv/tools/color-palette-generator",
        en: "/en/tools/color-palette-generator",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      type: "website",
      siteName: "Qvicko",
      url: `${baseUrl}/${locale}/tools/color-palette-generator`,
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
    name:
      locale === "sv" ? "Färgpalett Generator" : "Color Palette Generator",
    description:
      locale === "sv"
        ? "Hitta den perfekta färgpaletten för din hemsida"
        : "Find the perfect color palette for your website",
    url: `https://qvicko.com/${locale}/tools/color-palette-generator`,
    applicationCategory: "DesignApplication",
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
      <ColorPaletteGenerator />
    </>
  );
}
