"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { JsonLd } from "@/components/json-ld";

interface Crumb {
  label: string;
  href?: string;
}

export default function HelpBreadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations("helpCenter");

  const allCrumbs: Crumb[] = [{ label: t("title"), href: "/help" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: crumb.href } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          {allCrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="h-3.5 w-3.5 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
              {crumb.href && i < allCrumbs.length - 1 ? (
                <Link href={crumb.href} className="transition hover:text-primary-deep">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-primary-deep font-medium">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
