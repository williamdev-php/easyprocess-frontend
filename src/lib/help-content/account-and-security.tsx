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
/*  CATEGORY: Konto & Sakerhet / Account & Security                   */
/* ================================================================== */

export const accountAndSecurityCategory: HelpCategory = {
  slug: "account-and-security",
  icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  label: {
    sv: {
      title: "Konto & Sakerhet",
      description: "Hantera din profil, losenord, inloggningsmetoder och kontosakerhet",
    },
    en: {
      title: "Account & Security",
      description: "Manage your profile, password, login methods, and account security",
    },
  },
  articles: [
    /* -------------------------------------------------------------- */
    /*  1. Overview                                                    */
    /* -------------------------------------------------------------- */
    {
      slug: "overview",
      category: "account-and-security",
      icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
      content: {
        sv: {
          title: "Kontosakerhet -- oversikt och basta praxis",
          description: "Lар dig hur Qvicko skyddar ditt konto och vad du kan gora for att halla det sakert.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko tar din kontosakerhet pa allvar. Ditt konto skyddas av flera
                lager av sakerhet -- fran krypterade losenord och JWT-baserad
                autentisering till automatiska kontolasningar och fullstandig
                granskningslogg.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Inbyggda sakerhetsatgarder</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  title="Krypterade losenord"
                  desc="Ditt losenord lagras med bcrypt-hashing och kan aldrig lasas i klartext."
                />
                <FeatureCard
                  icon="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  title="JWT-autentisering"
                  desc="Korttidslevande access-tokens och lAnglivade sessionstoken med automatisk fornyelse."
                />
                <FeatureCard
                  icon="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  title="Automatisk kontolasning"
                  desc="Kontot lasas i 15 minuter efter 5 misslyckade inloggningsforsoek."
                />
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Granskningslogg"
                  desc="Varje inloggning, losenordsbyte och sakerhetshandelse loggas med IP och tid."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sessionshantering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nar du loggar in skapas en <strong>session</strong> som kopplas till din enhet.
                Qvicko anvander ett system med betrodda enheter -- om du loggar in fran samma
                enhet flera ganger far den en langre sessionslivslangd. Du kan se och
                aterkalla alla aktiva sessioner under <strong>Konto</strong> i din dashboard.
              </p>

              <InfoBox title="Betrodda enheter">
                <p>
                  Nar du loggar in fran en enhet som du tidigare anvant kanner Qvicko igen
                  den via ett enhetsfingeravtryck (baserat pa webblasare och IP-subnаt). Betrodda
                  sessioner far forlangd giltighetstid sa att du inte behover logga in lika ofta.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">E-postverifiering</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nar du registrerar dig skickas ett verifieringsmail till din e-postadress.
                Klicka pa lanken i mailet for att bekrafta att du ager adressen. Du kan
                begara ett nytt verifieringsmail fran din dashboard om det forsta inte
                kom fram.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips for ett sakert konto</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Anvand ett <strong>starkt losenord</strong> med minst 12 tecken -- ju langre desto battre.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Anvand <strong>unika losenord</strong> -- ateranvand inte samma losenord pa flera tjanster.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Koppla ditt konto till <strong>Google</strong> eller <strong>Apple</strong> for snabb och saker inloggning.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Granska dina <strong>aktiva sessioner</strong> regelbundet och aterkalla de du inte kanner igen.</span>
                </li>
              </ul>
            </>
          ),
        },
        en: {
          title: "Account security -- overview and best practices",
          description: "Learn how Qvicko protects your account and what you can do to keep it secure.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko takes your account security seriously. Your account is protected by
                multiple layers of security -- from encrypted passwords and JWT-based
                authentication to automatic account lockouts and comprehensive audit
                logging.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Built-in security measures</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  title="Encrypted passwords"
                  desc="Your password is stored with bcrypt hashing and can never be read in plain text."
                />
                <FeatureCard
                  icon="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  title="JWT authentication"
                  desc="Short-lived access tokens and long-lived session tokens with automatic renewal."
                />
                <FeatureCard
                  icon="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  title="Automatic account lockout"
                  desc="Your account is locked for 15 minutes after 5 failed login attempts."
                />
                <FeatureCard
                  icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  title="Audit log"
                  desc="Every login, password change, and security event is logged with IP and timestamp."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Session management</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you log in, a <strong>session</strong> is created and linked to your device.
                Qvicko uses a trusted device system -- if you log in from the same device
                multiple times, it receives extended session lifetime. You can view and
                revoke all active sessions under <strong>Account</strong> in your dashboard.
              </p>

              <InfoBox title="Trusted devices">
                <p>
                  When you log in from a device you have previously used, Qvicko recognizes
                  it via a device fingerprint (based on browser and IP subnet). Trusted
                  sessions get extended validity so you don&apos;t have to log in as frequently.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Email verification</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you register, a verification email is sent to your email address.
                Click the link in the email to confirm you own the address. You can
                request a new verification email from your dashboard if the first one
                didn&apos;t arrive.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tips for a secure account</h2>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Use a <strong>strong password</strong> with at least 12 characters -- the longer the better.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Use <strong>unique passwords</strong> -- don&apos;t reuse the same password across services.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Link your account to <strong>Google</strong> or <strong>Apple</strong> for fast and secure login.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Review your <strong>active sessions</strong> regularly and revoke any you don&apos;t recognize.</span>
                </li>
              </ul>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  2. Manage Profile                                              */
    /* -------------------------------------------------------------- */
    {
      slug: "manage-profile",
      category: "account-and-security",
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
      content: {
        sv: {
          title: "Hantera din profil",
          description: "Lar dig hur du andrar ditt namn, foretagsuppgifter, telefonnummer, land och profilbild.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Pa sidan <strong>Konto</strong> i din dashboard kan du redigera din
                personliga information. Alla andringar sparas automatiskt -- du behover
                inte klicka pa nagon spara-knapp.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Sa nar du din profil</h2>
              <Step n={1} title="Oppna Konto">
                <p>
                  Klicka pa ditt namn eller din avatar langst ner i sidofaltet, eller navigera
                  direkt till <Code>/dashboard/account</Code>.
                </p>
              </Step>
              <Step n={2} title="Redigera dina uppgifter">
                <p>
                  Pa kontosidan ser du alla redigerbara falt. Skriv i nagot av falten sa
                  sparas andringen automatiskt efter en kort fordrojning.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Tillgangliga falt</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                  title="Fullstandigt namn"
                  desc="Ditt namn som visas i dashboarden och pa ditt konto."
                />
                <FeatureCard
                  icon="M2.25 21h19.5M3.75 3v18h16.5V3H3.75zm3 3.75h3v3h-3v-3zm6.75 0h3v3h-3v-3z"
                  title="Foretagsnamn"
                  desc="Valfritt. Ditt foretagsnamn for fakturering och kontoinformation."
                />
                <FeatureCard
                  icon="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                  title="Organisationsnummer"
                  desc="Valfritt. Ditt organisationsnummer for fakturor."
                />
                <FeatureCard
                  icon="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  title="Telefonnummer"
                  desc="Valfritt. Ditt telefonnummer for kontakt."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Byta profilbild (avatar)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Din profilbild visas i dashboarden och i ditt konto. Du kan ladda upp en
                bild via <strong>medievaljaren</strong> pa kontosidan. Om du loggat in med
                Google anvands din Google-profilbild automatiskt, men du kan byta den nar som helst.
              </p>
              <Step n={1} title="Ga till Konto">
                <p>Navigera till kontosidan i din dashboard.</p>
              </Step>
              <Step n={2} title="Klicka pa medievaljaren">
                <p>Bredvid din nuvarande avatar finns en knapp for att valja en ny bild. Klicka pa den for att oppna medievaljaren.</p>
              </Step>
              <Step n={3} title="Valj eller ladda upp en bild">
                <p>Valj en befintlig bild fran ditt mediabibliotek eller ladda upp en ny. Bilden sparas automatiskt.</p>
              </Step>

              <InfoBox title="E-postadressen kan inte andras">
                <p>
                  Din e-postadress visas pa kontosidan men ar <strong>skrivskyddad</strong>.
                  Om du behover byta e-postadress, kontakta Qvickos support.
                </p>
              </InfoBox>

              <InfoBox title="Automatisk sparning">
                <p>
                  Alla andringar sparas automatiskt efter att du slutat skriva (ca 1,5 sekunder).
                  Du ser en snurrande indikator medan sparning pagar och en groen bock nar
                  andringen ar sparad.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Manage your profile",
          description: "Learn how to change your name, company details, phone number, country, and profile picture.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                On the <strong>Account</strong> page in your dashboard, you can edit your
                personal information. All changes are saved automatically -- you don&apos;t
                need to click any save button.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How to reach your profile</h2>
              <Step n={1} title="Open Account">
                <p>
                  Click your name or avatar at the bottom of the sidebar, or navigate
                  directly to <Code>/dashboard/account</Code>.
                </p>
              </Step>
              <Step n={2} title="Edit your details">
                <p>
                  On the account page you will see all editable fields. Type in any field
                  and the change is saved automatically after a short delay.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Available fields</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                  title="Full name"
                  desc="Your name as displayed in the dashboard and on your account."
                />
                <FeatureCard
                  icon="M2.25 21h19.5M3.75 3v18h16.5V3H3.75zm3 3.75h3v3h-3v-3zm6.75 0h3v3h-3v-3z"
                  title="Company name"
                  desc="Optional. Your company name for billing and account information."
                />
                <FeatureCard
                  icon="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                  title="Organization number"
                  desc="Optional. Your organization number for invoices."
                />
                <FeatureCard
                  icon="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  title="Phone number"
                  desc="Optional. Your phone number for contact."
                />
              </div>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Changing your profile picture (avatar)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Your profile picture is displayed in the dashboard and on your account.
                You can upload an image via the <strong>media picker</strong> on the account
                page. If you logged in with Google, your Google profile picture is used
                automatically, but you can change it at any time.
              </p>
              <Step n={1} title="Go to Account">
                <p>Navigate to the account page in your dashboard.</p>
              </Step>
              <Step n={2} title="Click the media picker">
                <p>Next to your current avatar there is a button to choose a new image. Click it to open the media picker.</p>
              </Step>
              <Step n={3} title="Select or upload an image">
                <p>Select an existing image from your media library or upload a new one. The image is saved automatically.</p>
              </Step>

              <InfoBox title="Email address cannot be changed">
                <p>
                  Your email address is shown on the account page but is <strong>read-only</strong>.
                  If you need to change your email address, contact Qvicko support.
                </p>
              </InfoBox>

              <InfoBox title="Auto-save">
                <p>
                  All changes are saved automatically after you stop typing (about 1.5 seconds).
                  You will see a spinning indicator while saving and a green checkmark when
                  the change is saved.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  3. Change Password                                             */
    /* -------------------------------------------------------------- */
    {
      slug: "change-password",
      category: "account-and-security",
      icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
      content: {
        sv: {
          title: "Byt eller aterstall ditt losenord",
          description: "Steg-for-steg-guide for att byta losenord fran dashboarden eller aterstalla det om du glomt det.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Du kan byta ditt losenord nar som helst fran din dashboard, eller aterstalla
                det via e-post om du glomt det. Qvicko kraver att losenord ar minst
                <strong> 8 tecken</strong> langa.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Byt losenord (inloggad)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du ar inloggad och vill byta losenord:
              </p>
              <Step n={1} title="Ga till Konto">
                <p>Navigera till kontosidan i din dashboard.</p>
              </Step>
              <Step n={2} title="Ange nuvarande losenord">
                <p>
                  For sakerhetens skull maste du forst ange ditt <strong>nuvarande losenord</strong> for
                  att bevisa att det verkligen ar du som gor andringen.
                </p>
              </Step>
              <Step n={3} title="Valj nytt losenord">
                <p>
                  Ange ditt nya losenord. Det maste vara minst 8 tecken langt. Vi
                  rekommenderar minst 12 tecken for battre sakerhet.
                </p>
              </Step>
              <Step n={4} title="Spara">
                <p>
                  Klicka pa <strong>Byt losenord</strong>. En granskningshandelse loggas
                  automatiskt med tidpunkt och IP-adress.
                </p>
              </Step>

              <InfoBox title="Losenordsstyrka">
                <p>
                  Nar du valjer losenord visas en styrkeindikator med tre nivaer:
                  <strong> Svagt</strong> (under 8 tecken), <strong>OK</strong> (8-11 tecken)
                  och <strong>Starkt</strong> (12+ tecken). Ju langre losenord desto sakrare.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Aterstall losenord (glomt)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du har glomt ditt losenord kan du aterstalla det:
              </p>
              <Step n={1} title="Ga till inloggningssidan">
                <p>Besok <Code>/login</Code> och ange din e-postadress i forsta steget.</p>
              </Step>
              <Step n={2} title="Klicka Glomt losenord">
                <p>
                  I steg 2 (losenordsfaltet) finns en lank <strong>Glomt losenord?</strong>.
                  Klicka pa den for att skicka en aterställningslank till din e-post.
                </p>
              </Step>
              <Step n={3} title="Oppna mailet">
                <p>
                  Kontrollera din inkorg (och skrappost-mappen). Du far ett mail med en
                  lank till aterställningssidan.
                </p>
              </Step>
              <Step n={4} title="Valj nytt losenord">
                <p>
                  Pa aterställningssidan anger du ditt nya losenord och bekraftar det.
                  Klicka sedan <strong>Aterstall losenord</strong>.
                </p>
              </Step>
              <Step n={5} title="Logga in">
                <p>
                  Nar losenordet ar aterställt kan du logga in med ditt nya losenord.
                </p>
              </Step>

              <WarningBox title="Begransning pa aterställning">
                <p>
                  Du kan bara begara en losenordsaterställning per dygn. Aterställningslanken
                  ar tidsbegraensad och kan bara anvandas en gang. Om den gatt ut,
                  begаr en ny.
                </p>
              </WarningBox>

              <InfoBox title="Sociala inloggningar utan losenord">
                <p>
                  Om du skapade ditt konto med Google eller Apple har du inget losenord.
                  Du kan fortfarande logga in via din sociala leverantor. Om du vill lagga
                  till ett losenord, kontakta support.
                </p>
              </InfoBox>
            </>
          ),
        },
        en: {
          title: "Change or reset your password",
          description: "Step-by-step guide to changing your password from the dashboard or resetting it if you forgot it.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                You can change your password at any time from your dashboard, or reset it
                via email if you forgot it. Qvicko requires passwords to be at least
                <strong> 8 characters</strong> long.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Change password (logged in)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you are logged in and want to change your password:
              </p>
              <Step n={1} title="Go to Account">
                <p>Navigate to the account page in your dashboard.</p>
              </Step>
              <Step n={2} title="Enter current password">
                <p>
                  For security, you must first enter your <strong>current password</strong> to
                  prove that it is really you making the change.
                </p>
              </Step>
              <Step n={3} title="Choose a new password">
                <p>
                  Enter your new password. It must be at least 8 characters long. We
                  recommend at least 12 characters for better security.
                </p>
              </Step>
              <Step n={4} title="Save">
                <p>
                  Click <strong>Change password</strong>. An audit event is logged
                  automatically with timestamp and IP address.
                </p>
              </Step>

              <InfoBox title="Password strength">
                <p>
                  When choosing a password, a strength indicator is shown with three levels:
                  <strong> Weak</strong> (under 8 characters), <strong>OK</strong> (8-11 characters),
                  and <strong>Strong</strong> (12+ characters). The longer the password, the more secure.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Reset password (forgotten)</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you have forgotten your password, you can reset it:
              </p>
              <Step n={1} title="Go to the login page">
                <p>Visit <Code>/login</Code> and enter your email address in the first step.</p>
              </Step>
              <Step n={2} title="Click Forgot password">
                <p>
                  In step 2 (the password field), there is a <strong>Forgot password?</strong> link.
                  Click it to send a reset link to your email.
                </p>
              </Step>
              <Step n={3} title="Open the email">
                <p>
                  Check your inbox (and spam folder). You will receive an email with a
                  link to the reset page.
                </p>
              </Step>
              <Step n={4} title="Choose a new password">
                <p>
                  On the reset page, enter your new password and confirm it.
                  Then click <strong>Reset password</strong>.
                </p>
              </Step>
              <Step n={5} title="Log in">
                <p>
                  Once the password is reset, you can log in with your new password.
                </p>
              </Step>

              <WarningBox title="Reset rate limit">
                <p>
                  You can only request a password reset once per day. The reset link is
                  time-limited and can only be used once. If it has expired, request a new one.
                </p>
              </WarningBox>

              <InfoBox title="Social logins without a password">
                <p>
                  If you created your account with Google or Apple, you don&apos;t have a password.
                  You can still log in via your social provider. If you want to add a
                  password, contact support.
                </p>
              </InfoBox>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  4. Login Methods                                               */
    /* -------------------------------------------------------------- */
    {
      slug: "login-methods",
      category: "account-and-security",
      icon: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
      content: {
        sv: {
          title: "Inloggningsmetoder",
          description: "Oversikt over alla satt att logga in pa Qvicko: e-post/losenord, Google och Apple.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko erbjuder flera satt att logga in. Du kan valja det som passar
                dig bast -- eller anvanda flera metoder pa samma konto.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">E-post och losenord</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Den klassiska metoden. Nar du registrerar dig anger du din e-postadress
                och valjer ett losenord (minst 8 tecken). Vid inloggning anger du forst din
                e-post och sedan ditt losenord i ett tvastegsfloede.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Ange e-post i steg 1 och klicka <strong>Fortsatt</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Ange losenord i steg 2 och klicka <strong>Logga in</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Du kan ga tillbaka till steg 1 for att andra e-postadressen.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Google-inloggning</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Logga in med ditt Google-konto med bara ett klick. Tillgangligt pa bade
                inloggnings- och registreringssidan.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Klicka pa <strong>Fortsatt med Google</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Valj ditt Google-konto i popupen.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Du loggas in automatiskt. Om du inte har ett Qvicko-konto sedan tidigare skapas ett automatiskt.</span>
                </li>
              </ul>

              <InfoBox title="Google Workspace">
                <p>
                  Om du loggar in med ett Google Workspace-konto (foretagskonto) anvands din
                  domаn som foretagsnamnstips nar ett nytt konto skapas. Din Google-profilbild
                  anvands automatiskt som avatar.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Apple-inloggning</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Logga in med ditt Apple-ID. Tillgangligt via Qvickos iOS-app.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Klicka pa <strong>Logga in med Apple</strong> i appen.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Autentisera med Face ID, Touch ID eller ditt Apple-losenord.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Apple verifierar din identitet och du loggas in automatiskt.</span>
                </li>
              </ul>

              <WarningBox title="Apple och e-post">
                <p>
                  Apple ger dig mojlighet att dolja din riktiga e-postadress och anvanda en
                  Apple-relayeringsadress istallet. Tаnk pa att detta kan gora det svarare
                  att koppla ihop ditt konto med andra tjanster.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Koppla sociala konton</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du redan har ett Qvicko-konto med en viss e-postadress och loggar in
                med Google eller Apple med <strong>samma e-postadress</strong>, kopplas det
                sociala kontot automatiskt till ditt befintliga konto. Du kan sedan logga
                in med vilken metod du foredrar.
              </p>
            </>
          ),
        },
        en: {
          title: "Login methods",
          description: "Overview of all ways to log in to Qvicko: email/password, Google, and Apple.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Qvicko offers several ways to log in. You can choose whichever works
                best for you -- or use multiple methods on the same account.
              </p>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Email and password</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                The classic method. When you register, you enter your email address and
                choose a password (at least 8 characters). When logging in, you first enter
                your email, then your password in a two-step flow.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Enter your email in step 1 and click <strong>Continue</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Enter your password in step 2 and click <strong>Log in</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>You can go back to step 1 to change the email address.</span>
                </li>
              </ul>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Google login</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Log in with your Google account in just one click. Available on both
                the login and registration pages.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Click <strong>Continue with Google</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Choose your Google account in the popup.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>You are logged in automatically. If you don&apos;t have a Qvicko account yet, one is created automatically.</span>
                </li>
              </ul>

              <InfoBox title="Google Workspace">
                <p>
                  If you log in with a Google Workspace account (business account), your
                  domain is used as a company name hint when a new account is created. Your
                  Google profile picture is used automatically as your avatar.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Apple login</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Log in with your Apple ID. Available via Qvicko&apos;s iOS app.
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Tap <strong>Sign in with Apple</strong> in the app.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Authenticate with Face ID, Touch ID, or your Apple password.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M4.5 12.75l6 6 9-13.5" />
                  <span>Apple verifies your identity and you are logged in automatically.</span>
                </li>
              </ul>

              <WarningBox title="Apple and email">
                <p>
                  Apple gives you the option to hide your real email address and use an
                  Apple relay address instead. Keep in mind that this can make it harder
                  to link your account with other services.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Linking social accounts</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you already have a Qvicko account with a certain email address and
                log in with Google or Apple using <strong>the same email address</strong>,
                the social account is automatically linked to your existing account. You can
                then log in with whichever method you prefer.
              </p>
            </>
          ),
        },
      },
    },

    /* -------------------------------------------------------------- */
    /*  5. Delete Account                                              */
    /* -------------------------------------------------------------- */
    {
      slug: "delete-account",
      category: "account-and-security",
      icon: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
      content: {
        sv: {
          title: "Radera ditt konto",
          description: "Vad som hander nar du raderar ditt konto, vilken data som paverkas och hur du gar tillvaga.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                Du har ratt att radera ditt konto nar som helst. Har forklarar vi vad
                som hander med din data och hur processen fungerar.
              </p>

              <WarningBox title="Kontoradering ar permanent">
                <p>
                  Nar ditt konto raderas ar det <strong>oaterkallelig</strong>. Alla dina
                  personuppgifter, webbplatser, appar och installningar tas bort. Denna
                  atgаrd kan inte angras.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Vad hander med din data?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nar du begаr att radera ditt konto hander foljande:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Personuppgifter</strong> -- Namn, e-post, telefon, foretagsuppgifter och profilbild raderas.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Webbplatser</strong> -- Alla dina webbplatser och deras innehall tas bort.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Installerade appar</strong> -- Alla appar och deras data (blogginlagg, chattkonversationer etc.) raderas.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Sessioner</strong> -- Alla aktiva sessioner aterkallas omedelbart.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Sociala kopplingar</strong> -- Kopplingar till Google och Apple tas bort.</span>
                </li>
              </ul>

              <InfoBox title="Granskningsloggar">
                <p>
                  Vissa granskningsloggar kan bevaras en begransad tid efter kontoradering
                  for sakerhets- och juridiska andamal, men de innehaller inga personuppgifter
                  som kan kopplas till dig.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Hur raderar jag mitt konto?</h2>
              <Step n={1} title="Kontakta support">
                <p>
                  For narvarande hanteras kontoradering via Qvickos support. Skicka ett
                  mail till support fran den e-postadress som ar kopplad till ditt konto.
                </p>
              </Step>
              <Step n={2} title="Verifiering">
                <p>
                  Vi verifierar att begaran kommer fran kontoinnehavaren. Du kan bli ombedd
                  att bekrafta din identitet.
                </p>
              </Step>
              <Step n={3} title="Kontot raderas">
                <p>
                  Nar verifieringen ar klar raderas ditt konto och all tillhorande data.
                  Du far en bekraftelse via e-post.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Aktiv prenumeration?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Om du har en aktiv prenumeration bor du avsluta den forst. Annars avslutas
                den automatiskt i samband med kontoradering. Inga fler avgifter debiteras
                efter att kontot ar raderat.
              </p>
            </>
          ),
        },
        en: {
          title: "Delete your account",
          description: "What happens when you delete your account, which data is affected, and how to proceed.",
          body: (
            <>
              <p className="text-lg text-text-secondary leading-relaxed">
                You have the right to delete your account at any time. Here we explain what
                happens to your data and how the process works.
              </p>

              <WarningBox title="Account deletion is permanent">
                <p>
                  When your account is deleted, it is <strong>irreversible</strong>. All your
                  personal data, websites, apps, and settings are removed. This action
                  cannot be undone.
                </p>
              </WarningBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">What happens to your data?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                When you request to delete your account, the following happens:
              </p>
              <ul className="mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Personal data</strong> -- Name, email, phone, company details, and profile picture are deleted.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Websites</strong> -- All your websites and their content are removed.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Installed apps</strong> -- All apps and their data (blog posts, chat conversations, etc.) are deleted.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Sessions</strong> -- All active sessions are revoked immediately.</span>
                </li>
                <li className="flex gap-3">
                  <Icon d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  <span><strong>Social connections</strong> -- Links to Google and Apple are removed.</span>
                </li>
              </ul>

              <InfoBox title="Audit logs">
                <p>
                  Some audit logs may be retained for a limited time after account deletion
                  for security and legal purposes, but they do not contain any personal data
                  that can be linked to you.
                </p>
              </InfoBox>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">How do I delete my account?</h2>
              <Step n={1} title="Contact support">
                <p>
                  Currently, account deletion is handled via Qvicko support. Send an
                  email to support from the email address linked to your account.
                </p>
              </Step>
              <Step n={2} title="Verification">
                <p>
                  We verify that the request comes from the account holder. You may be
                  asked to confirm your identity.
                </p>
              </Step>
              <Step n={3} title="Account is deleted">
                <p>
                  Once verification is complete, your account and all associated data are
                  deleted. You will receive a confirmation via email.
                </p>
              </Step>

              <h2 className="mt-10 text-2xl font-bold text-primary-deep">Active subscription?</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                If you have an active subscription, you should cancel it first. Otherwise,
                it is automatically canceled when the account is deleted. No further charges
                are billed after the account is removed.
              </p>
            </>
          ),
        },
      },
    },
  ],
};
