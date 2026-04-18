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

function DnsTable({ rows }: { rows: { type: string; name: string; value: string; ttl?: string }[] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border-theme">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-theme bg-background">
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">Typ</th>
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">Namn</th>
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">Värde / Pekar på</th>
            <th className="px-4 py-3 text-left font-semibold text-primary-deep">TTL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border-theme last:border-0">
              <td className="px-4 py-3 font-mono text-xs">{r.type}</td>
              <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
              <td className="px-4 py-3 font-mono text-xs break-all">{r.value}</td>
              <td className="px-4 py-3 font-mono text-xs">{r.ttl ?? "Auto"}</td>
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

export const domainsCategory: HelpCategory = {
  slug: "domains",
  icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  label: {
    sv: {
      title: "Domäner",
      description: "Hantera domäner, subdomäner, DNS-inställningar och domänköp",
    },
    en: {
      title: "Domains",
      description: "Manage domains, subdomains, DNS settings, and domain purchases",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Overview / Introduction                                     */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "domains",
      icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
      content: {
        sv: {
          title: "Översikt — Domäner på Qvicko",
          description: "Lär dig hur domäner fungerar på Qvicko-plattformen. Tre typer: gratis subdomän, egen domän och köp av domän.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Varje webbplats du skapar på Qvicko får automatiskt en unik webbadress.
                Du kan använda den direkt, koppla din egen domän, eller köpa en ny — allt
                hanteras från samma ställe i din dashboard.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tre typer av domäner</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Gratis subdomän", desc: "Alla sidor får automatiskt en adress som dinbutik.qvickosite.com. Perfekt för att komma igång snabbt." },
                  { title: "Egen domän", desc: "Koppla en domän du redan äger, t.ex. dinbutik.se, och peka den till din Qvicko-sida." },
                  { title: "Köp domän", desc: "Sök och köp en ny domän direkt via Qvicko. Vi hanterar registrering och förnyelse åt dig." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border-theme bg-surface p-5">
                    <h3 className="font-semibold text-primary-deep">{item.title}</h3>
                    <p className="mt-2 text-sm text-text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Var hittar jag domäninställningar?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Logga in på ditt konto och gå till <strong>Dashboard → Domäner</strong>. Där ser du en
                samlad lista med alla dina domäner — subdomäner, egna domäner och köpta domäner —
                med status, åtgärder och DNS-information.
              </p>

              <InfoBox title="Kräver aktivt abonnemang">
                <p>Gratis subdomäner ingår i alla planer. För att koppla en egen domän eller köpa en ny domän behöver du ett aktivt abonnemang.</p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Snabblänkar</h2>
              <ul className="mt-4 space-y-2 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Koppla egen domän</strong> — Steg-för-steg-guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Förstå subdomäner</strong> — Hur din gratis adress fungerar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Köp domän via Qvicko</strong> — Sök, köp och hantera</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>DNS & propagering</strong> — Vad händer efter ändring</span>
                </li>
              </ul>
            </>
          ),
        },
        en: {
          title: "Overview — Domains on Qvicko",
          description: "Learn how domains work on the Qvicko platform. Three types: free subdomain, custom domain, and domain purchase.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Every website you create on Qvicko automatically receives a unique web address.
                You can use it right away, connect your own domain, or purchase a new one — everything
                is managed from the same place in your dashboard.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Three types of domains</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Free subdomain", desc: "All sites automatically get an address like yourstore.qvickosite.com. Perfect for getting started quickly." },
                  { title: "Custom domain", desc: "Connect a domain you already own, e.g. yourstore.com, and point it to your Qvicko site." },
                  { title: "Purchase domain", desc: "Search and buy a new domain directly through Qvicko. We handle registration and renewal for you." },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border-theme bg-surface p-5">
                    <h3 className="font-semibold text-primary-deep">{item.title}</h3>
                    <p className="mt-2 text-sm text-text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Where do I find domain settings?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Log in to your account and go to <strong>Dashboard → Domains</strong>. There you will find a
                unified list of all your domains — subdomains, custom domains, and purchased domains —
                with status, actions, and DNS information.
              </p>

              <InfoBox title="Requires active subscription">
                <p>Free subdomains are included in all plans. To connect a custom domain or purchase a new one, you need an active subscription.</p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Quick links</h2>
              <ul className="mt-4 space-y-2 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Connect custom domain</strong> — Step-by-step guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Understanding subdomains</strong> — How your free address works</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>Buy domain via Qvicko</strong> — Search, buy, and manage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  <span><strong>DNS & propagation</strong> — What happens after changes</span>
                </li>
              </ul>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Connect a custom domain                                     */
    /* -------------------------------------------------------------- */
    {
      slug: "custom-domain",
      category: "domains",
      icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
      content: {
        sv: {
          title: "Koppla en egen domän",
          description: "Steg-för-steg-guide för att koppla din egen domän till din Qvicko-webbplats. Lär dig om DNS-poster, verifiering och SSL.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Har du redan en domän registrerad hos en annan leverantör (t.ex. Loopia, One.com,
                GoDaddy eller Namecheap)? Då kan du enkelt peka den till din Qvicko-sida. Följ
                stegen nedan.
              </p>

              <InfoBox title="Förutsättningar">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Du har ett aktivt Qvicko-abonnemang</li>
                  <li>Du har tillgång till DNS-inställningarna hos din domänleverantör</li>
                  <li>Domänen är inte redan kopplad till ett annat Qvicko-konto</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Steg-för-steg</h2>

              <Step n={1} title="Lägg till domänen i Qvicko">
                <p>
                  Gå till <strong>Dashboard → Domäner</strong> och klicka på <strong>&quot;Lägg till domän&quot;</strong>.
                  Skriv in din domän (t.ex. <Code>minbutik.se</Code>) och klicka spara.
                  Domänen visas nu med status <em>Väntar på verifiering</em>.
                </p>
              </Step>

              <Step n={2} title="Kopiera DNS-posterna">
                <p>
                  Qvicko visar de DNS-poster du behöver lägga till. Du kommer att se en
                  TXT-post för verifiering och en CNAME- eller A-post för trafik.
                </p>
              </Step>

              <h3 className="mt-8 text-lg font-semibold text-primary-deep">Exempel på DNS-poster</h3>
              <DnsTable rows={[
                { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
                { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
                { type: "TXT", name: "_vercel", value: "vc-domain-verify=abc123...", ttl: "3600" },
              ]} />

              <Step n={3} title="Lägg till posterna hos din DNS-leverantör">
                <p>
                  Logga in hos din domänleverantör och navigera till DNS-inställningarna.
                  Lägg till varje post exakt som de visas i Qvicko. Var noga med att kopiera
                  värdena korrekt — ett litet fel kan göra att verifieringen misslyckas.
                </p>
              </Step>

              <Step n={4} title="Verifiera domänen">
                <p>
                  Gå tillbaka till Qvicko och klicka <strong>&quot;Verifiera&quot;</strong>. Om DNS-posterna
                  har propagerats korrekt ändras statusen till <em>Aktiv</em>. SSL-certifikat
                  utfärdas automatiskt.
                </p>
              </Step>

              <Step n={5} title="Tilldela domänen till en webbplats">
                <p>
                  Klicka på <strong>&quot;Tilldela till sida&quot;</strong> och välj vilken av dina Qvicko-sidor
                  domänen ska peka på. Du kan byta sida när som helst.
                </p>
              </Step>

              <WarningBox title="DNS-propagering tar tid">
                <p>
                  Ändringar i DNS kan ta upp till 24–48 timmar att sprida sig globalt,
                  men brukar vanligtvis vara klara inom 5–30 minuter. Under tiden kan du
                  se att verifieringen misslyckas — vänta en stund och försök igen.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vanliga problem</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Verifieringen misslyckas</h4>
                  <p className="mt-1 text-sm text-text-secondary">Kontrollera att TXT-posten är korrekt och att du har väntat tillräckligt länge. Använd ett verktyg som <Code>dig</Code> eller en online DNS-checker för att verifiera.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">SSL-certifikatet saknas</h4>
                  <p className="mt-1 text-sm text-text-secondary">SSL utfärdas automatiskt efter verifiering. Det kan ta upp till 10 minuter. Om det inte fungerar, kontrollera att CNAME/A-posterna pekar korrekt.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Domänen används redan</h4>
                  <p className="mt-1 text-sm text-text-secondary">Varje domän kan bara kopplas till ett Qvicko-konto. Om du har bytt konto, ta bort domänen från det gamla kontot först.</p>
                </div>
              </div>
            </>
          ),
        },
        en: {
          title: "Connect a custom domain",
          description: "Step-by-step guide to connect your own domain to your Qvicko website. Learn about DNS records, verification, and SSL.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Already have a domain registered with another provider (e.g. GoDaddy, Namecheap,
                Cloudflare)? You can easily point it to your Qvicko site. Follow the steps below.
              </p>

              <InfoBox title="Prerequisites">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You have an active Qvicko subscription</li>
                  <li>You have access to DNS settings at your domain provider</li>
                  <li>The domain is not already connected to another Qvicko account</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Step by step</h2>

              <Step n={1} title="Add the domain in Qvicko">
                <p>
                  Go to <strong>Dashboard → Domains</strong> and click <strong>&quot;Add domain&quot;</strong>.
                  Enter your domain (e.g. <Code>mystore.com</Code>) and click save.
                  The domain will appear with status <em>Pending verification</em>.
                </p>
              </Step>

              <Step n={2} title="Copy the DNS records">
                <p>
                  Qvicko displays the DNS records you need to add. You will see a
                  TXT record for verification and a CNAME or A record for traffic.
                </p>
              </Step>

              <h3 className="mt-8 text-lg font-semibold text-primary-deep">Example DNS records</h3>
              <DnsTable rows={[
                { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
                { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
                { type: "TXT", name: "_vercel", value: "vc-domain-verify=abc123...", ttl: "3600" },
              ]} />

              <Step n={3} title="Add the records at your DNS provider">
                <p>
                  Log in to your domain provider and navigate to DNS settings.
                  Add each record exactly as shown in Qvicko. Be careful to copy
                  the values correctly — a small error can cause verification to fail.
                </p>
              </Step>

              <Step n={4} title="Verify the domain">
                <p>
                  Go back to Qvicko and click <strong>&quot;Verify&quot;</strong>. If the DNS records
                  have propagated correctly, the status changes to <em>Active</em>. SSL certificates
                  are issued automatically.
                </p>
              </Step>

              <Step n={5} title="Assign the domain to a website">
                <p>
                  Click <strong>&quot;Assign to site&quot;</strong> and choose which of your Qvicko sites
                  the domain should point to. You can change this at any time.
                </p>
              </Step>

              <WarningBox title="DNS propagation takes time">
                <p>
                  DNS changes can take up to 24–48 hours to propagate globally,
                  but usually complete within 5–30 minutes. During this time, verification
                  may fail — wait a moment and try again.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Common issues</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Verification fails</h4>
                  <p className="mt-1 text-sm text-text-secondary">Check that the TXT record is correct and that you have waited long enough. Use a tool like <Code>dig</Code> or an online DNS checker to verify.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">SSL certificate missing</h4>
                  <p className="mt-1 text-sm text-text-secondary">SSL is issued automatically after verification. It can take up to 10 minutes. If it doesn&apos;t work, check that CNAME/A records point correctly.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Domain already in use</h4>
                  <p className="mt-1 text-sm text-text-secondary">Each domain can only be connected to one Qvicko account. If you switched accounts, remove the domain from the old account first.</p>
                </div>
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Subdomains                                                  */
    /* -------------------------------------------------------------- */
    {
      slug: "subdomains",
      category: "domains",
      icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
      content: {
        sv: {
          title: "Förstå subdomäner",
          description: "Lär dig hur gratis subdomäner fungerar på Qvicko. Anpassa din subdomän och förstå reglerna.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Varje webbplats du skapar på Qvicko tilldelas automatiskt en gratis subdomän
                under <Code>qvickosite.com</Code>. Det betyder att du kan publicera din sida
                direkt utan att behöva köpa eller konfigurera en domän.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad är en subdomän?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                En subdomän är en del av en större domän. I adressen <Code>minbutik.qvickosite.com</Code>
                är <strong>minbutik</strong> subdomänen och <strong>qvickosite.com</strong> är huvuddomänen.
                Det fungerar som en egen webbadress men delar teknisk infrastruktur med huvuddomänen.
              </p>

              <div className="my-8 rounded-xl bg-primary-deep/5 p-6">
                <p className="text-center font-mono text-lg text-primary-deep">
                  <span className="rounded bg-primary/10 px-2 py-1 text-primary font-bold">minbutik</span>
                  <span className="text-text-muted">.qvickosite.com</span>
                </p>
                <p className="mt-3 text-center text-sm text-text-muted">
                  ↑ Din unika subdomän &nbsp;&nbsp;&nbsp; ↑ Qvickos basdomän
                </p>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur tilldelas subdomänen?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Subdomänen genereras automatiskt baserat på ditt företagsnamn eller webbplatsens titel.
                Den konverteras till ett URL-vänligt format (gemener, bindestreck istället för mellanslag).
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Anpassa din subdomän</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan ändra subdomänen i <strong>Dashboard → Domäner</strong>. Klicka på
                redigera-ikonen bredvid subdomänen och ange ett nytt namn.
              </p>

              <h3 className="mt-6 text-lg font-semibold text-primary-deep">Regler för subdomäner</h3>
              <ul className="mt-3 space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Minst 3 tecken, max 63 tecken
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Bara bokstäver (a–z), siffror (0–9) och bindestreck (-)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Kan inte börja eller sluta med bindestreck
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Måste vara unik — ingen annan sida kan ha samma subdomän
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Reserverade namn (t.ex. www, admin, api, mail) är inte tillåtna
                </li>
              </ul>

              <WarningBox title="Att byta subdomän">
                <p>
                  Om du ändrar din subdomän slutar den gamla adressen att fungera omedelbart.
                  Om du har delat den gamla adressen, se till att uppdatera alla länkar.
                  Sökmotorer kan behöva tid att indexera den nya adressen.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Subdomän vs. egen domän</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Egenskap</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Subdomän</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Egen domän</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">Kostnad</td>
                      <td className="px-4 py-3">Gratis</td>
                      <td className="px-4 py-3">Domänkostnad tillkommer</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">Branding</td>
                      <td className="px-4 py-3">Innehåller qvickosite.com</td>
                      <td className="px-4 py-3">Helt eget varumärke</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">SEO</td>
                      <td className="px-4 py-3">Begränsat</td>
                      <td className="px-4 py-3">Full kontroll</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">SSL</td>
                      <td className="px-4 py-3">Automatiskt</td>
                      <td className="px-4 py-3">Automatiskt</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Kräver abonnemang</td>
                      <td className="px-4 py-3">Nej</td>
                      <td className="px-4 py-3">Ja</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        en: {
          title: "Understanding subdomains",
          description: "Learn how free subdomains work on Qvicko. Customize your subdomain and understand the rules.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Every website you create on Qvicko is automatically assigned a free subdomain
                under <Code>qvickosite.com</Code>. This means you can publish your site
                immediately without needing to buy or configure a domain.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What is a subdomain?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A subdomain is a part of a larger domain. In the address <Code>mystore.qvickosite.com</Code>,
                <strong> mystore</strong> is the subdomain and <strong>qvickosite.com</strong> is the main domain.
                It works as its own web address but shares technical infrastructure with the main domain.
              </p>

              <div className="my-8 rounded-xl bg-primary-deep/5 p-6">
                <p className="text-center font-mono text-lg text-primary-deep">
                  <span className="rounded bg-primary/10 px-2 py-1 text-primary font-bold">mystore</span>
                  <span className="text-text-muted">.qvickosite.com</span>
                </p>
                <p className="mt-3 text-center text-sm text-text-muted">
                  ↑ Your unique subdomain &nbsp;&nbsp;&nbsp; ↑ Qvicko base domain
                </p>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How is the subdomain assigned?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The subdomain is automatically generated based on your business name or website title.
                It is converted to a URL-friendly format (lowercase, hyphens instead of spaces).
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Customize your subdomain</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can change the subdomain in <strong>Dashboard → Domains</strong>. Click the
                edit icon next to the subdomain and enter a new name.
              </p>

              <h3 className="mt-6 text-lg font-semibold text-primary-deep">Subdomain rules</h3>
              <ul className="mt-3 space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Minimum 3 characters, maximum 63 characters
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Only letters (a–z), numbers (0–9) and hyphens (-)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Cannot start or end with a hyphen
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Must be unique — no other site can have the same subdomain
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Reserved names (e.g. www, admin, api, mail) are not allowed
                </li>
              </ul>

              <WarningBox title="Changing your subdomain">
                <p>
                  If you change your subdomain, the old address stops working immediately.
                  If you shared the old address, make sure to update all links.
                  Search engines may need time to index the new address.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Subdomain vs. custom domain</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Feature</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Subdomain</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Custom domain</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">Cost</td>
                      <td className="px-4 py-3">Free</td>
                      <td className="px-4 py-3">Domain cost applies</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">Branding</td>
                      <td className="px-4 py-3">Includes qvickosite.com</td>
                      <td className="px-4 py-3">Fully custom branding</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">SEO</td>
                      <td className="px-4 py-3">Limited</td>
                      <td className="px-4 py-3">Full control</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3">SSL</td>
                      <td className="px-4 py-3">Automatic</td>
                      <td className="px-4 py-3">Automatic</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Requires subscription</td>
                      <td className="px-4 py-3">No</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Buy a domain via Qvicko                                     */
    /* -------------------------------------------------------------- */
    {
      slug: "buy-domain",
      category: "domains",
      icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
      content: {
        sv: {
          title: "Köp domän via Qvicko",
          description: "Sök, köp och hantera domäner direkt genom Qvicko-plattformen. Automatisk registrering, SSL och koppling till din webbplats.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Du behöver inte gå till en extern domänregistrator. Med Qvicko kan du söka efter,
                köpa och hantera din domän direkt från din dashboard. Domänen kopplas automatiskt
                till din webbplats och SSL-certifikat konfigureras åt dig.
              </p>

              <InfoBox title="Fördelar med att köpa via Qvicko">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Allt i ett ställe — ingen separat domänleverantör</li>
                  <li>Automatisk koppling till din Qvicko-webbplats</li>
                  <li>SSL-certifikat konfigureras automatiskt</li>
                  <li>Automatisk förnyelse så du aldrig tappar din domän</li>
                  <li>Hantera DNS, förnyelse och överföring från dashboard</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Så köper du en domän</h2>

              <Step n={1} title="Sök efter en domän">
                <p>
                  Gå till <strong>Dashboard → Domäner</strong> och använd sökfältet. Skriv in
                  det domännamn du vill ha (t.ex. <Code>mittforetag.se</Code>) och klicka sök.
                  Du ser direkt om domänen är ledig och vad den kostar.
                </p>
              </Step>

              <Step n={2} title="Granska pris och tillgänglighet">
                <p>
                  Priset visas i SEK per år. Priset varierar beroende på domänändelse
                  (.com, .se, .net etc.) och eventuella premiumdomäner.
                </p>
              </Step>

              <Step n={3} title="Slutför köpet">
                <p>
                  Klicka <strong>&quot;Köp domän&quot;</strong>. En betalningsdialog visas där du kan
                  betala med kort via Stripe. Välj vilken webbplats domänen ska kopplas till.
                </p>
              </Step>

              <Step n={4} title="Klart!">
                <p>
                  Efter genomförd betalning registreras domänen automatiskt. Den kopplas
                  till din valda webbplats, SSL-certifikat utfärdas, och domänen visas
                  i din domänlista med status <em>Köpt</em>.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hantera köpta domäner</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                I <strong>Dashboard → Domäner</strong> kan du se och hantera alla dina köpta domäner:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    Automatisk förnyelse
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">Aktiverad som standard. Din domän förnyas automatiskt innan den löper ut. Du kan stänga av det om du vill.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    Domänlås
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">Domänen är låst som standard för att förhindra obehörig överföring. Du måste låsa upp den innan du kan flytta den till en annan registrator.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    Överför till annan registrator
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">Vill du flytta domänen? Klicka &quot;Förbered överföring&quot; för att låsa upp och få en EPP/auth-kod. Överföringen tar vanligtvis 5–7 dagar.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Priser</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Domänpriser varierar beroende på ändelse. Här är ungefärliga priser:
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Domänändelse</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Pris/år (ca)</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    {[
                      { ext: ".com", price: "150 – 200 kr" },
                      { ext: ".se", price: "200 – 300 kr" },
                      { ext: ".net", price: "150 – 250 kr" },
                      { ext: ".org", price: "150 – 200 kr" },
                      { ext: ".io", price: "400 – 600 kr" },
                    ].map((row) => (
                      <tr key={row.ext} className="border-b border-border-theme last:border-0">
                        <td className="px-4 py-3 font-mono">{row.ext}</td>
                        <td className="px-4 py-3">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-text-muted">
                Exakta priser visas vid sökning. Alla priser är i SEK inklusive moms.
              </p>
            </>
          ),
        },
        en: {
          title: "Buy a domain via Qvicko",
          description: "Search, buy, and manage domains directly through the Qvicko platform. Automatic registration, SSL, and connection to your website.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                You don&apos;t need to go to an external domain registrar. With Qvicko, you can search for,
                buy, and manage your domain directly from your dashboard. The domain is automatically
                connected to your website and SSL certificates are configured for you.
              </p>

              <InfoBox title="Benefits of buying through Qvicko">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Everything in one place — no separate domain provider</li>
                  <li>Automatic connection to your Qvicko website</li>
                  <li>SSL certificates configured automatically</li>
                  <li>Auto-renewal so you never lose your domain</li>
                  <li>Manage DNS, renewal, and transfer from your dashboard</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to buy a domain</h2>

              <Step n={1} title="Search for a domain">
                <p>
                  Go to <strong>Dashboard → Domains</strong> and use the search field. Enter
                  the domain name you want (e.g. <Code>mybusiness.com</Code>) and click search.
                  You&apos;ll see immediately if the domain is available and the price.
                </p>
              </Step>

              <Step n={2} title="Review price and availability">
                <p>
                  The price is shown in SEK per year. The price varies depending on the domain
                  extension (.com, .se, .net, etc.) and any premium domains.
                </p>
              </Step>

              <Step n={3} title="Complete the purchase">
                <p>
                  Click <strong>&quot;Buy domain&quot;</strong>. A payment dialog appears where you can
                  pay by card via Stripe. Choose which website the domain should be connected to.
                </p>
              </Step>

              <Step n={4} title="Done!">
                <p>
                  After payment, the domain is registered automatically. It&apos;s connected
                  to your chosen website, SSL certificate is issued, and the domain appears
                  in your domain list with status <em>Purchased</em>.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Manage purchased domains</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                In <strong>Dashboard → Domains</strong> you can view and manage all your purchased domains:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    Auto-renewal
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">Enabled by default. Your domain renews automatically before it expires. You can turn it off if you want.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    Domain lock
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">The domain is locked by default to prevent unauthorized transfer. You must unlock it before transferring to another registrar.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep flex items-center gap-2">
                    <Icon d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    Transfer to another registrar
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">Want to move your domain? Click &quot;Prepare transfer&quot; to unlock and get an EPP/auth code. The transfer typically takes 5–7 days.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Pricing</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Domain prices vary by extension. Here are approximate prices:
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Extension</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Price/year (approx)</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    {[
                      { ext: ".com", price: "150 – 200 SEK" },
                      { ext: ".se", price: "200 – 300 SEK" },
                      { ext: ".net", price: "150 – 250 SEK" },
                      { ext: ".org", price: "150 – 200 SEK" },
                      { ext: ".io", price: "400 – 600 SEK" },
                    ].map((row) => (
                      <tr key={row.ext} className="border-b border-border-theme last:border-0">
                        <td className="px-4 py-3 font-mono">{row.ext}</td>
                        <td className="px-4 py-3">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-text-muted">
                Exact prices are shown when searching. All prices are in SEK including VAT.
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. DNS & Propagation                                           */
    /* -------------------------------------------------------------- */
    {
      slug: "dns-propagation",
      category: "domains",
      icon: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
      content: {
        sv: {
          title: "DNS & propagering",
          description: "Förstå hur DNS fungerar, vad propagering innebär, och hur lång tid det tar innan dina domänändringar slår igenom.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                DNS (Domain Name System) är internets adressbok. Det översätter domännamn
                som <Code>dinbutik.se</Code> till IP-adresser som datorer förstår. När du
                ändrar DNS-poster behöver dessa ändringar sprida sig genom hela internet —
                detta kallas DNS-propagering.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur fungerar DNS?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När någon skriver in din webbadress i en webbläsare sker följande:
              </p>

              <Step n={1} title="Webbläsaren frågar en DNS-resolver">
                <p>Din internetleverantörs DNS-server får frågan: &quot;Vilken IP-adress har dinbutik.se?&quot;</p>
              </Step>
              <Step n={2} title="Resolvern söker svaret">
                <p>Om svaret inte finns i cachen, frågar resolvern rot-namnservrar, sedan TLD-servrar (.se), och slutligen din domäns namnserver.</p>
              </Step>
              <Step n={3} title="Svaret cachas">
                <p>Svaret sparas i cachen under en viss tid (TTL — Time To Live) så att samma fråga inte behöver ställas igen.</p>
              </Step>
              <Step n={4} title="Webbläsaren ansluter">
                <p>Med IP-adressen kan webbläsaren ansluta till rätt server och visa din webbplats.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vanliga DNS-posttyper</h2>
              <DnsTable rows={[
                { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
                { type: "AAAA", name: "@", value: "2001:db8::1", ttl: "3600" },
                { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
                { type: "TXT", name: "@", value: "v=spf1 include:...", ttl: "3600" },
                { type: "MX", name: "@", value: "mail.provider.com", ttl: "3600" },
              ]} />

              <div className="mt-4 space-y-3 text-text-secondary">
                <p><strong>A-post</strong> — Pekar domänen till en IPv4-adress. Används för root-domänen (t.ex. dinbutik.se).</p>
                <p><strong>AAAA-post</strong> — Samma som A men för IPv6-adresser.</p>
                <p><strong>CNAME-post</strong> — Pekar ett namn till ett annat namn. Används ofta för www-versionen av domänen.</p>
                <p><strong>TXT-post</strong> — Textpost som används för verifiering, SPF, DKIM och andra ändamål.</p>
                <p><strong>MX-post</strong> — Pekar domänens e-post till en specifik mailserver.</p>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad är DNS-propagering?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                När du ändrar en DNS-post uppdateras den först hos din domänleverantörs namnserver.
                Men DNS-resolvrar världen över har ofta den gamla posten cachad. Det tar tid
                innan alla cachar uppdateras med den nya informationen.
              </p>

              <div className="my-8 rounded-xl border border-border-theme bg-surface p-6">
                <h3 className="text-lg font-semibold text-primary-deep mb-4">Typiska propageringstider</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">5–30 min</p>
                    <p className="text-sm text-text-muted mt-1">De flesta ändringar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">1–4 h</p>
                    <p className="text-sm text-text-muted mt-1">Komplexa ändringar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">24–48 h</p>
                    <p className="text-sm text-text-muted mt-1">Maximal global spridning</p>
                  </div>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips för snabbare propagering</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                  <span><strong>Sänk TTL i förväg</strong> — Ändra TTL till ett lågt värde (60–300 sekunder) minst 24 timmar innan du planerar att ändra DNS-poster.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                  <span><strong>Rensa lokal DNS-cache</strong> — Kör <Code>ipconfig /flushdns</Code> (Windows) eller <Code>sudo dscacheutil -flushcache</Code> (Mac).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                  <span><strong>Testa med olika DNS</strong> — Prova Google DNS (8.8.8.8) eller Cloudflare DNS (1.1.1.1) för att se om propageringen har nått dit.</span>
                </li>
              </ul>

              <WarningBox title="Ha tålamod">
                <p>
                  Under propageringen kan din webbplats fungera för vissa besökare men inte för andra.
                  Det är normalt och löser sig när alla DNS-servrar har uppdaterats.
                  Undvik att göra fler ändringar under propageringen.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Felsökning</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Domänen pekar på fel ställe</h4>
                  <p className="mt-1 text-sm text-text-secondary">Dubbelkolla att A- och CNAME-posterna är korrekta. Ta bort eventuella gamla poster som kan krocka.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">&quot;DNS_PROBE_FINISHED_NXDOMAIN&quot;</h4>
                  <p className="mt-1 text-sm text-text-secondary">Domänen hittas inte alls. Kontrollera att namnservern är korrekt konfigurerad och att domänen inte har löpt ut.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Fungerar på mobil men inte dator (eller tvärtom)</h4>
                  <p className="mt-1 text-sm text-text-secondary">Olika enheter kan använda olika DNS-resolvrar. Vänta på att propageringen ska slutföras eller rensa enhetens DNS-cache.</p>
                </div>
              </div>
            </>
          ),
        },
        en: {
          title: "DNS & propagation",
          description: "Understand how DNS works, what propagation means, and how long it takes for your domain changes to take effect.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                DNS (Domain Name System) is the internet&apos;s address book. It translates domain names
                like <Code>yourstore.com</Code> to IP addresses that computers understand. When you
                change DNS records, these changes need to spread throughout the internet —
                this is called DNS propagation.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How does DNS work?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When someone enters your web address in a browser, the following happens:
              </p>

              <Step n={1} title="The browser asks a DNS resolver">
                <p>Your ISP&apos;s DNS server receives the question: &quot;What IP address does yourstore.com have?&quot;</p>
              </Step>
              <Step n={2} title="The resolver searches for the answer">
                <p>If the answer isn&apos;t in cache, the resolver asks root nameservers, then TLD servers (.com), and finally your domain&apos;s nameserver.</p>
              </Step>
              <Step n={3} title="The answer is cached">
                <p>The answer is stored in cache for a certain time (TTL — Time To Live) so the same question doesn&apos;t need to be asked again.</p>
              </Step>
              <Step n={4} title="The browser connects">
                <p>With the IP address, the browser can connect to the right server and display your website.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Common DNS record types</h2>
              <DnsTable rows={[
                { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
                { type: "AAAA", name: "@", value: "2001:db8::1", ttl: "3600" },
                { type: "CNAME", name: "www", value: "cname.vercel-dns.com", ttl: "3600" },
                { type: "TXT", name: "@", value: "v=spf1 include:...", ttl: "3600" },
                { type: "MX", name: "@", value: "mail.provider.com", ttl: "3600" },
              ]} />

              <div className="mt-4 space-y-3 text-text-secondary">
                <p><strong>A record</strong> — Points the domain to an IPv4 address. Used for the root domain (e.g. yourstore.com).</p>
                <p><strong>AAAA record</strong> — Same as A but for IPv6 addresses.</p>
                <p><strong>CNAME record</strong> — Points a name to another name. Often used for the www version of the domain.</p>
                <p><strong>TXT record</strong> — Text record used for verification, SPF, DKIM, and other purposes.</p>
                <p><strong>MX record</strong> — Points the domain&apos;s email to a specific mail server.</p>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What is DNS propagation?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you change a DNS record, it&apos;s first updated at your domain provider&apos;s nameserver.
                But DNS resolvers worldwide often have the old record cached. It takes time
                for all caches to update with the new information.
              </p>

              <div className="my-8 rounded-xl border border-border-theme bg-surface p-6">
                <h3 className="text-lg font-semibold text-primary-deep mb-4">Typical propagation times</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">5–30 min</p>
                    <p className="text-sm text-text-muted mt-1">Most changes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">1–4 h</p>
                    <p className="text-sm text-text-muted mt-1">Complex changes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">24–48 h</p>
                    <p className="text-sm text-text-muted mt-1">Maximum global spread</p>
                  </div>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips for faster propagation</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                  <span><strong>Lower TTL in advance</strong> — Change TTL to a low value (60–300 seconds) at least 24 hours before you plan to change DNS records.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                  <span><strong>Flush local DNS cache</strong> — Run <Code>ipconfig /flushdns</Code> (Windows) or <Code>sudo dscacheutil -flushcache</Code> (Mac).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                  <span><strong>Test with different DNS</strong> — Try Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1) to see if propagation has reached there.</span>
                </li>
              </ul>

              <WarningBox title="Be patient">
                <p>
                  During propagation, your website may work for some visitors but not others.
                  This is normal and resolves once all DNS servers have been updated.
                  Avoid making further changes during propagation.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Troubleshooting</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Domain points to wrong location</h4>
                  <p className="mt-1 text-sm text-text-secondary">Double-check that A and CNAME records are correct. Remove any old records that may conflict.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">&quot;DNS_PROBE_FINISHED_NXDOMAIN&quot;</h4>
                  <p className="mt-1 text-sm text-text-secondary">The domain cannot be found at all. Check that the nameserver is correctly configured and that the domain hasn&apos;t expired.</p>
                </div>
                <div className="rounded-xl border border-border-theme p-5">
                  <h4 className="font-semibold text-primary-deep">Works on mobile but not desktop (or vice versa)</h4>
                  <p className="mt-1 text-sm text-text-secondary">Different devices may use different DNS resolvers. Wait for propagation to complete or flush the device&apos;s DNS cache.</p>
                </div>
              </div>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  6. Domain management (transfer, lock, renewal)                 */
    /* -------------------------------------------------------------- */
    {
      slug: "domain-management",
      category: "domains",
      icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
      content: {
        sv: {
          title: "Hantera dina domäner",
          description: "Lär dig hur du hanterar domänlås, automatisk förnyelse, överföring till annan registrator och tilldelning till webbplatser.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                I Qvicko-dashboarden har du full kontroll över alla dina domäner. Här förklarar
                vi de olika hanteringsåtgärderna du kan utföra.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tilldela domän till webbplats</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                En domän som inte är kopplad till en webbplats visar bara en parkeringssida.
                För att din domän ska visa ditt innehåll behöver du tilldela den till en av dina sidor.
              </p>
              <Step n={1} title="Gå till Domäner">
                <p>Navigera till <strong>Dashboard → Domäner</strong>.</p>
              </Step>
              <Step n={2} title="Välj domän">
                <p>Klicka på den domän du vill tilldela.</p>
              </Step>
              <Step n={3} title="Tilldela">
                <p>Klicka <strong>&quot;Tilldela till sida&quot;</strong> och välj vilken webbplats domänen ska peka på.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Automatisk förnyelse</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Köpta domäner har automatisk förnyelse aktiverad som standard. Det innebär att
                domänen förnyas automatiskt innan registreringsperioden löper ut, så du aldrig
                riskerar att förlora din domän.
              </p>
              <InfoBox title="Så fungerar det">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Betalning dras automatiskt från ditt registrerade betalkort</li>
                  <li>Du får ett e-postmeddelande innan förnyelsen</li>
                  <li>Du kan stänga av automatisk förnyelse när som helst</li>
                  <li>Om betalningen misslyckas får du en varning och kan förnya manuellt</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Domänlås</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Domänlåset skyddar din domän från obehörig överföring. Det är aktiverat som
                standard och bör vara påslaget om du inte planerar att flytta domänen.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <h4 className="font-semibold text-green-800">Låst (rekommenderat)</h4>
                  <p className="mt-1 text-sm text-green-700">Domänen kan inte överföras till en annan registrator. Skyddar mot obehörig flytt.</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h4 className="font-semibold text-amber-800">Olåst</h4>
                  <p className="mt-1 text-sm text-amber-700">Domänen kan överföras. Låses automatiskt efter 14 dagar om ingen överföring påbörjas.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Överföra domän till annan registrator</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du vill flytta din köpta domän till en annan registrator, följ dessa steg:
              </p>
              <Step n={1} title="Förbered överföringen">
                <p>Klicka <strong>&quot;Förbered överföring&quot;</strong> på domänen. Domänlåset tas bort automatiskt.</p>
              </Step>
              <Step n={2} title="Kopiera auth-koden">
                <p>Du får en EPP/auth-kod som behövs hos den nya registratorn. Koden visas i dashboarden.</p>
              </Step>
              <Step n={3} title="Starta överföringen">
                <p>Gå till din nya registrator och starta en domänöverföring. Ange auth-koden när du uppmanas.</p>
              </Step>
              <Step n={4} title="Vänta på överföring">
                <p>Överföringsprocessen tar vanligtvis 5–7 dagar. Du kan behöva godkänna överföringen via e-post.</p>
              </Step>

              <WarningBox title="Viktig information om överföring">
                <p>
                  Om ingen överföring påbörjas inom 14 dagar låses domänen automatiskt igen.
                  Domänen måste vara minst 60 dagar gammal för att kunna överföras (ICANN-policy).
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Ta bort en domän</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Du kan ta bort en egen (kopplad) domän från ditt konto. Domänen kopplas
                bort från din webbplats och kan kopplas till ett annat konto eller tjänst.
              </p>
              <WarningBox title="Köpta domäner">
                <p>
                  Köpta domäner kan inte &quot;tas bort&quot; på samma sätt. Du behöver antingen låta
                  registreringen löpa ut (stäng av automatisk förnyelse) eller överföra
                  domänen till en annan registrator.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Domänstatus</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Betydelse</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Åtgärd</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Väntar</span></td>
                      <td className="px-4 py-3">DNS-verifiering pågår</td>
                      <td className="px-4 py-3">Lägg till DNS-poster och klicka Verifiera</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Aktiv</span></td>
                      <td className="px-4 py-3">Domänen är verifierad och live</td>
                      <td className="px-4 py-3">Ingen åtgärd krävs</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Misslyckad</span></td>
                      <td className="px-4 py-3">Verifieringen misslyckades</td>
                      <td className="px-4 py-3">Kontrollera DNS-poster och försök igen</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Köpt</span></td>
                      <td className="px-4 py-3">Domänen är registrerad via Qvicko</td>
                      <td className="px-4 py-3">Tilldela till en webbplats</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Utgången</span></td>
                      <td className="px-4 py-3">Registreringen har löpt ut</td>
                      <td className="px-4 py-3">Förnya domänen</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        en: {
          title: "Manage your domains",
          description: "Learn how to manage domain locks, auto-renewal, transfers to other registrars, and assignment to websites.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                In the Qvicko dashboard, you have full control over all your domains. Here we explain
                the different management actions you can perform.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Assign domain to website</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                A domain that isn&apos;t connected to a website only shows a parking page.
                To make your domain show your content, you need to assign it to one of your sites.
              </p>
              <Step n={1} title="Go to Domains">
                <p>Navigate to <strong>Dashboard → Domains</strong>.</p>
              </Step>
              <Step n={2} title="Select domain">
                <p>Click on the domain you want to assign.</p>
              </Step>
              <Step n={3} title="Assign">
                <p>Click <strong>&quot;Assign to site&quot;</strong> and choose which website the domain should point to.</p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Auto-renewal</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Purchased domains have auto-renewal enabled by default. This means the domain
                renews automatically before the registration period expires, so you never
                risk losing your domain.
              </p>
              <InfoBox title="How it works">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Payment is automatically charged to your registered payment card</li>
                  <li>You receive an email notification before renewal</li>
                  <li>You can turn off auto-renewal at any time</li>
                  <li>If payment fails, you get a warning and can renew manually</li>
                </ul>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Domain lock</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The domain lock protects your domain from unauthorized transfer. It&apos;s enabled by
                default and should remain on unless you plan to move the domain.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <h4 className="font-semibold text-green-800">Locked (recommended)</h4>
                  <p className="mt-1 text-sm text-green-700">The domain cannot be transferred to another registrar. Protects against unauthorized transfer.</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h4 className="font-semibold text-amber-800">Unlocked</h4>
                  <p className="mt-1 text-sm text-amber-700">The domain can be transferred. Auto-locks after 14 days if no transfer is initiated.</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Transfer domain to another registrar</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you want to move your purchased domain to another registrar, follow these steps:
              </p>
              <Step n={1} title="Prepare the transfer">
                <p>Click <strong>&quot;Prepare transfer&quot;</strong> on the domain. The domain lock is removed automatically.</p>
              </Step>
              <Step n={2} title="Copy the auth code">
                <p>You receive an EPP/auth code needed at the new registrar. The code is displayed in the dashboard.</p>
              </Step>
              <Step n={3} title="Start the transfer">
                <p>Go to your new registrar and start a domain transfer. Enter the auth code when prompted.</p>
              </Step>
              <Step n={4} title="Wait for transfer">
                <p>The transfer process typically takes 5–7 days. You may need to approve the transfer via email.</p>
              </Step>

              <WarningBox title="Important transfer information">
                <p>
                  If no transfer is initiated within 14 days, the domain automatically locks again.
                  The domain must be at least 60 days old to be transferred (ICANN policy).
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Remove a domain</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                You can remove a custom (connected) domain from your account. The domain is
                disconnected from your website and can be connected to another account or service.
              </p>
              <WarningBox title="Purchased domains">
                <p>
                  Purchased domains cannot be &quot;removed&quot; in the same way. You need to either let
                  the registration expire (turn off auto-renewal) or transfer the domain
                  to another registrar.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Domain status</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-border-theme">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-theme bg-background">
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Meaning</th>
                      <th className="px-4 py-3 text-left font-semibold text-primary-deep">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Pending</span></td>
                      <td className="px-4 py-3">DNS verification in progress</td>
                      <td className="px-4 py-3">Add DNS records and click Verify</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span></td>
                      <td className="px-4 py-3">Domain is verified and live</td>
                      <td className="px-4 py-3">No action required</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Failed</span></td>
                      <td className="px-4 py-3">Verification failed</td>
                      <td className="px-4 py-3">Check DNS records and try again</td>
                    </tr>
                    <tr className="border-b border-border-theme">
                      <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Purchased</span></td>
                      <td className="px-4 py-3">Domain is registered via Qvicko</td>
                      <td className="px-4 py-3">Assign to a website</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Expired</span></td>
                      <td className="px-4 py-3">Registration has expired</td>
                      <td className="px-4 py-3">Renew the domain</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
      },
    },
  ],
};
