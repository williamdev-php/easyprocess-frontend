import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button, Card, Badge } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  // TODO: Fetch real product data for dynamic metadata
  const title = `${t("title")} #${id}`;

  return {
    title,
    alternates: {
      languages: {
        sv: `${baseUrl}/sv/product/${id}`,
        en: `${baseUrl}/en/product/${id}`,
      },
    },
    openGraph: {
      title,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  // TODO: Replace with real data fetching
  const product = {
    name: `Tjanst #${id}`,
    description: "Detaljerad beskrivning av tjansten.",
    price: 25000,
    seller: "Qvicko",
    condition: "Tillganglig",
    location: "Stockholm",
    category: "Digital tjanst",
  };

  const productJsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    price: product.price,
    seller: product.seller,
  });

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: "Home", url: `/${locale}` },
    { name: "Collections", url: `/${locale}/collections` },
    { name: product.name, url: `/${locale}/product/${id}` },
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbs} />

      {/* Breadcrumb nav */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/collections" className="hover:text-primary">{t("title")}</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Image placeholder */}
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl bg-border-theme/50 flex items-center justify-center">
            <span className="text-text-muted text-lg">Tjanstbild</span>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <Badge variant="outline" className="mb-3">Fastpris</Badge>
          <h1 className="text-3xl font-bold text-primary-deep">{product.name}</h1>

          <p className="mt-4 text-3xl font-bold text-primary">
            {product.price.toLocaleString(locale === "sv" ? "sv-SE" : "en-US")} SEK
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <DetailRow label={t("seller")} value={product.seller} />
            <DetailRow label={t("condition")} value={product.condition} />
            <DetailRow label={t("location")} value={product.location} />
            <DetailRow label={t("category")} value={product.category} />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" fullWidth>{t("buyNow")}</Button>
            <Button variant="outline" size="lg" fullWidth>{t("contactSeller")}</Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mt-10">
        <h2 className="text-xl font-semibold text-primary-deep">{t("description")}</h2>
        <p className="mt-3 text-text-secondary leading-relaxed">{product.description}</p>
      </Card>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border-light py-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-theme">{value}</span>
    </div>
  );
}
