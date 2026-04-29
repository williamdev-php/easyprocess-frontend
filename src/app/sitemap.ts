import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";
const viewerDomain = process.env.NEXT_PUBLIC_VIEWER_DOMAIN || "qvickosite.com";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const locales = ["sv", "en"];

interface PublishedSite {
  id: string;
  subdomain: string | null;
  custom_domain: string | null;
  updated_at: string | null;
  slugs: string[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages on qvicko.com
  const staticPages = [
    "",
    "/collections",
    "/pricing",
    "/tools/business-name-generator",
    "/tools/color-palette-generator",
    "/terms",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? ("weekly" as const) : ("monthly" as const),
      priority: page === "" ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`])
        ),
      },
    }))
  );

  // Dynamic entries from published sites
  let siteEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/api/sites/published`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const sites: PublishedSite[] = await res.json();

      for (const site of sites) {
        const siteUrl = site.custom_domain
          ? `https://${site.custom_domain}`
          : site.subdomain
            ? `https://${site.subdomain}.${viewerDomain}`
            : null;

        if (!siteUrl) continue;

        const lastMod = site.updated_at ? new Date(site.updated_at) : new Date();

        // Site root
        siteEntries.push({
          url: siteUrl,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        });

        // Site sub-pages
        for (const slug of site.slugs) {
          siteEntries.push({
            url: `${siteUrl}/${slug}`,
            lastModified: lastMod,
            changeFrequency: "monthly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Sitemap generation should not fail if API is unreachable
  }

  return [...staticEntries, ...siteEntries];
}
