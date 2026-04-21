"use client";

import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function BlogAppPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/sites/${siteId}/apps/blog/posts` as "/dashboard");
  }, [router, siteId]);

  return null;
}
