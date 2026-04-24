"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function BookingsAppPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const siteId = params.siteId as string;

  useEffect(() => {
    router.replace(`/${locale}/dashboard/sites/${siteId}/apps/bookings/overview`);
  }, [router, locale, siteId]);

  return null;
}
