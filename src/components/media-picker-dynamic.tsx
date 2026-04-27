"use client";

import dynamic from "next/dynamic";

export const MediaPickerField = dynamic(
  () =>
    import("@/components/media-picker").then((mod) => ({
      default: mod.MediaPickerField,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 w-full animate-pulse rounded-lg bg-gray-50" />
    ),
  },
);

export const MediaPickerDialog = dynamic(
  () =>
    import("@/components/media-picker").then((mod) => ({
      default: mod.MediaPickerDialog,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-gray-50" />
    ),
  },
);
