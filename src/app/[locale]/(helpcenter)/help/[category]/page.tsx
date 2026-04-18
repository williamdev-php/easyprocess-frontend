import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getCategory, helpCategories } from "@/lib/help-content/registry";
import type { Locale } from "@/i18n/config";
import HelpBreadcrumbs from "@/components/help/help-breadcrumbs";
import { JsonLd } from "@/components/json-ld";

type Props = { params: Promise<{ locale: Locale; category: string }> };

export async function generateStaticParams() {
  return helpCategories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, category: slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};

  const label = cat.label[locale];
  const t = await getTranslations({ locale, namespace: "helpCenter" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: `${label.title} — ${t("title")}`,
    description: label.description,
    alternates: {
      canonical: `${baseUrl}/help/${slug}`,
      languages: {
        sv: `${baseUrl}/help/${slug}`,
        en: `${baseUrl}/en/help/${slug}`,
      },
    },
  };
}

function ArticleIcon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category: slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const t = await getTranslations({ locale, namespace: "helpCenter" });
  const label = cat.label[locale];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: label.title,
    description: label.description,
    url: `${baseUrl}/help/${slug}`,
    isPartOf: {
      "@type": "WebPage",
      name: t("title"),
      url: `${baseUrl}/help`,
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <JsonLd data={jsonLd} />
      <HelpBreadcrumbs items={[{ label: label.title }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-deep">{label.title}</h1>
        <p className="mt-2 text-text-secondary">{label.description}</p>
      </div>

      <div className="space-y-3">
        {cat.articles.map((article) => {
          const content = article.content[locale];
          return (
            <Link
              key={article.slug}
              href={`/help/${slug}/${article.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-border-theme bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ArticleIcon d={article.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-primary-deep group-hover:text-primary transition">
                  {content.title}
                </h2>
                <p className="mt-1 text-sm text-text-muted line-clamp-2">
                  {content.description}
                </p>
              </div>
              <svg className="mt-1 h-5 w-5 shrink-0 text-text-muted transition group-hover:text-primary group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
