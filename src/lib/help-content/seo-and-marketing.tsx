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

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-primary-deep/10 px-1.5 py-0.5 text-xs font-mono text-primary-deep">{children}</code>;
}

/* ================================================================== */
/*  CATEGORY: SEO & Marknadsf&ouml;ring                               */
/* ================================================================== */

export const seoAndMarketingCategory: HelpCategory = {
  slug: "seo-and-marketing",
  // Heroicon: magnifying-glass-circle (outline 24x24)
  icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  label: {
    sv: {
      title: "SEO & Marknadsf\u00f6ring",
      description: "L\u00e4r dig hur du optimerar din webbplats f\u00f6r s\u00f6kmotorer, hanterar meta-taggar och anv\u00e4nder Qvickos gratisverktyg",
    },
    en: {
      title: "SEO & Marketing",
      description: "Learn how to optimize your website for search engines, manage meta tags, and use Qvicko\u2019s free tools",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. \u00d6versikt / Overview                                    */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "seo-and-marketing",
      icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
      content: {
        sv: {
          title: "SEO-\u00f6versikt \u2014 vad Qvicko g\u00f6r f\u00f6r din synlighet",
          description: "En introduktion till s\u00f6kmotoroptimering (SEO) och vilka verktyg Qvicko erbjuder f\u00f6r att hj\u00e4lpa din webbplats ranka b\u00e4ttre.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>S\u00f6kmotoroptimering (SEO)</strong> handlar om att g\u00f6ra din webbplats
                synlig i s\u00f6kresultaten p\u00e5 Google och andra s\u00f6kmotorer. Qvicko hanterar
                m\u00e5nga tekniska SEO-aspekter automatiskt s\u00e5 att du kan fokusera p\u00e5 ditt
                inneh\u00e5ll.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad Qvicko g\u00f6r automatiskt</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Sitemap"
                  desc="En XML-sitemap genereras automatiskt s\u00e5 att s\u00f6kmotorer kan hitta alla dina sidor."
                />
                <FeatureCard
                  icon="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z"
                  title="Robots.txt"
                  desc="En korrekt robots.txt-fil ser till att s\u00f6kmotorer indexerar r\u00e4tt sidor och undviker dashboard och API."
                />
                <FeatureCard
                  icon="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  title="Meta-taggar"
                  desc="St\u00e4ll in sidtitel, beskrivning, nyckelord och Open Graph-bilder per sida."
                />
                <FeatureCard
                  icon="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                  title="Strukturerad data"
                  desc="JSON-LD schema markup l\u00e4ggs automatiskt till f\u00f6r LocalBusiness och WebApplication."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad du kan konfigurera sj\u00e4lv</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                I din dashboard under <strong>SEO</strong>-sidan kan du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Koppla Google Search Console f\u00f6r indexering och s\u00f6kanalys</li>
                <li>Se din sitemap-URL och robots.txt</li>
                <li>Beg\u00e4ra omindexering av din webbplats</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Under <strong>Sidinst\u00e4llningar</strong> (f\u00f6r varje sida) kan du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Ange meta-titel (max 60 tecken rekommenderat)</li>
                <li>Ange meta-beskrivning (max 160 tecken rekommenderat)</li>
                <li>L\u00e4gga till nyckelord</li>
                <li>V\u00e4lja en Open Graph-bild f\u00f6r sociala medier</li>
                <li>St\u00e4lla in robots-direktivet per sida</li>
                <li>Redigera strukturerad data (JSON-LD)</li>
              </ul>

              <InfoBox title="Tips: B\u00f6rja med titel och beskrivning">
                <p>
                  De viktigaste SEO-f\u00e4lten \u00e4r <strong>meta-titel</strong> och <strong>meta-beskrivning</strong>.
                  Dessa visas direkt i Googles s\u00f6kresultat och avg\u00f6r om anv\u00e4ndare klickar p\u00e5
                  din l\u00e4nk. Se till att varje sida har unika, beskrivande v\u00e4rden.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "SEO overview \u2014 what Qvicko does for your visibility",
          description: "An introduction to search engine optimization (SEO) and the tools Qvicko provides to help your website rank better.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Search engine optimization (SEO)</strong> is about making your website
                visible in search results on Google and other search engines. Qvicko handles
                many technical SEO aspects automatically so you can focus on your content.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What Qvicko does automatically</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Sitemap"
                  desc="An XML sitemap is generated automatically so search engines can discover all your pages."
                />
                <FeatureCard
                  icon="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z"
                  title="Robots.txt"
                  desc="A properly configured robots.txt ensures search engines index the right pages and avoid the dashboard and API."
                />
                <FeatureCard
                  icon="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  title="Meta tags"
                  desc="Set page title, description, keywords, and Open Graph images per page."
                />
                <FeatureCard
                  icon="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                  title="Structured data"
                  desc="JSON-LD schema markup is automatically added for LocalBusiness and WebApplication."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What you can configure yourself</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                In your dashboard under the <strong>SEO</strong> page you can:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Connect Google Search Console for indexing and search analytics</li>
                <li>View your sitemap URL and robots.txt</li>
                <li>Request re-indexing of your website</li>
              </ul>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Under <strong>Page Settings</strong> (for each page) you can:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Set the meta title (max 60 characters recommended)</li>
                <li>Set the meta description (max 160 characters recommended)</li>
                <li>Add keywords</li>
                <li>Choose an Open Graph image for social media</li>
                <li>Set the robots directive per page</li>
                <li>Edit structured data (JSON-LD)</li>
              </ul>

              <InfoBox title="Tip: Start with title and description">
                <p>
                  The most important SEO fields are the <strong>meta title</strong> and <strong>meta description</strong>.
                  These are displayed directly in Google search results and determine whether users
                  click your link. Make sure every page has unique, descriptive values.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Meta-taggar / Meta Tags                                     */
    /* -------------------------------------------------------------- */
    {
      slug: "meta-tags",
      category: "seo-and-marketing",
      icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
      content: {
        sv: {
          title: "Meta-taggar \u2014 sidtitel, beskrivning och OG-taggar",
          description: "S\u00e5 st\u00e4ller du in meta-titel, meta-beskrivning, nyckelord och Open Graph-taggar f\u00f6r varje sida.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Meta-taggar</strong> \u00e4r HTML-element som ber\u00e4ttar f\u00f6r s\u00f6kmotorer och
                sociala medier vad din sida handlar om. De syns inte p\u00e5 sj\u00e4lva sidan men
                p\u00e5verkar hur din sida visas i s\u00f6kresultat och n\u00e4r n\u00e5gon delar din l\u00e4nk.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Meta-titel</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Meta-titeln \u00e4r den bl\u00e5 l\u00e4nken som visas i Googles s\u00f6kresultat. Den b\u00f6r:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Vara unik f\u00f6r varje sida</li>
                <li>Vara max <strong>60 tecken</strong> l\u00e5ng</li>
                <li>Inneh\u00e5lla det viktigaste nyckelordet</li>
                <li>Vara beskrivande och lockande</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Meta-beskrivning</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Meta-beskrivningen visas som texten under titeln i s\u00f6kresultaten. Den b\u00f6r:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Vara max <strong>160 tecken</strong> l\u00e5ng</li>
                <li>Sammanfatta sidans inneh\u00e5ll p\u00e5 ett lockande s\u00e4tt</li>
                <li>Inneh\u00e5lla en uppmaning (call-to-action)</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Open Graph-taggar (OG)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Open Graph-taggar styr hur din sida visas n\u00e4r n\u00e5gon delar din l\u00e4nk p\u00e5
                Facebook, LinkedIn, X (Twitter) eller andra plattformar. Qvicko s\u00e4tter automatiskt
                <Code>og:title</Code>, <Code>og:description</Code> och <Code>og:url</Code> baserat
                p\u00e5 din meta-titel och beskrivning. Du kan dessutom v\u00e4lja en <strong>OG-bild</strong> som
                visas som f\u00f6rhandsgranskning.
              </p>

              <InfoBox title="Rekommenderad bildstorlek f\u00f6r OG">
                <p>
                  Den ideala storleken f\u00f6r en Open Graph-bild \u00e4r <strong>1200 \u00d7 630 pixlar</strong>.
                  Anv\u00e4nd en bild med h\u00f6g kontrast och tydlig text f\u00f6r b\u00e4sta resultat p\u00e5
                  sociala medier.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">S\u00e5 \u00e4ndrar du meta-taggar i Qvicko</h2>
              <Step n={1} title="G\u00e5 till din sidas inst\u00e4llningar">
                <p>
                  Navigera till <strong>Dashboard \u2192 din webbplats \u2192 Sidor \u2192 v\u00e4lj sida \u2192 Inst\u00e4llningar</strong>.
                </p>
              </Step>
              <Step n={2} title="Fyll i SEO-f\u00e4lten">
                <p>
                  Under rubriken <strong>SEO</strong> hittar du f\u00e4lt f\u00f6r meta-titel, meta-beskrivning,
                  nyckelord och OG-bild. En f\u00f6rhandsgranskning av hur din sida ser ut i
                  Google visas direkt under f\u00e4lten.
                </p>
              </Step>
              <Step n={3} title="Spara">
                <p>
                  Klicka <strong>Spara</strong>. \u00c4ndringarna tr\u00e4der i kraft direkt och
                  s\u00f6kmotorer kommer att plocka upp de nya v\u00e4rdena vid n\u00e4sta crawl.
                </p>
              </Step>

              <WarningBox title="Undvik duplicerade meta-taggar">
                <p>
                  Se till att varje sida har en <strong>unik</strong> titel och beskrivning.
                  Duplicerade meta-taggar g\u00f6r det sv\u00e5rare f\u00f6r Google att avg\u00f6ra vilken sida som
                  ska visas, vilket kan skada din rankning.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Nyckelord</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan l\u00e4gga till nyckelord (<Code>keywords</Code>) f\u00f6r varje sida. Google
                anv\u00e4nder inte nyckelord-taggen direkt f\u00f6r rankning, men andra s\u00f6kmotorer kan
                g\u00f6ra det. Det \u00e4r \u00e4nd\u00e5 bra praxis att fylla i relevanta nyckelord f\u00f6r att
                h\u00e5lla ditt inneh\u00e5ll organiserat.
              </p>
            </>
          ),
        },
        en: {
          title: "Meta tags \u2014 page title, description, and OG tags",
          description: "How to set meta title, meta description, keywords, and Open Graph tags for each page.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Meta tags</strong> are HTML elements that tell search engines and social
                media platforms what your page is about. They are not visible on the page itself
                but affect how your page appears in search results and when someone shares your link.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Meta title</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The meta title is the blue link displayed in Google search results. It should:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Be unique for every page</li>
                <li>Be a maximum of <strong>60 characters</strong> long</li>
                <li>Contain the most important keyword</li>
                <li>Be descriptive and enticing</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Meta description</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The meta description is displayed as the text below the title in search results. It should:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Be a maximum of <strong>160 characters</strong> long</li>
                <li>Summarize the page content in an enticing way</li>
                <li>Include a call-to-action</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Open Graph tags (OG)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Open Graph tags control how your page looks when someone shares your link on
                Facebook, LinkedIn, X (Twitter), or other platforms. Qvicko automatically sets
                <Code>og:title</Code>, <Code>og:description</Code>, and <Code>og:url</Code> based
                on your meta title and description. You can also choose an <strong>OG image</strong> that
                is displayed as a preview.
              </p>

              <InfoBox title="Recommended OG image size">
                <p>
                  The ideal size for an Open Graph image is <strong>1200 \u00d7 630 pixels</strong>.
                  Use an image with high contrast and clear text for the best results on
                  social media.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to change meta tags in Qvicko</h2>
              <Step n={1} title="Go to your page settings">
                <p>
                  Navigate to <strong>Dashboard \u2192 your website \u2192 Pages \u2192 select page \u2192 Settings</strong>.
                </p>
              </Step>
              <Step n={2} title="Fill in the SEO fields">
                <p>
                  Under the <strong>SEO</strong> heading you will find fields for meta title, meta description,
                  keywords, and OG image. A preview of how your page looks in Google is shown
                  directly below the fields.
                </p>
              </Step>
              <Step n={3} title="Save">
                <p>
                  Click <strong>Save</strong>. The changes take effect immediately and search engines
                  will pick up the new values on the next crawl.
                </p>
              </Step>

              <WarningBox title="Avoid duplicate meta tags">
                <p>
                  Make sure every page has a <strong>unique</strong> title and description.
                  Duplicate meta tags make it harder for Google to determine which page to
                  display, which can hurt your ranking.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Keywords</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can add keywords (<Code>keywords</Code>) for each page. Google does not
                use the keywords tag directly for ranking, but other search engines might.
                It is still good practice to fill in relevant keywords to keep your content
                organized.
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Sitemap & Robots / Sitemap & Robots                         */
    /* -------------------------------------------------------------- */
    {
      slug: "sitemap-and-robots",
      category: "seo-and-marketing",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      content: {
        sv: {
          title: "Sitemap och robots.txt \u2014 hj\u00e4lp s\u00f6kmotorer hitta r\u00e4tt",
          description: "F\u00f6rst\u00e5 hur Qvickos automatiska sitemap och robots.txt fungerar och hur du anv\u00e4nder dem.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Sitemap</strong> och <strong>robots.txt</strong> \u00e4r tv\u00e5 filer som hj\u00e4lper
                s\u00f6kmotorer att f\u00f6rst\u00e5 din webbplats. Qvicko genererar b\u00e5da automatiskt \u2014
                du beh\u00f6ver inte skapa dem manuellt.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sitemap (sitemap.xml)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                En sitemap \u00e4r en XML-fil som listar alla sidor p\u00e5 din webbplats. Den hj\u00e4lper
                Google och andra s\u00f6kmotorer att:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Uppt\u00e4cka nya sidor snabbare</li>
                <li>F\u00f6rst\u00e5 webbplatsens struktur</li>
                <li>Veta n\u00e4r sidor senast uppdaterades</li>
                <li>Hantera flerspr\u00e5kiga versioner (hreflang)</li>
              </ul>

              <p className="mt-4 text-text-secondary leading-relaxed">
                Qvickos sitemap genererar automatiskt poster f\u00f6r alla publicerade sidor p\u00e5
                b\u00e5de svenska och engelska med korrekta <Code>alternates</Code>-taggar. Din
                sitemap finns alltid p\u00e5:
              </p>
              <div className="my-4 rounded-lg bg-gray-50 border border-border-theme px-4 py-2.5">
                <code className="text-sm text-primary-deep">https://din-dom\u00e4n.se/sitemap.xml</code>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Robots.txt</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Filen <Code>robots.txt</Code> talar om f\u00f6r s\u00f6kmotorer vilka delar av din
                webbplats de f\u00e5r och inte f\u00e5r bes\u00f6ka. Qvickos robots.txt \u00e4r konfigurerad s\u00e5 h\u00e4r:
              </p>
              <div className="my-4 rounded-lg bg-gray-50 border border-border-theme px-4 py-3 font-mono text-sm text-primary-deep space-y-1">
                <p>User-Agent: *</p>
                <p>Allow: /</p>
                <p>Disallow: /dashboard/</p>
                <p>Disallow: /api/</p>
                <p>Sitemap: https://din-dom\u00e4n.se/sitemap.xml</p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Det inneb\u00e4r att s\u00f6kmotorer f\u00e5r indexera alla publika sidor, men <strong>inte</strong> din
                dashboard eller API-endpoints.
              </p>

              <InfoBox title="Sitemap skickas automatiskt till Google">
                <p>
                  N\u00e4r du kopplar Google Search Console skickar Qvicko automatiskt din sitemap
                  till Google s\u00e5 att indexeringen startar direkt. Du kan ocks\u00e5 manuellt
                  beg\u00e4ra omindexering fr\u00e5n SEO-sidan i dashboarden.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Se dina filer</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                N\u00e4r du har en verifierad dom\u00e4n kopplad till din webbplats visas l\u00e4nkar
                till b\u00e5de <Code>sitemap.xml</Code> och <Code>robots.txt</Code> p\u00e5
                SEO-sidan i din dashboard.
              </p>
            </>
          ),
        },
        en: {
          title: "Sitemap and robots.txt \u2014 help search engines find the right pages",
          description: "Understand how Qvicko\u2019s automatic sitemap and robots.txt work and how to use them.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Sitemap</strong> and <strong>robots.txt</strong> are two files that help
                search engines understand your website. Qvicko generates both automatically \u2014
                you do not need to create them manually.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sitemap (sitemap.xml)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A sitemap is an XML file that lists all pages on your website. It helps
                Google and other search engines to:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Discover new pages faster</li>
                <li>Understand the site structure</li>
                <li>Know when pages were last updated</li>
                <li>Handle multilingual versions (hreflang)</li>
              </ul>

              <p className="mt-4 text-text-secondary leading-relaxed">
                Qvicko&apos;s sitemap automatically generates entries for all published pages
                in both Swedish and English with correct <Code>alternates</Code> tags. Your
                sitemap is always available at:
              </p>
              <div className="my-4 rounded-lg bg-gray-50 border border-border-theme px-4 py-2.5">
                <code className="text-sm text-primary-deep">https://your-domain.com/sitemap.xml</code>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Robots.txt</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The <Code>robots.txt</Code> file tells search engines which parts of your
                website they may and may not visit. Qvicko&apos;s robots.txt is configured as follows:
              </p>
              <div className="my-4 rounded-lg bg-gray-50 border border-border-theme px-4 py-3 font-mono text-sm text-primary-deep space-y-1">
                <p>User-Agent: *</p>
                <p>Allow: /</p>
                <p>Disallow: /dashboard/</p>
                <p>Disallow: /api/</p>
                <p>Sitemap: https://your-domain.com/sitemap.xml</p>
              </div>
              <p className="mt-3 text-text-secondary leading-relaxed">
                This means search engines can index all public pages, but <strong>not</strong> your
                dashboard or API endpoints.
              </p>

              <InfoBox title="Sitemap is automatically submitted to Google">
                <p>
                  When you connect Google Search Console, Qvicko automatically submits your
                  sitemap to Google so indexing starts right away. You can also manually request
                  re-indexing from the SEO page in your dashboard.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Viewing your files</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Once you have a verified domain connected to your website, links to both
                <Code>sitemap.xml</Code> and <Code>robots.txt</Code> are displayed on the SEO
                page in your dashboard.
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Gratisverktyg / Free Tools                                  */
    /* -------------------------------------------------------------- */
    {
      slug: "free-tools",
      category: "seo-and-marketing",
      icon: "M11.42 15.17l-5.648-3.014a.75.75 0 01-.094-1.278l8.628-5.673a.75.75 0 011.178.818l-2.441 7.828a.75.75 0 01-1.623.119z",
      content: {
        sv: {
          title: "Gratisverktyg \u2014 f\u00f6retagsnamn och f\u00e4rgpaletter",
          description: "Anv\u00e4nd Qvickos kostnadsfria verktyg f\u00f6r att generera f\u00f6retagsnamn och hitta den perfekta f\u00e4rgpaletten.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko erbjuder <strong>kostnadsfria verktyg</strong> som hj\u00e4lper dig med
                varumerkesbyggande och design, \u00e4ven innan du skapat en webbplats. Verktygen
                \u00e4r tillg\u00e4ngliga f\u00f6r alla \u2014 ingen inloggning kr\u00e4vs.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">F\u00f6retagsnamn-generator</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Beh\u00f6ver du hj\u00e4lp med att hitta ett kreativt namn f\u00f6r ditt f\u00f6retag? V\u00e5r
                AI-drivna namnsgenerator skapar unika f\u00f6rslag baserat p\u00e5 din bransch och
                \u00f6nskem\u00e5l.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="AI-driven"
                  desc="Avancerad AI genererar kreativa och relevanta f\u00f6retagsnamn."
                />
                <FeatureCard
                  icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Helt gratis"
                  desc="Anv\u00e4nd verktyget utan kostnad, utan begr\u00e4nsningar och utan konto."
                />
              </div>

              <Step n={1} title="G\u00e5 till verktyget">
                <p>
                  Bes\u00f6k <strong><a href="/sv/tools/business-name-generator" className="text-primary underline hover:text-primary-deep">/tools/business-name-generator</a></strong> i din webbl\u00e4sare.
                </p>
              </Step>
              <Step n={2} title="Beskriv ditt f\u00f6retag">
                <p>
                  Ange bransch eller beskrivning. AI:n genererar f\u00f6rslag som passar din nisch.
                </p>
              </Step>
              <Step n={3} title="V\u00e4lj och anv\u00e4nd">
                <p>
                  Bl\u00e4ddra bland f\u00f6rslagen och v\u00e4lj det namn som passar b\u00e4st f\u00f6r ditt varum\u00e4rke.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">F\u00e4rgpalett-generator</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Hittar du r\u00e4tt f\u00e4rger sv\u00e5rt? V\u00e5r f\u00e4rgpalett-generator hj\u00e4lper dig att
                hitta harmoniska f\u00e4rgkombinationer som passar din webbplats och ditt varum\u00e4rke.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                  title="Visuell v\u00e4ljare"
                  desc="Utforska f\u00e4rgpaletter visuellt och se hur de ser ut tillsammans."
                />
                <FeatureCard
                  icon="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                  title="Kopiera f\u00e4rgkoder"
                  desc="F\u00e5 HEX-koder redo att anv\u00e4nda direkt i din design."
                />
              </div>

              <Step n={1} title="G\u00e5 till verktyget">
                <p>
                  Bes\u00f6k <strong><a href="/sv/tools/color-palette-generator" className="text-primary underline hover:text-primary-deep">/tools/color-palette-generator</a></strong> i din webbl\u00e4sare.
                </p>
              </Step>
              <Step n={2} title="Utforska paletter">
                <p>
                  Beskriv stilen du \u00e4r ute efter s\u00e5 genererar verktyget f\u00e4rgpaletter som
                  matchar.
                </p>
              </Step>
              <Step n={3} title="Anv\u00e4nd i din webbplats">
                <p>
                  Kopiera f\u00e4rgkoderna och anv\u00e4nd dem n\u00e4r du bygger eller anpassar din
                  Qvicko-webbplats.
                </p>
              </Step>

              <InfoBox title="Varumerkesbyggande fr\u00e5n b\u00f6rjan">
                <p>
                  Ett starkt varum\u00e4rke b\u00f6rjar med ett bra namn och konsekventa f\u00e4rger. Anv\u00e4nd
                  b\u00e5da verktygen tillsammans f\u00f6r att skapa en solid grund f\u00f6r din
                  visuella identitet innan du bygger din webbplats.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Free tools \u2014 business names and color palettes",
          description: "Use Qvicko\u2019s free tools to generate business names and find the perfect color palette.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko offers <strong>free tools</strong> that help you with branding and design,
                even before you have created a website. The tools are available to everyone \u2014
                no login required.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Business Name Generator</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Need help finding a creative name for your business? Our AI-powered name
                generator creates unique suggestions based on your industry and preferences.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="AI-powered"
                  desc="Advanced AI generates creative and relevant business names."
                />
                <FeatureCard
                  icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  title="Completely free"
                  desc="Use the tool at no cost, with no limitations and no account required."
                />
              </div>

              <Step n={1} title="Go to the tool">
                <p>
                  Visit <strong><a href="/en/tools/business-name-generator" className="text-primary underline hover:text-primary-deep">/tools/business-name-generator</a></strong> in your browser.
                </p>
              </Step>
              <Step n={2} title="Describe your business">
                <p>
                  Enter your industry or a description. The AI generates suggestions that fit your niche.
                </p>
              </Step>
              <Step n={3} title="Pick and use">
                <p>
                  Browse the suggestions and choose the name that best fits your brand.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Color Palette Generator</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Struggling to find the right colors? Our color palette generator helps you
                discover harmonious color combinations that suit your website and brand.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                  title="Visual picker"
                  desc="Explore color palettes visually and see how they look together."
                />
                <FeatureCard
                  icon="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                  title="Copy color codes"
                  desc="Get HEX codes ready to use directly in your design."
                />
              </div>

              <Step n={1} title="Go to the tool">
                <p>
                  Visit <strong><a href="/en/tools/color-palette-generator" className="text-primary underline hover:text-primary-deep">/tools/color-palette-generator</a></strong> in your browser.
                </p>
              </Step>
              <Step n={2} title="Explore palettes">
                <p>
                  Describe the style you are looking for and the tool generates color palettes
                  that match.
                </p>
              </Step>
              <Step n={3} title="Use in your website">
                <p>
                  Copy the color codes and use them when building or customizing your
                  Qvicko website.
                </p>
              </Step>

              <InfoBox title="Brand building from the start">
                <p>
                  A strong brand starts with a great name and consistent colors. Use both
                  tools together to create a solid foundation for your visual identity
                  before you build your website.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. Google Search Console                                       */
    /* -------------------------------------------------------------- */
    {
      slug: "google-search-console",
      category: "seo-and-marketing",
      icon: "M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z",
      content: {
        sv: {
          title: "Google Search Console \u2014 indexera och \u00f6vervaka din webbplats",
          description: "Koppla din Qvicko-webbplats till Google Search Console f\u00f6r automatisk indexering och s\u00f6kanalys.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Google Search Console (GSC)</strong> \u00e4r Googles gratisverktyg f\u00f6r
                webbplats\u00e4gare. Genom att koppla din Qvicko-webbplats till GSC kan du se hur
                Google ser din sida, vilka s\u00f6kord som driver trafik och hur indexeringen g\u00e5r.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">F\u00f6rkrav</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                F\u00f6r att koppla GSC beh\u00f6ver du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>En <strong>verifierad egen dom\u00e4n</strong> kopplad till din Qvicko-webbplats</li>
                <li>Ett <strong>Google-konto</strong></li>
              </ul>

              <WarningBox title="Ingen dom\u00e4n \u00e4nnu?">
                <p>
                  Om du inte har kopplat en egen dom\u00e4n visas ett meddelande p\u00e5 SEO-sidan
                  med en l\u00e4nk till dom\u00e4ninst\u00e4llningarna. Du m\u00e5ste f\u00f6rst l\u00e4gga till och
                  verifiera en dom\u00e4n innan du kan koppla GSC.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">S\u00e5 kopplar du GSC</h2>
              <Step n={1} title="G\u00e5 till SEO-sidan">
                <p>
                  Navigera till <strong>Dashboard \u2192 din webbplats \u2192 SEO</strong>. H\u00e4r ser du
                  Google Search Console-sektionen med statusen &quot;Ej ansluten&quot;.
                </p>
              </Step>
              <Step n={2} title="Klicka Anslut">
                <p>
                  Klicka p\u00e5 <strong>Anslut med Google</strong>-knappen. Ett popup-f\u00f6nster \u00f6ppnas
                  d\u00e4r du loggar in med ditt Google-konto och godk\u00e4nner beh\u00f6righeterna
                  f\u00f6r Search Console.
                </p>
              </Step>
              <Step n={3} title="Qvicko g\u00f6r resten automatiskt">
                <p>
                  N\u00e4r du godk\u00e4nt h\u00e4nder f\u00f6ljande automatiskt:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Din dom\u00e4n l\u00e4ggs till som egendom (property) i Google Search Console</li>
                  <li>Din sitemap skickas in till Google</li>
                  <li>Indexering beg\u00e4rs f\u00f6r din webbplats</li>
                </ul>
              </Step>
              <Step n={4} title="Verifiering klar">
                <p>
                  Statusen \u00e4ndras till &quot;Ansluten&quot; och du ser ditt Google-konto,
                  dom\u00e4nnamn och tidpunkt f\u00f6r senaste indexeringen.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Beg\u00e4ra omindexering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du har gjort st\u00f6rre \u00e4ndringar p\u00e5 din webbplats och vill att Google ska
                plocka upp dem snabbare kan du klicka p\u00e5 <strong>Indexera om</strong>-knappen
                p\u00e5 SEO-sidan. Qvicko skickar d\u00e5 en ny beg\u00e4ran till Google.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Koppla fr\u00e5n GSC</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan n\u00e4r som helst koppla fr\u00e5n Google Search Console genom att klicka p\u00e5
                <strong> Koppla fr\u00e5n</strong>-knappen. Dina tokens raderas och Qvicko har
                inte l\u00e4ngre \u00e5tkomst till ditt Google-konto.
              </p>

              <InfoBox title="Vad visas p\u00e5 SEO-sidan?">
                <p>
                  N\u00e4r GSC \u00e4r anslutet ser du f\u00f6ljande information: ditt anslutna Google-konto
                  (e-postadress), den indexerade dom\u00e4nen och tidpunkten f\u00f6r senaste
                  indexeringen. F\u00f6r detaljerad s\u00f6kanalys (klick, visningar, position) loggar
                  du in direkt p\u00e5 <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-deep">search.google.com/search-console</a>.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Google Search Console \u2014 index and monitor your website",
          description: "Connect your Qvicko website to Google Search Console for automatic indexing and search analytics.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Google Search Console (GSC)</strong> is Google&apos;s free tool for website
                owners. By connecting your Qvicko website to GSC, you can see how Google views
                your site, which search terms drive traffic, and how indexing is progressing.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Prerequisites</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                To connect GSC you need:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>A <strong>verified custom domain</strong> connected to your Qvicko website</li>
                <li>A <strong>Google account</strong></li>
              </ul>

              <WarningBox title="No domain yet?">
                <p>
                  If you have not connected a custom domain, a message is shown on the SEO page
                  with a link to the domain settings. You must first add and verify a domain
                  before you can connect GSC.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to connect GSC</h2>
              <Step n={1} title="Go to the SEO page">
                <p>
                  Navigate to <strong>Dashboard \u2192 your website \u2192 SEO</strong>. Here you will
                  see the Google Search Console section with the status &quot;Not connected&quot;.
                </p>
              </Step>
              <Step n={2} title="Click Connect">
                <p>
                  Click the <strong>Connect with Google</strong> button. A popup window opens
                  where you log in with your Google account and approve the permissions for
                  Search Console.
                </p>
              </Step>
              <Step n={3} title="Qvicko does the rest automatically">
                <p>
                  Once you approve, the following happens automatically:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Your domain is added as a property in Google Search Console</li>
                  <li>Your sitemap is submitted to Google</li>
                  <li>Indexing is requested for your website</li>
                </ul>
              </Step>
              <Step n={4} title="Verification complete">
                <p>
                  The status changes to &quot;Connected&quot; and you will see your Google account,
                  domain name, and the time of the last indexing.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Request re-indexing</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you have made major changes to your website and want Google to pick them up
                faster, you can click the <strong>Re-index</strong> button on the SEO page.
                Qvicko will then send a new request to Google.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Disconnect GSC</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can disconnect Google Search Console at any time by clicking the
                <strong> Disconnect</strong> button. Your tokens are deleted and Qvicko will
                no longer have access to your Google account.
              </p>

              <InfoBox title="What is shown on the SEO page?">
                <p>
                  When GSC is connected, you will see the following information: your connected
                  Google account (email address), the indexed domain, and the time of the last
                  indexing. For detailed search analytics (clicks, impressions, position), log in
                  directly at <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-deep">search.google.com/search-console</a>.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },
  ],
};
