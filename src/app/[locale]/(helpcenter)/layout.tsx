import { Suspense } from "react";
import HelpHeader from "@/components/help/help-header";
import HelpSidebar from "@/components/help/help-sidebar";

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <HelpHeader />
      </Suspense>
      <div className="flex flex-1">
        <HelpSidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
