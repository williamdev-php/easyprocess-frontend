"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_BLOG_CATEGORIES } from "@/graphql/queries";
import { CREATE_BLOG_CATEGORY, UPDATE_BLOG_CATEGORY, DELETE_BLOG_CATEGORY } from "@/graphql/mutations";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export default function BlogCategoriesPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("blog");

  const { data, loading, refetch } = useQuery<{ blogCategories: Category[] }>(
    GET_BLOG_CATEGORIES,
    { variables: { siteId }, fetchPolicy: "cache-and-network" }
  );

  const [createCategory, { loading: creating }] = useMutation(CREATE_BLOG_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_BLOG_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_BLOG_CATEGORY);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const categories = data?.blogCategories ?? [];

  async function handleCreate() {
    if (!newName.trim()) return;
    await createCategory({
      variables: {
        input: {
          siteId,
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        },
      },
    });
    setNewName("");
    setNewDescription("");
    refetch();
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    await updateCategory({
      variables: {
        input: {
          id,
          siteId,
          name: editName.trim(),
          description: editDescription.trim() || null,
        },
      },
    });
    setEditId(null);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteCategoryConfirm"))) return;
    await deleteCategory({ variables: { siteId, categoryId: id } });
    refetch();
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <h2 className="text-lg font-semibold text-text-primary">{t("categories")}</h2>

      {/* Add new category */}
      <div className="rounded-xl border border-border-light bg-white/80 p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">{t("addCategory")}</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder={t("categoryName")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <input
            type="text"
            placeholder={t("categoryDescription")}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="shrink-0 rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
          >
            {t("addCategory")}
          </button>
        </div>
      </div>

      {/* Category list */}
      {loading && categories.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-text-muted">{t("noCategories")}</p>
      ) : (
        <div className="rounded-xl border border-border-light bg-white/80 shadow-sm">
          <div className="divide-y divide-border-light">
            {categories.map((cat) => (
              <div key={cat.id} className="px-4 py-3">
                {editId === cat.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg border border-border-light bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-deep"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder={t("categoryDescription")}
                      className="flex-1 rounded-lg border border-border-light bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-deep"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="rounded-lg bg-primary-deep px-3 py-1.5 text-sm font-medium text-white"
                      >
                        {t("save")}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded-lg border border-border-light px-3 py-1.5 text-sm text-text-muted"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-text-primary">{cat.name}</span>
                      <span className="ml-2 text-xs text-text-muted">/{cat.slug}</span>
                      {cat.description && (
                        <p className="mt-0.5 text-sm text-text-muted">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{cat.postCount} {t("postsCount")}</span>
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-primary-deep/5 hover:text-primary-deep"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
