import type { HelpCategory } from "./types";
import { domainsCategory } from "./domains";

export const helpCategories: HelpCategory[] = [
  domainsCategory,
];

export function getCategory(slug: string): HelpCategory | undefined {
  return helpCategories.find((c) => c.slug === slug);
}

export function getArticle(categorySlug: string, articleSlug: string) {
  const cat = getCategory(categorySlug);
  if (!cat) return undefined;
  const article = cat.articles.find((a) => a.slug === articleSlug);
  if (!article) return undefined;
  return { category: cat, article };
}
