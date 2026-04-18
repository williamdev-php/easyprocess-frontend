"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { helpCategories } from "@/lib/help-content/registry";
import type { Locale } from "@/i18n/config";

function SvgIcon({ d }: { d: string }) {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function HelpSidebar() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations("helpCenter");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setMobileOpen((v) => !v);
    window.addEventListener("toggle-help-sidebar", handler);
    return () => window.removeEventListener("toggle-help-sidebar", handler);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="p-5">
        <Link
          href="/help"
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            pathname === "/help"
              ? "bg-primary/10 text-primary-deep"
              : "text-text-secondary hover:bg-primary/5 hover:text-primary-deep"
          }`}
        >
          <SvgIcon d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          {t("overview")}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {helpCategories.map((cat) => {
          const catPath = `/help/${cat.slug}`;
          const isActive = pathname.startsWith(catPath);

          return (
            <div key={cat.slug} className="mb-4">
              <Link
                href={catPath}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === catPath
                    ? "bg-primary/10 text-primary-deep"
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary-deep"
                }`}
              >
                <SvgIcon d={cat.icon} />
                {cat.label[locale].title}
              </Link>

              {isActive && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary/10 pl-3">
                  {cat.articles.map((article) => {
                    const articlePath = `/help/${cat.slug}/${article.slug}`;
                    const isArticleActive = pathname === articlePath;

                    return (
                      <Link
                        key={article.slug}
                        href={articlePath}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          isArticleActive
                            ? "bg-primary/10 font-medium text-primary-deep"
                            : "text-text-muted hover:bg-primary/5 hover:text-primary-deep"
                        }`}
                      >
                        {article.content[locale].title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border-theme bg-surface lg:block">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto lg:top-16 lg:h-[calc(100vh-4rem)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border-theme bg-surface shadow-xl lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-border-theme px-5">
              <span className="text-sm font-semibold text-primary-deep">{t("navigation")}</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-text-muted hover:bg-primary/5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              {sidebarContent}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
