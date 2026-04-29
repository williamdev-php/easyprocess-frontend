import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getBlogPost, getAllPostSlugs, getPostMeta } from "@/lib/blog-content";
import { locales } from "@/i18n/config";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";
const defaultLocale = "en";

/** Convert relative path to absolute URL, respecting localePrefix: "as-needed" */
function toAbsolute(url: string): string {
  if (url.startsWith("http")) return url;
  // Strip default locale prefix since localePrefix is "as-needed"
  const stripped = url.replace(new RegExp(`^/${defaultLocale}(/|$)`), "$1") || "/";
  return `${baseUrl}${stripped}`;
}

// ---------------------------------------------------------------------------
// SSG: generate static params for all slugs x locales
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Metadata: full SEO head tags, OG, Twitter, hreflang, canonical
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);
  const postMeta = getPostMeta(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const { meta } = post;

  // hreflang alternates – must be absolute URLs
  const alternateLanguages: Record<string, string> = {};
  if (postMeta?.hreflang_links) {
    for (const link of postMeta.hreflang_links) {
      if (link.hreflang !== "x-default") {
        alternateLanguages[link.hreflang] = toAbsolute(link.href);
      }
    }
  }

  return {
    title: meta.meta_title,
    description: meta.meta_description,
    alternates: {
      canonical: toAbsolute(meta.canonical_url || `/${locale}/blog/${slug}`),
      languages: alternateLanguages,
    },
    openGraph: {
      title: meta.open_graph?.og_title || meta.meta_title,
      description: meta.open_graph?.og_description || meta.meta_description,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      type: "article",
      url: toAbsolute(`/${locale}/blog/${slug}`),
      publishedTime: meta.published_at,
      modifiedTime: meta.updated_at || meta.published_at,
      authors: [meta.author?.name || "Qvicko"],
      tags: meta.tags,
      ...(meta.open_graph?.og_image
        ? { images: [{ url: meta.open_graph.og_image, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.open_graph?.og_title || meta.meta_title,
      description: meta.open_graph?.og_description || meta.meta_description,
      ...(meta.open_graph?.og_image ? { images: [meta.open_graph.og_image] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug, locale);
  const postMeta = getPostMeta(slug);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;
  const isSv = locale === "sv";

  const backLabel = isSv ? "Tillbaka till bloggen" : "Back to blog";
  const minRead = isSv ? "min läsning" : "min read";
  const writtenBy = isSv ? "Skriven av" : "Written by";
  const tocLabel = isSv ? "Innehållsförteckning" : "Table of Contents";
  const alsoIn = isSv ? "Finns även på:" : "Also available in:";
  const publishedLabel = isSv ? "Publicerad" : "Published";
  const updatedLabel = isSv ? "Uppdaterad" : "Updated";
  const homeLabel = isSv ? "Hem" : "Home";
  const blogLabel = isSv ? "Blogg" : "Blog";

  // Collect all JSON-LD schemas
  const schemas: Record<string, unknown>[] = [];
  if (meta.schema_article && Object.keys(meta.schema_article).length > 0) {
    schemas.push(meta.schema_article);
  }
  if (meta.schema_faq && Object.keys(meta.schema_faq).length > 0) {
    schemas.push(meta.schema_faq);
  }
  if (meta.schema_breadcrumb && Object.keys(meta.schema_breadcrumb).length > 0) {
    schemas.push(meta.schema_breadcrumb);
  }
  if (meta.schema_author && Object.keys(meta.schema_author).length > 0) {
    schemas.push(meta.schema_author);
  }

  return (
    <>
      {/* === hreflang link tags === */}
      {postMeta?.hreflang_links.map((link) => (
        <link
          key={link.hreflang}
          rel="alternate"
          hrefLang={link.hreflang}
          href={toAbsolute(link.href)}
        />
      ))}

      {/* === JSON-LD Structured Data (Article, FAQ, Breadcrumb, Author) === */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* === Hero header === */}
      <section className="bg-primary-deep pt-24 lg:pt-28">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8 animate-fade-rise">
            <ol className="flex items-center gap-2 text-sm text-white/80">
              <li>
                <Link href="/" className="transition hover:text-white">
                  {homeLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="transition hover:text-white">
                  {blogLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="truncate font-medium text-white">
                {meta.title}
              </li>
            </ol>
          </nav>

          <div className="animate-fade-rise-delay">
            {/* Tags */}
            {meta.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {meta.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
              {/* Author */}
              <span>
                {writtenBy}{" "}
                {meta.author?.url ? (
                  <a
                    href={meta.author.url}
                    className="font-semibold text-white transition hover:text-accent"
                  >
                    {meta.author.name}
                  </a>
                ) : (
                  <strong className="text-white">{meta.author?.name || "Qvicko"}</strong>
                )}
              </span>

              <span aria-hidden="true">&middot;</span>

              <time dateTime={meta.published_at}>
                {publishedLabel}{" "}
                {new Date(meta.published_at).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              {meta.updated_at && meta.updated_at !== meta.published_at && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={meta.updated_at}>
                    {updatedLabel}{" "}
                    {new Date(meta.updated_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </>
              )}

              {meta.reading_time_minutes > 0 && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>
                    {meta.reading_time_minutes} {minRead}
                  </span>
                </>
              )}

              {meta.word_count > 0 && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{meta.word_count.toLocaleString(locale)} {isSv ? "ord" : "words"}</span>
                </>
              )}
            </div>

            {meta.author?.bio && (
              <p className="mt-3 text-sm italic text-white/70">
                {meta.author.bio}
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <article>
          {/* === Language switcher === */}
          {postMeta && postMeta.languages.length > 1 && (
            <div className="mb-8 flex items-center gap-2 rounded-xl border border-border bg-accent/10 p-3">
              <span className="text-sm text-text-muted">
                {alsoIn}
              </span>
              {postMeta.languages
                .filter((l) => l !== locale)
                .map((lang) => (
                  <a
                    key={lang}
                    href={`/${lang}/blog/${slug}`}
                    hrefLang={lang}
                    className="rounded-lg bg-surface px-3 py-1 text-sm font-medium text-primary shadow-sm transition hover:bg-primary hover:text-white"
                  >
                    {lang.toUpperCase()}
                  </a>
                ))}
            </div>
          )}

          {/* === Table of Contents === */}
          {meta.toc && meta.toc.length > 0 && (
            <nav
              aria-label={tocLabel}
              className="mb-12 rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-bold text-primary-deep">
                {tocLabel}
              </h2>
              <ol className="space-y-1.5">
                {meta.toc.map((entry) => (
                  <li
                    key={entry.id}
                    className={entry.level === 3 ? "ml-5 border-l-2 border-border-light pl-3" : ""}
                  >
                    <a
                      href={`#${entry.id}`}
                      className={`inline-block rounded-md px-2 py-1 text-sm transition hover:bg-accent/20 hover:text-primary-deep ${
                        entry.level === 2
                          ? "font-medium text-primary-deep"
                          : "text-text-muted"
                      }`}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* === Blog content === */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-primary-deep prose-headings:scroll-mt-24 prose-p:text-text-secondary prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:text-primary-dark prose-strong:text-primary-deep prose-img:rounded-xl prose-img:shadow-md prose-li:text-text-secondary"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* === Back to top === */}
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-primary-deep"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              {isSv ? "Tillbaka till toppen" : "Back to top"}
            </a>
          </div>
        </article>

        {/* === Footer nav === */}
        <div className="mt-16 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </Link>
        </div>
      </main>
    </>
  );
}
