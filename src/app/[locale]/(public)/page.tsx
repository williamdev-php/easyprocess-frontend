import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import VideoHero from "@/components/video-hero";
import StatsCounter from "@/components/stats-counter";
import LazySection from "@/components/lazy-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const stats = await getTranslations("stats");
  const builder = await getTranslations("builder");
  const seo = await getTranslations("seoBoost");
  const showcase = await getTranslations("showcase");
  const steps = await getTranslations("simpleSteps");
  const cta = await getTranslations("ctaNew");

  return (
    <main>
      {/* ─── VIDEO HERO ─── */}
      <VideoHero />

      {/* ─── STATS ─── */}
      <StatsCounter
        items={[
          { value: 14, label: stats("experience") },
          { value: 3420, suffix: "+", label: stats("projects") },
          { value: 24, label: stats("technologies") },
          { value: 1290, label: stats("clients") },
        ]}
      />

      {/* ─── WEBSITE BUILDER ─── */}
      <LazySection>
        <section id="services" className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-primary-deep">
                {builder("badge")}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-primary-deep sm:text-4xl lg:text-5xl">
                {builder("title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
                {builder("subtitle")}
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(["speed", "design", "seo"] as const).map((key, i) => {
                const icons = [
                  <svg key="s" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
                  <svg key="d" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
                  <svg key="o" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
                ];
                return (
                  <div
                    key={key}
                    className="group rounded-2xl border border-border-theme bg-surface p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-deep/10 text-primary-deep transition-colors group-hover:bg-primary-deep group-hover:text-white">
                      {icons[i]}
                    </div>
                    <h3 className="text-xl font-bold text-primary-deep">
                      {builder(`${key}.title`)}
                    </h3>
                    <p className="mt-3 text-text-muted">
                      {builder(`${key}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/create-site"
                className="inline-flex items-center rounded-xl bg-primary-deep px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl"
              >
                {builder("cta")}
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ─── SPLIT-SCREEN: SHOWCASE + AI VIDEO ─── */}
      <LazySection>
        <section className="bg-primary-deep text-white py-20 lg:py-28 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: visual mockup */}
              <div className="relative">
                <div className="aspect-[4/3] w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {/* Placeholder for screenshot/mockup image */}
                  <div className="text-center p-8">
                    <svg className="mx-auto h-16 w-16 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-white/30 text-sm">{showcase("imagePlaceholder")}</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border-2 border-accent/30" />
              </div>

              {/* Right: AI video + description */}
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {showcase("badge")}
                </span>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  {showcase("title")}
                </h2>
                <p className="mt-6 text-lg text-white/70">
                  {showcase("description")}
                </p>

                {/* AI Video placeholder */}
                <div className="mt-8 aspect-video w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 transition group-hover:bg-accent/40">
                      <svg className="h-8 w-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm">{showcase("videoPlaceholder")}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/40">{showcase("videoHint")}</p>
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ─── SEO BOOST ─── */}
      <LazySection>
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <span className="inline-flex items-center rounded-full bg-primary-deep/10 px-4 py-1.5 text-sm font-semibold text-primary-deep">
                  {seo("badge")}
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-primary-deep sm:text-4xl">
                  {seo("title")}
                </h2>
                <p className="mt-6 text-lg text-text-muted">
                  {seo("description")}
                </p>

                <ul className="mt-8 space-y-4">
                  {(["point1", "point2", "point3", "point4"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-deep/10">
                        <svg className="h-3.5 w-3.5 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-deep">{seo(`${key}.title`)}</span>
                        <p className="text-sm text-text-muted">{seo(`${key}.desc`)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual: SEO metrics card */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-2xl border border-border-theme bg-surface p-8 shadow-lg">
                  <div className="space-y-6">
                    {(["traffic", "ranking", "conversions"] as const).map((metric) => (
                      <div key={metric}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary-deep">{seo(`metrics.${metric}`)}</span>
                          <span className="text-sm font-bold text-primary-deep">{seo(`metrics.${metric}Value`)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-border-theme">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                            style={{ width: metric === "traffic" ? "85%" : metric === "ranking" ? "72%" : "91%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 h-16 w-16 rounded-xl bg-accent/20" />
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border-2 border-primary/20" />
              </div>
            </div>
          </div>
        </section>
      </LazySection>

      {/* ─── SIMPLE STEPS ─── */}
      <LazySection>
        <section className="bg-surface py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
                {steps("title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
                {steps("subtitle")}
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {([1, 2, 3] as const).map((num) => (
                <div key={num} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-deep text-2xl font-bold text-white shadow-lg">
                    {num}
                  </div>
                  {num < 3 && (
                    <div className="absolute top-10 left-[60%] hidden h-px w-[80%] bg-border-theme lg:block" />
                  )}
                  <h3 className="text-xl font-bold text-primary-deep">
                    {steps(`step${num}.title`)}
                  </h3>
                  <p className="mt-3 text-text-muted">
                    {steps(`step${num}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      {/* ─── CTA ─── */}
      <LazySection>
        <section id="contact" className="bg-primary-deep text-white py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              {cta("title")}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              {cta("description")}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/create-site"
                className="inline-flex items-center rounded-xl bg-accent px-10 py-4 text-lg font-semibold text-primary-deep shadow-lg transition hover:bg-accent/90 hover:shadow-xl"
              >
                {cta("button")}
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {cta("loginButton")}
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/50">{cta("note")}</p>
          </div>
        </section>
      </LazySection>
    </main>
  );
}
