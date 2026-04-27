"use client";

import dynamic from "next/dynamic";
import type { RichTextEditorProps } from "@/components/rich-text-editor";

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] animate-pulse rounded-lg border border-border-light bg-gray-50" />
  ),
});

export default function RichTextEditorDynamic(props: RichTextEditorProps) {
  return <RichTextEditor {...props} />;
}
