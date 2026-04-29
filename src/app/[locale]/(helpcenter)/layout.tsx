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
      <Suspense fallback={
        <div className="h-16 w-full border-b border-border-light bg-white px-6">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
            <div className="h-6 w-28 bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer rounded" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-4 w-16 bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-8 w-8 bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer rounded-full" />
            </div>
          </div>
        </div>
      }>
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
