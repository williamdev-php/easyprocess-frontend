import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center bg-primary-deep overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary-dark/30 blur-2xl" />

        <div className="relative z-10 max-w-md px-12 text-white">
          <Link href="/">
            <Image
              src="/logo-sand-mist.png"
              alt="Qvicko"
              width={200}
              height={67}
              className="h-16"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <p className="mt-6 text-xl font-semibold leading-relaxed">
            Din hemsida, live på minuter
          </p>
          <p className="mt-4 text-white/60">
            Beskriv ditt företag och vår AI bygger en professionell, SEO-optimerad hemsida — redo att publicera direkt.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", text: "Klar på under 5 minuter" },
              { icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941", text: "Inbyggd SEO från dag ett" },
              { icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", text: "Snygg design, varje gång" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Mobile logo */}
        <div className="flex items-center justify-center pt-8 lg:hidden">
          <Link href="/">
            <Image
              src="/logo-petrol-blue.png"
              alt="Qvicko"
              width={120}
              height={40}
              className="h-9"
              style={{ width: "auto" }}
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
