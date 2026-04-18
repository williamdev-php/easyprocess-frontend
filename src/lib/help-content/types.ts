import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";

export interface HelpArticle {
  slug: string;
  category: string;
  icon: string;
  content: Record<Locale, {
    title: string;
    description: string;
    body: ReactNode;
  }>;
}

export interface HelpCategory {
  slug: string;
  icon: string;
  label: Record<Locale, { title: string; description: string }>;
  articles: HelpArticle[];
}
