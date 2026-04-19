import { setRequestLocale } from "next-intl/server";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return locale === "sv" ? <TermsSV /> : <TermsEN />;
}

/* ------------------------------------------------------------------ */
/* SWEDISH VERSION                                                     */
/* ------------------------------------------------------------------ */

function TermsSV() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-primary-deep">
        Allmanna villkor
      </h1>
      <p className="mt-2 text-text-muted">
        Senast uppdaterad: 17 april 2026
      </p>

      <div className="mt-12 space-y-10 text-text-secondary leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary-deep [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary-deep [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1">

        <section>
          <h2>1. Introduktion</h2>
          <p>
            Dessa allmanna villkor (&quot;Villkoren&quot;) reglerar din anvandning av webbplatsen qvicko.com och alla relaterade tjanster (&quot;Tjansten&quot;) som tillhandahalls av Everly AB, organisationsnummer 559337-9059, med adress Kubiken, Sundsvall, Sverige (&quot;Everly&quot;, &quot;vi&quot;, &quot;oss&quot; eller &quot;var&quot;).
          </p>
          <p>
            Genom att skapa ett konto, anvanda Tjansten eller besoka var webbplats samtycker du till dessa Villkor. Om du inte godkanner Villkoren, vanligan anvand inte Tjansten.
          </p>
          <p>
            Kontaktuppgifter:<br />
            Everly AB<br />
            Kubiken, Sundsvall, Sverige<br />
            Organisationsnummer: SE559337-9059<br />
            E-post: help@qvicko.com<br />
            Ansvarig: william@qvicko.com
          </p>
        </section>

        <section>
          <h2>2. Definitioner</h2>
          <ul>
            <li><strong>&quot;Anvandare&quot;</strong> — varje fysisk eller juridisk person som skapar ett konto pa Tjansten.</li>
            <li><strong>&quot;Innehall&quot;</strong> — all text, bilder, logotyper, data, webbsidor och annat material som en Anvandare publicerar, laddar upp eller genererar via Tjansten.</li>
            <li><strong>&quot;Hostade webbplatser&quot;</strong> — de webbsidor som genereras och/eller publiceras av Anvandare genom Tjansten och som hostas pa Everlys infrastruktur.</li>
            <li><strong>&quot;Personuppgifter&quot;</strong> — all information som direkt eller indirekt kan kopplas till en identifierbar fysisk person, i enlighet med EU:s dataskyddsforordning (GDPR).</li>
          </ul>
        </section>

        <section>
          <h2>3. Tjanstebeskrivning</h2>
          <p>
            Qvicko ar en plattform som gor det mojligt for Anvandare att fa en webbplats genererad baserat pa befintlig natvaro, redigera och anpassa den, och publicera den med en subdomaan eller egen doman. Tjansten inkluderar:
          </p>
          <ul>
            <li>AI-driven webbplatsgenerering baserat pa scraping av befintliga webbplatser</li>
            <li>Visuell redigering av genererade webbplatser</li>
            <li>Hosting av publicerade webbplatser pa Everlys infrastruktur</li>
            <li>Subdoman- och domananslutning</li>
            <li>Analys och besoksstatistik</li>
          </ul>
        </section>

        <section>
          <h2>4. Konto och registrering</h2>
          <h3>4.1 Kontovillkor</h3>
          <p>
            For att anvanda Tjansten maste du skapa ett konto. Du intygar att:
          </p>
          <ul>
            <li>Du ar minst 18 ar gammal eller har vardnadshavares samtycke.</li>
            <li>Alla uppgifter du anger ar korrekta och fullstandiga.</li>
            <li>Du ar ansvarig for att halla dina inloggningsuppgifter sakra.</li>
            <li>Du omedelbart meddelar oss vid obehörig anvandning av ditt konto.</li>
          </ul>
          <h3>4.2 Organisationskonton</h3>
          <p>
            Om du registrerar ett konto pa uppdrag av en organisation (foretag, forening etc.) garanterar du att du har behorighet att binda organisationen till dessa Villkor. Organisationen ar ansvarig for all anvandning under kontot.
          </p>
        </section>

        <section>
          <h2>5. Anvandarens ansvar for innehall</h2>
          <h3>5.1 Agande och ansvar</h3>
          <p>
            Anvandaren behaller aganderatt till allt Innehall som publiceras via Tjansten. <strong>Varje Anvandare och/eller organisation som hostar en webbplats genom Tjansten ar fullt ut ansvarig for allt Innehall som publiceras pa deras webbplats.</strong>
          </p>
          <p>
            Everly agerar enbart som teknisk hostingleverantor och ar inte redaktionellt ansvarig for det Innehall som Anvandare publicerar. Everly granskar inte Innehall i forhand, men forbehaller sig ratten att ta bort Innehall som bryter mot dessa Villkor.
          </p>
          <h3>5.2 Licens till Everly</h3>
          <p>
            Genom att publicera Innehall pa Tjansten ger du Everly en icke-exklusiv, royaltyfri, varldsomspannande licens att lagra, visa, distribuera och tekniskt behandla ditt Innehall i den utstrackning som kravs for att tillhandahalla Tjansten.
          </p>
        </section>

        <section>
          <h2>6. Forbjudet innehall och anvandning</h2>
          <p>
            Foljande innehall och beteenden ar strangligen forbjudna pa Tjansten:
          </p>
          <h3>6.1 Forbjudet innehall</h3>
          <ul>
            <li>Innehall som bryter mot svensk lag eller EU-lagstiftning</li>
            <li>Material som gor intrang i tredje parts upphovsratt, varumarke eller andra immaterialrattsliga rattigheter</li>
            <li>Barnpornografi eller sexuellt exploaterande material som involverar minderariga</li>
            <li>Hatretorik, rasism, diskriminering eller uppvigling till vald mot nagon grupp</li>
            <li>Bedrageri, phishing, identitetsstold eller annan vilseledande verksamhet</li>
            <li>Skadlig programvara, virus, spyware eller annan skadlig kod</li>
            <li>Olaglig forsaljning av vapen, narkotika, receptbelagda lakemedel eller andra kontrollerade substanser</li>
            <li>Spam, massutskick eller annat ooenskat kommersiellt innehall</li>
            <li>Personuppgifter om tredje person utan dennes samtycke</li>
            <li>Innehall som ar avsett att vilseleda konsumenter i strid med marknadsforingslagen</li>
          </ul>
          <h3>6.2 Forbjudet beteende</h3>
          <ul>
            <li>Forsok att fa obehörig atkomst till Tjanstens system eller andra Anvandares konton</li>
            <li>Belastningsattacker (DDoS) eller andra forsok att storja Tjanstens funktion</li>
            <li>Automatiserad datainsamling (scraping) av Tjanstens innehall utan tillstand</li>
            <li>Anvandning av Tjansten for att kranka tredje parts rattigheter</li>
            <li>Kringgaende av tekniska skyddsatgarder eller begransningar</li>
          </ul>
          <h3>6.3 Atgarder vid overträdelse</h3>
          <p>
            Vid overträdelse av ovanstaende forbehaller sig Everly ratten att:
          </p>
          <ol>
            <li>Omedelbart ta bort det otilllatna Innehallet</li>
            <li>Tillfälligt suspendera Anvandarens konto</li>
            <li>Permanent stanga Anvandarens konto utan aterbetalning</li>
            <li>Rapportera overträdelsen till relevant myndighet</li>
            <li>Krava skadestand for eventuell skada som orsakats Everly</li>
          </ol>
        </section>

        <section>
          <h2>7. Immaterialratt</h2>
          <h3>7.1 Everlys rattigheter</h3>
          <p>
            Tjansten, inkluderande men inte begransat till programvara, design, logotyper, varumarken och dokumentation, ags av Everly AB eller dess licensgivare och skyddas av svensk och internationell upphovsrattslagstiftning.
          </p>
          <h3>7.2 AI-genererat innehall</h3>
          <p>
            Webbplatser som genereras av Tjanstens AI-funktion baseras pa Anvandarens befintliga innehall och material. Anvandaren erhaller full anvandningsratt till det genererade materialet for sin egen webbplats. Everly gor inga ansprak pa aganderatt till AI-genererat innehall som skapats for Anvandarens rakning.
          </p>
        </section>

        <section>
          <h2>8. Priser och betalning</h2>
          <p>
            Aktuella priser och planer framgar av Tjanstens prissida. Everly forbehaller sig ratten att andra priser med 30 dagars forvarning. For betalande planer galler:
          </p>
          <ul>
            <li>Betalning sker i forskott for vald period.</li>
            <li>Vid utebliven betalning kan Tjansten begransas eller avslutas.</li>
            <li>Aterbetalning sker i enlighet med konsumentkopslagen (for konsumenter) eller enligt overenskommelse (for foretag).</li>
          </ul>
        </section>

        <section>
          <h2>9. Uppsagning och avslut av konto</h2>
          <h3>9.1 Anvandarens uppsagning</h3>
          <p>
            Du kan nar som helst saga upp ditt konto genom att kontakta oss via help@qvicko.com eller genom kontoinstellningarna i din dashboard. Vid uppsagning:
          </p>
          <ul>
            <li>Dina publicerade webbplatser avpubliceras inom 30 dagar.</li>
            <li>Ditt innehall raderas permanent inom 90 dagar efter uppsagning.</li>
            <li>Redan betalda perioder aterbetalas inte om inte annat foljer av lag.</li>
          </ul>
          <h3>9.2 Radering av konto (Right to Erasure)</h3>
          <p>
            I enlighet med GDPR artikel 17 har du ratt att begara radering av ditt konto och alla tillhorande personuppgifter. Du kan begara radering genom att:
          </p>
          <ul>
            <li>Skicka e-post till help@qvicko.com med amne &quot;Radering av konto&quot;</li>
            <li>Anvanda raderingsfunktionen i kontoinstellningarna</li>
          </ul>
          <p>
            Vi behandlar raderingsbegaran inom 30 dagar i enlighet med GDPR. Viss information kan behova bevaras i enlighet med bokforingslagen (7 ar).
          </p>
          <h3>9.3 Everlys uppsagning</h3>
          <p>
            Everly forbehaller sig ratten att saga upp eller suspendera ett konto vid overträdelse av dessa Villkor, olaglig aktivitet eller av affärsmässiga skal med 30 dagars forvarning.
          </p>
        </section>

        <section>
          <h2>10. Dataskydd och GDPR</h2>
          <h3>10.1 Personuppgiftsansvarig</h3>
          <p>
            Everly AB ar personuppgiftsansvarig for de personuppgifter som behandlas inom ramen for Tjansten. For fragor om dataskydd, kontakta oss pa help@qvicko.com.
          </p>
          <h3>10.2 Insamling av personuppgifter</h3>
          <p>Vi samlar in foljande kategorier av personuppgifter:</p>
          <ul>
            <li><strong>Kontouppgifter:</strong> Namn, e-postadress, telefonnummer, foretagsnamn, organisationsnummer</li>
            <li><strong>Teknisk data:</strong> IP-adress, webblasare, enhetsinformation, operativsystem</li>
            <li><strong>Anvandningsdata:</strong> Sidvisningar, klick, sessionslangd, funktionsanvandning</li>
            <li><strong>Kommunikation:</strong> E-post och supportarenden</li>
          </ul>
          <h3>10.3 Rattslig grund for behandling</h3>
          <p>Vi behandlar personuppgifter baserat pa:</p>
          <ul>
            <li><strong>Avtal (Art. 6.1.b GDPR):</strong> For att tillhandahalla Tjansten och uppfylla vara avtalsforpliktelser</li>
            <li><strong>Berättigat intresse (Art. 6.1.f GDPR):</strong> For sakerhets- och prestandaandamal</li>
            <li><strong>Samtycke (Art. 6.1.a GDPR):</strong> For marknadsforingskommunikation och icke-nödvandiga cookies</li>
            <li><strong>Rattslig forpliktelse (Art. 6.1.c GDPR):</strong> For bokforing och skatteandamal</li>
          </ul>
          <h3>10.4 Dina rattigheter enligt GDPR</h3>
          <p>Du har foljande rattigheter avseende dina personuppgifter:</p>
          <ul>
            <li><strong>Ratt till tillgang</strong> — begara en kopia av dina personuppgifter</li>
            <li><strong>Ratt till rattelse</strong> — korrigera felaktiga uppgifter</li>
            <li><strong>Ratt till radering</strong> — begara att dina uppgifter raderas (&quot;ratten att bli glomd&quot;)</li>
            <li><strong>Ratt till begransning</strong> — begara begransad behandling under vissa omstandigheter</li>
            <li><strong>Ratt till dataportabilitet</strong> — fa dina uppgifter i ett maskinlasbart format</li>
            <li><strong>Ratt att gora invandningar</strong> — invanda mot behandling baserad pa berattigat intresse</li>
            <li><strong>Ratt att aterkalla samtycke</strong> — nar som helst aterkalla ett givet samtycke</li>
          </ul>
          <p>
            Du har aven ratt att inge klagomal till Integritetsskyddsmyndigheten (IMY), Box 8114, 104 20 Stockholm, imy.se.
          </p>
          <h3>10.5 Lagringstid</h3>
          <p>
            Personuppgifter lagras sa lange kontot ar aktivt och darefter i hogst 90 dagar, med undantag for uppgifter som maste bevaras enligt lag (t.ex. bokforingslagen, 7 ar).
          </p>
          <h3>10.6 Tredjelandsoverforing</h3>
          <p>
            Dina personuppgifter kan overforas till lander utanfor EU/EES for att tillhandahalla Tjansten (t.ex. molntjanster). Sadana overforingar sker med lampliga skyddsatgarder i enlighet med GDPR kapitel V, inklusive EU-kommissionens standardavtalsklausuler (SCC).
          </p>
          <h3>10.7 Personuppgiftsbitradesavtal</h3>
          <p>
            Nar Anvandaren samlar in och lagrar personuppgifter om sina besokare genom hostade webbplatser, agerar Everly som personuppgiftsbitrade. I sadana fall galler tillampliga villkor for personuppgiftsbitraden enligt GDPR artikel 28.
          </p>
        </section>

        <section>
          <h2>11. Cookies och sparningstekniker</h2>
          <h3>11.1 Vad ar cookies?</h3>
          <p>
            Cookies ar sma textfiler som lagras pa din enhet nar du besoker var webbplats. Vi anvander cookies och liknande tekniker for att tillhandahalla, skydda och forbattra Tjansten.
          </p>
          <h3>11.2 Typer av cookies vi anvander</h3>
          <ul>
            <li><strong>Nödvandiga cookies:</strong> Kravs for att Tjansten ska fungera (t.ex. inloggning, sessionhantering, CSRF-skydd). Dessa kräver inte samtycke.</li>
            <li><strong>Funktionscookies:</strong> Sparar dina preferenser (t.ex. sprak, tema). Aktiveras med ditt samtycke.</li>
            <li><strong>Analyscookies:</strong> Hjalper oss forsta hur Tjansten anvands (t.ex. sidvisningar, prestanda). Aktiveras med ditt samtycke.</li>
          </ul>
          <h3>11.3 Hantering av cookies</h3>
          <p>
            Du kan hantera dina cookie-installningar via var cookie-banner vid forsta besoket eller genom din webblasares installningar. Observera att blockering av nödvandiga cookies kan paverka Tjanstens funktion.
          </p>
          <h3>11.4 Tredjepartscookies</h3>
          <p>
            Vi anvander inga tredjepartscookies for annonsering. Eventuella tredjepartstjanster (t.ex. betalningsleverantorer) kan anvanda egna cookies enligt sina respektive integritetspolicyer.
          </p>
        </section>

        <section>
          <h2>12. Tillganglighet och garanti</h2>
          <h3>12.1 Tjanstens tillganglighet</h3>
          <p>
            Everly stravar efter att erbjuda hog tillganglighet men garanterar inte oavbruten drift. Planerat underhall aviseras i forväg nar det ar mojligt.
          </p>
          <h3>12.2 Ansvarsbegransning</h3>
          <p>
            Tjansten tillhandahalls &quot;i befintligt skick&quot;. Everly ansvarar inte for:
          </p>
          <ul>
            <li>Forlust av data, intakter eller affärsmojligheter till foljd av anvandning av Tjansten</li>
            <li>Skada orsakad av tredje parts handlingar, inklusive hackning eller dataintrang</li>
            <li>Tillfälliga avbrott eller prestandaforandringar</li>
            <li>Innehall som publiceras av Anvandare</li>
          </ul>
          <p>
            Everlys totala ansvar under dessa Villkor ar begransat till det belopp Anvandaren har betalat for Tjansten under de senaste 12 manaderna.
          </p>
        </section>

        <section>
          <h2>13. Andring av villkor</h2>
          <p>
            Everly kan uppdatera dessa Villkor. Vasentliga andringar meddelas minst 30 dagar i forväg via e-post och/eller i Tjansten. Fortsatt anvandning efter meddelad andring utgör godkannande av de uppdaterade Villkoren.
          </p>
        </section>

        <section>
          <h2>14. Tillamplig lag och tvistlosning</h2>
          <p>
            Dessa Villkor lyder under svensk lag. Tvister ska i forsta hand losas genom forhandling. Om overenskommelse inte nas, ska tvisten avgorjas av svensk allmaan domstol med Sundsvalls tingsratt som forsta instans.
          </p>
          <p>
            For konsumenter inom EU galler aven ratten att vanda sig till Allmaanna reklamationsnamnden (ARN) eller EU:s plattform for tvistlosning online (ODR): <a href="https://ec.europa.eu/consumers/odr" className="text-primary underline hover:text-primary-deep" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
          </p>
        </section>

        <section>
          <h2>15. Force majeure</h2>
          <p>
            Everly ansvarar inte for forseningar eller utebliven prestation som orsakas av omstandigheter utanfor Everlys kontroll, inklusive men inte begransat till naturkatastrofer, krig, pandemi, strejk, myndighetsatgarder, elavbrott eller stoerningar i internetforbindelser.
          </p>
        </section>

        <section>
          <h2>16. Ovriga bestammelser</h2>
          <h3>16.1 Overdragelse</h3>
          <p>
            Anvandaren far inte overlata sina rattigheter eller skyldigheter enligt dessa Villkor utan Everlys skriftliga samtycke. Everly kan overlata sina rattigheter och skyldigheter till en tredje part i samband med forsaljning eller fusion.
          </p>
          <h3>16.2 Ogiltighet</h3>
          <p>
            Om nagon bestammelse i dessa Villkor befinns vara ogiltig, ska ovriga bestammelser forstatt galla i full utstrackning.
          </p>
          <h3>16.3 Fullstandigt avtal</h3>
          <p>
            Dessa Villkor, tillsammans med eventuella tillaaggs- eller specialvillkor, utgör det fullstandiga avtalet mellan dig och Everly avseende Tjansten.
          </p>
        </section>

        <section>
          <h2>17. Kontaktinformation</h2>
          <p>
            For fragor om dessa Villkor, kontakta oss:
          </p>
          <p>
            Everly AB<br />
            Kubiken, Sundsvall, Sverige<br />
            Org.nr: SE559337-9059<br />
            E-post: <a href="mailto:help@qvicko.com" className="text-primary underline hover:text-primary-deep">help@qvicko.com</a><br />
            Ansvarig: <a href="mailto:william@qvicko.com" className="text-primary underline hover:text-primary-deep">william@qvicko.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ENGLISH VERSION                                                     */
