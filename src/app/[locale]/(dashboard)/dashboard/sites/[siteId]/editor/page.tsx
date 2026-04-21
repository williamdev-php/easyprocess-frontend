"use client";

import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Editor page — redirects to the existing pages/[id] editor.
 * The original editor is tightly coupled to the pages/[id] route structure.
 * Until we fully migrate the editor, we redirect there.
 */
export default function EditorPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/pages/${siteId}` as "/dashboard");
  }, [router, siteId]);

  return (
    <div className="flex items-center gap-2 text-text-muted">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-deep border-t-transparent" />
      <span className="text-sm">Laddar redigeraren...</span>
    </div>
  );
}
