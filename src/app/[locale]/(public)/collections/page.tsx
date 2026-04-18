import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardTitle, CardDescription, Badge } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collections" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        sv: `${baseUrl}/sv/collections`,
        en: `${baseUrl}/en/collections`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

const placeholderListings = [
  { id: "1", title: "Datasystem & Integrationer", type: "auction" as const, price: 15000 },
  { id: "2", title: "Facebook & Google Ads", type: "auction" as const, price: 85000 },
  { id: "3", title: "Hemsida & Webbdesign", type: "fixed" as const, price: 12000 },
  { id: "4", title: "Headless E-handel", type: "fixed" as const, price: 45000 },
  { id: "5", title: "SEO & Content Marketing", type: "auction" as const, price: 120000 },
  { id: "6", title: "Custom Utveckling", type: "fixed" as const, price: 200000 },
];

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("collections");

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: "Home", url: `/${locale}` },
    { name: t("title"), url: `/${locale}/collections` },
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={breadcrumbs} />

      <h1 className="text-3xl font-bold text-primary-deep">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("description")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderListings.map((listing) => (
          <Link
            key={listing.id}
            href={listing.type === "auction" ? `/auction/${listing.id}` : `/product/${listing.id}`}
          >
            <Card hover className="h-full">
              <div className="mb-3">
                <Badge variant={listing.type === "auction" ? "primary" : "outline"}>
                  {listing.type === "auction" ? t("auction") : t("fixedPrice")}
                </Badge>
              </div>
              <CardTitle>{listing.title}</CardTitle>
              <CardDescription>
                {listing.price.toLocaleString(locale === "sv" ? "sv-SE" : "en-US")} SEK
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
