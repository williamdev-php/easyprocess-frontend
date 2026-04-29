const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.com";

export function generateWebsiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Qvicko",
    url: `${baseUrl}/${locale}`,
    inLanguage: locale === "sv" ? "sv-SE" : "en-US",
    description:
      locale === "sv"
        ? "AI-automatiseringar, e-handelslosningar, webbdesign och digitala AI-tjanster"
        : "AI automations, e-commerce solutions, web design and digital AI services",
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
