"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initTracking, trackPageView, flushEvents } from "@/lib/tracking";

export default function TrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    initTracking();

    const handleUnload = () => flushEvents();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    // Track page view on pathname change (skip duplicate on mount)
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      trackPageView();
    }
  }, [pathname]);

  return <>{children}</>;
}
