"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import apolloClient from "@/lib/apollo-client";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { MY_SITES } from "@/graphql/queries";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import SubscriptionAlert from "@/components/subscription-alert";
import CreateSiteWizard from "@/components/create-site-wizard";

function MinimalHeader() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border-light bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-petrol-blue.png"
            alt="Qvicko"
            width={120}
            height={40}
            className="h-10 w-auto sm:h-12"
            loading="eager"
            priority
          />
        </Link>
        <button
          onClick={() => logout()}
          className="text-sm font-medium text-text-muted hover:text-primary-deep transition"
        >
          Logga ut
        </button>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={apolloClient}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ApolloProvider>
  );
}

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: sitesData, loading: sitesLoading } = useQuery<{ mySites: Array<{ id: string }> }>(MY_SITES, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const [siteCreated, setSiteCreated] = useState(false);
  const [billingRedirectHandled, setBillingRedirectHandled] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = pathname && pathname !== "/dashboard" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${returnUrl}` as "/dashboard");
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Redirect to billing if user clicked a paid plan on pricing page
  useEffect(() => {
    if (!isLoading && isAuthenticated && !sitesLoading && !billingRedirectHandled) {
      const billingRedirect = localStorage.getItem("billing_redirect");
      if (billingRedirect) {
        localStorage.removeItem("billing_redirect");
        setBillingRedirectHandled(true);
        const hasSitesNow = siteCreated || (sitesData?.mySites && sitesData.mySites.length > 0);
        if (hasSitesNow || user?.isSuperuser) {
          router.push("/dashboard/billing" as "/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, sitesLoading, siteCreated, sitesData, user, router, billingRedirectHandled]);

  if (isLoading || sitesLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="sticky top-0 z-30 border-b border-border-light bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="h-10 w-28 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-16 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex gap-8">
            {/* Sidebar skeleton */}
            <div className="hidden w-56 shrink-0 space-y-4 lg:block">
              <div className="h-8 w-40 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-48 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-36 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-44 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-32 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            </div>
            {/* Main content skeleton */}
            <div className="min-w-0 flex-1 space-y-6">
              <div className="h-8 w-48 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-32 w-full rounded-lg bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-48 w-full rounded-lg bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasSites = siteCreated || (sitesData?.mySites && sitesData.mySites.length > 0);
  const isSuperuser = user?.isSuperuser === true;

  // User has no sites and is not superuser -> show create-site wizard
  if (!isSuperuser && !hasSites) {
    return (
      <div className="min-h-screen bg-background">
        <MinimalHeader />
        <Suspense fallback={null}>
          <CreateSiteWizard
            embedded
            onComplete={() => {
              setSiteCreated(true);
              const billingRedirect = localStorage.getItem("billing_redirect");
              if (billingRedirect) {
                localStorage.removeItem("billing_redirect");
                router.push("/dashboard/billing" as "/dashboard");
              } else {
                router.push("/dashboard");
              }
            }}
          />
        </Suspense>
      </div>
    );
  }

  // Full-screen pages without sidebar
  const isFullscreenPage = pathname === "/dashboard/select-site";

  if (isFullscreenPage) {
    return (
      <div className="min-h-screen bg-background">
        <MinimalHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className={`mx-auto px-4 py-8 sm:px-6 ${isSuperuser ? "max-w-[1400px]" : "max-w-6xl"}`}>
        <div className="flex gap-8">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">
            <SubscriptionAlert />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
