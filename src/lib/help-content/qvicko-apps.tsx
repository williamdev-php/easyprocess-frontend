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

function SidebarPreview({ links }: { links: { icon: string; label: string }[] }) {
  return (
    <div className="my-6 mx-auto max-w-xs rounded-2xl border border-border-theme bg-white/80 shadow-sm p-3">
      <p className="px-3 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Sidebar</p>
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary bg-primary-deep/5 mb-1 last:mb-0">
          <Icon d={link.icon} className="h-5 w-5 text-primary" />
          <span>{link.label}</span>
        </div>
      ))}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-primary-deep/10 px-1.5 py-0.5 text-xs font-mono text-primary-deep">{children}</code>;
}

/* ================================================================== */
/*  CATEGORY: Appar by Qvicko                                        */
/* ================================================================== */

export const qvickoAppsCategory: HelpCategory = {
  slug: "qvicko-apps",
  icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  label: {
    sv: {
      title: "Appar by Qvicko",
      description: "Lär dig om Qvickos appbibliotek, hur du installerar appar och hur varje app fungerar",
    },
    en: {
      title: "Apps by Qvicko",
      description: "Learn about Qvicko's app library, how to install apps, and how each app works",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Appbiblioteket / App Library                                */
    /* -------------------------------------------------------------- */
    {
      slug: "app-library",
      category: "qvicko-apps",
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
      content: {
        sv: {
          title: "Appbiblioteket — utöka din webbplats med appar",
          description: "Förstå hur Qvickos stängda appbibliotek fungerar, hur du installerar appar, autentisering och hur appar integreras i din dashboard.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Appbiblioteket</strong> är Qvickos samling av appar som du kan installera
                på din webbplats för att lägga till ny funktionalitet. Alla appar är utvecklade
                och underhållna av Qvicko — det är ett <strong>stängt appbibliotek</strong> där
                kvalitet och säkerhet prioriteras.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Stängt appbibliotek</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Till skillnad från öppna marknadsplatser (som WordPress-plugins) är Qvickos
                appbibliotek stängt. Det innebär:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  <span><strong>Säkerhet</strong> — Alla appar granskas och testas av Qvickos team innan de publiceras.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span><strong>Kompatibilitet</strong> — Appar är garanterat kompatibla med Qvickos plattform och varandra.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                  <span><strong>Uppdateringar</strong> — Appar uppdateras automatiskt utan att du behöver göra något.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur hittar jag appar?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Appbiblioteket nås via <strong>/apps</strong> i menyn. Där kan du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Bläddra bland alla tillgängliga appar</li>
                <li>Filtrera per kategori</li>
                <li>Söka efter specifika appar</li>
                <li>Se betyg, recensioner och antal installationer</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Installera en app</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Att installera en app tar bara några klick:
              </p>
              <Step n={1} title="Välj app">
                <p>Klicka på appen du vill installera i appbiblioteket för att se dess detaljsida med beskrivning, skärmdumpar och recensioner.</p>
              </Step>
              <Step n={2} title="Klicka Installera">
                <p>Klicka på <strong>Installera</strong>-knappen. Du behöver vara inloggad — om inte omdirigeras du till inloggningssidan.</p>
              </Step>
              <Step n={3} title="Välj webbplats">
                <p>Om du har flera webbplatser väljer du vilken sida appen ska installeras på.</p>
              </Step>
              <Step n={4} title="Klart!">
                <p>Appen installeras direkt och dyker upp i sidofältet i din dashboard. Du kan börja använda den omedelbart.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Autentisering och behörigheter</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Appar autentiseras genom samma session som din dashboard. När du loggar in på
                Qvicko skapas en JWT-token som automatiskt skickas med alla API-anrop, inklusive
                de som appar gör.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Varje app definierar sina <Code>scopes</Code> — de behörigheter den behöver för
                att fungera. Till exempel behöver blogg-appen behörighet att läsa och skriva
                blogg-inlägg, medan chatt-appen behöver åtkomst till konversationer.
              </p>

              <InfoBox title="Dina data är säkra">
                <p>
                  Eftersom alla appar är utvecklade av Qvicko och körs inom plattformen finns
                  ingen risk att tredjepartskod får åtkomst till dina data. Alla API-anrop
                  autentiseras med din JWT-token och valideras på servern.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad händer i din dashboard?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När en app installeras integreras den automatiskt i din dashboard:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  <span><strong>Sidofältet</strong> — Appens egna navigeringslänkar dyker upp under &quot;Appar&quot;-sektionen med en siffra som visar hur många appar du har installerat.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  <span><strong>Egna sidor</strong> — Varje app har sina egna sidor inom dashboarden, t.ex. <Code>/dashboard/sites/[siteId]/apps/blog/posts</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281" />
                  <span><strong>Inställningar</strong> — Appar som kräver konfiguration (t.ex. betalningsmetoder) har egna inställningssidor.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Prissättning</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Appar kan ha olika prismodeller:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75"
                  title="Gratis"
                  desc="Helt kostnadsfria appar — installera och använd direkt."
                />
                <FeatureCard
                  icon="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7"
                  title="Månadskostnad"
                  desc="En fast månadsavgift som faktureras löpande."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Avinstallera en app</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan avinstallera en app när som helst via <strong>Dashboard → din webbplats → Appar</strong>.
                Klicka på appen och välj avinstallera. Appens data kan komma att raderas — kontrollera
                detta innan du avinstallerar.
              </p>
            </>
          ),
        },
        en: {
          title: "App Library — extend your website with apps",
          description: "Understand how Qvicko's closed app library works, how to install apps, authentication, and how apps integrate into your dashboard.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>App Library</strong> is Qvicko&apos;s collection of apps that you can
                install on your website to add new functionality. All apps are developed and
                maintained by Qvicko — it is a <strong>closed app library</strong> where quality
                and security are prioritized.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Closed app library</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Unlike open marketplaces (like WordPress plugins), Qvicko&apos;s app library is
                closed. This means:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  <span><strong>Security</strong> — All apps are reviewed and tested by the Qvicko team before publication.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span><strong>Compatibility</strong> — Apps are guaranteed to be compatible with the Qvicko platform and each other.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                  <span><strong>Updates</strong> — Apps are updated automatically without any action required from you.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How do I find apps?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The app library is accessible via <strong>/apps</strong> in the menu. There you can:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Browse all available apps</li>
                <li>Filter by category</li>
                <li>Search for specific apps</li>
                <li>View ratings, reviews, and install counts</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Installing an app</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Installing an app only takes a few clicks:
              </p>
              <Step n={1} title="Choose an app">
                <p>Click on the app you want to install in the app library to see its detail page with description, screenshots, and reviews.</p>
              </Step>
              <Step n={2} title="Click Install">
                <p>Click the <strong>Install</strong> button. You need to be logged in — if not, you will be redirected to the login page.</p>
              </Step>
              <Step n={3} title="Select website">
                <p>If you have multiple websites, choose which site the app should be installed on.</p>
              </Step>
              <Step n={4} title="Done!">
                <p>The app is installed instantly and appears in the sidebar of your dashboard. You can start using it immediately.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Authentication and permissions</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Apps are authenticated through the same session as your dashboard. When you log in
                to Qvicko, a JWT token is created that is automatically sent with all API calls,
                including those made by apps.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Each app defines its <Code>scopes</Code> — the permissions it needs to function.
                For example, the blog app needs permission to read and write blog posts, while the
                chat app needs access to conversations.
              </p>

              <InfoBox title="Your data is safe">
                <p>
                  Since all apps are developed by Qvicko and run within the platform, there is
                  no risk of third-party code accessing your data. All API calls are authenticated
                  with your JWT token and validated on the server.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What happens in your dashboard?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When an app is installed, it is automatically integrated into your dashboard:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  <span><strong>Sidebar</strong> — The app&apos;s own navigation links appear under the &quot;Apps&quot; section with a badge showing how many apps you have installed.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  <span><strong>Dedicated pages</strong> — Each app has its own pages within the dashboard, e.g. <Code>/dashboard/sites/[siteId]/apps/blog/posts</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281" />
                  <span><strong>Settings</strong> — Apps that require configuration (e.g. payment methods) have their own settings pages.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Pricing</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Apps can have different pricing models:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75"
                  title="Free"
                  desc="Completely free apps — install and use right away."
                />
                <FeatureCard
                  icon="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7"
                  title="Monthly"
                  desc="A fixed monthly fee billed on a recurring basis."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Uninstalling an app</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can uninstall an app at any time via <strong>Dashboard → your website → Apps</strong>.
                Click on the app and choose uninstall. The app&apos;s data may be deleted — check
                this before uninstalling.
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Chatt-appen / Chat App                                      */
    /* -------------------------------------------------------------- */
    {
      slug: "chat-app",
      category: "qvicko-apps",
      icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
      content: {
        sv: {
          title: "Chatt-appen — kommunicera med besökare i realtid",
          description: "Lär dig hur chatt-appen fungerar: ta emot meddelanden från besökare, svara direkt från dashboarden och hantera konversationer.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Chatt-appen</strong> gör det möjligt för besökare på din webbplats att
                skicka meddelanden direkt till dig. Du hanterar alla konversationer från din
                Qvicko-dashboard — ingen extra programvara behövs.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Funktioner</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242"
                  title="Realtidsmeddelanden"
                  desc="Se nya meddelanden automatiskt — dashboarden uppdateras var 15:e sekund."
                />
                <FeatureCard
                  icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  title="Besökarinformation"
                  desc="Se besökarens e-post, namn och ämnesrad för varje konversation."
                />
                <FeatureCard
                  icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Statushantering"
                  desc="Markera konversationer som öppna eller stängda. Återöppna stängda konversationer vid behov."
                />
                <FeatureCard
                  icon="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  title="Sök och filtrera"
                  desc="Sök bland konversationer och filtrera på status för att hitta rätt snabbt."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navigering efter installation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När du installerar chatt-appen läggs följande länk till i sidofältet:
              </p>
              <SidebarPreview
                links={[
                  { icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", label: "Konversationer" },
                ]}
              />

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur fungerar det?</h2>
              <Step n={1} title="Besökaren skickar ett meddelande">
                <p>
                  En chattwidget visas på din webbplats. Besökaren fyller i namn, e-post och
                  ämne, och skriver sitt meddelande.
                </p>
              </Step>
              <Step n={2} title="Du ser konversationen i dashboarden">
                <p>
                  Under <strong>Chatt → Konversationer</strong> i din dashboard visas alla
                  inkommande konversationer. Du ser en förhandsvisning av senaste meddelandet,
                  antal meddelanden och tidpunkt.
                </p>
              </Step>
              <Step n={3} title="Svara direkt">
                <p>
                  Klicka på en konversation för att se hela meddelandetråden. Skriv ditt svar
                  i textfältet och klicka <strong>Skicka</strong>. Besökaren får ditt svar
                  via e-post eller i chatten.
                </p>
              </Step>
              <Step n={4} title="Stäng konversationen">
                <p>
                  När ärendet är löst kan du stänga konversationen. Den flyttas till fliken
                  &quot;Stängda&quot; och kan öppnas igen vid behov.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Konversationsstatusar</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Öppen</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Aktiv konversation som väntar på svar eller uppföljning.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Stängd</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Ärendet är löst. Kan öppnas igen om besökaren hör av sig.</p>
                </div>
              </div>

              <InfoBox title="Automatisk uppdatering">
                <p>
                  Konversationslistan pollar automatiskt var 15:e sekund efter nya meddelanden.
                  Du behöver inte ladda om sidan — nya konversationer och svar dyker upp automatiskt.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Chat App — communicate with visitors in real time",
          description: "Learn how the chat app works: receive messages from visitors, reply directly from the dashboard, and manage conversations.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>Chat App</strong> allows visitors on your website to send messages
                directly to you. You manage all conversations from your Qvicko dashboard — no
                extra software needed.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Features</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242"
                  title="Real-time messages"
                  desc="See new messages automatically — the dashboard updates every 15 seconds."
                />
                <FeatureCard
                  icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  title="Visitor information"
                  desc="See the visitor's email, name, and subject line for each conversation."
                />
                <FeatureCard
                  icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Status management"
                  desc="Mark conversations as open or closed. Reopen closed conversations when needed."
                />
                <FeatureCard
                  icon="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  title="Search and filter"
                  desc="Search through conversations and filter by status to find what you need quickly."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navigation after installation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you install the chat app, the following link is added to the sidebar:
              </p>
              <SidebarPreview
                links={[
                  { icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", label: "Conversations" },
                ]}
              />

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How does it work?</h2>
              <Step n={1} title="Visitor sends a message">
                <p>
                  A chat widget is displayed on your website. The visitor fills in their name,
                  email, and subject, and writes their message.
                </p>
              </Step>
              <Step n={2} title="You see the conversation in the dashboard">
                <p>
                  Under <strong>Chat → Conversations</strong> in your dashboard, all incoming
                  conversations are displayed. You can see a preview of the latest message,
                  message count, and timestamp.
                </p>
              </Step>
              <Step n={3} title="Reply directly">
                <p>
                  Click on a conversation to see the full message thread. Type your reply in
                  the text field and click <strong>Send</strong>. The visitor receives your reply
                  via email or in the chat.
                </p>
              </Step>
              <Step n={4} title="Close the conversation">
                <p>
                  When the issue is resolved, you can close the conversation. It moves to the
                  &quot;Closed&quot; tab and can be reopened if needed.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Conversation statuses</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Open</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Active conversation awaiting a reply or follow-up.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Closed</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Issue resolved. Can be reopened if the visitor reaches out again.</p>
                </div>
              </div>

              <InfoBox title="Automatic updates">
                <p>
                  The conversation list automatically polls for new messages every 15 seconds.
                  You don&apos;t need to reload the page — new conversations and replies appear automatically.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Blogg-appen / Blog App                                      */
    /* -------------------------------------------------------------- */
    {
      slug: "blog-app",
      category: "qvicko-apps",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      content: {
        sv: {
          title: "Blogg-appen — publicera innehåll på din webbplats",
          description: "Lär dig hur blogg-appen fungerar: skapa inlägg, hantera kategorier, använd rich text-editorn och publicera direkt till din sida.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Blogg-appen</strong> ger dig ett komplett system för att skapa, hantera
                och publicera blogginlägg på din webbplats. Med en kraftfull rich text-editor
                kan du skriva snyggt formaterade inlägg med bilder, rubriker och mycket mer.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Funktioner</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  title="Rich text-editor"
                  desc="Tiptap-baserad editor med formatering, rubriker, listor, bilder och mer."
                />
                <FeatureCard
                  icon="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  title="Kategorier"
                  desc="Organisera dina inlägg med kategorier. Skapa, redigera och ta bort kategorier."
                />
                <FeatureCard
                  icon="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  title="Utvald bild"
                  desc="Välj en bild som visas som omslagsbild för ditt inlägg."
                />
                <FeatureCard
                  icon="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  title="Filter och sök"
                  desc="Filtrera inlägg på status och kategori. Sök bland alla inlägg."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navigering efter installation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När du installerar blogg-appen läggs följande länkar till i sidofältet:
              </p>
              <SidebarPreview
                links={[
                  { icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", label: "Blogginlägg" },
                  { icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z", label: "Kategorier" },
                ]}
              />

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Skapa ett inlägg</h2>
              <Step n={1} title="Gå till Blogginlägg">
                <p>Klicka på <strong>Blogginlägg</strong> i sidofältet. Du ser en lista med alla dina inlägg.</p>
              </Step>
              <Step n={2} title="Klicka Skapa nytt">
                <p>Klicka på knappen <strong>Skapa nytt inlägg</strong> högst upp till höger.</p>
              </Step>
              <Step n={3} title="Fyll i innehåll">
                <p>
                  Ange titel, slug (URL-vänligt namn), utdrag (kort beskrivning), välj kategori
                  och författarnamn. Använd den inbyggda rich text-editorn för att skriva inläggets
                  brödtext med formatering, bilder och listor.
                </p>
              </Step>
              <Step n={4} title="Välj status och spara">
                <p>
                  Välj status: <strong>Utkast</strong> (sparar utan att publicera),
                  <strong> Publicerad</strong> (synlig på webbplatsen) eller <strong>Arkiverad</strong> (dold).
                  Klicka sedan <strong>Spara</strong>.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Inläggsstatusar</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Utkast</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Inlägget är sparat men inte synligt för besökare. Perfekt för pågående arbete.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Publicerad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Inlägget är live och synligt för alla besökare på din webbplats.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Arkiverad</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">Inlägget är dolt från webbplatsen men inte raderat. Kan publiceras igen.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hantera kategorier</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Under <strong>Kategorier</strong> i sidofältet kan du skapa och hantera
                bloggens kategorier. Varje kategori har ett namn och en slug. Du kan sedan
                tilldela inlägg till kategorier för att organisera ditt innehåll.
              </p>

              <InfoBox title="Filtrera med kategorier">
                <p>
                  I inläggslistan kan du filtrera per kategori med dropdown-menyn. Det gör
                  det enkelt att hitta alla inlägg inom ett specifikt ämne, t.ex. &quot;Nyheter&quot;
                  eller &quot;Guider&quot;.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Blog App — publish content on your website",
          description: "Learn how the blog app works: create posts, manage categories, use the rich text editor, and publish directly to your site.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>Blog App</strong> gives you a complete system for creating, managing,
                and publishing blog posts on your website. With a powerful rich text editor, you
                can write beautifully formatted posts with images, headings, and much more.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Features</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  title="Rich text editor"
                  desc="Tiptap-based editor with formatting, headings, lists, images, and more."
                />
                <FeatureCard
                  icon="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  title="Categories"
                  desc="Organize your posts with categories. Create, edit, and delete categories."
                />
                <FeatureCard
                  icon="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  title="Featured image"
                  desc="Choose an image to display as the cover image for your post."
                />
                <FeatureCard
                  icon="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  title="Filter and search"
                  desc="Filter posts by status and category. Search across all posts."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navigation after installation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you install the blog app, the following links are added to the sidebar:
              </p>
              <SidebarPreview
                links={[
                  { icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", label: "Blog Posts" },
                  { icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z", label: "Categories" },
                ]}
              />

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Creating a post</h2>
              <Step n={1} title="Go to Blog Posts">
                <p>Click on <strong>Blog Posts</strong> in the sidebar. You will see a list of all your posts.</p>
              </Step>
              <Step n={2} title="Click Create New">
                <p>Click the <strong>Create new post</strong> button in the top right corner.</p>
              </Step>
              <Step n={3} title="Fill in content">
                <p>
                  Enter the title, slug (URL-friendly name), excerpt (short description), select
                  a category, and author name. Use the built-in rich text editor to write the
                  post body with formatting, images, and lists.
                </p>
              </Step>
              <Step n={4} title="Choose status and save">
                <p>
                  Choose a status: <strong>Draft</strong> (saves without publishing),
                  <strong> Published</strong> (visible on the website), or <strong>Archived</strong> (hidden).
                  Then click <strong>Save</strong>.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Post statuses</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <p className="font-semibold text-primary-deep">Draft</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The post is saved but not visible to visitors. Perfect for work in progress.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-primary-deep">Published</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The post is live and visible to all visitors on your website.</p>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-400" />
                    <p className="font-semibold text-primary-deep">Archived</p>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">The post is hidden from the website but not deleted. Can be republished.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Managing categories</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Under <strong>Categories</strong> in the sidebar you can create and manage blog
                categories. Each category has a name and a slug. You can then assign posts to
                categories to organize your content.
              </p>

              <InfoBox title="Filter with categories">
                <p>
                  In the posts list, you can filter by category using the dropdown menu. This
                  makes it easy to find all posts within a specific topic, such as &quot;News&quot;
                  or &quot;Guides&quot;.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },
  ],
};
