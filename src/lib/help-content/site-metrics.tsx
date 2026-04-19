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

function MetricCard({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border-theme bg-surface p-5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary-deep">{value}</p>
      <p className="mt-2 text-sm text-text-muted">{desc}</p>
    </div>
  );
}

function ScoreTable({ rows }: { rows: { metric: string; good: string; ok: string; poor: string }[] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border-theme">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-theme bg-background">
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">Metrik</th>
            <th className="px-4 py-3 text-left font-semibold text-emerald-700">Bra</th>
            <th className="px-4 py-3 text-left font-semibold text-amber-700">OK</th>
            <th className="px-4 py-3 text-left font-semibold text-red-700">Dåligt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border-theme last:border-0">
              <td className="px-4 py-3 font-semibold">{r.metric}</td>
              <td className="px-4 py-3 text-emerald-700">{r.good}</td>
              <td className="px-4 py-3 text-amber-700">{r.ok}</td>
              <td className="px-4 py-3 text-red-700">{r.poor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreTableEn({ rows }: { rows: { metric: string; good: string; ok: string; poor: string }[] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border-theme">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-theme bg-background">
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">Metric</th>
            <th className="px-4 py-3 text-left font-semibold text-emerald-700">Good</th>
            <th className="px-4 py-3 text-left font-semibold text-amber-700">Needs work</th>
            <th className="px-4 py-3 text-left font-semibold text-red-700">Poor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border-theme last:border-0">
              <td className="px-4 py-3 font-semibold">{r.metric}</td>
              <td className="px-4 py-3 text-emerald-700">{r.good}</td>
              <td className="px-4 py-3 text-amber-700">{r.ok}</td>
              <td className="px-4 py-3 text-red-700">{r.poor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-primary-deep/10 px-1.5 py-0.5 text-xs font-mono text-primary-deep">{children}</code>;
}

/* ================================================================== */
/*  ARTICLES                                                          */
/* ================================================================== */

export const siteMetricsCategory: HelpCategory = {
  slug: "site-metrics",
  icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  label: {
    sv: {
      title: "Sidmetriker",
      description: "Förstå besökarstatistik, sessionsdata och prestanda-score för din webbplats",
    },
    en: {
      title: "Site Metrics",
      description: "Understand visitor statistics, session data, and performance scores for your website",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Besökare / Visitors                                         */
    /* -------------------------------------------------------------- */
    {
      slug: "visitors",
      category: "site-metrics",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      content: {
        sv: {
          title: "Besökare — unika besökare på din webbplats",
          description: "Lär dig hur Qvicko mäter unika besökare, hur besökar-ID fungerar och hur du tolkar besöksstatistiken i din dashboard.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Metriken <strong>Besökare</strong> visar antalet unika personer som har besökt din
                webbplats under en vald tidsperiod. Det är en av de viktigaste indikatorerna
                för att förstå hur många som faktiskt når din sida.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad räknas som en unik besökare?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                En unik besökare identifieras genom ett anonymt besökar-ID som sparas i
                webbläsarens <Code>localStorage</Code>. Första gången någon besöker din sida genereras
                ett slumpmässigt ID (via <Code>crypto.randomUUID</Code>) som sedan återanvänds vid
                framtida besök från samma webbläsare.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Det innebär att samma person som besöker din sida tre gånger under en vecka
                räknas som <strong>en</strong> unik besökare — inte tre. Om personen byter
                webbläsare eller enhet räknas den dock som en ny besökare.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Besökare" value="342" desc="Unika besökare senaste 7 dagarna" />
                <MetricCard label="Sessioner" value="587" desc="Totalt antal sessioner" />
                <MetricCard label="Sidvisningar" value="1 204" desc="Totalt antal sidor visade" />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Besökare vs. sessioner vs. sidvisningar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Det är lätt att blanda ihop dessa tre begrepp. Så här hänger de samman:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  <span><strong>Besökare</strong> — En unik person (identifierad via besökar-ID i localStorage). Räknas en gång oavsett hur många gånger personen återkommer.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Session</strong> — Ett sammanhängande besök. En ny session skapas varje gång besökaren öppnar en ny flik eller återkommer efter att ha stängt webbläsaren. Sessions-ID sparas i <Code>sessionStorage</Code> och försvinner när fliken stängs.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>Sidvisning</strong> — Varje enskild sida som laddas. En besökare med en session kan generera flera sidvisningar.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Så samlas data in</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko använder en lättviktig spårningspixel som automatiskt laddas på varje
                sida i din webbplats. Pixeln är en React-komponent som körs på klientsidan
                och skickar en enda förfrågan per sidladdning.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Data skickas via <Code>navigator.sendBeacon()</Code> — en webbläsar-API som
                är designad för att leverera data pålitligt även om besökaren navigerar bort
                eller stänger sidan. Som fallback används <Code>fetch()</Code> med <Code>keepalive: true</Code>.
              </p>

              <InfoBox title="Integritetsvänlig spårning">
                <p>
                  Qvicko använder inga tredjepartscookies. Besökar-ID:t är ett anonymt,
                  slumpmässigt genererat värde som inte kan kopplas till personlig information.
                  Ingen data delas med externa parter.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Jämförelse med föregående period</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                I din dashboard visas en procentuell förändring jämfört med föregående period.
                Om du tittar på de senaste 7 dagarna jämförs värdet med de 7 dagarna innan dess.
                En positiv förändring (t.ex. <span className="text-emerald-600 font-semibold">+23%</span>)
                innebär att fler unika besökare hittade din sida jämfört med föregående period.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Var hittar jag statistiken?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Logga in och gå till <strong>Dashboard → din webbplats</strong>. Högst upp ser du
                översiktskort med besökare, sessioner, sidor per session och prestanda-score.
                Under korten finns ett dagligt diagram som visar besökar- och sidvisningstrenden
                för den valda perioden (upp till 90 dagar).
              </p>
            </>
          ),
        },
        en: {
          title: "Visitors — unique visitors to your website",
          description: "Learn how Qvicko measures unique visitors, how visitor IDs work, and how to interpret visit statistics in your dashboard.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>Visitors</strong> metric shows the number of unique people who have
                visited your website during a selected time period. It is one of the most
                important indicators for understanding how many people actually reach your site.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What counts as a unique visitor?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A unique visitor is identified by an anonymous visitor ID stored in the
                browser&apos;s <Code>localStorage</Code>. The first time someone visits your site, a
                random ID is generated (via <Code>crypto.randomUUID</Code>) and reused for
                future visits from the same browser.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                This means the same person visiting your site three times in a week is counted
                as <strong>one</strong> unique visitor — not three. However, if they switch
                browsers or devices, they will be counted as a new visitor.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Visitors" value="342" desc="Unique visitors in the last 7 days" />
                <MetricCard label="Sessions" value="587" desc="Total number of sessions" />
                <MetricCard label="Page views" value="1,204" desc="Total pages viewed" />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Visitors vs. sessions vs. page views</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                It is easy to confuse these three concepts. Here is how they relate:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  <span><strong>Visitor</strong> — A unique person (identified by visitor ID in localStorage). Counted once regardless of how many times they return.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <span><strong>Session</strong> — A continuous visit. A new session is created each time a visitor opens a new tab or returns after closing the browser. The session ID is stored in <Code>sessionStorage</Code> and disappears when the tab is closed.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>Page view</strong> — Each individual page load. A visitor with one session can generate multiple page views.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How data is collected</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko uses a lightweight tracking pixel that automatically loads on every page
                of your website. The pixel is a client-side React component that sends a single
                request per page load.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Data is sent via <Code>navigator.sendBeacon()</Code> — a browser API designed
                to deliver data reliably even if the visitor navigates away or closes the page.
                As a fallback, <Code>fetch()</Code> with <Code>keepalive: true</Code> is used.
              </p>

              <InfoBox title="Privacy-friendly tracking">
                <p>
                  Qvicko does not use any third-party cookies. The visitor ID is an anonymous,
                  randomly generated value that cannot be linked to personal information.
                  No data is shared with external parties.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Comparison with previous period</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Your dashboard displays a percentage change compared to the previous period.
                If you are looking at the last 7 days, the value is compared with the 7 days
                before that. A positive change (e.g. <span className="text-emerald-600 font-semibold">+23%</span>)
                means more unique visitors found your site compared to the previous period.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Where do I find the statistics?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Log in and go to <strong>Dashboard → your website</strong>. At the top you will see
                summary cards with visitors, sessions, pages per session, and performance score.
                Below the cards is a daily chart showing visitor and page view trends for the
                selected period (up to 90 days).
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Sidor per session / Pages per Session                       */
    /* -------------------------------------------------------------- */
    {
      slug: "pages-per-session",
      category: "site-metrics",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      content: {
        sv: {
          title: "Sidor per session — engagemang på din webbplats",
          description: "Förstå metriken sidor per session: hur den beräknas, vad den säger om besökarengagemang och hur du kan förbättra den.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Sidor per session</strong> visar det genomsnittliga antalet sidor en
                besökare tittar på under ett enskilt besök. Det är ett direkt mått på hur
                engagerande din webbplats är — ju fler sidor per session, desto mer utforskar
                besökaren ditt innehåll.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur beräknas det?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Formeln är enkel:
              </p>
              <div className="my-6 rounded-xl border border-border-theme bg-surface p-5 text-center">
                <p className="text-lg font-mono text-primary-deep">
                  Sidor per session = Totala sidvisningar ÷ Totala sessioner
                </p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Till exempel: Om din sida hade 1 200 sidvisningar och 400 sessioner under en vecka
                blir sidor per session <strong>3,0</strong> — varje besökare tittade i genomsnitt
                på tre sidor.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad är en session?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                En session definieras av ett sessions-ID som sparas i webbläsarens <Code>sessionStorage</Code>.
                Sessionen lever så länge webbläsarfliken är öppen. En ny session skapas när:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Besökaren öppnar din sida i en ny flik eller ett nytt fönster</li>
                <li>Besökaren stänger fliken och sedan återkommer</li>
                <li>Besökaren rensar sin webbläsardata</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad är ett bra värde?</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Lågt" value="1,0–1,5" desc="Besökare lämnar snabbt. Kan tyda på att landningssidan inte engagerar." />
                <MetricCard label="Bra" value="2,0–3,0" desc="Besökare utforskar ditt innehåll aktivt. Bra engagemangsnivå." />
                <MetricCard label="Utmärkt" value="3,0+" desc="Hög nyfikenhet. Ditt innehåll driver besökare att gå vidare." />
              </div>

              <InfoBox title="Kontexten spelar roll">
                <p>
                  En landningssida med ett enda syfte (t.ex. ett kontaktformulär) kan ha
                  låga sidor per session och ändå vara effektiv. Bedöm alltid metriken
                  utifrån sidans mål.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Så samlas data in tekniskt</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Varje sidladdning registreras som en <strong>sidvisning</strong> kopplad till
                besökarens sessions-ID. Backend-servern aggregerar sedan data med databasfrågor:
              </p>
              <div className="my-6 rounded-xl border border-border-theme bg-surface p-5">
                <p className="font-mono text-sm text-primary-deep">
                  COUNT(page_views) ÷ COUNT(DISTINCT session_id)
                </p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Beräkningen görs i realtid för den tidsperiod du väljer i dashboarden
                (7, 14, 30 eller upp till 90 dagar).
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips för att förbättra sidor per session</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Intern länkning</strong> — Länka till relaterat innehåll och tjänster från varje sida.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  <span><strong>Tydlig navigation</strong> — Se till att besökare enkelt hittar vidare på sidan.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  <span><strong>Snabb laddningstid</strong> — Långsamma sidor gör att besökare lämnar innan de klickar vidare.</span>
                </li>
              </ul>
            </>
          ),
        },
        en: {
          title: "Pages per session — engagement on your website",
          description: "Understand the pages per session metric: how it is calculated, what it says about visitor engagement, and how to improve it.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Pages per session</strong> shows the average number of pages a visitor
                views during a single visit. It is a direct measure of how engaging your
                website is — the more pages per session, the more your visitors explore
                your content.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How is it calculated?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The formula is simple:
              </p>
              <div className="my-6 rounded-xl border border-border-theme bg-surface p-5 text-center">
                <p className="text-lg font-mono text-primary-deep">
                  Pages per session = Total page views ÷ Total sessions
                </p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                For example: if your site had 1,200 page views and 400 sessions in a week,
                pages per session would be <strong>3.0</strong> — each visitor looked at an
                average of three pages.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What is a session?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A session is defined by a session ID stored in the browser&apos;s <Code>sessionStorage</Code>.
                The session lives as long as the browser tab is open. A new session is created when:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>The visitor opens your site in a new tab or window</li>
                <li>The visitor closes the tab and then returns</li>
                <li>The visitor clears their browser data</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What is a good value?</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Low" value="1.0–1.5" desc="Visitors leave quickly. May indicate the landing page isn't engaging." />
                <MetricCard label="Good" value="2.0–3.0" desc="Visitors actively explore your content. Healthy engagement level." />
                <MetricCard label="Excellent" value="3.0+" desc="High curiosity. Your content drives visitors to keep going." />
              </div>

              <InfoBox title="Context matters">
                <p>
                  A landing page with a single purpose (e.g. a contact form) can have
                  low pages per session and still be effective. Always evaluate the metric
                  in relation to the page&apos;s goal.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How data is collected technically</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Each page load is recorded as a <strong>page view</strong> linked to the
                visitor&apos;s session ID. The backend server then aggregates data with database queries:
              </p>
              <div className="my-6 rounded-xl border border-border-theme bg-surface p-5">
                <p className="font-mono text-sm text-primary-deep">
                  COUNT(page_views) ÷ COUNT(DISTINCT session_id)
                </p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The calculation is done in real time for the time period you select in the
                dashboard (7, 14, 30, or up to 90 days).
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips to improve pages per session</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Internal linking</strong> — Link to related content and services from every page.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  <span><strong>Clear navigation</strong> — Make it easy for visitors to find their way around.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  <span><strong>Fast load times</strong> — Slow pages cause visitors to leave before clicking through.</span>
                </li>
              </ul>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Prestanda-score / Performance Score                         */
    /* -------------------------------------------------------------- */
    {
      slug: "performance-score",
      category: "site-metrics",
      icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
      content: {
        sv: {
          title: "Prestanda-score — samlat betyg för din webbplats hastighet",
          description: "Förstå hur Qvickos prestanda-score beräknas från Core Web Vitals (LCP, FCP, CLS) och vad du kan göra för att förbättra den.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Prestanda-score</strong> är ett samlat betyg mellan 0 och 100 som
                mäter hur snabbt och stabilt din webbplats laddas. Betyget baseras på
                Googles <strong>Core Web Vitals</strong> — tre nyckeltal som mäter
                laddningstid och visuell stabilitet.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tre metriker som bygger betyget</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Prestanda-score beräknas som ett genomsnitt av poäng från tre Web Vitals:
              </p>

              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    LCP — Largest Contentful Paint
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Mäter hur lång tid det tar innan det största synliga elementet (t.ex. en
                    huvudbild eller rubrik) har renderats på skärmen. LCP är det viktigaste
                    måttet på <strong>upplevd laddningstid</strong>.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Bra: ≤ 2,5 s · Behöver förbättras: ≤ 4,0 s · Dåligt: &gt; 4,0 s
                  </p>
                </div>

                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    FCP — First Contentful Paint
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Mäter hur lång tid det tar innan det första synliga innehållet (text,
                    bild eller SVG) visas på skärmen. FCP visar hur snabbt besökaren ser
                    att <strong>något händer</strong> efter att ha klickat på länken.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Bra: ≤ 1,8 s · Behöver förbättras: ≤ 3,0 s · Dåligt: &gt; 3,0 s
                  </p>
                </div>

                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    CLS — Cumulative Layout Shift
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Mäter hur mycket sidans layout hoppar eller flyttas under laddning.
                    Ett högt CLS-värde innebär att element (bilder, annonser, knappar)
                    förskjuts oväntat — vilket är frustrerande för besökaren.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Bra: ≤ 0,1 · Behöver förbättras: ≤ 0,25 · Dåligt: &gt; 0,25
                  </p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur beräknas poängen?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Varje metrik ger ett delpoäng mellan 0 och 100 baserat på Googles tröskelvärden.
                Slutbetyget är genomsnittet av alla tillgängliga delpoäng.
              </p>

              <ScoreTable
                rows={[
                  { metric: "LCP", good: "≤ 2 500 ms → 100p", ok: "≤ 4 000 ms → 50–100p", poor: "> 4 000 ms → 0–50p" },
                  { metric: "FCP", good: "≤ 1 800 ms → 100p", ok: "≤ 3 000 ms → 50–100p", poor: "> 3 000 ms → 0–50p" },
                  { metric: "CLS", good: "≤ 0,1 → 100p", ok: "≤ 0,25 → 50–100p", poor: "> 0,25 → 0–50p" },
                ]}
              />

              <p className="mt-3 text-text-secondary leading-relaxed">
                Om till exempel din sidas genomsnittliga LCP är 2 000 ms (100p), FCP är 1 500 ms
                (100p) och CLS är 0,15 (67p), blir din prestanda-score: <strong>(100 + 100 + 67) ÷ 3 ≈ 89</strong>.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Så mäts Web Vitals tekniskt</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvickos spårningspixel samlar in Web Vitals direkt från varje besökares
                webbläsare med hjälp av webbstandard-API:er:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>Navigation Timing API</strong> — Ger laddningstid och TTFB (Time to First Byte) via <Code>PerformanceNavigationTiming</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>Paint Timing API</strong> — Ger FCP-värdet via <Code>performance.getEntriesByType(&quot;paint&quot;)</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>PerformanceObserver</strong> — Lyssnar på <Code>largest-contentful-paint</Code> och <Code>layout-shift</Code> händelser för LCP och CLS.</span>
                </li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Pixeln väntar 100 ms för att låta webbläsaren stabiliseras, och ytterligare
                1 000 ms för att LCP- och CLS-observatörer ska rapportera in sina värden.
                Genomsnittsvärden beräknas sedan på servern över alla sidvisningar i den valda perioden.
              </p>

              <InfoBox title="Verkliga värden, inte simulerade">
                <p>
                  Till skillnad från verktyg som Google Lighthouse (som kör simulerade
                  tester) visar Qvickos prestanda-score data från <strong>riktiga besökare</strong> i
                  riktiga nätverksförhållanden. Det ger en mer representativ bild av
                  användarupplevelsen.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips för att förbättra din score</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Optimera bilder</strong> — Använd rätt bildformat (WebP) och storlek. Stora bilder är den vanligaste orsaken till hög LCP.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  <span><strong>Ange dimensioner</strong> — Ge alla bilder och iframes en fast bredd och höjd för att minska CLS.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  <span><strong>Minimera blockerande resurser</strong> — Ladda CSS och JavaScript asynkront där det är möjligt.</span>
                </li>
              </ul>
            </>
          ),
        },
        en: {
          title: "Performance score — combined rating for your website speed",
          description: "Understand how Qvicko's performance score is calculated from Core Web Vitals (LCP, FCP, CLS) and what you can do to improve it.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Performance score</strong> is a combined rating between 0 and 100 that
                measures how fast and stable your website loads. The score is based on
                Google&apos;s <strong>Core Web Vitals</strong> — three key metrics that measure
                loading speed and visual stability.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Three metrics that build the score</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The performance score is calculated as an average of scores from three Web Vitals:
              </p>

              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    LCP — Largest Contentful Paint
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Measures how long it takes before the largest visible element (e.g. a hero
                    image or heading) has rendered on screen. LCP is the most important measure
                    of <strong>perceived loading speed</strong>.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Good: ≤ 2.5 s · Needs improvement: ≤ 4.0 s · Poor: &gt; 4.0 s
                  </p>
                </div>

                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    FCP — First Contentful Paint
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Measures how long it takes before the first visible content (text, image,
                    or SVG) appears on screen. FCP shows how quickly the visitor sees that
                    <strong> something is happening</strong> after clicking the link.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Good: ≤ 1.8 s · Needs improvement: ≤ 3.0 s · Poor: &gt; 3.0 s
                  </p>
                </div>

                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <h3 className="text-lg font-bold text-primary-deep flex items-center gap-2">
                    <Icon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    CLS — Cumulative Layout Shift
                  </h3>
                  <p className="mt-2 text-text-secondary leading-relaxed">
                    Measures how much the page layout jumps or shifts during loading.
                    A high CLS value means elements (images, ads, buttons) shift
                    unexpectedly — which is frustrating for visitors.
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Good: ≤ 0.1 · Needs improvement: ≤ 0.25 · Poor: &gt; 0.25
                  </p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How is the score calculated?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Each metric yields a sub-score between 0 and 100 based on Google&apos;s thresholds.
                The final score is the average of all available sub-scores.
              </p>

              <ScoreTableEn
                rows={[
                  { metric: "LCP", good: "≤ 2,500 ms → 100p", ok: "≤ 4,000 ms → 50–100p", poor: "> 4,000 ms → 0–50p" },
                  { metric: "FCP", good: "≤ 1,800 ms → 100p", ok: "≤ 3,000 ms → 50–100p", poor: "> 3,000 ms → 0–50p" },
                  { metric: "CLS", good: "≤ 0.1 → 100p", ok: "≤ 0.25 → 50–100p", poor: "> 0.25 → 0–50p" },
                ]}
              />

              <p className="mt-3 text-text-secondary leading-relaxed">
                For example, if your site&apos;s average LCP is 2,000 ms (100p), FCP is 1,500 ms
                (100p), and CLS is 0.15 (67p), your performance score becomes: <strong>(100 + 100 + 67) ÷ 3 ≈ 89</strong>.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How Web Vitals are measured technically</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko&apos;s tracking pixel collects Web Vitals directly from each visitor&apos;s
                browser using web standard APIs:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>Navigation Timing API</strong> — Provides load time and TTFB (Time to First Byte) via <Code>PerformanceNavigationTiming</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>Paint Timing API</strong> — Provides the FCP value via <Code>performance.getEntriesByType(&quot;paint&quot;)</Code>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  <span><strong>PerformanceObserver</strong> — Listens for <Code>largest-contentful-paint</Code> and <Code>layout-shift</Code> events for LCP and CLS.</span>
                </li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The pixel waits 100 ms to let the browser stabilize, and an additional
                1,000 ms for LCP and CLS observers to report their values. Averages are
                then computed on the server across all page views in the selected period.
              </p>

              <InfoBox title="Real values, not simulated">
                <p>
                  Unlike tools like Google Lighthouse (which runs simulated tests), Qvicko&apos;s
                  performance score shows data from <strong>real visitors</strong> under real
                  network conditions. This provides a more representative picture of the
                  user experience.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips to improve your score</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Optimize images</strong> — Use the right image format (WebP) and size. Large images are the most common cause of high LCP.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  <span><strong>Set dimensions</strong> — Give all images and iframes a fixed width and height to reduce CLS.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  <span><strong>Minimize blocking resources</strong> — Load CSS and JavaScript asynchronously where possible.</span>
                </li>
              </ul>
            </>
          ),
        },
      },
    },
  ],
};
