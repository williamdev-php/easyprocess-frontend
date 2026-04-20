"use client";

import { Link } from "@/i18n/routing";
import { trackEvent } from "@/lib/tracking";

export default function PricingCtaLink({
  href,
  planKey,
  className,
  children,
}: {
  href: string;
  planKey: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackEvent("cta_click", {
          target: href,
          location: "pricing_page",
          plan: planKey,
        });
        if (planKey !== "free") {
          localStorage.setItem("billing_redirect", planKey);
        }
      }}
    >
      {children}
    </Link>
  );
}
