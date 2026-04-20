import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");

  const plans = [
    {
      key: "free",
      name: t("freePlan"),
      description: t("freePlanDesc"),
      price: 0,
      features: [
        t("features.freeSite"),
        t("features.subdomain"),
        t("features.basicEditing"),
      ],
      cta: t("getStarted"),
      href: "/create-site",
      popular: false,
      trial: false,
      trialDays: 0,
    },
    {
      key: "basic",
      name: t("basicPlan"),
      description: t("basicPlanDesc"),
      price: 199,
      features: [
        t("features.aiWebsites"),
        t("features.publishSite"),
        t("features.customDomain"),
        t("features.basicStats"),
        t("features.seoTools"),
      ],
      cta: t("getStarted"),
      href: "/create-site",
      popular: true,
      trial: true,
      trialDays: 30,
    },
    {
      key: "pro",
      name: t("proPlan"),
      description: t("proPlanDesc"),
      price: 299,
      features: [
        t("features.allInBasic"),
        t("features.unlimitedSites"),
        t("features.fullStats"),
        t("features.prioritySupport"),
        t("features.advancedSeo"),
      ],
      cta: t("getStarted"),
      href: "/create-site",
      popular: false,
      trial: true,
      trialDays: 30,
    },
  ];

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
  ];

  return (
    <main>
      {/* Pricing Hero */}
      <section className="bg-primary-deep text-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
            {t("badge")}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-background py-20 lg:py-28 -mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  plan.popular
                    ? "border-accent bg-surface ring-2 ring-accent"
                    : "border-border-theme bg-surface"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-accent px-4 py-1 text-xs font-bold text-primary-deep">
                    {t("popular")}
                  </span>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-bold text-primary-deep">{plan.name}</h3>
                  <p className="mt-2 text-sm text-text-muted">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-5xl font-extrabold text-primary-deep">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-lg text-text-muted">
                      kr/{t("monthly")}
                    </span>
                  </div>
                  {plan.trial && (
                    <p className="mt-2 text-sm text-accent font-medium">
                      {t("trialNote", { days: plan.trialDays })}
                    </p>
                  )}
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                      plan.popular
                        ? "bg-primary-deep text-white hover:bg-primary-dark"
                        : "bg-primary-deep/10 text-primary-deep hover:bg-primary-deep/20"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-primary-deep sm:text-4xl">
              {t("faqTitle")}
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              {t("faqSubtitle")}
            </p>
          </div>

          <dl className="mt-12 space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border-theme bg-background p-6"
              >
                <dt className="text-base font-semibold text-primary-deep">
                  {faq.q}
                </dt>
                <dd className="mt-3 text-sm text-text-muted leading-relaxed">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-deep text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {t("title")}
          </h2>
          <div className="mt-10">
            <Link
              href="/create-site"
              className="inline-flex items-center rounded-xl bg-accent px-10 py-4 text-lg font-semibold text-primary-deep shadow-lg transition hover:bg-accent/90 hover:shadow-xl"
            >
              {t("getStarted")}
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
