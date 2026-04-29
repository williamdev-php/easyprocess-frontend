"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type DragEvent,
} from "react";
import {
  uploadMediaFile,
  listMedia,
  deleteMediaFile,
  createFolder,
  formatFileSize,
  isImageType,
  type MediaFile,
} from "@/lib/media-api";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// MediaPickerField — the small inline control that opens the dialog
// ---------------------------------------------------------------------------

export function MediaPickerField({
  value,
  onChange,
  label,
  accept = "image/*",
  folder = "",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  folder?: string;
}) {
  const t = useTranslations("mediaPicker");
  const [open, setOpen] = useState(false);
  const hasValue = !!value;

  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {/* Thumbnail preview */}
        {hasValue ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border-light bg-gray-50">
            <img
              src={value}
              alt={t("selectedPreview")}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border-light bg-gray-50 text-text-muted">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21z"
              />
            </svg>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-border-light bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
          >
            {hasValue ? t("changeImage") : t("selectMedia")}
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-left text-[10px] text-red-400 hover:text-red-600 transition-colors"
            >
              {t("remove")}
            </button>
          )}
        </div>
      </div>

      {open && (
        <MediaPickerDialog
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          accept={accept}
          initialFolder={folder}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MediaPickerDialog — fullscreen modal with media library
// ---------------------------------------------------------------------------

export function MediaPickerDialog({
  onSelect,
  onClose,
  accept,
  initialFolder,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
  accept: string;
  initialFolder: string;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const closingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const t = useTranslations("mediaPicker");

  const handleAnimatedClose = useCallback(() => {
    setIsClosing(true);
    closingTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
    };
  }, []);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMedia(currentFolder);
      setFiles(data.files);
      setFolders(data.folders);
      setStorageUsed(data.storageUsed);
      setStorageLimit(data.storageLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentFolder, t]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleAnimatedClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAnimatedClose]);

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const filesToUpload = Array.from(fileList);
      if (filesToUpload.length === 0) return;

      setUploading(true);
      setError(null);

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(
          filesToUpload.length > 1
            ? t("uploadingProgress", { name: file.name, current: i + 1, total: filesToUpload.length })
            : t("uploading", { name: file.name })
        );
        try {
          await uploadMediaFile(file, currentFolder);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : t("uploadFailed", { name: file.name })
          );
          break;
        }
      }

      setUploading(false);
      setUploadProgress(null);
      await loadMedia();
    },
    [currentFolder, loadMedia]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMediaFile(id);
        setConfirmDeleteId(null);
        await loadMedia();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("deleteError"));
      }
    },
    [loadMedia]
  );

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim(), currentFolder);
      setShowNewFolder(false);
      setNewFolderName("");
      // Navigate into the new folder
      const newPath = currentFolder
        ? `${currentFolder}/${newFolderName.trim()}`
        : newFolderName.trim();
      setCurrentFolder(newPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("folderError"));
    }
  }, [newFolderName, currentFolder]);

  const navigateUp = () => {
    const parts = currentFolder.split("/");
    parts.pop();
    setCurrentFolder(parts.join("/"));
  };

  const navigateToFolder = (folder: string) => {
    setCurrentFolder(currentFolder ? `${currentFolder}/${folder}` : folder);
  };

  const selectedFile = files.find((f) => f.id === selectedId);
  const breadcrumbs = currentFolder ? currentFolder.split("/") : [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${isClosing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
        onClick={handleAnimatedClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className={`relative z-10 flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-light bg-white shadow-2xl ${isClosing ? "animate-modal-out" : "animate-modal-in"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div>
            <h2 id="media-picker-title" className="text-lg font-bold text-primary-deep">{t("title")}</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {formatFileSize(storageUsed)} / {formatFileSize(storageLimit)} använt
            </p>
          </div>
          <button
            type="button"
            onClick={handleAnimatedClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-100 hover:text-primary-deep"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Toolbar: breadcrumbs + actions */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-2.5">
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setCurrentFolder("")}
              className="font-medium text-primary hover:underline"
            >
              Media
            </button>
            {breadcrumbs.map((part, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="text-text-muted">/</span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentFolder(breadcrumbs.slice(0, idx + 1).join("/"))
                  }
                  className="font-medium text-primary hover:underline"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-1 rounded-lg border border-border-light px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z"
                />
              </svg>
              {t("newFolder")}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              {t("upload")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex items-center gap-2 border-b border-border-light bg-gray-50 px-6 py-2.5">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolder(false);
              }}
              placeholder={t("folderNamePlaceholder")}
              autoFocus
              className="flex-1 rounded-lg border border-border-light bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-deep"
            >
              {t("create")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName("");
              }}
              className="rounded-lg px-2 py-1.5 text-xs text-text-muted hover:text-primary-deep"
            >
              {t("cancel")}
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 font-medium hover:underline"
            >
              {t("close")}
            </button>
          </div>
        )}

        {/* Upload progress */}
        {uploadProgress && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-700">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            {uploadProgress}
          </div>
        )}

        {/* Content — file grid with drag-and-drop */}
        <div
          className={`flex-1 overflow-y-auto p-6 transition-colors ${isDragOver ? "bg-primary/5" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : files.length === 0 && folders.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-gray-50 p-6">
                <svg
                  className="mx-auto h-12 w-12 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-primary-deep">
                {t("noFiles")}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {t("dropHint")}
              </p>
            </div>
          ) : (
            <div>
              {/* Back button */}
              {currentFolder && (
                <button
                  type="button"
                  onClick={navigateUp}
                  className="mb-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-primary-deep"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                  {t("back")}
                </button>
              )}

              {/* Folders */}
              {folders.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-text-muted">
                    {t("folders")}
                  </p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {folders.map((folder) => (
                      <button
                        key={folder}
                        type="button"
                        onClick={() => navigateToFolder(folder)}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border-light p-3 transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <svg
                          className="h-8 w-8 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z"
                          />
                        </svg>
                        <span className="max-w-full truncate text-[10px] font-medium text-primary-deep">
                          {folder}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Files grid */}
              {files.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">
                    {t("files")}
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {files.map((file) => {
                      const isImage = isImageType(file.contentType);
                      const isSelected = selectedId === file.id;
                      return (
                        <div
                          key={file.id}
                          className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border-light hover:border-primary/40"
                          }`}
                          onClick={() => setSelectedId(file.id)}
                          onDoubleClick={() => onSelect(file.url)}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-square bg-gray-50">
                            {isImage ? (
                              <img
                                src={file.url}
                                alt={file.originalFilename}
                                width={200}
                                height={200}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <FileIcon contentType={file.contentType} />
                              </div>
                            )}
                          </div>

                          {/* Filename */}
                          <div className="px-2 py-1.5">
                            <p className="truncate text-[10px] font-medium text-primary-deep">
                              {file.originalFilename}
                            </p>
                            <p className="text-[9px] text-text-muted">
                              {formatFileSize(file.sizeBytes)}
                              {file.width && file.height
                                ? ` \u00b7 ${file.width}\u00d7${file.height}`
                                : ""}
                            </p>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(file.id);
                            }}
                            className="absolute right-1 top-1 rounded-md bg-white/80 p-1 text-red-400 opacity-0 backdrop-blur-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>

                          {/* Selection checkmark */}
                          {isSelected && (
                            <div className="absolute left-1 top-1 rounded-full bg-primary p-0.5">
                              <svg
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-light px-6 py-3">
          <div className="text-xs text-text-muted">
            {selectedFile && (
              <span>
                {selectedFile.originalFilename} \u00b7{" "}
                {formatFileSize(selectedFile.sizeBytes)}
                {selectedFile.width && selectedFile.height
                  ? ` \u00b7 ${selectedFile.width}\u00d7${selectedFile.height}`
                  : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAnimatedClose}
              className="rounded-lg border border-border-light px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedFile) onSelect(selectedFile.url);
              }}
              disabled={!selectedFile}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-40"
            >
              {t("select")}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl border border-border-light bg-white p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-primary-deep">
              {t("deleteTitle")}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              {t("deleteDescription")}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileIcon — icon for non-image files
// ---------------------------------------------------------------------------

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType === "application/pdf") {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
          />
        </svg>
        <span className="text-[9px] font-medium text-red-500">PDF</span>
      </div>
    );
  }

  if (contentType.startsWith("video/")) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg
          className="h-8 w-8 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"
          />
        </svg>
        <span className="text-[9px] font-medium text-purple-500">Video</span>
      </div>
    );
  }

  return (
    <svg
      className="h-8 w-8 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
      />
    </svg>
  );
}