/* ------------------------------------------------------------------ */

function TermsEN() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-primary-deep">
        Terms and Conditions
      </h1>
      <p className="mt-2 text-text-muted">
        Last updated: April 17, 2026
      </p>

      <div className="mt-12 space-y-10 text-text-secondary leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary-deep [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary-deep [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1">

        <section>
          <h2>1. Introduction</h2>
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your use of the website qvicko.com and all related services (&quot;Service&quot;) provided by Everly AB, registration number 559337-9059, with address Kubiken, Sundsvall, Sweden (&quot;Everly&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;).
          </p>
          <p>
            By creating an account, using the Service or visiting our website, you agree to these Terms. If you do not accept these Terms, please do not use the Service.
          </p>
          <p>
            Contact information:<br />
            Everly AB<br />
            Kubiken, Sundsvall, Sweden<br />
            Registration number: SE559337-9059<br />
            Email: help@qvicko.com<br />
            Responsible: william@qvicko.com
          </p>
        </section>

        <section>
          <h2>2. Definitions</h2>
          <ul>
            <li><strong>&quot;User&quot;</strong> — any natural or legal person who creates an account on the Service.</li>
            <li><strong>&quot;Content&quot;</strong> — all text, images, logos, data, web pages and other material that a User publishes, uploads or generates through the Service.</li>
            <li><strong>&quot;Hosted Websites&quot;</strong> — the web pages generated and/or published by Users through the Service and hosted on Everly&apos;s infrastructure.</li>
            <li><strong>&quot;Personal Data&quot;</strong> — any information that can directly or indirectly be linked to an identifiable natural person, in accordance with the EU General Data Protection Regulation (GDPR).</li>
          </ul>
        </section>

        <section>
          <h2>3. Service Description</h2>
          <p>
            Qvicko is a platform that enables Users to have a website generated based on their existing online presence, edit and customize it, and publish it with a subdomain or custom domain. The Service includes:
          </p>
          <ul>
            <li>AI-powered website generation based on scraping of existing websites</li>
            <li>Visual editing of generated websites</li>
            <li>Hosting of published websites on Everly&apos;s infrastructure</li>
            <li>Subdomain and custom domain connection</li>
            <li>Analytics and visitor statistics</li>
          </ul>
        </section>

        <section>
          <h2>4. Account and Registration</h2>
          <h3>4.1 Account Requirements</h3>
          <p>
            To use the Service, you must create an account. You represent and warrant that:
          </p>
          <ul>
            <li>You are at least 18 years old or have parental/guardian consent.</li>
            <li>All information you provide is accurate and complete.</li>
            <li>You are responsible for maintaining the security of your login credentials.</li>
            <li>You will immediately notify us of any unauthorized use of your account.</li>
          </ul>
          <h3>4.2 Organization Accounts</h3>
          <p>
            If you register an account on behalf of an organization (company, association, etc.), you warrant that you have the authority to bind the organization to these Terms. The organization is responsible for all use under the account.
          </p>
        </section>

        <section>
          <h2>5. User Responsibility for Content</h2>
          <h3>5.1 Ownership and Liability</h3>
          <p>
            The User retains ownership of all Content published through the Service. <strong>Each User and/or organization that hosts a website through the Service is fully responsible for all Content published on their website.</strong>
          </p>
          <p>
            Everly acts solely as a technical hosting provider and is not editorially responsible for Content published by Users. Everly does not review Content in advance but reserves the right to remove Content that violates these Terms.
          </p>
          <h3>5.2 License to Everly</h3>
          <p>
            By publishing Content on the Service, you grant Everly a non-exclusive, royalty-free, worldwide license to store, display, distribute and technically process your Content to the extent necessary to provide the Service.
          </p>
        </section>

        <section>
          <h2>6. Prohibited Content and Use</h2>
          <p>
            The following content and behaviors are strictly prohibited on the Service:
          </p>
          <h3>6.1 Prohibited Content</h3>
          <ul>
            <li>Content that violates Swedish law or EU legislation</li>
            <li>Material that infringes third-party copyright, trademark or other intellectual property rights</li>
            <li>Child sexual abuse material or sexually exploitative material involving minors</li>
            <li>Hate speech, racism, discrimination or incitement to violence against any group</li>
            <li>Fraud, phishing, identity theft or other deceptive activities</li>
            <li>Malware, viruses, spyware or other malicious code</li>
            <li>Illegal sale of weapons, narcotics, prescription drugs or other controlled substances</li>
            <li>Spam, mass mailing or other unsolicited commercial content</li>
            <li>Personal data of third parties without their consent</li>
            <li>Content intended to mislead consumers in violation of marketing legislation</li>
          </ul>
          <h3>6.2 Prohibited Behavior</h3>
          <ul>
            <li>Attempting to gain unauthorized access to the Service&apos;s systems or other Users&apos; accounts</li>
            <li>Denial-of-service attacks (DDoS) or other attempts to disrupt the Service</li>
            <li>Automated data collection (scraping) of the Service&apos;s content without permission</li>
            <li>Using the Service to violate third-party rights</li>
            <li>Circumventing technical security measures or limitations</li>
          </ul>
          <h3>6.3 Enforcement Actions</h3>
          <p>
            In case of violation, Everly reserves the right to:
          </p>
          <ol>
            <li>Immediately remove the offending Content</li>
            <li>Temporarily suspend the User&apos;s account</li>
            <li>Permanently terminate the User&apos;s account without refund</li>
            <li>Report the violation to relevant authorities</li>
            <li>Seek damages for any harm caused to Everly</li>
          </ol>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <h3>7.1 Everly&apos;s Rights</h3>
          <p>
            The Service, including but not limited to software, design, logos, trademarks and documentation, is owned by Everly AB or its licensors and is protected by Swedish and international copyright law.
          </p>
          <h3>7.2 AI-Generated Content</h3>
          <p>
            Websites generated by the Service&apos;s AI feature are based on the User&apos;s existing content and materials. The User receives full usage rights to the generated material for their own website. Everly makes no ownership claims to AI-generated content created for the User.
          </p>
        </section>

        <section>
          <h2>8. Pricing and Payment</h2>
          <p>
            Current prices and plans are displayed on the Service&apos;s pricing page. Everly reserves the right to change prices with 30 days&apos; notice. For paid plans:
          </p>
          <ul>
            <li>Payment is made in advance for the selected period.</li>
            <li>Failure to pay may result in limitation or termination of the Service.</li>
            <li>Refunds are provided in accordance with the Swedish Consumer Sales Act (for consumers) or by agreement (for businesses).</li>
          </ul>
        </section>

        <section>
          <h2>9. Termination and Account Deletion</h2>
          <h3>9.1 User Termination</h3>
          <p>
            You may terminate your account at any time by contacting us at help@qvicko.com or through your account settings in the dashboard. Upon termination:
          </p>
          <ul>
            <li>Your published websites will be unpublished within 30 days.</li>
            <li>Your content will be permanently deleted within 90 days after termination.</li>
            <li>Already paid periods will not be refunded unless required by law.</li>
          </ul>
          <h3>9.2 Account Deletion (Right to Erasure)</h3>
          <p>
            In accordance with GDPR Article 17, you have the right to request deletion of your account and all associated personal data. You can request deletion by:
          </p>
          <ul>
            <li>Sending an email to help@qvicko.com with subject &quot;Account Deletion&quot;</li>
            <li>Using the deletion function in your account settings</li>
          </ul>
          <p>
            We will process deletion requests within 30 days in accordance with GDPR. Certain information may need to be retained in accordance with the Swedish Bookkeeping Act (7 years).
          </p>
          <h3>9.3 Termination by Everly</h3>
          <p>
            Everly reserves the right to terminate or suspend an account for violation of these Terms, illegal activity, or for business reasons with 30 days&apos; notice.
          </p>
        </section>

        <section>
          <h2>10. Data Protection and GDPR</h2>
          <h3>10.1 Data Controller</h3>
          <p>
            Everly AB is the data controller for personal data processed within the scope of the Service. For data protection inquiries, contact us at help@qvicko.com.
          </p>
          <h3>10.2 Collection of Personal Data</h3>
          <p>We collect the following categories of personal data:</p>
          <ul>
            <li><strong>Account data:</strong> Name, email address, phone number, company name, organization number</li>
            <li><strong>Technical data:</strong> IP address, browser, device information, operating system</li>
            <li><strong>Usage data:</strong> Page views, clicks, session duration, feature usage</li>
            <li><strong>Communications:</strong> Emails and support tickets</li>
          </ul>
          <h3>10.3 Legal Basis for Processing</h3>
          <p>We process personal data based on:</p>
          <ul>
            <li><strong>Contract (Art. 6.1.b GDPR):</strong> To provide the Service and fulfill our contractual obligations</li>
            <li><strong>Legitimate interest (Art. 6.1.f GDPR):</strong> For security and performance purposes</li>
            <li><strong>Consent (Art. 6.1.a GDPR):</strong> For marketing communications and non-essential cookies</li>
            <li><strong>Legal obligation (Art. 6.1.c GDPR):</strong> For accounting and tax purposes</li>
          </ul>
          <h3>10.4 Your Rights Under GDPR</h3>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access</strong> — request a copy of your personal data</li>
            <li><strong>Right to rectification</strong> — correct inaccurate data</li>
            <li><strong>Right to erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Right to restriction</strong> — request restricted processing under certain circumstances</li>
            <li><strong>Right to data portability</strong> — receive your data in a machine-readable format</li>
            <li><strong>Right to object</strong> — object to processing based on legitimate interest</li>
            <li><strong>Right to withdraw consent</strong> — withdraw a given consent at any time</li>
          </ul>
          <p>
            You also have the right to lodge a complaint with the Swedish Authority for Privacy Protection (IMY), Box 8114, 104 20 Stockholm, imy.se. For other EU/EEA residents, complaints may be filed with your local data protection authority.
          </p>
          <h3>10.5 Retention Period</h3>
          <p>
            Personal data is stored for as long as the account is active and thereafter for a maximum of 90 days, with the exception of data that must be retained by law (e.g., the Swedish Bookkeeping Act, 7 years).
          </p>
          <h3>10.6 International Transfers</h3>
          <p>
            Your personal data may be transferred to countries outside the EU/EEA to provide the Service (e.g., cloud services). Such transfers are made with appropriate safeguards in accordance with GDPR Chapter V, including EU Commission Standard Contractual Clauses (SCCs).
          </p>
          <h3>10.7 Data Processing Agreement</h3>
          <p>
            When the User collects and stores personal data about their visitors through hosted websites, Everly acts as a data processor. In such cases, applicable terms for data processors under GDPR Article 28 apply.
          </p>
        </section>

        <section>
          <h2>11. Cookies and Tracking Technologies</h2>
          <h3>11.1 What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your device when you visit our website. We use cookies and similar technologies to provide, protect and improve the Service.
          </p>
          <h3>11.2 Types of Cookies We Use</h3>
          <ul>
            <li><strong>Essential cookies:</strong> Required for the Service to function (e.g., login, session management, CSRF protection). These do not require consent.</li>
            <li><strong>Functional cookies:</strong> Store your preferences (e.g., language, theme). Activated with your consent.</li>
            <li><strong>Analytics cookies:</strong> Help us understand how the Service is used (e.g., page views, performance). Activated with your consent.</li>
          </ul>
          <h3>11.3 Managing Cookies</h3>
          <p>
            You can manage your cookie settings via our cookie banner on your first visit or through your browser settings. Note that blocking essential cookies may affect the functionality of the Service.
          </p>
          <h3>11.4 Third-Party Cookies</h3>
          <p>
            We do not use third-party cookies for advertising. Any third-party services (e.g., payment providers) may use their own cookies according to their respective privacy policies.
          </p>
        </section>

        <section>
          <h2>12. Availability and Warranty</h2>
          <h3>12.1 Service Availability</h3>
          <p>
            Everly strives to offer high availability but does not guarantee uninterrupted operation. Scheduled maintenance will be announced in advance when possible.
          </p>
          <h3>12.2 Limitation of Liability</h3>
          <p>
            The Service is provided &quot;as is&quot;. Everly is not liable for:
          </p>
          <ul>
            <li>Loss of data, revenue or business opportunities resulting from use of the Service</li>
            <li>Damage caused by third-party actions, including hacking or data breaches</li>
            <li>Temporary outages or performance changes</li>
            <li>Content published by Users</li>
          </ul>
          <p>
            Everly&apos;s total liability under these Terms is limited to the amount the User has paid for the Service during the preceding 12 months.
          </p>
        </section>

        <section>
          <h2>13. Modifications to Terms</h2>
          <p>
            Everly may update these Terms. Material changes will be notified at least 30 days in advance via email and/or within the Service. Continued use after notification of changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2>14. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by Swedish law. Disputes shall first be resolved through negotiation. If agreement cannot be reached, the dispute shall be settled by the Swedish general courts with Sundsvall District Court as the court of first instance.
          </p>
          <p>
            For consumers within the EU, you also have the right to contact the Swedish National Board for Consumer Disputes (ARN) or the EU Online Dispute Resolution platform (ODR): <a href="https://ec.europa.eu/consumers/odr" className="text-primary underline hover:text-primary-deep" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
          </p>
        </section>

        <section>
          <h2>15. Force Majeure</h2>
          <p>
            Everly is not liable for delays or failure to perform caused by circumstances beyond Everly&apos;s control, including but not limited to natural disasters, war, pandemic, strikes, government actions, power outages or internet connectivity disruptions.
          </p>
        </section>

        <section>
          <h2>16. Miscellaneous</h2>
          <h3>16.1 Assignment</h3>
          <p>
            The User may not transfer their rights or obligations under these Terms without Everly&apos;s written consent. Everly may transfer its rights and obligations to a third party in connection with a sale or merger.
          </p>
          <h3>16.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be invalid, the remaining provisions shall continue in full force and effect.
          </p>
          <h3>16.3 Entire Agreement</h3>
          <p>
            These Terms, together with any supplementary or special terms, constitute the entire agreement between you and Everly regarding the Service.
          </p>
        </section>

        <section>
          <h2>17. Contact Information</h2>
          <p>
            For questions about these Terms, contact us:
          </p>
          <p>
            Everly AB<br />
            Kubiken, Sundsvall, Sweden<br />
            Reg. no: SE559337-9059<br />
            Email: <a href="mailto:help@qvicko.com" className="text-primary underline hover:text-primary-deep">help@qvicko.com</a><br />
            Responsible: <a href="mailto:william@qvicko.com" className="text-primary underline hover:text-primary-deep">william@qvicko.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
