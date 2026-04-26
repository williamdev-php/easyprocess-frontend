import type { HelpCategory } from "./types";
import { gettingStartedCategory } from "./getting-started";
import { websiteEditorCategory } from "./website-editor";
import { domainsCategory } from "./domains";
import { seoAndMarketingCategory } from "./seo-and-marketing";
import { billingAndPlansCategory } from "./billing-and-plans";
import { accountAndSecurityCategory } from "./account-and-security";
import { siteMetricsCategory } from "./site-metrics";
import { qvickoAppsCategory } from "./qvicko-apps";

export const helpCategories: HelpCategory[] = [
  gettingStartedCategory,
  websiteEditorCategory,
  domainsCategory,
  seoAndMarketingCategory,
  billingAndPlansCategory,
  accountAndSecurityCategory,
  siteMetricsCategory,
  qvickoAppsCategory,
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
