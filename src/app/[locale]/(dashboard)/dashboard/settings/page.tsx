"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_INDUSTRIES, GET_PLATFORM_SETTINGS } from "@/graphql/queries";
import {
  CREATE_INDUSTRY,
  UPDATE_INDUSTRY,
  DELETE_INDUSTRY,
  UPDATE_PLATFORM_SETTING,
} from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

interface PlatformSetting {
  key: string;
  value: string;
}

const AI_MODELS = [
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    description: "Snabb & kostnadseffektiv (standard)",
  },
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Google Gemini — snabb & billig",
  },
];

const IMAGE_MODELS = [
  {
    value: "nano-banana",
    label: "Nano Banana",
    description: "Standard kvalitet, snabbast",
  },
  {
    value: "nano-banana-2",
    label: "Nano Banana 2",
    description: "Förbättrad kvalitet (standard)",
  },
  {
    value: "nano-banana-pro",
    label: "Nano Banana Pro",
    description: "Högsta kvalitet, produktionsklass",
  },
];

export default function SettingsPage() {
  const t = useTranslations("settings");

  // Industries
  const { data, loading, refetch } = useQuery<any>(GET_INDUSTRIES, {
    fetchPolicy: "cache-and-network",
  });
  const [createIndustry, { loading: creating }] = useMutation(CREATE_INDUSTRY);
  const [updateIndustry] = useMutation(UPDATE_INDUSTRY);
  const [deleteIndustry] = useMutation(DELETE_INDUSTRY);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const industries: Industry[] = data?.industries ?? [];

  // Platform settings
  const { data: settingsData, loading: settingsLoading } = useQuery<any>(
    GET_PLATFORM_SETTINGS,
    { fetchPolicy: "cache-and-network" }
  );
  const [updatePlatformSetting] = useMutation(UPDATE_PLATFORM_SETTING);

  const [aiModel, setAiModel] = useState("claude-haiku-4-5-20251001");
  const [imageModel, setImageModel] = useState("nano-banana-2");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (settingsData?.platformSettings) {
      const settings: PlatformSetting[] = settingsData.platformSettings;
      const ai = settings.find((s) => s.key === "ai_model");
      const img = settings.find((s) => s.key === "image_model");
      if (ai) setAiModel(ai.value);
      if (img) setImageModel(img.value);
    }
  }, [settingsData]);

  async function handleModelChange(key: string, value: string) {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await updatePlatformSetting({
        variables: { input: { key, value } },
      });
      if (key === "ai_model") setAiModel(value);
      if (key === "image_model") setImageModel(value);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      // Error shown by Apollo
    } finally {
      setSavingKey(null);
    }
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    try {
      await createIndustry({
        variables: { input: { name, description: newDesc.trim() || null } },
      });
      setNewName("");
      setNewDesc("");
      refetch();
    } catch {
      // Error shown by Apollo
    }
  }

  async function handleUpdate(id: string) {
    try {
      await updateIndustry({
        variables: {
          input: {
            id,
            name: editName.trim() || undefined,
            description: editDesc.trim() || null,
          },
        },
      });
      setEditingId(null);
      refetch();
    } catch {
      // Error shown by Apollo
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteIndustry({ variables: { industryId: id } });
      refetch();
    } catch {
      // Error shown by Apollo
    }
  }

  function startEditing(ind: Industry) {
    setEditingId(ind.id);
    setEditName(ind.name);
    setEditDesc(ind.description ?? "");
  }

  return (
    <div className="animate-page-enter space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* AI Models section */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="text-lg font-semibold text-primary-deep mb-1">
          {t("aiModelsTitle")}
        </h3>
        <p className="text-sm text-text-muted mb-5">
          {t("aiModelsSubtitle")}
        </p>

        {settingsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Site generation model */}
            <div>
              <label className="block text-sm font-medium text-primary-deep mb-1">
                {t("siteGenerationModel")}
              </label>
              <p className="text-xs text-text-muted mb-2">
                {t("siteGenerationModelDesc")}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={aiModel}
                  onChange={(e) => handleModelChange("ai_model", e.target.value)}
                  disabled={savingKey === "ai_model"}
                  className="w-full max-w-sm rounded-xl border border-border-light bg-white px-3 py-2 text-sm text-primary-deep shadow-sm transition-colors focus:border-primary-deep focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} — {m.description}
                    </option>
                  ))}
                </select>
                {savingKey === "ai_model" && (
                  <span className="text-xs text-text-muted animate-pulse">
                    {t("savingModel")}
                  </span>
                )}
                {savedKey === "ai_model" && (
                  <span className="text-xs text-green-600">
                    {t("modelUpdated")}
                  </span>
                )}
              </div>
            </div>

            {/* Image generation model */}
            <div>
              <label className="block text-sm font-medium text-primary-deep mb-1">
                {t("imageGenerationModel")}
              </label>
              <p className="text-xs text-text-muted mb-2">
                {t("imageGenerationModelDesc")}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={imageModel}
                  onChange={(e) => handleModelChange("image_model", e.target.value)}
                  disabled={savingKey === "image_model"}
                  className="w-full max-w-sm rounded-xl border border-border-light bg-white px-3 py-2 text-sm text-primary-deep shadow-sm transition-colors focus:border-primary-deep focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  {IMAGE_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} — {m.description}
                    </option>
                  ))}
                </select>
                {savingKey === "image_model" && (
                  <span className="text-xs text-text-muted animate-pulse">
                    {t("savingModel")}
                  </span>
                )}
                {savedKey === "image_model" && (
                  <span className="text-xs text-green-600">
                    {t("modelUpdated")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Industries section */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="text-lg font-semibold text-primary-deep mb-1">
          {t("industriesTitle")}
        </h3>
        <p className="text-sm text-text-muted mb-5">
          {t("industriesSubtitle")}
        </p>

        {/* Add form */}
        <div className="flex flex-col gap-3 sm:flex-row mb-6">
          <Input
            placeholder={t("industryNamePlaceholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="sm:w-56"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Input
            placeholder={t("industryDescPlaceholder")}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? t("adding") : t("addIndustry")}
          </Button>
        </div>

        {/* Industries list */}
        {loading && industries.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : industries.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            {t("noIndustries")}
          </p>
        ) : (
          <div className="space-y-2">
            {industries.map((ind) => (
              <div
                key={ind.id}
                className="flex items-center gap-3 rounded-xl border border-border-light bg-white p-3 transition-shadow hover:shadow-sm"
              >
                {editingId === ind.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-48"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(ind.id)
                      }
                    />
                    <Input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="flex-1"
                      placeholder={t("industryDescPlaceholder")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleUpdate(ind.id)
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(ind.id)}
                    >
                      {t("save")}
                    </Button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-deep">
                          {ind.name}
                        </span>
                        <span className="rounded-full bg-primary-deep/5 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                          {ind.slug}
                        </span>
                      </div>
                      {ind.description && (
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {ind.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => startEditing(ind)}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(ind.id)}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
