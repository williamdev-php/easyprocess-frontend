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
/*  CATEGORY: Website Editor                                          */
/* ================================================================== */

export const websiteEditorCategory: HelpCategory = {
  slug: "website-editor",
  icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
  label: {
    sv: {
      title: "Webbredigeraren",
      description: "Lar dig anvanda Qvickos webbredigerare for att bygga, redigera och publicera din webbplats",
    },
    en: {
      title: "Website Editor",
      description: "Learn how to use Qvicko's website editor to build, edit, and publish your website",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Overview                                                    */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "website-editor",
      icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      content: {
        sv: {
          title: "Oversikt over webbredigeraren",
          description: "En introduktion till Qvickos webbredigerare, dess uppbyggnad och de viktigaste funktionerna du har tillgang till.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                <strong>Webbredigeraren</strong> ar hjartat i Qvicko-plattformen. Har bygger du din
                webbplats visuellt genom att lagga till sektioner, redigera innehall och anpassa
                design &mdash; utan att behova skriva en enda rad kod.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur oppnar jag redigeraren?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Redigeraren nas fran din dashboard under <strong>Sidor</strong>. Klicka pa en
                befintlig sida och valj <strong>Editor</strong>, eller navigera direkt till
                <Code>/dashboard/pages/[siteId]</Code>. Redigeraren oppnas i en helskarmslayout
                med ett mork sidopanel till vanster och en live-forhandsvisning av din webbplats
                till hoger.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Redigerarens uppbyggnad</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  title="Sidopanel"
                  desc="Vanster sida &mdash; har valjer du sektioner, redigerar innehall och andrar installningar."
                />
                <FeatureCard
                  icon="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  title="Live-forhandsvisning"
                  desc="Hoger sida &mdash; ser din webbplats exakt som besokare ser den, uppdateras i realtid."
                />
                <FeatureCard
                  icon="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  title="Designverktyg"
                  desc="Tema, farger, typsnitt, navbar-stil och footer-stil &mdash; allt konfigurerbart."
                />
                <FeatureCard
                  icon="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  title="Utkast och publicering"
                  desc="Andringar sparas automatiskt som utkast. Publicera nar du ar nojd."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tillgangliga sektionstyper</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Redigeraren stodjer ett brett utbud av sektionstyper som du kan lagga till pa dina sidor:
              </p>
              <ul className="mt-4 space-y-2 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  <span><strong>Hero</strong> &mdash; Huvudsektionen med rubrik, underrubrik, CTA-knapp och bakgrundsbild.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  <span><strong>Om oss, Team, Tjanster, Process</strong> &mdash; Presentera ditt foretag, teammedlemmar, tjanster och arbetsprocess.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Galleri, Video, Logotyper</strong> &mdash; Visa bilder, video och partnerlogotyper.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  <span><strong>FAQ, Omdomen, Priser</strong> &mdash; Vanliga fragor, kundrecensioner och prissattning.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>CTA, Kontakt, Banner, Eget innehall</strong> &mdash; Call-to-action, kontaktformular, banners och fritext-block.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  <span><strong>Topplista, Quiz, Sidinnehall</strong> &mdash; Rankings, interaktiva quiz och fria sidor med rich text.</span>
                </li>
              </ul>

              <InfoBox title="Automatiskt utkast">
                <p>
                  Alla andringar du gor i redigeraren sparas automatiskt som utkast. Du kan
                  stanga webblasaren och komma tillbaka senare &mdash; ditt arbete ar sparat. Klicka
                  <strong> Publicera</strong> for att gora andringarna synliga for besokare, eller
                  <strong> Kasta utkast</strong> for att aterstalla till senaste publicerade versionen.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Website editor overview",
          description: "An introduction to Qvicko's website editor, its layout, and the key features available to you.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                The <strong>Website Editor</strong> is the heart of the Qvicko platform. Here you
                build your website visually by adding sections, editing content, and customizing
                design &mdash; without writing a single line of code.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How do I open the editor?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The editor is accessed from your dashboard under <strong>Pages</strong>. Click on
                an existing page and choose <strong>Editor</strong>, or navigate directly to
                <Code>/dashboard/pages/[siteId]</Code>. The editor opens in a full-screen layout
                with a dark side panel on the left and a live preview of your website on the right.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Editor layout</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  title="Side panel"
                  desc="Left side &mdash; select sections, edit content, and change settings here."
                />
                <FeatureCard
                  icon="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                  title="Live preview"
                  desc="Right side &mdash; see your website exactly as visitors will, updated in real time."
                />
                <FeatureCard
                  icon="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  title="Design tools"
                  desc="Theme, colors, fonts, navbar style, and footer style &mdash; all configurable."
                />
                <FeatureCard
                  icon="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  title="Drafts and publishing"
                  desc="Changes are auto-saved as drafts. Publish when you are satisfied."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Available section types</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The editor supports a wide range of section types that you can add to your pages:
              </p>
              <ul className="mt-4 space-y-2 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  <span><strong>Hero</strong> &mdash; Main section with headline, subtitle, CTA button, and background image.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  <span><strong>About, Team, Services, Process</strong> &mdash; Present your company, team members, services, and workflow.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Gallery, Video, Logo Cloud</strong> &mdash; Showcase images, videos, and partner logos.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  <span><strong>FAQ, Testimonials, Pricing</strong> &mdash; Frequently asked questions, customer reviews, and pricing tiers.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>CTA, Contact, Banner, Custom Content</strong> &mdash; Call-to-action, contact forms, banners, and freeform blocks.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  <span><strong>Ranking, Quiz, Page Content</strong> &mdash; Leaderboards, interactive quizzes, and free-form rich text pages.</span>
                </li>
              </ul>

              <InfoBox title="Automatic drafts">
                <p>
                  All changes you make in the editor are automatically saved as a draft. You can
                  close the browser and come back later &mdash; your work is saved. Click
                  <strong> Publish</strong> to make the changes visible to visitors, or
                  <strong> Discard draft</strong> to restore the last published version.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Pages                                                       */
    /* -------------------------------------------------------------- */
    {
      slug: "pages",
      category: "website-editor",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      content: {
        sv: {
          title: "Skapa och hantera sidor",
          description: "Lar dig hur du skapar nya sidor, organiserar dem med under-sidor och hanterar sidinstallningar som slug, SEO och navigering.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Varje webbplats pa Qvicko bestar av <strong>sidor</strong>. En sida har en URL
                (slug), en titel, SEO-metadata och en eller flera <strong>sektioner</strong> som
                utgot sidans innehall. Du hanterar alla sidor fran <strong>Dashboard &rarr; din
                webbplats &rarr; Sidor</strong>.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Skapa en ny sida</h2>
              <Step n={1} title="Ga till Sidor">
                <p>
                  I din dashboard, navigera till din webbplats och klicka pa <strong>Sidor</strong> i
                  sidofaltet. Har ser du en lista over alla befintliga sidor.
                </p>
              </Step>
              <Step n={2} title="Klicka Skapa sida">
                <p>
                  Klicka pa knappen <strong>Skapa sida</strong> hogst upp till hoger. En dialog oppnas
                  dar du fyller i sidans uppgifter.
                </p>
              </Step>
              <Step n={3} title="Fyll i uppgifter">
                <p>
                  Ange sidans <strong>namn</strong> (t.ex. &quot;Vara tjanster&quot;). En
                  URL-vanlig <strong>slug</strong> genereras automatiskt (t.ex. <Code>vara-tjanster</Code>),
                  men du kan andra den manuellt. Valj om sidan ska vara en <strong>undersida</strong> till
                  en befintlig sida och om den ska <strong>visas i navigeringen</strong>.
                </p>
              </Step>
              <Step n={4} title="Borja redigera">
                <p>
                  Sidan skapas med en standardsektion (<Code>page_content</Code>). Klicka pa sidan
                  i listan for att oppna dess installningar, eller klicka <strong>Editor</strong> for
                  att borja lagga till innehall och sektioner.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sidinstallningar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nar du klickar pa en sida i listan oppnas en detaljvy dar du kan andra:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  <span><strong>Namn och slug</strong> &mdash; Sidans titel och URL-stig.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                  <span><strong>SEO</strong> &mdash; Meta-titel (max 60 tecken), meta-beskrivning (max 160 tecken) och OG-bild for delning pa sociala medier. En sokmotorforhandsvisning visas sa att du ser hur sidan framstar i Google.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  <span><strong>Navigering</strong> &mdash; Valj om sidan ska synas i webbplatsens meny och i vilken ordning.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  <span><strong>Overordnad sida</strong> &mdash; Gor sidan till en undersida under en annan sida for hierarkisk URL-struktur (t.ex. <Code>/tjanster/webdesign</Code>).</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Undersidor</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan organisera dina sidor hierarkiskt genom att valja en <strong>overordnad
                sida</strong>. Undersidor visas indenterade i sidolistan och far en URL under sin
                foraldersida. Till exempel: om du har en sida <Code>/tjanster</Code> och skapar
                en undersida <Code>webdesign</Code> med <Code>tjanster</Code> som overordnad, blir
                URL:en <Code>/tjanster/webdesign</Code>.
              </p>

              <InfoBox title="Sektioner bestammer innehallet">
                <p>
                  En sidas faktiska innehall bestams av dess <strong>sektioner</strong>. Nar du
                  skapar en ny sida far den automatiskt en tom <Code>page_content</Code>-sektion.
                  Oppna editorn for att lagga till fler sektioner som Hero, Galleri, FAQ med mera.
                </p>
              </InfoBox>

              <WarningBox title="Radering ar permanent">
                <p>
                  Nar du raderar en sida forsvinner den och alla dess sektioner permanent. Det gar
                  inte att angra. Kontrollera att sidan inte langre behovs innan du raderar den.
                </p>
              </WarningBox>
            </>
          ),
        },
        en: {
          title: "Creating and managing pages",
          description: "Learn how to create new pages, organize them with sub-pages, and manage page settings like slug, SEO, and navigation.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Every website on Qvicko consists of <strong>pages</strong>. A page has a URL
                (slug), a title, SEO metadata, and one or more <strong>sections</strong> that
                make up the page&apos;s content. You manage all pages from <strong>Dashboard &rarr;
                your website &rarr; Pages</strong>.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Creating a new page</h2>
              <Step n={1} title="Go to Pages">
                <p>
                  In your dashboard, navigate to your website and click <strong>Pages</strong> in
                  the sidebar. Here you will see a list of all existing pages.
                </p>
              </Step>
              <Step n={2} title="Click Create Page">
                <p>
                  Click the <strong>Create Page</strong> button in the top right corner. A dialog
                  opens where you fill in the page details.
                </p>
              </Step>
              <Step n={3} title="Fill in details">
                <p>
                  Enter the page <strong>name</strong> (e.g. &quot;Our Services&quot;). A
                  URL-friendly <strong>slug</strong> is generated automatically (e.g. <Code>our-services</Code>),
                  but you can edit it manually. Choose whether the page should be a <strong>sub-page</strong> of
                  an existing page and whether it should <strong>appear in the navigation</strong>.
                </p>
              </Step>
              <Step n={4} title="Start editing">
                <p>
                  The page is created with a default section (<Code>page_content</Code>). Click on
                  the page in the list to open its settings, or click <strong>Editor</strong> to
                  start adding content and sections.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Page settings</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you click on a page in the list, a detail view opens where you can change:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  <span><strong>Name and slug</strong> &mdash; The page title and URL path.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                  <span><strong>SEO</strong> &mdash; Meta title (max 60 characters), meta description (max 160 characters), and OG image for social media sharing. A search engine preview is shown so you can see how the page appears in Google.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  <span><strong>Navigation</strong> &mdash; Choose whether the page should appear in the site menu and in which order.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  <span><strong>Parent page</strong> &mdash; Make the page a sub-page under another page for hierarchical URL structure (e.g. <Code>/services/web-design</Code>).</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sub-pages</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can organize your pages hierarchically by choosing a <strong>parent
                page</strong>. Sub-pages are shown indented in the page list and get a URL under
                their parent page. For example: if you have a page <Code>/services</Code> and
                create a sub-page <Code>web-design</Code> with <Code>services</Code> as parent,
                the URL becomes <Code>/services/web-design</Code>.
              </p>

              <InfoBox title="Sections determine the content">
                <p>
                  A page&apos;s actual content is determined by its <strong>sections</strong>. When
                  you create a new page, it automatically gets an empty <Code>page_content</Code> section.
                  Open the editor to add more sections like Hero, Gallery, FAQ, and more.
                </p>
              </InfoBox>

              <WarningBox title="Deletion is permanent">
                <p>
                  When you delete a page, it and all its sections are permanently removed. This
                  cannot be undone. Make sure the page is no longer needed before deleting it.
                </p>
              </WarningBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Templates                                                   */
    /* -------------------------------------------------------------- */
    {
      slug: "templates",
      category: "website-editor",
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
      content: {
        sv: {
          title: "Anvanda och anpassa mallar",
          description: "Forsta hur Qvickos teman och designstilar fungerar, och hur du anpassar utseendet pa din webbplats med farger, typsnitt och layout.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Nar du skapar en ny webbplats pa Qvicko kan du valja mellan att <strong>skapa
                fran grunden</strong> eller <strong>transformera en befintlig webbplats</strong>.
                Oavsett vilken vag du valjer bygger designen pa ett flexibelt <strong>temasystem</strong> med
                fyra teman och fyra designstilar som du kan kombinera fritt.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Teman</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko erbjuder fyra grundteman som bestammer den generella kanslan pa din webbplats:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="Modern"
                  desc="Ren och tidsenlig design med fokus pa tydlighet."
                />
                <FeatureCard
                  icon="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  title="Bold"
                  desc="Djarvare design med starkare kontraster och tydligare visuella element."
                />
                <FeatureCard
                  icon="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  title="Elegant"
                  desc="Sofistikerad och forfynad med subtila detaljer."
                />
                <FeatureCard
                  icon="M3.75 9h16.5m-16.5 6.75h16.5"
                  title="Minimal"
                  desc="Minimalistisk design med fokus pa innehallet."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Designstilar (Style Variants)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Utover tema kan du valja en <strong>designstil</strong> som paverkar hur sektionernas
                kort, knappar och layout renderas:
              </p>
              <ul className="mt-4 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Original</strong> &mdash; Standardutseendet for det valda temat.</li>
                <li><strong>Modern Cards</strong> &mdash; Kortbaserad layout med skuggor och rundade horn.</li>
                <li><strong>Clean &amp; Minimal</strong> &mdash; Ren layout med extra luft och subtila linjer.</li>
                <li><strong>Bold &amp; Filled</strong> &mdash; Fylliga fargblock och tydligare avgransning.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Anpassa farger och typsnitt</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                I redigerarens <strong>Branding</strong>-sektion kan du anpassa:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                  <span><strong>Farger</strong> &mdash; Primar, sekundar, accent, bakgrund och textfarg. Anvand fargvaljarna for att matcha din varumarkesprofil.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  <span><strong>Typsnitt</strong> &mdash; Valj separata typsnitt for rubriker och brodtext fran ett brett utbud av Google Fonts.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Logotyp</strong> &mdash; Ladda upp din logotyp via mediahanteraren. Den visas i navbar och footer.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navbar- och footer-stil</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan aven valja separat stil for navbar och footer:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <p className="font-semibold text-primary-deep">Navbar-stilar</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-muted">
                    <li>Standard (fran designstil)</li>
                    <li>Flytande (pill)</li>
                    <li>Sticky (fast)</li>
                    <li>Minimal</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <p className="font-semibold text-primary-deep">Footer-stilar</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-muted">
                    <li>Standard (fran designstil)</li>
                    <li>Kolumner</li>
                    <li>Centrerad</li>
                    <li>Minimal</li>
                  </ul>
                </div>
              </div>

              <InfoBox title="Anpassningar galler hela webbplatsen">
                <p>
                  Tema, designstil, farger och typsnitt galler for hela webbplatsen &mdash; alla sidor
                  och sektioner anvander samma branding. Detta ger ett enhetligt utseende.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Using and customizing templates",
          description: "Understand how Qvicko's themes and design styles work, and how to customize the look of your website with colors, fonts, and layout.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                When you create a new website on Qvicko you can choose between <strong>creating
                from scratch</strong> or <strong>transforming an existing website</strong>.
                Regardless of which path you choose, the design is built on a flexible
                <strong> theme system</strong> with four themes and four design styles that you
                can combine freely.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Themes</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Qvicko offers four base themes that determine the overall feel of your website:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  title="Modern"
                  desc="Clean and contemporary design with focus on clarity."
                />
                <FeatureCard
                  icon="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  title="Bold"
                  desc="Bolder design with stronger contrasts and more prominent visual elements."
                />
                <FeatureCard
                  icon="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  title="Elegant"
                  desc="Sophisticated and refined with subtle details."
                />
                <FeatureCard
                  icon="M3.75 9h16.5m-16.5 6.75h16.5"
                  title="Minimal"
                  desc="Minimalist design with focus on the content."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Design styles (Style Variants)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                In addition to the theme, you can choose a <strong>design style</strong> that
                affects how section cards, buttons, and layout are rendered:
              </p>
              <ul className="mt-4 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Original</strong> &mdash; Default appearance for the selected theme.</li>
                <li><strong>Modern Cards</strong> &mdash; Card-based layout with shadows and rounded corners.</li>
                <li><strong>Clean &amp; Minimal</strong> &mdash; Clean layout with extra whitespace and subtle lines.</li>
                <li><strong>Bold &amp; Filled</strong> &mdash; Solid color blocks and stronger separation.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Customizing colors and fonts</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                In the editor&apos;s <strong>Branding</strong> section you can customize:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                  <span><strong>Colors</strong> &mdash; Primary, secondary, accent, background, and text color. Use the color pickers to match your brand identity.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  <span><strong>Fonts</strong> &mdash; Choose separate fonts for headings and body text from a wide selection of Google Fonts.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Logo</strong> &mdash; Upload your logo via the media manager. It is displayed in the navbar and footer.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Navbar and footer styles</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can also choose separate styles for the navbar and footer:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <p className="font-semibold text-primary-deep">Navbar styles</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-muted">
                    <li>Standard (from design style)</li>
                    <li>Floating (pill)</li>
                    <li>Sticky (fixed)</li>
                    <li>Minimal</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border-theme bg-surface p-5">
                  <p className="font-semibold text-primary-deep">Footer styles</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-muted">
                    <li>Standard (from design style)</li>
                    <li>Columns</li>
                    <li>Centered</li>
                    <li>Minimal</li>
                  </ul>
                </div>
              </div>

              <InfoBox title="Customizations apply site-wide">
                <p>
                  Theme, design style, colors, and fonts apply to the entire website &mdash; all pages
                  and sections use the same branding. This ensures a consistent look and feel.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Sections and Blocks                                         */
    /* -------------------------------------------------------------- */
    {
      slug: "sections-and-blocks",
      category: "website-editor",
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z",
      content: {
        sv: {
          title: "Arbeta med sektioner och innehallsblock",
          description: "Forsta hur sektioner bygger upp dina sidor, hur du lagger till, tar bort och ordnar sektioner, samt hur du redigerar innehall i varje sektion.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                En sida i Qvicko bestar av <strong>sektioner</strong> &mdash; byggstenar som
                staplas vertikalt for att skapa sidans innehall. Varje sektion har en <strong>typ</strong> (t.ex.
                Hero, Om oss, FAQ) och <strong>data</strong> som du redigerar i sidopanelen.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tillgangliga sektionstyper</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Har ar alla sektionstyper du kan valja mellan:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { name: "Hero", desc: "Huvudrubrik med bild" },
                  { name: "Om oss", desc: "Foretagspresentation" },
                  { name: "Egenskaper", desc: "Funktionslista" },
                  { name: "Statistik", desc: "Siffror och fakta" },
                  { name: "Tjanster", desc: "Tjanstelista" },
                  { name: "Process", desc: "Steg-for-steg" },
                  { name: "Galleri", desc: "Bildgalleri" },
                  { name: "Team", desc: "Teammedlemmar" },
                  { name: "Omdomen", desc: "Kundrecensioner" },
                  { name: "FAQ", desc: "Vanliga fragor" },
                  { name: "CTA", desc: "Call-to-action" },
                  { name: "Kontakt", desc: "Kontaktformular" },
                  { name: "Priser", desc: "Pristabell" },
                  { name: "Video", desc: "Video-embed" },
                  { name: "Logotyper", desc: "Partnerloggor" },
                  { name: "Eget innehall", desc: "Fritext-block" },
                  { name: "Banner", desc: "Meddelandeband" },
                  { name: "Topplista", desc: "Ranking-lista" },
                  { name: "Quiz", desc: "Interaktivt quiz" },
                  { name: "Sidinnehall", desc: "Rich text-sida" },
                ].map((s) => (
                  <div key={s.name} className="rounded-lg border border-border-theme bg-surface px-3 py-2">
                    <p className="text-sm font-semibold text-primary-deep">{s.name}</p>
                    <p className="text-xs text-text-muted">{s.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Lagga till en sektion</h2>
              <Step n={1} title="Oppna redigeraren">
                <p>Ga till din sida och klicka <strong>Editor</strong> for att oppna webbredigeraren.</p>
              </Step>
              <Step n={2} title="Valj sektionstyp">
                <p>
                  I sidopanelen ser du en lista over sektioner. Varje sektion har en kryssruta
                  &mdash; bocka i den for att aktivera sektionen pa sidan. Sektioner som inte ar
                  ibockade visas inte for besokare.
                </p>
              </Step>
              <Step n={3} title="Redigera innehall">
                <p>
                  Klicka pa sektionens rubrik for att falla ut dess redigeringspanel. Har kan du
                  redigera text, ladda upp bilder, lagga till listobjekt (tjanster, FAQ-fragor,
                  teammedlemmar etc.) och konfigurera instavllningar.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ordna sektioner</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Sektionerna visas pa sidan i den ordning de ar definierade i <Code>section_order</Code>.
                Du kan andra ordningen genom att dra och slappa sektioner i sidopanelen, eller
                genom att redigera sektionsordningen direkt.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Duplicera sektioner</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Behover du tva instanser av samma sektionstyp (t.ex. tva CTA-sektioner pa olika
                stallen)? Du kan <strong>duplicera en sektion</strong>. Kopian far en unik nyckel
                (t.ex. <Code>cta__dup_1700000000</Code>) och lagras i <Code>extra_sections</Code>.
                Den har sitt eget innehall som du redigerar separat.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Listobjekt i sektioner</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Manga sektioner innehaller <strong>listobjekt</strong> &mdash; t.ex. tjanster i
                Tjanster-sektionen, fragor i FAQ, eller teammedlemmar i Team. For varje lista kan du:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Lagga till nya objekt med knappen &quot;Lagg till&quot;</li>
                <li>Redigera varje objekts innehall genom att klicka pa det</li>
                <li>Flytta objekt upp och ner med pilknapparna</li>
                <li>Ta bort objekt med X-knappen</li>
              </ul>

              <InfoBox title="Sektioner pa sidor vs. huvudsidan">
                <p>
                  Huvudsidan anvander toppniva-sektioner direkt i siteData (hero, about, services
                  etc.). Undersidor anvander <Code>sections</Code>-arrayen dar varje sektion har en
                  typ och data. Redigeraren hanterar bada fallen somlost.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Working with sections and content blocks",
          description: "Understand how sections build up your pages, how to add, remove, and reorder sections, and how to edit content in each section.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                A page in Qvicko consists of <strong>sections</strong> &mdash; building blocks
                stacked vertically to create the page content. Each section has a <strong>type</strong> (e.g.
                Hero, About, FAQ) and <strong>data</strong> that you edit in the side panel.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Available section types</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Here are all the section types you can choose from:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { name: "Hero", desc: "Main headline with image" },
                  { name: "About", desc: "Company presentation" },
                  { name: "Features", desc: "Feature list" },
                  { name: "Stats", desc: "Numbers and facts" },
                  { name: "Services", desc: "Service listing" },
                  { name: "Process", desc: "Step-by-step" },
                  { name: "Gallery", desc: "Image gallery" },
                  { name: "Team", desc: "Team members" },
                  { name: "Testimonials", desc: "Customer reviews" },
                  { name: "FAQ", desc: "Frequently asked questions" },
                  { name: "CTA", desc: "Call-to-action" },
                  { name: "Contact", desc: "Contact form" },
                  { name: "Pricing", desc: "Pricing table" },
                  { name: "Video", desc: "Video embed" },
                  { name: "Logo Cloud", desc: "Partner logos" },
                  { name: "Custom Content", desc: "Freeform blocks" },
                  { name: "Banner", desc: "Message bar" },
                  { name: "Ranking", desc: "Leaderboard list" },
                  { name: "Quiz", desc: "Interactive quiz" },
                  { name: "Page Content", desc: "Rich text page" },
                ].map((s) => (
                  <div key={s.name} className="rounded-lg border border-border-theme bg-surface px-3 py-2">
                    <p className="text-sm font-semibold text-primary-deep">{s.name}</p>
                    <p className="text-xs text-text-muted">{s.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Adding a section</h2>
              <Step n={1} title="Open the editor">
                <p>Go to your page and click <strong>Editor</strong> to open the website editor.</p>
              </Step>
              <Step n={2} title="Choose section type">
                <p>
                  In the side panel you will see a list of sections. Each section has a checkbox
                  &mdash; check it to enable the section on the page. Sections that are not checked
                  are not visible to visitors.
                </p>
              </Step>
              <Step n={3} title="Edit content">
                <p>
                  Click on the section heading to expand its editing panel. Here you can edit text,
                  upload images, add list items (services, FAQ questions, team members, etc.), and
                  configure settings.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Reordering sections</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Sections are displayed on the page in the order defined in <Code>section_order</Code>.
                You can change the order by dragging and dropping sections in the side panel, or
                by editing the section order directly.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Duplicating sections</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Need two instances of the same section type (e.g. two CTA sections in different
                places)? You can <strong>duplicate a section</strong>. The copy gets a unique key
                (e.g. <Code>cta__dup_1700000000</Code>) and is stored in <Code>extra_sections</Code>.
                It has its own content that you edit separately.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">List items in sections</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Many sections contain <strong>list items</strong> &mdash; e.g. services in the
                Services section, questions in FAQ, or team members in Team. For each list you can:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li>Add new items with the &quot;Add&quot; button</li>
                <li>Edit each item&apos;s content by clicking on it</li>
                <li>Move items up and down with the arrow buttons</li>
                <li>Remove items with the X button</li>
              </ul>

              <InfoBox title="Sections on pages vs. main site">
                <p>
                  The main page uses top-level sections directly in siteData (hero, about, services,
                  etc.). Sub-pages use the <Code>sections</Code> array where each section has a
                  type and data. The editor handles both cases seamlessly.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. Media and Images                                            */
    /* -------------------------------------------------------------- */
    {
      slug: "media-and-images",
      category: "website-editor",
      icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z",
      content: {
        sv: {
          title: "Ladda upp och hantera media och bilder",
          description: "Lar dig hur mediahanteraren fungerar, hur du laddar upp bilder, organiserar dem i mappar och anvander dem i din webbplats.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko har en inbyggd <strong>mediahanterare</strong> som gor det enkelt att
                ladda upp, organisera och anvanda bilder och filer pa din webbplats. Du kan
                komma at mediahanteraren bade fran redigeraren och fran dedikerade
                mediafalj i sektionsredigerare.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ladda upp filer</h2>
              <Step n={1} title="Oppna mediahanteraren">
                <p>
                  Mediahanteraren oppnas automatiskt nar du klickar pa ett bildfalt i redigeraren
                  (t.ex. Hero-bakgrundsbild, Galleri-bilder eller Logotyp). Du kan aven oppna den
                  fran <strong>mediavaljaren</strong> i vilken sektion som helst.
                </p>
              </Step>
              <Step n={2} title="Dra och slapp eller valj fil">
                <p>
                  Du kan antingen <strong>dra och slappa</strong> filer direkt i uppladdningszonen,
                  eller klicka for att oppna filvaljen och valja filer fran din dator.
                </p>
              </Step>
              <Step n={3} title="Valj bild">
                <p>
                  Nar bilden ar uppladdad visas den i medialistan. Klicka pa den for att valja
                  den &mdash; bildens URL fylls automatiskt i det falt du klickade fran.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Organisera med mappar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan skapa <strong>mappar</strong> for att organisera dina mediafiler. Varje
                sektion har en standardmapp (t.ex. <Code>hero</Code>, <Code>gallery</Code>,
                <Code> branding</Code>) men du kan aven skapa egna mappar for att halla ordning.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Var anvands bilder?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Bilder anvands pa manga stallen i din webbplats:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  <span><strong>Hero-bakgrundsbild</strong> &mdash; Stor bakgrundsbild i huvudsektionen.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Galleri</strong> &mdash; Bildsamling med alt-text och bildtexter.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  <span><strong>Team-foton</strong> &mdash; Profilbilder for teammedlemmar.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  <span><strong>Logotyp</strong> &mdash; Foretagets logotyp i navbar och footer.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                  <span><strong>OG-bild</strong> &mdash; Bild som visas vid delning pa sociala medier.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>Om oss-bild</strong> &mdash; Illustrationsbild i Om oss-sektionen.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ta bort filer</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan radera filer fran mediahanteraren. Klicka pa en fil for att valja den och
                anvand raderingsknappen. Observera att om bilden anvands pa din webbplats kommer
                den att visa en trasig bild tills du byter ut den.
              </p>

              <InfoBox title="Filformat och storlek">
                <p>
                  Mediahanteraren stodjer vanliga bildformat som JPG, PNG, GIF, SVG och WebP.
                  Filer laddas upp till Qvickos CDN for snabb leverans. Bildens filstorlek visas
                  i medialistan sa att du kan halla koll pa sidans laddningstid.
                </p>
              </InfoBox>

              <WarningBox title="Radering ar permanent">
                <p>
                  Nar du raderar en fil fran mediahanteraren forsvinner den permanent fran CDN:en.
                  Det gar inte att aterstalla en raderad fil. Se till att filen inte anvands nagonstan
                  pa din webbplats innan du raderar den.
                </p>
              </WarningBox>
            </>
          ),
        },
        en: {
          title: "Uploading and managing media and images",
          description: "Learn how the media manager works, how to upload images, organize them in folders, and use them on your website.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko has a built-in <strong>media manager</strong> that makes it easy to upload,
                organize, and use images and files on your website. You can access the media manager
                both from the editor and from dedicated media fields in section editors.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Uploading files</h2>
              <Step n={1} title="Open the media manager">
                <p>
                  The media manager opens automatically when you click on an image field in the
                  editor (e.g. Hero background image, Gallery images, or Logo). You can also open
                  it from the <strong>media picker</strong> in any section.
                </p>
              </Step>
              <Step n={2} title="Drag and drop or choose file">
                <p>
                  You can either <strong>drag and drop</strong> files directly into the upload zone,
                  or click to open the file picker and choose files from your computer.
                </p>
              </Step>
              <Step n={3} title="Select image">
                <p>
                  Once the image is uploaded it appears in the media list. Click on it to select
                  it &mdash; the image URL is automatically filled into the field you clicked from.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Organizing with folders</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can create <strong>folders</strong> to organize your media files. Each section
                has a default folder (e.g. <Code>hero</Code>, <Code>gallery</Code>,
                <Code> branding</Code>) but you can also create custom folders to keep things tidy.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Where are images used?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Images are used in many places on your website:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  <span><strong>Hero background image</strong> &mdash; Large background image in the main section.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  <span><strong>Gallery</strong> &mdash; Image collection with alt text and captions.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  <span><strong>Team photos</strong> &mdash; Profile photos for team members.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  <span><strong>Logo</strong> &mdash; Company logo in the navbar and footer.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                  <span><strong>OG image</strong> &mdash; Image displayed when sharing on social media.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  <span><strong>About image</strong> &mdash; Illustration image in the About section.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Deleting files</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can delete files from the media manager. Click on a file to select it and use
                the delete button. Note that if the image is used on your website, it will show a
                broken image until you replace it.
              </p>

              <InfoBox title="File formats and sizes">
                <p>
                  The media manager supports common image formats like JPG, PNG, GIF, SVG, and WebP.
                  Files are uploaded to Qvicko&apos;s CDN for fast delivery. The file size is shown
                  in the media list so you can keep an eye on page load time.
                </p>
              </InfoBox>

              <WarningBox title="Deletion is permanent">
                <p>
                  When you delete a file from the media manager, it is permanently removed from the
                  CDN. A deleted file cannot be restored. Make sure the file is not used anywhere on
                  your website before deleting it.
                </p>
              </WarningBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  6. Navigation Menus                                            */
    /* -------------------------------------------------------------- */
    {
      slug: "navigation-menus",
      category: "website-editor",
      icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
      content: {
        sv: {
          title: "Konfigurera webbplatsens navigering",
          description: "Lar dig hur du staller in header- och footer-navigeringen, valjer mellan automatisk och anpassad meny, och ordnar lankar.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko har ett flexibelt <strong>navigeringssystem</strong> for bade header och
                footer. Som standard genereras navigeringen automatiskt baserat pa dina aktiva
                sektioner och sidor, men du kan nar som helst <strong>anpassa</strong> den med
                egna lankar och ordning.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Automatisk navigering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nar du skapar en ny webbplats genereras navigeringen <strong>automatiskt</strong>.
                Menyn innehaller lankar till alla aktiva sektioner och sidor pa din webbplats.
                Vilka lankar som visas beror pa vilka sektioner du har aktiverat:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Hem</strong> &mdash; Alltid med</li>
                <li><strong>Om oss</strong> &mdash; Visas om du har en Om oss-sektion</li>
                <li><strong>Tjanster</strong> &mdash; Visas om du har tjanster tillagda</li>
                <li><strong>Galleri</strong> &mdash; Visas om du har galleri-bilder</li>
                <li><strong>FAQ</strong> &mdash; Visas om du har FAQ-fragor</li>
                <li><strong>Kontakt</strong> &mdash; Visas om du har kontaktuppgifter eller kontaktformular</li>
                <li><strong>Priser</strong> &mdash; Visas om du har en prissattningssektion</li>
                <li><strong>Team</strong> &mdash; Visas om du har teammedlemmar</li>
                <li><strong>Blogg</strong> &mdash; Alltid tillganglig</li>
              </ul>

              <InfoBox title="Automatisk navigering ar smart">
                <p>
                  Den automatiska navigeringen uppdateras nar du laggar till eller tar bort sektioner.
                  Du behover inte manuellt uppdatera menyn varje gang du andrar innehall.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Anpassa navigeringen</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du vill ha full kontroll over menyn kan du <strong>anpassa</strong> den:
              </p>
              <Step n={1} title="Ga till Navigering">
                <p>
                  I din dashboard, navigera till din webbplats och klicka pa <strong>Navigering</strong> i
                  sidofaltet.
                </p>
              </Step>
              <Step n={2} title="Klicka Anpassa meny">
                <p>
                  Under header- eller footer-sektionen klickar du pa <strong>Anpassa meny</strong>.
                  Den automatiska menyn konverteras till en redigerbar lista.
                </p>
              </Step>
              <Step n={3} title="Lagg till, ta bort och ordna lankar">
                <p>
                  For varje lank anger du en <strong>etikett</strong> (texten som visas) och valjer
                  vilken <strong>sida</strong> den ska lanka till. Du kan valja fran dina befintliga
                  sidor eller ange en <strong>anpassad URL</strong>. Anvand pilknapparna for att
                  andra ordning och papperskorgen for att ta bort lankar.
                </p>
              </Step>
              <Step n={4} title="Publicera">
                <p>
                  Andringar sparas automatiskt som utkast. Klicka <strong>Publicera</strong> nar du
                  ar nojd for att gora andringarna synliga pa din webbplats.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Header- och footer-navigering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan anpassa header och footer <strong>separat</strong>. Det ar vanligt att
                ha en kort header-meny med de viktigaste sidorna, och en mer detaljerad
                footer-meny med ytterligare lankar.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  title="Header"
                  desc="Huvudmenyn langst upp pa sidan. Visas pa alla sidor."
                />
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                  title="Footer"
                  desc="Sidfoten langst ner. Kan innehalla fler lankar, juridiska sidor etc."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Aterstalla till automatisk</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du har anpassat menyn men vill ga tillbaka till den automatiska versionen,
                klicka pa <strong>Aterstall till automatisk</strong> ovanfor header- eller
                footer-sektionen. Dina anpassade lankar tas bort och navigeringen genereras
                fran dina aktiva sektioner igen.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sidspecifik navigering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Varje sida du skapar har en installning <strong>Visa i navigering</strong>. Om du
                slar pa denna visas sidan automatiskt i den automatiska navigeringen (om du
                anvander den). Du kan aven ange en <strong>navigeringsordning</strong> for att
                bestamma var i menyn sidan hamnar.
              </p>

              <WarningBox title="Anpassad meny uppdateras inte automatiskt">
                <p>
                  Om du anvander en anpassad meny uppdateras den <strong>inte</strong> automatiskt
                  nar du laggar till nya sektioner eller sidor. Du behover manuellt lagga till nya
                  lankar i navigeringsvyn.
                </p>
              </WarningBox>
            </>
          ),
        },
        en: {
          title: "Setting up site navigation",
          description: "Learn how to configure header and footer navigation, choose between automatic and custom menus, and organize links.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko has a flexible <strong>navigation system</strong> for both header and
                footer. By default, navigation is generated automatically based on your active
                sections and pages, but you can <strong>customize</strong> it at any time with
                your own links and order.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Automatic navigation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you create a new website, navigation is generated <strong>automatically</strong>.
                The menu contains links to all active sections and pages on your website. Which
                links are shown depends on which sections you have enabled:
              </p>
              <ul className="mt-3 space-y-2 text-text-secondary list-disc list-inside">
                <li><strong>Home</strong> &mdash; Always included</li>
                <li><strong>About</strong> &mdash; Shown if you have an About section</li>
                <li><strong>Services</strong> &mdash; Shown if you have services added</li>
                <li><strong>Gallery</strong> &mdash; Shown if you have gallery images</li>
                <li><strong>FAQ</strong> &mdash; Shown if you have FAQ items</li>
                <li><strong>Contact</strong> &mdash; Shown if you have contact info or a contact form</li>
                <li><strong>Pricing</strong> &mdash; Shown if you have a pricing section</li>
                <li><strong>Team</strong> &mdash; Shown if you have team members</li>
                <li><strong>Blog</strong> &mdash; Always available</li>
              </ul>

              <InfoBox title="Automatic navigation is smart">
                <p>
                  The automatic navigation updates when you add or remove sections. You don&apos;t
                  need to manually update the menu every time you change content.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Customizing navigation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you want full control over the menu, you can <strong>customize</strong> it:
              </p>
              <Step n={1} title="Go to Navigation">
                <p>
                  In your dashboard, navigate to your website and click <strong>Navigation</strong> in
                  the sidebar.
                </p>
              </Step>
              <Step n={2} title="Click Customize menu">
                <p>
                  Under the header or footer section, click <strong>Customize menu</strong>. The
                  automatic menu is converted to an editable list.
                </p>
              </Step>
              <Step n={3} title="Add, remove, and reorder links">
                <p>
                  For each link, enter a <strong>label</strong> (the displayed text) and choose
                  which <strong>page</strong> it should link to. You can select from your existing
                  pages or enter a <strong>custom URL</strong>. Use the arrow buttons to change
                  order and the trash icon to remove links.
                </p>
              </Step>
              <Step n={4} title="Publish">
                <p>
                  Changes are automatically saved as drafts. Click <strong>Publish</strong> when
                  you are satisfied to make the changes visible on your website.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Header and footer navigation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can customize header and footer <strong>separately</strong>. It is common to
                have a short header menu with the most important pages, and a more detailed
                footer menu with additional links.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  title="Header"
                  desc="The main menu at the top of the page. Shown on all pages."
                />
                <FeatureCard
                  icon="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                  title="Footer"
                  desc="The page footer at the bottom. Can contain more links, legal pages, etc."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Resetting to automatic</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you have customized the menu but want to go back to the automatic version,
                click <strong>Reset to automatic</strong> above the header or footer section.
                Your custom links are removed and the navigation is generated from your active
                sections again.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Page-specific navigation</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Each page you create has a <strong>Show in navigation</strong> setting. If you
                enable this, the page is automatically shown in the automatic navigation (if you
                are using it). You can also set a <strong>navigation order</strong> to control
                where in the menu the page appears.
              </p>

              <WarningBox title="Custom menu does not auto-update">
                <p>
                  If you are using a custom menu, it does <strong>not</strong> automatically update
                  when you add new sections or pages. You need to manually add new links in the
                  navigation view.
                </p>
              </WarningBox>
            </>
          ),
        },
      },
    },
  ],
};
