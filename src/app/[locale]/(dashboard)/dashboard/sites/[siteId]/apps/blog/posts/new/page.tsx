"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter, Link } from "@/i18n/routing";
import { CREATE_BLOG_POST } from "@/graphql/mutations";
import { GET_BLOG_CATEGORIES } from "@/graphql/queries";
import { MediaPickerField } from "@/components/media-picker";

export default function NewBlogPostPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("blog");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [error, setError] = useState("");

  const { data: catData } = useQuery<{ blogCategories: Array<{ id: string; name: string }> }>(
    GET_BLOG_CATEGORIES,
    { variables: { siteId } }
  );
  const categories = catData?.blogCategories ?? [];

  const [createPost, { loading: saving }] = useMutation(CREATE_BLOG_POST);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      || "untitled";
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function handleSave(publishStatus: "DRAFT" | "PUBLISHED") {
    if (!title.trim()) {
      setError("Titel krävs");
      return;
    }
    setError("");
    try {
      const result = await createPost({
        variables: {
          input: {
            siteId,
            title: title.trim(),
            slug: slug.trim() || undefined,
            content,
            excerpt: excerpt || undefined,
            featuredImage: featuredImage || undefined,
            categoryId: categoryId || undefined,
            status: publishStatus,
          },
        },
      });
      const postId = (result.data as Record<string, Record<string, string>> | undefined)?.createBlogPost?.id;
      if (postId) {
        router.push(`/dashboard/sites/${siteId}/apps/blog/posts/${postId}` as "/dashboard");
      } else {
        router.push(`/dashboard/sites/${siteId}/apps/blog/posts` as "/dashboard");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/sites/${siteId}/apps/blog/posts` as "/dashboard"}
            className="text-sm text-text-muted hover:text-primary-deep"
          >
            &larr; {t("backToPosts")}
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-gray-50 disabled:opacity-50"
          >
            {t("save")} {t("draft").toLowerCase()}
          </button>
          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
          >
            {t("publish")}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-border-light bg-white/80 p-6 shadow-sm">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("title")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-base outline-none focus:border-primary-deep"
            placeholder="Ange titel..."
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("slug")}</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-mono outline-none focus:border-primary-deep"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("excerpt")}</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
            placeholder="Kort sammanfattning..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("content")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-mono outline-none focus:border-primary-deep"
            placeholder="Skriv ditt blogginlägg här... (Markdown stöds)"
          />
        </div>

        {/* Featured image */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("featuredImage")}</label>
          <MediaPickerField
            value={featuredImage}
            onChange={setFeaturedImage}
            label=""
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">{t("category")}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
            >
              <option value="">— Ingen kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">{t("status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
            >
              <option value="DRAFT">{t("draft")}</option>
              <option value="PUBLISHED">{t("published")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
