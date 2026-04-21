"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@apollo/client/react";
import { MY_SITE, GET_SITE_APPS } from "@/graphql/queries";

interface SiteData {
  id: string;
  siteData: Record<string, unknown>;
  template: string;
  status: string;
  subdomain: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  leadId: string | null;
  businessName: string | null;
  websiteUrl: string | null;
}

interface InstalledApp {
  id: string;
  appSlug: string;
  appName: string;
  siteId: string;
  isActive: boolean;
  sidebarLinks: Array<{ key: string; href_suffix: string; icon: string }> | null;
  installedAt: string | null;
}

interface SiteContextValue {
  site: SiteData | null;
  siteId: string;
  installedApps: InstalledApp[];
  loading: boolean;
  siteName: string;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function SiteContextProvider({
  siteId,
  children,
}: {
  siteId: string;
  children: React.ReactNode;
}) {
  const { data: siteData, loading: siteLoading } = useQuery<{ mySite: SiteData }>(
    MY_SITE,
    { variables: { id: siteId }, fetchPolicy: "cache-and-network" }
  );

  const { data: appsData, loading: appsLoading, error: appsError } = useQuery<{ siteApps: InstalledApp[] }>(
    GET_SITE_APPS,
    {
      variables: { siteId },
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );

  const site = siteData?.mySite ?? null;
  const installedApps = appsData?.siteApps ?? [];
  // Don't block rendering on apps query failure (backend might not have the resolver yet)
  const loading = siteLoading || (appsLoading && !appsError);

  const siteName =
    (site?.siteData as Record<string, unknown>)?.business &&
    typeof (site?.siteData as Record<string, Record<string, unknown>>)?.business?.name === "string"
      ? ((site?.siteData as Record<string, Record<string, unknown>>)?.business?.name as string)
      : site?.businessName || "Min sida";

  return (
    <SiteContext.Provider value={{ site, siteId, installedApps, loading, siteName }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSiteContext must be used within SiteContextProvider");
  return ctx;
}
