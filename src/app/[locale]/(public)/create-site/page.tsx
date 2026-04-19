"use client";

import { Suspense } from "react";
import CreateSiteWizard from "@/components/create-site-wizard";

export default function CreateSitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] bg-background">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
          <div className="mb-10 text-center">
            <div className="mx-auto h-8 w-48 animate-shimmer rounded bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%]" />
            <div className="mx-auto mt-4 h-10 w-80 animate-shimmer rounded bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%]" />
          </div>
          <div className="rounded-2xl border border-border-theme bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-6 w-40 animate-shimmer rounded bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%]" />
              <div className="h-12 w-full animate-shimmer rounded-xl bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%]" />
              <div className="h-12 w-full animate-shimmer rounded-xl bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      </div>
    }>
      <div className="min-h-[calc(100vh-80px)] bg-background pt-24 lg:pt-28">
        <CreateSiteWizard />
      </div>
    </Suspense>
  );
}
