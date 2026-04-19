"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const { data: sitesData, loading: sitesLoading } = useQuery<{ mySites: Array<{ id: string }> }>(MY_SITES, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const [siteCreated, setSiteCreated] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login" as "/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || sitesLoading) {
    return null;
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
              router.push("/dashboard");
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
