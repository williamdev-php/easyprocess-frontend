"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter, Link } from "@/i18n/routing";
import { GET_BLOG_POST, GET_BLOG_CATEGORIES } from "@/graphql/queries";
import { UPDATE_BLOG_POST, DELETE_BLOG_POST } from "@/graphql/mutations";
import { MediaPickerField } from "@/components/media-picker";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  categoryId: string | null;
  status: string;
  publishedAt: string | null;
}

export default function EditBlogPostPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const postId = params.postId as string;
  const t = useTranslations("blog");
  const router = useRouter();

  const { data: postData, loading: postLoading } = useQuery<{ blogPost: BlogPostData }>(
    GET_BLOG_POST,
    { variables: { siteId, postId } }
  );

  const { data: catData } = useQuery<{ blogCategories: Array<{ id: string; name: string }> }>(
    GET_BLOG_CATEGORIES,
    { variables: { siteId } }
  );

  const [updatePost, { loading: saving }] = useMutation(UPDATE_BLOG_POST);
  const [deletePost] = useMutation(DELETE_BLOG_POST);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const categories = catData?.blogCategories ?? [];

  useEffect(() => {
    if (postData?.blogPost && !initialized) {
      const p = postData.blogPost;
      setTitle(p.title);
      setSlug(p.slug);
      setExcerpt(p.excerpt || "");
      setContent(p.content);
      setFeaturedImage(p.featuredImage || "");
      setCategoryId(p.categoryId || "");
      setStatus(p.status);
      setInitialized(true);
    }
  }, [postData, initialized]);

  async function handleSave(publishStatus?: string) {
    if (!title.trim()) {
      setError("Titel krävs");
      return;
    }
    setError("");
    try {
      await updatePost({
        variables: {
          input: {
            id: postId,
            siteId,
            title: title.trim(),
            slug: slug.trim(),
            content,
            excerpt: excerpt || null,
            featuredImage: featuredImage || null,
            categoryId: categoryId || null,
            status: publishStatus || status,
          },
        },
      });
      if (publishStatus) setStatus(publishStatus);
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deletePost({ variables: { siteId, postId } });
    router.push(`/dashboard/sites/${siteId}/apps/blog/posts` as "/dashboard");
  }

  if (postLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
        ))}
      </div>
    );
  }

  if (!postData?.blogPost) {
    return <p className="text-text-muted">Inlägget hittades inte.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/sites/${siteId}/apps/blog/posts` as "/dashboard"}
          className="text-sm text-text-muted hover:text-primary-deep"
        >
          &larr; {t("backToPosts")}
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            {t("delete")}
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-lg border border-border-light px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-gray-50 disabled:opacity-50"
          >
            {t("save")}
          </button>
          {status !== "PUBLISHED" && (
            <button
              onClick={() => handleSave("PUBLISHED")}
              disabled={saving}
              className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
            >
              {t("publish")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-border-light bg-white/80 p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("title")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-base outline-none focus:border-primary-deep"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("slug")}</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-mono outline-none focus:border-primary-deep"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("excerpt")}</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("content")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-mono outline-none focus:border-primary-deep"
            placeholder="Markdown stöds"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">{t("featuredImage")}</label>
          <MediaPickerField
            value={featuredImage}
            onChange={setFeaturedImage}
            label=""
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">{t("status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
            >
              <option value="DRAFT">{t("draft")}</option>
              <option value="PUBLISHED">{t("published")}</option>
              <option value="ARCHIVED">{t("archived")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
