import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getBlogIndex } from "@/lib/blog-content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === "sv" ? "Blogg | Qvicko" : "Blog | Qvicko";
  const description =
    locale === "sv"
      ? "Läs våra senaste artiklar om webbdesign, SEO och digital marknadsföring."
      : "Read our latest articles about web design, SEO and digital marketing.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        sv: `${baseUrl}/sv/blog`,
        en: `${baseUrl}/en/blog`,
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "sv" ? "sv_SE" : "en_US",
      alternateLocale: locale === "sv" ? ["en_US"] : ["sv_SE"],
      type: "website",
      url: `${baseUrl}/${locale}/blog`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getBlogIndex(locale);

  const isSv = locale === "sv";
  const heading = isSv ? "Blogg" : "Blog";
  const subtitle = isSv
    ? "Artiklar om webbdesign, SEO och digital marknadsföring"
    : "Articles about web design, SEO and digital marketing";
  const emptyMessage = isSv
    ? "Inga inlägg ännu. Kom tillbaka snart!"
    : "No posts yet. Check back soon!";
  const readMore = isSv ? "Läs mer" : "Read more";
  const minRead = isSv ? "min läsning" : "min read";
  const homeLabel = isSv ? "Hem" : "Home";

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: heading,
        item: `${baseUrl}/${locale}/blog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero section */}
      <section className="bg-primary-deep pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8 animate-fade-rise">
            <ol className="flex items-center gap-2 text-sm text-white/80">
              <li>
                <Link href="/" className="transition hover:text-white">
                  {homeLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-white">
                {heading}
              </li>
            </ol>
          </nav>

          <div className="animate-fade-rise-delay">
            <span className="inline-flex items-center rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
              {heading}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {isSv ? "Insikter & guider" : "Insights & guides"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {posts.length === 0 ? (
          <p className="text-center text-lg text-text-muted">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                  <div className="relative aspect-[16/10] w-full bg-accent/10">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-primary/20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    {post.reading_time_minutes > 0 && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span>
                          {post.reading_time_minutes} {minRead}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="mt-3 text-xl font-bold text-primary-deep transition group-hover:text-primary">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-primary-deep"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read more */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark"
                  >
                    {readMore}
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
