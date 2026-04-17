import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button, Card, Badge, Input, Label } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { generateAuctionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "auction" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qvicko.se";

  const title = `${t("title")} #${id}`;

  return {
    title,
    alternates: {
      languages: {
        sv: `${baseUrl}/sv/auction/${id}`,
        en: `${baseUrl}/en/auction/${id}`,
      },
    },
    openGraph: {
      title,
      type: "website",
    },
  };
}

export default async function AuctionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auction");

  // TODO: Replace with real data fetching
  const auction = {
    name: `Projekt #${id}`,
    description: "Detaljerad beskrivning av projektet.",
    currentBid: 45000,
    startingBid: 10000,
    endDate: "2026-05-01T18:00:00Z",
    bids: [
      { bidder: "Anvandare A", amount: 45000, time: "2026-04-15 14:30" },
      { bidder: "Anvandare B", amount: 38000, time: "2026-04-15 12:15" },
      { bidder: "Anvandare A", amount: 25000, time: "2026-04-14 09:00" },
    ],
  };

  const auctionJsonLd = generateAuctionJsonLd({
    name: auction.name,
    description: auction.description,
    endDate: auction.endDate,
    currentBid: auction.currentBid,
  });

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: "Home", url: `/${locale}` },
    { name: "Collections", url: `/${locale}/collections` },
    { name: auction.name, url: `/${locale}/auction/${id}` },
  ]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString(locale === "sv" ? "sv-SE" : "en-US");

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={auctionJsonLd} />
      <JsonLd data={breadcrumbs} />

      {/* Breadcrumb nav */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/collections" className="hover:text-primary">Collections</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{auction.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Image placeholder */}
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl bg-border-theme/50 flex items-center justify-center">
            <span className="text-text-muted text-lg">Projektbild</span>
          </div>

          {/* Description */}
          <Card className="mt-6">
            <p className="text-text-secondary leading-relaxed">{auction.description}</p>
          </Card>
        </div>

        {/* Bid panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Badge variant="primary" className="mb-3">Projekt</Badge>
            <h1 className="text-2xl font-bold text-primary-deep">{auction.name}</h1>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between border-b border-border-light py-2">
                <span className="text-text-muted">{t("currentBid")}</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(auction.currentBid)} SEK</span>
              </div>
              <div className="flex justify-between border-b border-border-light py-2">
                <span className="text-text-muted">{t("startingBid")}</span>
                <span className="font-medium text-text-theme">{formatCurrency(auction.startingBid)} SEK</span>
              </div>
              <div className="flex justify-between border-b border-border-light py-2">
                <span className="text-text-muted">{t("endsAt")}</span>
                <span className="font-medium text-text-theme">
                  {new Date(auction.endDate).toLocaleDateString(locale === "sv" ? "sv-SE" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="bidAmount">{t("bidAmount")}</Label>
              <Input
                id="bidAmount"
                type="number"
                min={auction.currentBid + 1}
                placeholder={`${formatCurrency(auction.currentBid + 1000)} SEK`}
              />
              <Button className="mt-3" fullWidth>{t("placeBid")}</Button>
            </div>
          </Card>

          {/* Bid history */}
          <Card>
            <h2 className="text-lg font-semibold text-primary-deep mb-4">{t("bidHistory")}</h2>
            {auction.bids.length === 0 ? (
              <p className="text-text-muted">{t("noBids")}</p>
            ) : (
              <div className="space-y-2">
                {auction.bids.map((bid, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-background px-4 py-2.5 text-sm"
                  >
                    <div>
                      <span className="font-medium text-text-theme">{bid.bidder}</span>
                      <span className="ml-2 text-text-muted">{bid.time}</span>
                    </div>
                    <span className="font-semibold text-primary">{formatCurrency(bid.amount)} SEK</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
