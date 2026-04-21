"use client";

import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Code page — redirects to the existing pages/[id]/code editor.
 */
export default function CodePage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/pages/${siteId}/code` as "/dashboard");
  }, [router, siteId]);

  return (
    <div className="flex items-center gap-2 text-text-muted">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-deep border-t-transparent" />
      <span className="text-sm">Laddar kodredigeraren...</span>
    </div>
  );
}
