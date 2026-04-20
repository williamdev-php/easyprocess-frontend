"use client";

import { Link } from "@/i18n/routing";
import { trackEvent } from "@/lib/tracking";

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
  eventName?: string;
  eventMeta?: Record<string, unknown>;
}

export default function CtaTrackLink({
  href,
  className,
  children,
  eventName = "cta_click",
  eventMeta,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(eventName, { target: href, ...eventMeta })}
    >
      {children}
    </Link>
  );
}
