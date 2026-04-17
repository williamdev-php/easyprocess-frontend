import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-primary-deep">{t("title")}</h1>
      <p className="mt-4 text-lg text-text-muted">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
      >
        {t("goHome")}
      </Link>
    </main>
  );
}
