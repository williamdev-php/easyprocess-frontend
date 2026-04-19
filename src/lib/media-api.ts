/**
 * Media API — upload, list, and delete media files.
 *
 * Uses REST endpoints since file uploads require multipart/form-data.
 */

import { getAccessToken } from "@/lib/auth-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface MediaFile {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  folder: string;
  url: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface MediaListResponse {
  files: MediaFile[];
  folders: string[];
  currentFolder: string;
  storageUsed: number;
  storageLimit: number;
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map((item) => convertKeys(item)) as T;
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, val]) => [
        snakeToCamel(key),
        convertKeys(val),
      ])
    ) as T;
  }
  return obj as T;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadMediaFile(
  file: File,
  folder: string = ""
): Promise<MediaFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${API_URL}/api/media/upload`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  return convertKeys<MediaFile>(data);
}

export async function listMedia(folder: string = ""): Promise<MediaListResponse> {
  const params = new URLSearchParams();
  if (folder) params.set("folder", folder);

  const res = await fetch(`${API_URL}/api/media?${params}`, {
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load media: ${res.status}`);
  }

  const data = await res.json();
  return convertKeys<MediaListResponse>(data);
}

export async function deleteMediaFile(mediaId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/media/${mediaId}`, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Delete failed: ${res.status}`);
  }
}

export async function createFolder(
  folderName: string,
  parentFolder: string = ""
): Promise<string> {
  const formData = new FormData();
  formData.append("folder_name", folderName);
  formData.append("parent_folder", parentFolder);

  const res = await fetch(`${API_URL}/api/media/folders`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to create folder: ${res.status}`);
  }

  const data = await res.json();
  return data.folder;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageType(contentType: string): boolean {
  return contentType.startsWith("image/");
}
