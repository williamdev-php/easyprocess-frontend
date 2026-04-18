"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import SubscriptionAlert from "@/components/subscription-alert";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login" as "/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">
            {!isLoading && <SubscriptionAlert />}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
