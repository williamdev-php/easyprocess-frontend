import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import VideoHero from "@/components/video-hero";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hero = await getTranslations("hero");
  const stats = await getTranslations("stats");
  const services = await getTranslations("services");
  const about = await getTranslations("about");
  const process = await getTranslations("process");
  const portfolio = await getTranslations("portfolio");
  const why = await getTranslations("whyWebizo");
  const testimonials = await getTranslations("testimonials");
  const cta = await getTranslations("cta");

  return (
    <main>
      {/* ─── VIDEO HERO (new) ─── */}
      <VideoHero />

      {/* ─── ORIGINAL HERO (hidden — kept for easy rollback) ─── */}
      {false && (
      <section className="relative min-h-screen bg-primary-deep text-white overflow-hidden">
        {/* Decorative graphic placeholders */}
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-primary-dark/30 blur-2xl" />

        {/* Graphic element placeholder */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
          {/* GRAPHIC: hero-illustration.png — 600×600px abstract illustration */}
          <div className="h-[500px] w-[500px] rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-white/20 text-sm">
            hero-illustration.png
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pt-44 lg:pb-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
              <span className="mr-2 h-2 w-2 rounded-full bg-accent" />
              William Söderström — Qvicko
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {hero("title")}
              <span className="text-accent">{hero("highlight")}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/70 sm:text-xl">
              {hero("description")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-primary-deep shadow-lg transition hover:bg-accent/90 hover:shadow-xl"
              >
                {hero("cta")}
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {hero("ctaSecondary")}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80V20C240 60 480 0 720 20C960 40 1200 80 1440 40V80H0Z" fill="var(--background)" />
          </svg>
        </div>
      </section>
      )}

      {/* ─── STATS ─── */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: "5+", label: stats("experience") },
              { value: "50+", label: stats("projects") },
              { value: "30+", label: stats("clients") },
              { value: "20+", label: stats("technologies") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold text-primary-deep lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
              {services("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              {services("subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {(["automation", "ecommerce", "webdev", "ai"] as const).map(
              (key, i) => {
                const icons = ["⚡", "🛒", "🌐", "🤖"];
                const features: string[] = [
                  services(`${key}.features.0`),
                  services(`${key}.features.1`),
                  services(`${key}.features.2`),
                  services(`${key}.features.3`),
                ];
                return (
                  <div
                    key={key}
                    className="group rounded-2xl border border-border-theme bg-surface p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* GRAPHIC: service-{key}-icon.png — 64×64px icon */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-deep/10 text-2xl">
                      {icons[i]}
                    </div>
                    <h3 className="text-xl font-bold text-primary-deep">
                      {services(`${key}.title`)}
                    </h3>
                    <p className="mt-3 text-text-muted">
                      {services(`${key}.description`)}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                          <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="bg-primary-deep text-white py-20 lg:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Photo placeholder */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* GRAPHIC: william-portrait.png — 500×600px professional photo */}
              <div className="aspect-[4/5] w-full rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 text-sm">
                william-portrait.png
              </div>
              {/* Decorative accent corner */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border-2 border-accent/30" />
              <div className="absolute -top-4 -left-4 h-16 w-16 rounded-xl bg-accent/20" />
            </div>

            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                {about("subtitle")}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                {about("title")}
              </h2>
              <p className="mt-6 text-lg text-white/70">
                {about("description")}
              </p>
              <p className="mt-4 text-white/70">
                {about("paragraph2")}
              </p>
              <p className="mt-4 text-white/70">
                {about("paragraph3")}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {(["personal", "quality", "results"] as const).map((v) => (
                  <div key={v} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-accent">{about(`values.${v}`)}</div>
                    <div className="mt-1 text-sm text-white/50">{about(`values.${v}Desc`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section id="process" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
              {process("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              {process("subtitle")}
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border-theme lg:block" />

            <div className="grid gap-8 lg:grid-cols-4">
              {([1, 2, 3, 4] as const).map((step) => (
                <div key={step} className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep text-xl font-bold text-white shadow-lg">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-primary-deep">
                    {process(`step${step}.title`)}
                  </h3>
                  <p className="mt-3 text-sm text-text-muted">
                    {process(`step${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO ─── */}
      <section className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
              {portfolio("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              {portfolio("subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3] as const).map((num) => (
              <div
                key={num}
                className="group overflow-hidden rounded-2xl border border-border-theme bg-background shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                {/* GRAPHIC: portfolio-{num}.png — 600×400px project screenshot */}
                <div className="aspect-[3/2] bg-primary-deep/5 flex items-center justify-center text-text-muted text-sm">
                  portfolio-{num}.png
                </div>
                <div className="p-6">
                  <span className="inline-flex rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold text-primary-deep">
                    {portfolio(`project${num}.category`)}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-primary-deep">
                    {portfolio(`project${num}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {portfolio(`project${num}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY EASYPROCESS ─── */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
              {why("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
              {why("subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(["personal", "modern", "results", "transparent"] as const).map(
              (key, i) => {
                const icons = [
                  /* person */ <svg key="p" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>,
                  /* tech */   <svg key="t" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13a17.96 17.96 0 01-14.726 0l-.772-.13c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
                  /* chart */  <svg key="c" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
                  /* eye */    <svg key="e" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                ];
                return (
                  <div key={key} className="text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-deep/10 text-primary-deep">
                      {icons[i]}
                    </div>
                    <h3 className="text-lg font-bold text-primary-deep">
                      {why(`${key}.title`)}
                    </h3>
                    <p className="mt-3 text-sm text-text-muted">
                      {why(`${key}.description`)}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-primary-deep text-white py-20 lg:py-28 overflow-hidden relative">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              {testimonials("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
              {testimonials("subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3] as const).map((num) => (
              <div
                key={num}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                {/* Quote mark */}
                <svg className="mb-4 h-8 w-8 text-accent/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                </svg>
                <p className="text-white/80 italic">
                  &ldquo;{testimonials(`testimonial${num}.quote`)}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {/* GRAPHIC: avatar-{num}.png — 48×48px client photo */}
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {testimonials(`testimonial${num}.name`).charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonials(`testimonial${num}.name`)}
                    </div>
                    <div className="text-sm text-white/50">
                      {testimonials(`testimonial${num}.title`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="contact" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl lg:text-5xl">
            {cta("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
            {cta("description")}
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-primary-deep px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl"
            >
              {cta("button")}
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-text-muted">{cta("note")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
