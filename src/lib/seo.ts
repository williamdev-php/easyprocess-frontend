const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.se";

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

export function generateProductJsonLd(product: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  seller?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.image && { image: product.image }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "SEK",
      availability: "https://schema.org/InStock",
      ...(product.seller && {
        seller: { "@type": "Organization", name: product.seller },
      }),
    },
  };
}

export function generateAuctionJsonLd(auction: {
  name: string;
  description: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  currentBid?: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: auction.name,
    description: auction.description,
    ...(auction.image && { image: auction.image }),
    ...(auction.startDate && { startDate: auction.startDate }),
    ...(auction.endDate && { endDate: auction.endDate }),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    offers: {
      "@type": "Offer",
      price: auction.currentBid || 0,
      priceCurrency: auction.currency || "SEK",
      availability: "https://schema.org/InStock",
    },
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
