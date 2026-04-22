"use client";

import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ChatAppPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/sites/${siteId}/apps/chat/conversations` as "/dashboard");
  }, [router, siteId]);

  return null;
}
