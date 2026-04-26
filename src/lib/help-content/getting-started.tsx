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
/*  CATEGORY: Getting Started                                         */
/* ================================================================== */

export const gettingStartedCategory: HelpCategory = {
  slug: "getting-started",
  icon: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  label: {
    sv: {
      title: "Kom igang",
      description: "Lär dig grunderna i Qvicko — skapa konto, bygg din webbplats och publicera den",
    },
    en: {
      title: "Getting Started",
      description: "Learn the basics of Qvicko — create an account, build your website, and publish it",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Overview — Welcome to Qvicko                               */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "getting-started",
      icon: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
      content: {
        sv: {
          title: "Välkommen till Qvicko — din webbplatsbyggare",
          description: "En översikt av vad Qvicko erbjuder, hur plattformen fungerar och vad du kan åstadkomma.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Qvicko</strong> är en modern webbplatsbyggare som gör det enkelt att skapa,
                hantera och publicera professionella webbplatser. Oavsett om du driver ett litet
                företag, en frilansverksamhet eller en organisation hjälper Qvicko dig att komma
                online snabbt och smidigt.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad kan du göra med Qvicko?</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  title="AI-genererade webbplatser"
                  desc="Beskriv ditt företag och lät Qvicko generera en komplett webbplats at dig med texter, bilder och färger."
                />
                <FeatureCard
                  icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  title="Visuell redigering"
                  desc="Redigera sektioner, texter, bilder och färger direkt i dashboarden utan att skriva kod."
                />
                <FeatureCard
                  icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"
                  title="Eget domännamn"
                  desc="Koppla din egen domän eller använd en gratis qvickosite.com-subdomän."
                />
                <FeatureCard
                  icon="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z"
                  title="Appar och tillägg"
                  desc="Utöka din webbplats med appar som blogg, chatt, formulär och mer fran Qvickos appbibliotek."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur fungerar det?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko följer en enkel process i tre steg:
              </p>
              <Step n={1} title="Skapa ett konto">
                <p>Registrera dig med e-post eller Google. Det tar mindre än en minut.</p>
              </Step>
              <Step n={2} title="Bygg din webbplats">
                <p>
                  Använd Qvickos AI-guide för att generera en webbplats automatiskt, eller
                  omvandla en befintlig webbplats till Qvicko-plattformen. Anpassa sedan
                  design, sektioner och innehall i dashboarden.
                </p>
              </Step>
              <Step n={3} title="Publicera och vax">
                <p>
                  Med ett klick publiceras din webbplats. Koppla en egen domän, installera
                  appar och följ dina besökare via den inbyggda analysen.
                </p>
              </Step>

              <InfoBox title="Gratis att börja">
                <p>
                  Du kan skapa ett konto och bygga din webbplats helt gratis. Du behöver bara
                  välja ett abonnemang när du vill publicera med en egen domän eller lasa upp
                  avancerade funktioner.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Plattformens delar</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  <span><strong>Dashboard</strong> — Ditt kontrollcenter där du hanterar webbplatser, sidor, inställningar och appar.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  <span><strong>Editor</strong> — Redigera varje sektion av din webbplats visuellt med direktförhandsgranskning.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  <span><strong>Appbiblioteket</strong> — Installera appar som blogg, chatt och mer för att utöka funktionaliteten.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                  <span><strong>Analys</strong> — Följ besökare, sidvisningar och prestanda i realtid.</span>
                </li>
              </ul>
            </>
          ),
        },
        en: {
          title: "Welcome to Qvicko — your website builder",
          description: "An overview of what Qvicko offers, how the platform works, and what you can accomplish.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Qvicko</strong> is a modern website builder that makes it easy to create,
                manage, and publish professional websites. Whether you run a small business, a
                freelance practice, or an organization, Qvicko helps you get online quickly and
                smoothly.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What can you do with Qvicko?</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  title="AI-generated websites"
                  desc="Describe your business and let Qvicko generate a complete website for you with text, images, and colors."
                />
                <FeatureCard
                  icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  title="Visual editing"
                  desc="Edit sections, text, images, and colors directly in the dashboard without writing code."
                />
                <FeatureCard
                  icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"
                  title="Custom domain"
                  desc="Connect your own domain or use a free qvickosite.com subdomain."
                />
                <FeatureCard
                  icon="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z"
                  title="Apps and extensions"
                  desc="Extend your website with apps like blog, chat, forms, and more from Qvicko&apos;s app library."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How does it work?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko follows a simple three-step process:
              </p>
              <Step n={1} title="Create an account">
                <p>Sign up with email or Google. It takes less than a minute.</p>
              </Step>
              <Step n={2} title="Build your website">
                <p>
                  Use Qvicko&apos;s AI wizard to generate a website automatically, or transform
                  an existing website onto the Qvicko platform. Then customize the design,
                  sections, and content in the dashboard.
                </p>
              </Step>
              <Step n={3} title="Publish and grow">
                <p>
                  With one click your website is published. Connect a custom domain, install
                  apps, and track your visitors with the built-in analytics.
                </p>
              </Step>

              <InfoBox title="Free to start">
                <p>
                  You can create an account and build your website completely free. You only
                  need to choose a subscription when you want to publish with a custom domain
                  or unlock advanced features.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Platform components</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  <span><strong>Dashboard</strong> — Your control center where you manage websites, pages, settings, and apps.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  <span><strong>Editor</strong> — Edit every section of your website visually with a live preview.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  <span><strong>App Library</strong> — Install apps like blog, chat, and more to extend functionality.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                  <span><strong>Analytics</strong> — Track visitors, page views, and performance in real time.</span>
                </li>
              </ul>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Create Account                                              */
    /* -------------------------------------------------------------- */
    {
      slug: "create-account",
      category: "getting-started",
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
      content: {
        sv: {
          title: "Skapa ditt konto — registrering steg för steg",
          description: "Lär dig hur du registrerar dig pa Qvicko med e-post eller Google, och vilken information som behövs.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Att skapa ett konto pa <strong>Qvicko</strong> är snabbt och enkelt. Du kan
                registrera dig med din e-postadress eller logga in direkt med ditt Google-konto.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Metod 1: Registrera med Google</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Det snabbaste sättet att komma igang är att använda ditt Google-konto:
              </p>
              <Step n={1} title="Ga till registreringssidan">
                <p>Besök <Code>/register</Code> eller klicka pa <strong>Kom igang</strong> pa startsidan.</p>
              </Step>
              <Step n={2} title="Klicka pa Google-knappen">
                <p>Klicka pa knappen <strong>Fortsätt med Google</strong> högst upp pa sidan. Du omdirigeras till Googles inloggningssida.</p>
              </Step>
              <Step n={3} title="Välj ditt Google-konto">
                <p>Välj det Google-konto du vill använda. Qvicko far tillgang till ditt namn och din e-postadress.</p>
              </Step>
              <Step n={4} title="Klart!">
                <p>Du loggas in automatiskt och omdirigeras till din dashboard.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Metod 2: Registrera med e-post</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du föredrar att använda e-post följer registreringen tva steg:
              </p>

              <h3 className="mt-8 text-lg font-bold text-primary-deep">Steg 1 — Kontoinformation</h3>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Namn</strong> — Ditt fullständiga namn.</li>
                <li><strong>E-post</strong> — Din e-postadress som används för inloggning.</li>
                <li><strong>Lösenord</strong> — Minst 8 tecken. En styrkeindikator visar hur starkt ditt lösenord är.</li>
                <li><strong>Bekräfta lösenord</strong> — Skriv samma lösenord igen.</li>
                <li><strong>Godkänn villkor</strong> — Du maste acceptera användarvillkoren.</li>
              </ul>

              <h3 className="mt-8 text-lg font-bold text-primary-deep">Steg 2 — Företagsuppgifter (valfritt)</h3>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Företagsnamn</strong> — Valfritt. Används om du driver ett företag.</li>
                <li><strong>Organisationsnummer</strong> — Valfritt. Ditt företags organisationsnummer.</li>
                <li><strong>Telefon</strong> — Valfritt. Används för kontakt vid behov.</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan hoppa över steg 2 genom att klicka pa <strong>Hoppa över</strong> — du kan alltid lägga till dessa uppgifter senare under <Code>/dashboard/account</Code>.
              </p>

              <InfoBox title="E-postverifiering">
                <p>
                  Efter registrering skickas ett verifieringsmail till din e-postadress. Klicka
                  pa länken i mailet för att verifiera ditt konto. Du kan använda dashboarden
                  direkt, men vissa funktioner kräver ett verifierat konto.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Lösenordssäkerhet</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När du skriver ditt lösenord visas en styrkeindikator med tre nivaer:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-error" />
                    <p className="font-semibold text-primary-deep">Svagt</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Färre än 8 tecken. Välj ett längre lösenord.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                    <p className="font-semibold text-primary-deep">OK</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">8-11 tecken. Tillräckligt men kan förbättras.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <p className="font-semibold text-primary-deep">Starkt</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">12 tecken eller fler. Bra val!</p>
                </div>
              </div>
            </>
          ),
        },
        en: {
          title: "Create your account — registration step by step",
          description: "Learn how to register on Qvicko with email or Google, and what information is needed.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Creating an account on <strong>Qvicko</strong> is quick and easy. You can
                register with your email address or sign in directly with your Google account.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Method 1: Register with Google</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The fastest way to get started is to use your Google account:
              </p>
              <Step n={1} title="Go to the registration page">
                <p>Visit <Code>/register</Code> or click <strong>Get Started</strong> on the homepage.</p>
              </Step>
              <Step n={2} title="Click the Google button">
                <p>Click the <strong>Continue with Google</strong> button at the top of the page. You will be redirected to Google&apos;s login page.</p>
              </Step>
              <Step n={3} title="Choose your Google account">
                <p>Select the Google account you want to use. Qvicko will receive your name and email address.</p>
              </Step>
              <Step n={4} title="Done!">
                <p>You are logged in automatically and redirected to your dashboard.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Method 2: Register with email</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you prefer to use email, the registration follows two steps:
              </p>

              <h3 className="mt-8 text-lg font-bold text-primary-deep">Step 1 — Account information</h3>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Name</strong> — Your full name.</li>
                <li><strong>Email</strong> — Your email address used for login.</li>
                <li><strong>Password</strong> — At least 8 characters. A strength indicator shows how strong your password is.</li>
                <li><strong>Confirm password</strong> — Type the same password again.</li>
                <li><strong>Accept terms</strong> — You must accept the terms of service.</li>
              </ul>

              <h3 className="mt-8 text-lg font-bold text-primary-deep">Step 2 — Company details (optional)</h3>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Company name</strong> — Optional. Used if you run a business.</li>
                <li><strong>Organization number</strong> — Optional. Your company&apos;s registration number.</li>
                <li><strong>Phone</strong> — Optional. Used for contact if needed.</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can skip step 2 by clicking <strong>Skip</strong> — you can always add these details later under <Code>/dashboard/account</Code>.
              </p>

              <InfoBox title="Email verification">
                <p>
                  After registration, a verification email is sent to your email address. Click
                  the link in the email to verify your account. You can use the dashboard
                  right away, but some features require a verified account.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Password security</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you type your password, a strength indicator is shown with three levels:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-error" />
                    <p className="font-semibold text-primary-deep">Weak</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Fewer than 8 characters. Choose a longer password.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                    <p className="font-semibold text-primary-deep">OK</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">8-11 characters. Sufficient but can be improved.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <p className="font-semibold text-primary-deep">Strong</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">12 characters or more. Great choice!</p>
                </div>
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Create Site                                                 */
    /* -------------------------------------------------------------- */
    {
      slug: "create-site",
      category: "getting-started",
      icon: "M12 4.5v15m7.5-7.5h-15",
      content: {
        sv: {
          title: "Skapa din första webbplats",
          description: "Lär dig hur du skapar en ny webbplats med Qvickos AI-guide — steg för steg fran namn till färdig sida.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Att skapa en webbplats pa <strong>Qvicko</strong> görs genom en steg-för-steg-guide
                som hjälper dig fran ide till färdig webbplats. Du kan antingen skapa en helt ny
                sida med AI-hjälp eller omvandla en befintlig webbplats.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tva sätt att skapa en webbplats</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="Skapa ny webbplats"
                  desc="Beskriv ditt företag sa genererar Qvickos AI en komplett webbplats at dig."
                />
                <FeatureCard
                  icon="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183"
                  title="Omvandla befintlig webbplats"
                  desc="Ange URL:en till din nuvarande sida sa omvandlar Qvicko den till plattformen."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Skapa en ny webbplats — steg för steg</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Ga till <Code>/create-site</Code> eller klicka pa <strong>Skapa webbplats</strong> i din dashboard.
              </p>

              <Step n={1} title="Logga in eller skapa konto">
                <p>
                  Om du inte redan är inloggad visas först en inloggnings- eller registreringsruta.
                  Du kan logga in med e-post eller Google. Om du redan är inloggad hoppas detta steg automatiskt över.
                </p>
              </Step>
              <Step n={2} title="Välj skapandeläge">
                <p>
                  Välj mellan <strong>Skapa ny</strong> (AI-genererad webbplats) eller
                  <strong> Omvandla befintlig</strong> (importera fran en URL).
                </p>
              </Step>
              <Step n={3} title="Fyll i företagsdetaljer">
                <p>Ange följande information:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Företagsnamn</strong> — Namnet pa ditt företag eller webbplats.</li>
                  <li><strong>Bransch</strong> — Välj fran listan eller skriv in din bransch.</li>
                  <li><strong>Beskrivning</strong> — Berätta kort vad ditt företag gör. Ju mer detaljer, desto bättre resultat.</li>
                  <li><strong>Färgpalett</strong> — Välj färger eller klicka pa slumpa för en ny palett.</li>
                  <li><strong>Typsnitt</strong> — Välj ett typsnitt som passar din stil.</li>
                  <li><strong>Logotyp</strong> (valfritt) — Ladda upp din logotyp.</li>
                  <li><strong>Bilder</strong> (valfritt) — Ladda upp egna bilder att använda pa sidan.</li>
                </ul>
              </Step>
              <Step n={4} title="Generering">
                <p>
                  Klicka pa <strong>Skapa webbplats</strong> sa börjar Qvickos AI generera din sida.
                  Det tar vanligtvis 30-60 sekunder. Du ser en animation medan sidan skapas.
                </p>
              </Step>
              <Step n={5} title="Klart!">
                <p>
                  När genereringen är klar visas en förhandsgranskning av din nya webbplats.
                  Du kan ga vidare till dashboarden för att redigera och anpassa sidan, eller
                  publicera den direkt.
                </p>
              </Step>

              <InfoBox title="Tips för bättre resultat">
                <p>
                  Ju mer information du ger i beskrivningen, desto bättre blir resultatet.
                  Beskriv dina tjänster, din malgrupp och vad som gör ditt företag unikt.
                  Du kan alltid redigera allt efterat i editorn.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Omvandla en befintlig webbplats</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du redan har en webbplats kan du ange dess URL sa analyserar Qvicko den
                och atersskapar innehallet pa Qvicko-plattformen. Det är ett enkelt sätt att
                migrera fran en annan plattform.
              </p>
              <Step n={1} title="Välj Omvandla befintlig">
                <p>I steg 2 av guiden väljer du alternativet <strong>Omvandla befintlig webbplats</strong>.</p>
              </Step>
              <Step n={2} title="Ange URL">
                <p>Skriv in den fullständiga URL:en till din nuvarande webbplats, t.ex. <Code>https://minwebbplats.se</Code>.</p>
              </Step>
              <Step n={3} title="Generering">
                <p>Qvicko analyserar sidan, extraherar innehall och skapar en ny version pa plattformen.</p>
              </Step>
            </>
          ),
        },
        en: {
          title: "Create your first website",
          description: "Learn how to create a new website with Qvicko&apos;s AI wizard — step by step from name to finished site.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Creating a website on <strong>Qvicko</strong> is done through a step-by-step wizard
                that guides you from idea to finished website. You can either create a brand new
                site with AI assistance or transform an existing website.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Two ways to create a website</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="Create new website"
                  desc="Describe your business and Qvicko&apos;s AI generates a complete website for you."
                />
                <FeatureCard
                  icon="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183"
                  title="Transform existing website"
                  desc="Enter the URL of your current site and Qvicko transforms it onto the platform."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Create a new website — step by step</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Go to <Code>/create-site</Code> or click <strong>Create website</strong> in your dashboard.
              </p>

              <Step n={1} title="Log in or create an account">
                <p>
                  If you are not already logged in, a login or registration form is shown first.
                  You can log in with email or Google. If you are already logged in, this step is skipped automatically.
                </p>
              </Step>
              <Step n={2} title="Choose creation mode">
                <p>
                  Choose between <strong>Create new</strong> (AI-generated website) or
                  <strong> Transform existing</strong> (import from a URL).
                </p>
              </Step>
              <Step n={3} title="Fill in business details">
                <p>Enter the following information:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Business name</strong> — The name of your business or website.</li>
                  <li><strong>Industry</strong> — Select from the list or type in your industry.</li>
                  <li><strong>Description</strong> — Briefly describe what your business does. The more detail, the better the result.</li>
                  <li><strong>Color palette</strong> — Choose colors or click randomize for a new palette.</li>
                  <li><strong>Font</strong> — Choose a font that fits your style.</li>
                  <li><strong>Logo</strong> (optional) — Upload your logo.</li>
                  <li><strong>Images</strong> (optional) — Upload your own images to use on the site.</li>
                </ul>
              </Step>
              <Step n={4} title="Generation">
                <p>
                  Click <strong>Create website</strong> and Qvicko&apos;s AI starts generating your site.
                  It typically takes 30-60 seconds. You will see an animation while the site is being created.
                </p>
              </Step>
              <Step n={5} title="Done!">
                <p>
                  When generation is complete, a preview of your new website is shown. You can
                  proceed to the dashboard to edit and customize the site, or publish it directly.
                </p>
              </Step>

              <InfoBox title="Tips for better results">
                <p>
                  The more information you provide in the description, the better the result.
                  Describe your services, your target audience, and what makes your business
                  unique. You can always edit everything afterwards in the editor.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Transform an existing website</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you already have a website, you can enter its URL and Qvicko will analyze it
                and recreate the content on the Qvicko platform. It is a simple way to migrate
                from another platform.
              </p>
              <Step n={1} title="Choose Transform existing">
                <p>In step 2 of the wizard, select the <strong>Transform existing website</strong> option.</p>
              </Step>
              <Step n={2} title="Enter URL">
                <p>Type the full URL of your current website, e.g. <Code>https://mywebsite.com</Code>.</p>
              </Step>
              <Step n={3} title="Generation">
                <p>Qvicko analyzes the site, extracts content, and creates a new version on the platform.</p>
              </Step>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Dashboard Overview                                          */
    /* -------------------------------------------------------------- */
    {
      slug: "dashboard-overview",
      category: "getting-started",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      content: {
        sv: {
          title: "Navigera i dashboarden — en översikt",
          description: "Förstå hur dashboarden är uppbyggd, vilka sektioner som finns och vad du kan göra i varje del.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Dashboarden</strong> är ditt kontrollcenter i Qvicko. Härifran hanterar du
                allt fran webbplatsens innehall och design till domäner, fakturering och appar.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Startsidan</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När du loggar in landar du pa dashboardens startsida (<Code>/dashboard</Code>).
                Här ser du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>En personlig hälsning baserad pa tid pa dygnet.</li>
                <li><strong>Nyckeltal</strong> — Besökare, sidvisningar per session och prestandapoäng för din valda webbplats de senaste 7 dagarna.</li>
                <li><strong>Besöksdiagram</strong> — Ett stapeldiagram som visar besökare per dag under veckan.</li>
                <li><strong>Onboarding-checklista</strong> — En steg-för-steg-guide som hjälper dig slutföra viktiga uppgifter som att publicera din sida, koppla domän och installera appar.</li>
                <li><strong>Tips</strong> — Praktiska rad för att fa ut mesta möjliga av plattformen.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sidofältet</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Till vänster hittar du sidofältet med alla huvudsektioner. Överst finns en
                webbplatsväljare om du har flera sidor. Nedan listas de viktigaste sektionerna:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-semibold text-primary-deep">Översikt</p>
                  </div>
                  <p className="text-sm text-text-muted">Startsidan med nyckeltal, besöksstatistik och onboarding-checklista.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Editor</p>
                    </div>
                    <p className="text-sm text-text-muted">Redigera din webbplats visuellt — ändra sektioner, texter och bilder.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Sidor</p>
                    </div>
                    <p className="text-sm text-text-muted">Hantera webbplatsens sidor — skapa, redigera och ta bort undersidor.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Navigation</p>
                    </div>
                    <p className="text-sm text-text-muted">Konfigurera sidans meny och navigeringslänkar.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">SEO</p>
                    </div>
                    <p className="text-sm text-text-muted">Optimera sökmotorsynlighet med meta-titlar, beskrivningar och Open Graph-bilder.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Domän</p>
                    </div>
                    <p className="text-sm text-text-muted">Koppla en egen domän till din webbplats.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Analys</p>
                    </div>
                    <p className="text-sm text-text-muted">Se besöksstatistik, sidvisningar och prestanda.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Fakturering</p>
                    </div>
                    <p className="text-sm text-text-muted">Hantera din prenumeration och betalningsmetoder.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Konto</p>
                    </div>
                    <p className="text-sm text-text-muted">Uppdatera din profil, företagsinformation och lösenord.</p>
                  </div>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Onboarding-checklista</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Pa startsidan visas en checklista som hjälper dig att slutföra alla viktiga steg
                för att fa ut det mesta av Qvicko:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Fyll i företagsuppgifter</li>
                <li>Välj ett abonnemang</li>
                <li>Publicera din webbplats</li>
                <li>Koppla en egen domän</li>
                <li>Anslut Google Search Console</li>
                <li>Installera appar</li>
              </ul>

              <InfoBox title="Webbplatsväljare">
                <p>
                  Om du har flera webbplatser kan du växla mellan dem med dropdown-menyn
                  högst upp i sidofältet. Alla statistik och inställningar i dashboarden
                  gäller den valda webbplatsen.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Navigate the dashboard — an overview",
          description: "Understand how the dashboard is structured, what sections are available, and what you can do in each part.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>Dashboard</strong> is your control center in Qvicko. From here you
                manage everything from your website&apos;s content and design to domains, billing,
                and apps.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Home page</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you log in, you land on the dashboard home page (<Code>/dashboard</Code>).
                Here you will see:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>A personalized greeting based on the time of day.</li>
                <li><strong>Key metrics</strong> — Visitors, pages per session, and performance score for your selected website over the last 7 days.</li>
                <li><strong>Visitor chart</strong> — A bar chart showing visitors per day during the week.</li>
                <li><strong>Onboarding checklist</strong> — A step-by-step guide that helps you complete important tasks like publishing your site, connecting a domain, and installing apps.</li>
                <li><strong>Tips</strong> — Practical advice to get the most out of the platform.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sidebar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                On the left side you will find the sidebar with all main sections. At the top
                there is a site selector if you have multiple sites. Below are the key sections:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-semibold text-primary-deep">Overview</p>
                  </div>
                  <p className="text-sm text-text-muted">Home page with key metrics, visitor stats, and onboarding checklist.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Editor</p>
                    </div>
                    <p className="text-sm text-text-muted">Edit your website visually — modify sections, text, and images.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Pages</p>
                    </div>
                    <p className="text-sm text-text-muted">Manage your website&apos;s pages — create, edit, and delete subpages.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Navigation</p>
                    </div>
                    <p className="text-sm text-text-muted">Configure your site&apos;s menu and navigation links.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">SEO</p>
                    </div>
                    <p className="text-sm text-text-muted">Optimize search engine visibility with meta titles, descriptions, and Open Graph images.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Domain</p>
                    </div>
                    <p className="text-sm text-text-muted">Connect a custom domain to your website.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Analytics</p>
                    </div>
                    <p className="text-sm text-text-muted">View visitor statistics, page views, and performance.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Billing</p>
                    </div>
                    <p className="text-sm text-text-muted">Manage your subscription and payment methods.</p>
                  </div>
                  <div className="rounded-xl border border-border-theme bg-surface p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-primary-deep">Account</p>
                    </div>
                    <p className="text-sm text-text-muted">Update your profile, company information, and password.</p>
                  </div>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Onboarding checklist</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                On the home page, a checklist is displayed that helps you complete all the
                important steps to get the most out of Qvicko:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Fill in company details</li>
                <li>Choose a subscription plan</li>
                <li>Publish your website</li>
                <li>Connect a custom domain</li>
                <li>Connect Google Search Console</li>
                <li>Install apps</li>
              </ul>

              <InfoBox title="Site selector">
                <p>
                  If you have multiple websites, you can switch between them using the dropdown
                  menu at the top of the sidebar. All statistics and settings in the dashboard
                  apply to the selected website.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. Publish Site                                                */
    /* -------------------------------------------------------------- */
    {
      slug: "publish-site",
      category: "getting-started",
      icon: "M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z",
      content: {
        sv: {
          title: "Publicera din webbplats — ga live",
          description: "Lär dig hur du publicerar din webbplats, vilka statusar som finns, och hur du hanterar paus och avpublicering.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                När din webbplats är redo att visas för omvärlden är det dags att <strong>publicera</strong>.
                Att publicera gör din sida live pa din subdomän (<Code>dittnamn.qvickosite.com</Code>)
                eller pa din egna domän om du har kopplat en.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur publicerar jag?</h2>
              <Step n={1} title="Ga till webbplatsöversikten">
                <p>
                  Navigera till <strong>Dashboard</strong> och klicka pa din webbplats i sidofältet,
                  eller ga direkt till <Code>/dashboard/sites/[siteId]/general</Code>. Här ser du
                  en översikt av din webbplats med status, besökare och förhandsgranskning.
                </p>
              </Step>
              <Step n={2} title="Granska din sida">
                <p>
                  Innan du publicerar, kontrollera att allt ser bra ut. Du kan se en förhandsgranskning
                  av din webbplats direkt pa översiktssidan. Klicka pa <strong>Editor</strong> i sidofältet
                  för att göra sista justeringar.
                </p>
              </Step>
              <Step n={3} title="Klicka Publicera">
                <p>
                  Pa översiktssidan klickar du pa knappen <strong>Publicera</strong>. Din webbplats
                  status ändras fran &quot;Utkast&quot; till &quot;Publicerad&quot; och sidan blir
                  tillgänglig för besökare.
                </p>
              </Step>

              <InfoBox title="Subdomän ingår">
                <p>
                  Alla webbplatser pa Qvicko far automatiskt en gratis subdomän i formatet
                  <Code> dittnamn.qvickosite.com</Code>. Du kan använda den direkt eller
                  koppla en egen domän via <strong>Dashboard &rarr; Domän</strong>.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Webbplatsstatusar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Din webbplats kan ha en av följande statusar:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Utkast</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Webbplatsen är inte synlig för besökare. Du kan redigera fritt. Det här är standardstatusen för nya sidor.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Publicerad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Webbplatsen är live och tillgänglig för alla pa internet. Ändringar du gör syns direkt.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    <p className="font-semibold text-primary-deep">Pausad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Webbplatsen är tillfälligt offline. Användbart om du gör stora ändringar och vill dölja sidan tillfälligt.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Arkiverad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Webbplatsen är dold och inaktiv. Kan aterställas vid behov.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Pausa och aterstarta</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du behöver ta ned din webbplats tillfälligt kan du <strong>pausa</strong> den
                fran översiktssidan. En pausad sida är inte tillgänglig för besökare men alla
                dina inställningar och innehall bevaras. Klicka pa <strong>Aterstarta</strong> för
                att göra sidan live igen.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Checklista före publicering</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Kontrollera att alla sektioner har korrekt innehall (texter, bilder, kontaktuppgifter).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Granska SEO-inställningar — meta-titel, beskrivning och Open Graph-bild.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Testa navigeringen — se till att alla menylänkar fungerar.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Kontrollera hur sidan ser ut pa mobil (responsivt).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Överväg att koppla en egen domän för ett professionellt intryck.</span>
                </li>
              </ul>

              <InfoBox title="Ändringar efter publicering">
                <p>
                  Du kan fortsätta redigera din webbplats även efter publicering. Alla ändringar
                  du gör i editorn sparas och uppdateras automatiskt pa den live-publicerade sidan.
                  Du behöver inte publicera om efter varje ändring.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Publish your website — go live",
          description: "Learn how to publish your website, what statuses are available, and how to manage pausing and unpublishing.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                When your website is ready to be seen by the world, it is time to <strong>publish</strong>.
                Publishing makes your site live on your subdomain (<Code>yourname.qvickosite.com</Code>)
                or on your custom domain if you have connected one.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How do I publish?</h2>
              <Step n={1} title="Go to the site overview">
                <p>
                  Navigate to the <strong>Dashboard</strong> and click on your website in the sidebar,
                  or go directly to <Code>/dashboard/sites/[siteId]/general</Code>. Here you will see
                  an overview of your website with status, visitors, and a preview.
                </p>
              </Step>
              <Step n={2} title="Review your site">
                <p>
                  Before publishing, make sure everything looks good. You can see a preview of your
                  website directly on the overview page. Click <strong>Editor</strong> in the sidebar
                  to make final adjustments.
                </p>
              </Step>
              <Step n={3} title="Click Publish">
                <p>
                  On the overview page, click the <strong>Publish</strong> button. Your website
                  status changes from &quot;Draft&quot; to &quot;Published&quot; and the site
                  becomes accessible to visitors.
                </p>
              </Step>

              <InfoBox title="Subdomain included">
                <p>
                  All websites on Qvicko automatically get a free subdomain in the format
                  <Code> yourname.qvickosite.com</Code>. You can use it right away or
                  connect a custom domain via <strong>Dashboard &rarr; Domain</strong>.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Website statuses</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Your website can have one of the following statuses:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Draft</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The website is not visible to visitors. You can edit freely. This is the default status for new sites.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Published</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The website is live and accessible to everyone on the internet. Changes you make are visible immediately.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />
                    <p className="font-semibold text-primary-deep">Paused</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The website is temporarily offline. Useful when making major changes and you want to hide the site temporarily.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Archived</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The website is hidden and inactive. Can be restored when needed.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Pause and resume</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you need to take your website down temporarily, you can <strong>pause</strong> it
                from the overview page. A paused site is not accessible to visitors, but all your
                settings and content are preserved. Click <strong>Resume</strong> to make the site
                live again.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Pre-publish checklist</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Check that all sections have correct content (text, images, contact details).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Review SEO settings — meta title, description, and Open Graph image.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Test the navigation — make sure all menu links work.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Check how the site looks on mobile (responsive).</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Consider connecting a custom domain for a professional impression.</span>
                </li>
              </ul>

              <InfoBox title="Changes after publishing">
                <p>
                  You can continue editing your website even after publishing. All changes you
                  make in the editor are saved and automatically updated on the live-published
                  site. You do not need to republish after each change.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },
  ],
};
