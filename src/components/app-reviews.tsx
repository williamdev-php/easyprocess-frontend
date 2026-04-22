"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITES } from "@/graphql/queries";
import { CREATE_APP_REVIEW } from "@/graphql/mutations";
import { useTranslations, useLocale } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string | null;
}

interface SiteItem {
  id: string;
  businessName: string | null;
}

interface InstalledApp {
  appSlug: string;
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase());
}

function convertKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map((item) => convertKeys(item)) as T;
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        toCamelCase(key),
        convertKeys(value),
      ])
    ) as T;
  }
  return obj as T;
}

function StarRatingInput({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition"
        >
          <svg
            className={`h-6 w-6 ${
              star <= (hovered || rating) ? "text-amber-400" : "text-gray-200"
            } transition`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AppReviews({
  appSlug,
  appName,
}: {
  appSlug: string;
  appName: string;
}) {
  const t = useTranslations("appLibrary");
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check if user has app installed (needed for review validation)
  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    skip: !isAuthenticated,
    errorPolicy: "all",
  });

  const sites = sitesData?.mySites ?? [];
  const [installedSiteId, setInstalledSiteId] = useState<string | null>(null);

  // Check each site for the app installation
  useEffect(() => {
    if (!isAuthenticated || sites.length === 0) return;

    async function checkInstallation() {
      // Use the stored selected site first
      const storedSiteId = localStorage.getItem("selectedSiteId");
      const sitesToCheck = storedSiteId
        ? [storedSiteId, ...sites.filter((s) => s.id !== storedSiteId).map((s) => s.id)]
        : sites.map((s) => s.id);

      for (const siteId of sitesToCheck) {
        try {
          const res = await fetch(`${API_URL}/api/sites/${siteId}/apps/installed`);
          if (res.ok) {
            const slugs: string[] = await res.json();
            if (slugs.includes(appSlug)) {
              setInstalledSiteId(siteId);
              return;
            }
          }
        } catch {
          // skip
        }
      }
    }
    checkInstallation();
  }, [isAuthenticated, sites, appSlug]);

  const canReview = !!installedSiteId;

  const [createReview, { loading: submitting }] = useMutation(CREATE_APP_REVIEW);

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`${API_URL}/api/apps/${appSlug}/reviews?locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(convertKeys<Review[]>(data));
        }
      } catch {
        // skip
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [appSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (rating === 0) {
      setSubmitError(t("ratingRequired"));
      return;
    }

    try {
      const result = await createReview({
        variables: {
          input: {
            appSlug,
            siteId: installedSiteId,
            rating,
            title: title || null,
            body: body || null,
            locale,
          },
        },
      });

      const newReview: Review = {
        id: (result.data as { createAppReview: { id: string } }).createAppReview.id,
        userName: user?.fullName || "Anonymous",
        rating,
        title: title || null,
        body: body || null,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setShowForm(false);
      setRating(0);
      setTitle("");
      setBody("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setSubmitError(message);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(locale === "sv" ? "sv-SE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="rounded-2xl border border-border-light bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {t("reviews")} ({reviews.length})
        </h2>
        {isAuthenticated && canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary-deep/5 px-4 py-2 text-sm font-medium text-primary-deep transition hover:bg-primary-deep/10"
          >
            {t("writeReview")}
          </button>
        )}
        {isAuthenticated && !canReview && (
          <p className="text-xs text-text-muted">{t("installToReview")}</p>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border-light pt-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">{t("yourRating")}</label>
            <StarRatingInput rating={rating} onChange={setRating} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">{t("reviewTitle")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("reviewTitlePlaceholder")}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">{t("reviewBody")}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={t("reviewBodyPlaceholder")}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("submitReview")}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setSubmitError(null); }}
              className="rounded-xl border border-border-light px-5 py-2.5 text-sm font-medium text-text-muted transition hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">{t("noReviews")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-border-light pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {review.title && (
                      <span className="text-sm font-medium text-text-primary">{review.title}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {review.userName} &middot; {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
              {review.body && (
                <p className="mt-2 text-sm text-text-secondary">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
