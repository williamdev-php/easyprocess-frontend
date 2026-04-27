import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getArticle, helpCategories } from "@/lib/help-content/registry";
import type { Locale } from "@/i18n/config";
import HelpBreadcrumbs from "@/components/help/help-breadcrumbs";
import { JsonLd } from "@/components/json-ld";

type Props = { params: Promise<{ locale: Locale; category: string; slug: string }> };

export async function generateStaticParams() {
  const results: { category: string; slug: string }[] = [];
  for (const cat of helpCategories) {
    for (const article of cat.articles) {
      results.push({ category: cat.slug, slug: article.slug });
    }
  }
  return results;
}

export async function generateMetadata({ params }: Props) {
  const { locale, category, slug } = await params;
  const result = getArticle(category, slug);
  if (!result) return {};

  const content = result.article.content[locale];
  const t = await getTranslations({ locale, namespace: "helpCenter" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

  return {
    title: `${content.title} — ${t("title")}`,
    description: content.description,
    alternates: {
      canonical: `${baseUrl}/help/${category}/${slug}`,
      languages: {
        sv: `${baseUrl}/help/${category}/${slug}`,
        en: `${baseUrl}/en/help/${category}/${slug}`,
      },
    },
    openGraph: {
      title: content.title,
      description: content.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, category, slug } = await params;
  const result = getArticle(category, slug);
  if (!result) notFound();

  const { category: cat, article } = result;
  const content = article.content[locale];
  const catLabel = cat.label[locale];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";
  const ta = await getTranslations({ locale, namespace: "helpArticle" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.description,
    url: `${baseUrl}/help/${category}/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Qvicko",
      url: baseUrl,
    },
    isPartOf: {
      "@type": "WebPage",
      name: catLabel.title,
      url: `${baseUrl}/help/${category}`,
    },
  };

  // Find prev/next articles
  const idx = cat.articles.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? cat.articles[idx - 1] : null;
  const next = idx < cat.articles.length - 1 ? cat.articles[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <JsonLd data={jsonLd} />
      <HelpBreadcrumbs
        items={[
          { label: catLabel.title, href: `/help/${category}` },
          { label: content.title },
        ]}
      />

      <article>
        <h1 className="text-3xl font-bold text-primary-deep sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-lg text-text-muted">{content.description}</p>
        <hr className="my-8 border-border-theme" />
        <div className="help-article-content">{content.body}</div>
      </article>

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <nav className="mt-12 grid gap-4 border-t border-border-theme pt-8 sm:grid-cols-2">
          {prev ? (
            <a
              href={`/help/${category}/${prev.slug}`}
              className="group flex flex-col rounded-2xl border border-border-theme bg-surface p-5 transition hover:shadow-md"
            >
              <span className="text-xs font-medium text-text-muted">&larr; {ta("previous")}</span>
              <span className="mt-1 text-sm font-semibold text-primary-deep group-hover:text-primary transition">
                {prev.content[locale].title}
              </span>
            </a>
          ) : <div />}
          {next ? (
            <a
              href={`/help/${category}/${next.slug}`}
              className="group flex flex-col rounded-2xl border border-border-theme bg-surface p-5 text-right transition hover:shadow-md sm:items-end"
            >
              <span className="text-xs font-medium text-text-muted">{ta("next")} &rarr;</span>
              <span className="mt-1 text-sm font-semibold text-primary-deep group-hover:text-primary transition">
                {next.content[locale].title}
              </span>
            </a>
          ) : <div />}
        </nav>
      )}
    </div>
  );
}
