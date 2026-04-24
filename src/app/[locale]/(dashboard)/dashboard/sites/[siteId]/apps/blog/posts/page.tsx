"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_BLOG_POSTS, GET_BLOG_CATEGORIES } from "@/graphql/queries";
import { DELETE_BLOG_POST } from "@/graphql/mutations";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  categoryName: string | null;
  categoryId: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogPostsPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("blog");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filter: Record<string, unknown> = { page, pageSize: 20 };
  if (statusFilter) filter.status = statusFilter;
  if (categoryFilter) filter.categoryId = categoryFilter;
  if (search) filter.search = search;

  const { data, loading, refetch } = useQuery<{
    blogPosts: { items: BlogPost[]; total: number; page: number; pageSize: number };
  }>(GET_BLOG_POSTS, {
    variables: { siteId, filter },
    fetchPolicy: "cache-and-network",
  });

  const { data: catData } = useQuery<{ blogCategories: Category[] }>(GET_BLOG_CATEGORIES, {
    variables: { siteId },
  });

  const [deletePost] = useMutation(DELETE_BLOG_POST);

  const posts = data?.blogPosts.items ?? [];
  const total = data?.blogPosts.total ?? 0;
  const categories = catData?.blogCategories ?? [];
  const totalPages = Math.ceil(total / 20);

  async function handleDelete(postId: string) {
    if (!window.confirm(t("deleteConfirm"))) return;
    await deletePost({ variables: { siteId, postId } });
    refetch();
  }

  const statusBadge: Record<string, { label: string; color: string }> = {
    DRAFT: { label: t("draft"), color: "bg-amber-100 text-amber-700" },
    PUBLISHED: { label: t("published"), color: "bg-green-100 text-green-700" },
    ARCHIVED: { label: t("archived"), color: "bg-gray-100 text-gray-600" },
  };

  return (
    <div className="space-y-4 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-text-primary">{t("posts")}</h2>
        <Link
          href={`/dashboard/sites/${siteId}/apps/blog/posts/new` as "/dashboard"}
          className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
        >
          + {t("newPost")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("searchPosts")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="DRAFT">{t("draft")}</option>
          <option value="PUBLISHED">{t("published")}</option>
          <option value="ARCHIVED">{t("archived")}</option>
        </select>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Posts list */}
      {loading && posts.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-border-light bg-white/80 p-8 text-center shadow-sm">
          <p className="text-text-muted">{t("noPosts")}</p>
          <Link
            href={`/dashboard/sites/${siteId}/apps/blog/posts/new` as "/dashboard"}
            className="mt-3 inline-block rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
          >
            {t("createFirst")}
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border-light bg-white/80 shadow-sm">
          <div className="divide-y divide-border-light">
            {posts.map((post) => {
              const badge = statusBadge[post.status] || statusBadge.DRAFT;
              return (
                <div key={post.id} className="flex items-center gap-4 px-4 py-3">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/sites/${siteId}/apps/blog/posts/${post.id}` as "/dashboard"}
                      className="font-medium text-text-primary hover:text-primary-deep"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                      {post.categoryName && <span>{post.categoryName}</span>}
                      {post.publishedAt && (
                        <span>{new Date(post.publishedAt).toLocaleDateString("sv")}</span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Link
                      href={`/dashboard/sites/${siteId}/apps/blog/posts/${post.id}` as "/dashboard"}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-primary-deep/5 hover:text-primary-deep"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &larr;
          </button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
