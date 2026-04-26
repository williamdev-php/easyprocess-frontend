import type { HelpCategory } from "./types";

/* ------------------------------------------------------------------ */
/*  SVG icon helpers (inline so no extra deps)                        */
/* ------------------------------------------------------------------ */
function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable article-body primitives                                  */
/* ------------------------------------------------------------------ */
function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <p className="font-semibold text-primary-deep mb-2 flex items-center gap-2">
        <Icon d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        {title}
      </p>
      <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function WarningBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-amber-300/40 bg-amber-50 p-5">
      <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
        <Icon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        {title}
      </p>
      <div className="text-sm text-amber-900/80 leading-relaxed">{children}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 my-6">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{n}</span>
      <div>
        <h4 className="font-semibold text-primary-deep">{title}</h4>
        <div className="mt-1 text-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-theme bg-surface p-5">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon d={icon} className="h-5 w-5 text-primary" />
      </div>
      <p className="font-semibold text-primary-deep">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{desc}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-primary-deep/10 px-1.5 py-0.5 text-xs font-mono text-primary-deep">{children}</code>;
}

/* ================================================================== */
/*  CATEGORY: Fakturering och planer / Billing and Plans              */
/* ================================================================== */

export const billingAndPlansCategory: HelpCategory = {
  slug: "billing-and-plans",
  icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z",
  label: {
    sv: {
      title: "Fakturering och planer",
      description: "Hantera din prenumeration, planer, betalningar och fakturor",
    },
    en: {
      title: "Billing and Plans",
      description: "Manage your subscription, plans, payments, and invoices",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Overview                                                    */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "billing-and-plans",
      icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      content: {
        sv: {
          title: "Qvickos planer och prismodell",
          description: "En oversikt over Qvickos tillgangliga planer, vad som ingar och hur prismodellen fungerar.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko erbjuder tre planer som passar olika behov: <strong>Gratis</strong>, <strong>Basic</strong> och <strong>Pro</strong>.
                Alla betalplaner inkluderar en <strong>30 dagars kostnadsfri provperiod</strong> sa att du kan testa alla funktioner innan du bestammer dig.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tillgangliga planer</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border-2 border-border-theme bg-surface p-5">
                  <h4 className="text-lg font-bold text-primary-deep">Gratis</h4>
                  <p className="text-2xl font-bold text-text-muted mt-1">0 kr<span className="text-sm font-medium">/man</span></p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>En gratis webbplats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>Qvicko-subdoman</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>Grundlaggande redigering</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-primary bg-primary/5 p-5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-primary-deep">Basic</h4>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary-deep">Populart</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">199 kr<span className="text-sm font-medium">/man</span></p>
                  <p className="text-xs text-accent font-medium mt-0.5">30 dagars gratis provperiod</p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>AI-genererade webbplatser</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Publicera din webbplats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Egen doman</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Grundlaggande statistik</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>SEO-verktyg</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-border-theme bg-surface p-5">
                  <h4 className="text-lg font-bold text-primary-deep">Pro</h4>
                  <p className="text-2xl font-bold text-primary mt-1">299 kr<span className="text-sm font-medium">/man</span></p>
                  <p className="text-xs text-accent font-medium mt-0.5">30 dagars gratis provperiod</p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Allt i Basic</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Obegransat antal webbplatser</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Fullstandig statistik</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Prioriterad support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Avancerad SEO</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur fungerar betalning?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Alla betalningar hanteras sakert via <strong>Stripe</strong>. Du betalar med kreditkort eller betalkort.
                Prenumerationen debiteras <strong>manadsvis</strong> och fornyar sig automatiskt. Priserna ar angivna i <strong>SEK</strong> (svenska kronor).
              </p>

              <InfoBox title="30 dagars gratis provperiod">
                <p>
                  Bade Basic och Pro inkluderar 30 dagars gratis provperiod. Du behover registrera ett betalkort for att starta
                  provperioden, men du debiteras inte forran provperioden ar slut. Du kan avbryta nar som helst under provperioden
                  utan kostnad.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Prenumerationsstatusar</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Aktiv</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Din prenumeration ar aktiv och alla funktioner ar tillgangliga.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <p className="font-semibold text-primary-deep">Provperiod</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Du ar i din 30-dagars provperiod. Alla funktioner ar tillgangliga utan kostnad.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Forfalden betalning</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">En betalning har misslyckats. Du har 14 dagars respitperiod for att uppdatera din betalmetod.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <p className="font-semibold text-primary-deep">Uppsagd</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Prenumerationen ar uppsagd. Du har tillgang till slutet av den aktuella perioden.</p>
                </div>
              </div>
            </>
          ),
        },
        en: {
          title: "Qvicko's plans and pricing model",
          description: "An overview of Qvicko's available plans, what is included, and how the pricing model works.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko offers three plans to suit different needs: <strong>Free</strong>, <strong>Basic</strong>, and <strong>Pro</strong>.
                All paid plans include a <strong>30-day free trial</strong> so you can test all features before committing.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Available plans</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border-2 border-border-theme bg-surface p-5">
                  <h4 className="text-lg font-bold text-primary-deep">Free</h4>
                  <p className="text-2xl font-bold text-text-muted mt-1">0 SEK<span className="text-sm font-medium">/mo</span></p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>One free website</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>Qvicko subdomain</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-text-muted" />
                      <span>Basic editing</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-primary bg-primary/5 p-5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-primary-deep">Basic</h4>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary-deep">Popular</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">199 SEK<span className="text-sm font-medium">/mo</span></p>
                  <p className="text-xs text-accent font-medium mt-0.5">30-day free trial</p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>AI-generated websites</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Publish your website</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Custom domain</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>SEO tools</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border-2 border-border-theme bg-surface p-5">
                  <h4 className="text-lg font-bold text-primary-deep">Pro</h4>
                  <p className="text-2xl font-bold text-primary mt-1">299 SEK<span className="text-sm font-medium">/mo</span></p>
                  <p className="text-xs text-accent font-medium mt-0.5">30-day free trial</p>
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Unlimited websites</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Full analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon d="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-primary" />
                      <span>Advanced SEO</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How does payment work?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                All payments are handled securely via <strong>Stripe</strong>. You pay with a credit card or debit card.
                The subscription is billed <strong>monthly</strong> and renews automatically. Prices are listed in <strong>SEK</strong> (Swedish kronor).
              </p>

              <InfoBox title="30-day free trial">
                <p>
                  Both Basic and Pro include a 30-day free trial. You need to register a payment card to start
                  the trial, but you will not be charged until the trial period ends. You can cancel at any time during
                  the trial at no cost.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Subscription statuses</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Active</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Your subscription is active and all features are available.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <p className="font-semibold text-primary-deep">Trialing</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">You are in your 30-day trial period. All features are available at no cost.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Past due</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">A payment has failed. You have a 14-day grace period to update your payment method.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <p className="font-semibold text-primary-deep">Canceled</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The subscription is canceled. You retain access until the end of the current billing period.</p>
                </div>
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Upgrade Plan                                                */
    /* -------------------------------------------------------------- */
    {
      slug: "upgrade-plan",
      category: "billing-and-plans",
      icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
      content: {
        sv: {
          title: "Uppgradera fran gratis till en betald plan",
          description: "Steg-for-steg-guide for att uppgradera din Qvicko-plan fran gratis till Basic eller Pro.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Att uppgradera fran gratisplanen till <strong>Basic</strong> eller <strong>Pro</strong> tar bara
                nagra minuter. Du far tillgang till alla funktioner direkt och din 30-dagars provperiod borjar omedelbart.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Innan du uppgraderar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                For att kunna uppgradera behover du ha ett <strong>betalkort</strong> (kredit- eller debitkort) redo.
                Kortet registreras via Stripe men debiteras inte forran provperioden ar slut.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sa har uppgraderar du</h2>

              <Step n={1} title="Ga till Fakturering">
                <p>
                  Klicka pa <strong>Fakturering</strong> i sidofaltet i din dashboard, eller navigera till <Code>/dashboard/billing</Code>.
                </p>
              </Step>

              <Step n={2} title="Lagg till ett betalkort">
                <p>
                  Om du inte redan har ett kort registrerat klickar du pa <strong>Lagg till kort</strong>.
                  Fyll i dina kortuppgifter i det sakra Stripe-formularet. Dina kortuppgifter lagras aldrig pa Qvickos servrar.
                </p>
              </Step>

              <Step n={3} title="Valj plan">
                <p>
                  Under <strong>Tillgangliga planer</strong> ser du Basic (199 kr/man) och Pro (299 kr/man).
                  Klicka pa <strong>Valj plan</strong> bredvid den plan du onskar.
                </p>
              </Step>

              <Step n={4} title="Provperioden startar">
                <p>
                  Din 30-dagars provperiod startar direkt. Du har full tillgang till alla funktioner i den valda planen.
                  Inga pengar dras forran provperioden ar slut.
                </p>
              </Step>

              <InfoBox title="Uppgradera via dialog">
                <p>
                  Du kan ocksa uppgradera genom att klicka pa uppgraderingsknappen som visas pa flera stallen i dashboarden
                  nar du anvander gratisplanen. En dialog oppnas dar du kan lagga till kort och valja plan i samma flode.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Skillnader mellan Basic och Pro</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582"
                  title="Basic — 199 kr/man"
                  desc="Perfekt for dig som vill publicera en professionell webbplats med egen doman och SEO-verktyg."
                />
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  title="Pro — 299 kr/man"
                  desc="For dig som vill ha obegransat antal webbplatser, fullstandig statistik och prioriterad support."
                />
              </div>
            </>
          ),
        },
        en: {
          title: "Upgrade from free to a paid plan",
          description: "Step-by-step guide to upgrading your Qvicko plan from free to Basic or Pro.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Upgrading from the free plan to <strong>Basic</strong> or <strong>Pro</strong> takes just
                a few minutes. You get access to all features immediately and your 30-day trial starts right away.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Before you upgrade</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                To upgrade, you need a <strong>payment card</strong> (credit or debit card) ready.
                The card is registered via Stripe but will not be charged until the trial period ends.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to upgrade</h2>

              <Step n={1} title="Go to Billing">
                <p>
                  Click <strong>Billing</strong> in the sidebar of your dashboard, or navigate to <Code>/dashboard/billing</Code>.
                </p>
              </Step>

              <Step n={2} title="Add a payment card">
                <p>
                  If you don&apos;t already have a card registered, click <strong>Add card</strong>.
                  Fill in your card details in the secure Stripe form. Your card details are never stored on Qvicko&apos;s servers.
                </p>
              </Step>

              <Step n={3} title="Choose a plan">
                <p>
                  Under <strong>Available plans</strong> you will see Basic (199 SEK/mo) and Pro (299 SEK/mo).
                  Click <strong>Choose plan</strong> next to the plan you want.
                </p>
              </Step>

              <Step n={4} title="Your trial starts">
                <p>
                  Your 30-day trial starts immediately. You have full access to all features in the selected plan.
                  No money is charged until the trial period ends.
                </p>
              </Step>

              <InfoBox title="Upgrade via dialog">
                <p>
                  You can also upgrade by clicking the upgrade button that appears in various places in the dashboard
                  when you are on the free plan. A dialog opens where you can add a card and choose a plan in the same flow.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Differences between Basic and Pro</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582"
                  title="Basic — 199 SEK/mo"
                  desc="Perfect for publishing a professional website with a custom domain and SEO tools."
                />
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  title="Pro — 299 SEK/mo"
                  desc="For those who want unlimited websites, full analytics, and priority support."
                />
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Manage Subscription                                         */
    /* -------------------------------------------------------------- */
    {
      slug: "manage-subscription",
      category: "billing-and-plans",
      icon: "M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z",
      content: {
        sv: {
          title: "Hantera din prenumeration",
          description: "Lar dig hur du hanterar din prenumeration, andrar betalmetod och uppdaterar faktureringsuppgifter.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                All hantering av din prenumeration sker pa sidan <strong>Fakturering</strong> i din dashboard.
                Har kan du se din aktuella plan, andra betalmetod, uppdatera faktureringsuppgifter och mer.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Fakturerings-sidan</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Navigera till <Code>/dashboard/billing</Code> for att komma at faktureringsssidan. Den ar indelad i flera sektioner:
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Aktuell plan"
                  desc="Se vilken plan du har, status, periodstart och periodslut."
                />
                <FeatureCard
                  icon="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                  title="Betalmetod"
                  desc="Se ditt registrerade kort och lagg till eller byt kort."
                />
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Betalhistorik"
                  desc="Se alla tidigare betalningar med belopp, status och fakturalank."
                />
                <FeatureCard
                  icon="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.75 7.5h3.75"
                  title="Faktureringsuppgifter"
                  desc="Foretag, org.nr, moms-nr, kontaktuppgifter och adress for fakturor."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Byta betalkort</h2>
              <Step n={1} title="Ga till Fakturering">
                <p>Oppna <strong>Fakturering</strong> i sidofaltet.</p>
              </Step>
              <Step n={2} title="Klicka Byt kort">
                <p>Under sektionen <strong>Betalmetod</strong> ser du ditt nuvarande kort. Klicka pa <strong>Byt kort</strong>.</p>
              </Step>
              <Step n={3} title="Fyll i nya kortuppgifter">
                <p>Fyll i dina nya kortuppgifter i Stripe-formularet och klicka <strong>Lagg till kort</strong>.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Uppdatera faktureringsuppgifter</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Langst ner pa faktureringssidan hittar du formularet for faktureringsuppgifter. Har kan du fylla i:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Foretagsuppgifter:</strong> Foretag, organisationsnummer, moms-nummer (VAT)</li>
                <li><strong>Kontaktuppgifter:</strong> Namn, e-post, telefon</li>
                <li><strong>Adress:</strong> Gatuadress, postnummer, stad och land</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Klicka <strong>Spara</strong> nar du ar klar. Dessa uppgifter anvands pa dina fakturor.
              </p>

              <InfoBox title="Perioder och fornyelse">
                <p>
                  Din prenumeration fornyar sig automatiskt varje manad. Pa faktureringssidan kan du se
                  din aktuella periods start- och slutdatum. Betalning dras automatiskt pa fornyelsedagen.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Managing your subscription",
          description: "Learn how to manage your subscription, change payment method, and update billing details.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                All subscription management happens on the <strong>Billing</strong> page in your dashboard.
                Here you can view your current plan, change payment method, update billing details, and more.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">The Billing page</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Navigate to <Code>/dashboard/billing</Code> to access the billing page. It is divided into several sections:
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Current plan"
                  desc="See which plan you are on, status, period start, and period end."
                />
                <FeatureCard
                  icon="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                  title="Payment method"
                  desc="View your registered card and add or change cards."
                />
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Payment history"
                  desc="View all past payments with amounts, status, and invoice links."
                />
                <FeatureCard
                  icon="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.75 7.5h3.75"
                  title="Billing details"
                  desc="Company, org number, VAT number, contact details, and invoice address."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Changing your payment card</h2>
              <Step n={1} title="Go to Billing">
                <p>Open <strong>Billing</strong> in the sidebar.</p>
              </Step>
              <Step n={2} title="Click Change card">
                <p>Under the <strong>Payment method</strong> section you will see your current card. Click <strong>Change card</strong>.</p>
              </Step>
              <Step n={3} title="Enter new card details">
                <p>Fill in your new card details in the Stripe form and click <strong>Add card</strong>.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Updating billing details</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                At the bottom of the billing page you will find the billing details form. Here you can fill in:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Company details:</strong> Company name, organization number, VAT number</li>
                <li><strong>Contact details:</strong> Name, email, phone</li>
                <li><strong>Address:</strong> Street address, zip code, city, and country</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Click <strong>Save</strong> when you are done. These details are used on your invoices.
              </p>

              <InfoBox title="Periods and renewal">
                <p>
                  Your subscription renews automatically every month. On the billing page you can see
                  your current period&apos;s start and end dates. Payment is charged automatically on the renewal date.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Invoices and Payments                                       */
    /* -------------------------------------------------------------- */
    {
      slug: "invoices-and-payments",
      category: "billing-and-plans",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      content: {
        sv: {
          title: "Fakturor och betalhistorik",
          description: "Lar dig hur du hittar dina fakturor, forstar betalningsstatusar och laddar ner kvitton.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Alla dina betalningar och fakturor samlas pa <strong>Fakturering</strong>-sidan i din dashboard.
                Har kan du se varje betalning som har gjorts, dess status, och ladda ner fakturor som PDF direkt fran Stripe.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hitta din betalhistorik</h2>
              <Step n={1} title="Ga till Fakturering">
                <p>Navigera till <Code>/dashboard/billing</Code> i din dashboard.</p>
              </Step>
              <Step n={2} title="Scrolla till Betalhistorik">
                <p>
                  Under ditt kort och din planinfo hittar du sektionen <strong>Betalhistorik</strong>.
                  Har visas en tabell med alla dina betalningar.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad visas i betalhistoriken?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                For varje betalning visas foljande information:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  <span><strong>Datum</strong> — Nar betalningen genomfordes.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Belopp</strong> — Beloppet i SEK (svenska kronor).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Status</strong> — Betald, misslyckad eller vantande.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  <span><strong>Faktura</strong> — En lank for att oppna fakturan via Stripe.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ladda ner faktura</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Klicka pa <strong>Visa faktura</strong> i betalhistoriktabellen for att oppna fakturan hos Stripe.
                Dar kan du se detaljerad information och ladda ner fakturan som PDF. Fakturan innehaller dina
                faktureringsuppgifter sa se till att dessa ar korrekta pa faktureringssidan.
              </p>

              <InfoBox title="Faktureringsuppgifter pa fakturan">
                <p>
                  Uppgifterna pa dina fakturor hamtas fran sektionen <strong>Faktureringsuppgifter</strong> pa
                  faktureringssidan. Se till att fylla i foretagsnamn, organisationsnummer och adress for att
                  fa korrekta fakturor — sarskilt viktigt om du behover gora avdrag.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Betalningsstatusar</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Betald</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Betalningen har genomforts framgangsrikt.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <p className="font-semibold text-primary-deep">Misslyckad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Betalningen misslyckades. Uppdatera ditt kort pa faktureringssidan.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Vantande</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Betalningen bearbetas. Vanligtvis losts detta automatiskt.</p>
                </div>
              </div>

              <WarningBox title="Misslyckad betalning?">
                <p>
                  Om en betalning misslyckas far du en varning i dashboarden. Du har <strong>14 dagars respitperiod</strong> for
                  att uppdatera din betalmetod. Under respitperioden forblir din webbplats aktiv. Om betalningen
                  inte losts inom 14 dagar kan din webbplats arkiveras.
                </p>
              </WarningBox>
            </>
          ),
        },
        en: {
          title: "Invoices and payment history",
          description: "Learn how to find your invoices, understand payment statuses, and download receipts.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                All your payments and invoices are collected on the <strong>Billing</strong> page in your dashboard.
                Here you can see every payment that has been made, its status, and download invoices as PDF directly from Stripe.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Finding your payment history</h2>
              <Step n={1} title="Go to Billing">
                <p>Navigate to <Code>/dashboard/billing</Code> in your dashboard.</p>
              </Step>
              <Step n={2} title="Scroll to Payment History">
                <p>
                  Below your card and plan info you will find the <strong>Payment History</strong> section.
                  Here a table shows all your payments.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What is shown in the payment history?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                For each payment the following information is displayed:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  <span><strong>Date</strong> — When the payment was processed.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Amount</strong> — The amount in SEK (Swedish kronor).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Status</strong> — Paid, failed, or pending.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  <span><strong>Invoice</strong> — A link to open the invoice via Stripe.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Downloading an invoice</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Click <strong>View invoice</strong> in the payment history table to open the invoice on Stripe.
                There you can see detailed information and download the invoice as PDF. The invoice uses your
                billing details so make sure they are correct on the billing page.
              </p>

              <InfoBox title="Billing details on invoices">
                <p>
                  The details on your invoices are pulled from the <strong>Billing details</strong> section on
                  the billing page. Make sure to fill in your company name, organization number, and address to
                  get correct invoices — especially important if you need to make deductions.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Payment statuses</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Paid</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The payment was processed successfully.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <p className="font-semibold text-primary-deep">Failed</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The payment failed. Update your card on the billing page.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Pending</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The payment is being processed. This usually resolves automatically.</p>
                </div>
              </div>

              <WarningBox title="Failed payment?">
                <p>
                  If a payment fails, you will see a warning in the dashboard. You have a <strong>14-day grace period</strong> to
                  update your payment method. During the grace period your website remains active. If the payment
                  is not resolved within 14 days, your website may be archived.
                </p>
              </WarningBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. Cancel Subscription                                         */
    /* -------------------------------------------------------------- */
    {
      slug: "cancel-subscription",
      category: "billing-and-plans",
      icon: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      content: {
        sv: {
          title: "Saga upp din prenumeration",
          description: "Lar dig hur du sager upp din prenumeration, vad som hander med din data, och hur du ateraktiverar.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Du kan saga upp din prenumeration nar som helst. Uppsagningen trader i kraft vid slutet av din
                aktuella faktureringsperiod — du behaller tillgangen till alla funktioner fram till dess.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sa har sager du upp</h2>

              <Step n={1} title="Ga till Fakturering">
                <p>Navigera till <Code>/dashboard/billing</Code> i din dashboard.</p>
              </Step>

              <Step n={2} title="Klicka pa Saga upp prenumeration">
                <p>
                  Under din aktuella plan ser du lanken <strong>Saga upp prenumeration</strong>. Klicka pa den.
                </p>
              </Step>

              <Step n={3} title="Bekrafta uppsagningen">
                <p>
                  En bekraftelsedialog visas. Klicka pa <strong>Ja, saga upp</strong> for att bekrafta.
                  Du kan ocksa valja <strong>Nej, behall</strong> om du andrar dig.
                </p>
              </Step>

              <InfoBox title="Uppsagningen ar inte omedelbar">
                <p>
                  Nar du sager upp din prenumeration avslutas den vid slutet av din aktuella period.
                  Du behaller full tillgang till alla funktioner fram till dess. Inga fler betalningar
                  dras fran ditt kort efter den aktuella perioden.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad hander med din data?</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Under perioden</strong> — Din webbplats och all data forblir aktiva och tillgangliga under resten av faktureringsperioden.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  <span><strong>Efter perioden</strong> — Din webbplats nedgraderas till gratisplanen. Funktioner som kravde en betalplan (t.ex. egen doman, avancerad SEO) blir otillgangliga.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  <span><strong>Dina data raderas inte</strong> — Ditt konto, webbplats-innehall och all data sparas. Du kan uppgradera igen nar som helst for att fa tillbaka alla funktioner.</span>
                </li>
              </ul>

              <WarningBox title="Publicerade webbplatser">
                <p>
                  Om du har en publicerad webbplats med egen doman kommer den att sluta fungera nar din betalda
                  plan lopor ut. Webbplatsen atergaer till gratisplanen med en Qvicko-subdoman. Se till att
                  planera for detta om du har besokare pa din sida.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ateraktivera prenumerationen</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du har sagt upp men din period inte ar slut annu kan du <strong>ateraktivera</strong> prenumerationen.
                Ga till <strong>Fakturering</strong> och klicka pa <strong>Ateraktivera prenumeration</strong>.
                Prenumerationen atergar till aktivt status och fortsatter som vanligt.
              </p>

              <InfoBox title="Angrar du dig?">
                <p>
                  Sa lange din faktureringsperiod inte ar slut kan du ateraktivera nar som helst. Om perioden
                  redan har gatt ut kan du bara starta en ny prenumeration fran faktureringssidan.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Canceling your subscription",
          description: "Learn how to cancel your subscription, what happens to your data, and how to reactivate.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                You can cancel your subscription at any time. The cancellation takes effect at the end of your
                current billing period — you keep access to all features until then.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to cancel</h2>

              <Step n={1} title="Go to Billing">
                <p>Navigate to <Code>/dashboard/billing</Code> in your dashboard.</p>
              </Step>

              <Step n={2} title="Click Cancel subscription">
                <p>
                  Under your current plan you will see the <strong>Cancel subscription</strong> link. Click it.
                </p>
              </Step>

              <Step n={3} title="Confirm the cancellation">
                <p>
                  A confirmation dialog appears. Click <strong>Yes, cancel</strong> to confirm.
                  You can also choose <strong>No, keep</strong> if you change your mind.
                </p>
              </Step>

              <InfoBox title="Cancellation is not immediate">
                <p>
                  When you cancel your subscription, it ends at the end of your current period.
                  You keep full access to all features until then. No further payments
                  will be charged to your card after the current period.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What happens to your data?</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>During the period</strong> — Your website and all data remain active and accessible for the rest of the billing period.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  <span><strong>After the period</strong> — Your website is downgraded to the free plan. Features that required a paid plan (e.g., custom domain, advanced SEO) become unavailable.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  <span><strong>Your data is not deleted</strong> — Your account, website content, and all data are preserved. You can upgrade again at any time to regain all features.</span>
                </li>
              </ul>

              <WarningBox title="Published websites">
                <p>
                  If you have a published website with a custom domain, it will stop working when your paid
                  plan expires. The website reverts to the free plan with a Qvicko subdomain. Make sure to
                  plan for this if you have visitors on your site.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Reactivating your subscription</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you have canceled but your period has not ended yet, you can <strong>reactivate</strong> your subscription.
                Go to <strong>Billing</strong> and click <strong>Reactivate subscription</strong>.
                The subscription returns to active status and continues as normal.
              </p>

              <InfoBox title="Changed your mind?">
                <p>
                  As long as your billing period has not ended, you can reactivate at any time. If the period
                  has already expired, you can simply start a new subscription from the billing page.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },
  ],
};
