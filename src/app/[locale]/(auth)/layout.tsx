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
              width={160}
              height={53}
              className="h-12"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <p className="mt-6 text-xl font-semibold leading-relaxed">
            Digitala losningar som driver tillvaxt
          </p>
          <p className="mt-4 text-white/60">
            AI-automatiseringar, e-handelslosningar, webbdesign och digitala tjanster — allt pa ett stalle.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Snabb onboarding" },
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Saker plattform" },
              { icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", text: "Spar dina projekt" },
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
