"use client";

import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirect bare /dashboard/sites/[siteId] to /dashboard/sites/[siteId]/general
 */
export default function SiteIndexRedirect() {
  const params = useParams();
  const siteId = params.siteId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/sites/${siteId}/general` as "/dashboard");
  }, [router, siteId]);

  return null;
}
