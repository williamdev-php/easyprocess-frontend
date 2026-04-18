import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { helpCategories } from "@/lib/help-content/registry";
import type { Locale } from "@/i18n/config";
import HelpSearch from "@/components/help/help-search";
import HelpBreadcrumbs from "@/components/help/help-breadcrumbs";
import { JsonLd } from "@/components/json-ld";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpCenter" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${baseUrl}/help`,
      languages: { sv: `${baseUrl}/help`, en: `${baseUrl}/en/help` },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

function CategoryIcon({ d }: { d: string }) {
  return (
    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default async function HelpOverviewPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpCenter" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("metaTitle"),
    description: t("metaDescription"),
    url: `${baseUrl}/help`,
    isPartOf: {
      "@type": "WebSite",
      name: "Qvicko",
      url: baseUrl,
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <JsonLd data={jsonLd} />
      <HelpBreadcrumbs items={[]} />

      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary-deep sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-text-secondary">
          {t("subheading")}
        </p>
        <div className="mx-auto mt-8 flex justify-center">
          <HelpSearch />
        </div>
      </div>

      {/* Category cards */}
      <h2 className="mb-6 text-xl font-bold text-primary-deep">{t("categories")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {helpCategories.map((cat) => {
          const label = cat.label[locale];
          return (
            <Link
              key={cat.slug}
              href={`/help/${cat.slug}`}
              className="group rounded-2xl border border-border-theme bg-surface p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CategoryIcon d={cat.icon} />
              </div>
              <h3 className="text-lg font-semibold text-primary-deep group-hover:text-primary transition">
                {label.title}
              </h3>
              <p className="mt-1.5 text-sm text-text-muted">{label.description}</p>
              <p className="mt-3 text-xs font-medium text-primary">
                {cat.articles.length} {cat.articles.length === 1 ? t("article") : t("articles")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
