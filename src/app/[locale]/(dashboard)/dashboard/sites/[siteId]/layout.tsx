"use client";

import { useParams } from "next/navigation";
import { SiteContextProvider } from "@/lib/site-context";

/**
 * Site-scoped layout — provides site context for apps routes.
 * The main site navigation (editor, settings, code) is handled by the sidebar.
 * This layout only wraps /dashboard/sites/[siteId]/* routes (apps, blog etc).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const siteId = params.siteId as string;

  return (
    <SiteContextProvider siteId={siteId}>
      {children}
    </SiteContextProvider>
  );
}
