import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";
const locales = ["sv", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/collections"];

  const staticEntries = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page}`])
        ),
      },
    }))
  );

  // TODO: Fetch dynamic listing/auction IDs from API and generate entries
  // const listings = await fetchAllListingIds();
  // const dynamicEntries = listings.flatMap((id) => locales.map(...))

  return staticEntries;
}
