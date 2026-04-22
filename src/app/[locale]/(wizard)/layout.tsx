import CookieBanner from "@/components/cookie-banner";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <CookieBanner />
    </>
  );
}
