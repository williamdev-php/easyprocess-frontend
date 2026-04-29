"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { MediaPickerDialog } from "@/components/media-picker";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Custom resizable image extension
// ---------------------------------------------------------------------------

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width") || el.style.width || null,
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return { width: attrs.width, style: `width: ${attrs.width}` };
        },
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute("height") || el.style.height || null,
        renderHTML: (attrs) => {
          if (!attrs.height) return {};
          return { height: attrs.height };
        },
      },
    };
  },
});

// ---------------------------------------------------------------------------
// Custom link extension with per-link rel support
// ---------------------------------------------------------------------------

const CustomLink = LinkExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rel: {
        default: "noopener noreferrer nofollow",
        parseHTML: (el) => el.getAttribute("rel"),
        renderHTML: (attrs) => {
          if (!attrs.rel) return {};
          return { rel: attrs.rel };
        },
      },
      target: {
        default: "_blank",
        parseHTML: (el) => el.getAttribute("target"),
        renderHTML: (attrs) => {
          if (!attrs.target) return {};
          return { target: attrs.target };
        },
      },
    };
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-100 active:scale-90 ${
        active
          ? "bg-primary-deep/10 text-primary-deep"
          : "text-text-secondary hover:bg-gray-100 hover:text-primary-deep"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border-light" />;
}

// ---------------------------------------------------------------------------
// Link dialog
// ---------------------------------------------------------------------------

function LinkDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const t = useTranslations("richTextEditor.linkDialog");
  const currentAttrs = editor.getAttributes("link");
  const [url, setUrl] = useState(currentAttrs.href || "");
  const [rel, setRel] = useState(currentAttrs.rel || "noopener noreferrer nofollow");
  const [target, setTarget] = useState(currentAttrs.target || "_blank");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim(), target, rel })
        .run();
    }
    onClose();
  }

  function handleRemove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  }

  const relOptions = [
    { value: "noopener noreferrer nofollow", label: "Nofollow (noopener noreferrer nofollow)" },
    { value: "noopener noreferrer", label: "Dofollow (noopener noreferrer)" },
    { value: "noopener noreferrer sponsored", label: "Sponsored (noopener noreferrer sponsored)" },
    { value: "noopener noreferrer ugc", label: "UGC (noopener noreferrer ugc)" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border-light bg-white p-5 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-semibold text-primary-deep">{t("title")}</h3>

        <div>
          <label htmlFor="link-url" className="mb-1 block text-xs font-medium text-text-secondary">
            URL
          </label>
          <input
            ref={inputRef}
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
          />
        </div>

        <div>
          <label htmlFor="link-rel" className="mb-1 block text-xs font-medium text-text-secondary">
            {t("relAttribute")}
          </label>
          <select
            id="link-rel"
            value={rel}
            onChange={(e) => setRel(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
          >
            {relOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="link-target" className="mb-1 block text-xs font-medium text-text-secondary">
            {t("openIn")}
          </label>
          <select
            id="link-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
          >
            <option value="_blank">{t("newWindow")}</option>
            <option value="_self">{t("sameWindow")}</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          {currentAttrs.href ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              {t("removeLink")}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-deep px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-deep/90"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image dialog (with media picker + resize)
// ---------------------------------------------------------------------------

function ImageDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const t = useTranslations("richTextEditor.imageDialog");
  const [showMediaPicker, setShowMediaPicker] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState("");

  function handleMediaSelect(url: string) {
    setImageUrl(url);
    setShowMediaPicker(false);
  }

  function handleInsert(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const imgAttrs: { src: string; alt?: string; title?: string; width?: string; height?: string } = {
      src: imageUrl.trim(),
    };
    if (alt.trim()) imgAttrs.alt = alt.trim();
    if (width.trim()) {
      imgAttrs.width = width.trim().includes("%") || width.trim().includes("px")
        ? width.trim()
        : `${width.trim()}px`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor.chain().focus().setImage(imgAttrs as any).run();
    onClose();
  }

  if (showMediaPicker) {
    return (
      <MediaPickerDialog
        onSelect={handleMediaSelect}
        onClose={onClose}
        accept="image/*"
        initialFolder=""
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleInsert}
        className="w-full max-w-md rounded-xl border border-border-light bg-white p-5 shadow-xl space-y-4"
      >
        <h3 className="text-sm font-semibold text-primary-deep">{t("title")}</h3>

        <div className="flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border-light bg-gray-50">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setShowMediaPicker(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("changeImage")}
          </button>
        </div>

        <div>
          <label htmlFor="img-alt" className="mb-1 block text-xs font-medium text-text-secondary">
            {t("altText")}
          </label>
          <input
            id="img-alt"
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={t("altPlaceholder")}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
          />
        </div>

        <div>
          <label htmlFor="img-width" className="mb-1 block text-xs font-medium text-text-secondary">
            {t("width")}
          </label>
          <input
            id="img-width"
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder={t("widthPlaceholder")}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary-deep px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-deep/90"
          >
            {t("insert")}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heading dropdown
// ---------------------------------------------------------------------------

function HeadingDropdown({ editor }: { editor: Editor }) {
  const t = useTranslations("richTextEditor");
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 120);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open && !isClosing) closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, isClosing, closeDropdown]);

  const levels = [1, 2, 3, 4, 5, 6] as const;
  const currentLevel = levels.find((l) => editor.isActive("heading", { level: l }));
  const label = currentLevel ? `H${currentLevel}` : "Normal";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => open && !isClosing ? closeDropdown() : setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t("headingStyle")}
        className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-text-secondary transition-colors hover:bg-gray-100 hover:text-primary-deep"
      >
        {label}
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className={`absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-border-light bg-white py-1 shadow-lg ${isClosing ? "animate-dropdown-out" : "animate-dropdown"}`}
        >
          <button
            type="button"
            role="option"
            aria-selected={!currentLevel}
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              closeDropdown();
            }}
            className={`block w-full px-3 py-1.5 text-left text-sm transition-colors ${
              !currentLevel ? "bg-primary-deep/5 font-medium text-primary-deep" : "text-text-secondary hover:bg-gray-50"
            }`}
          >
            {t("normalText")}
          </button>
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              role="option"
              aria-selected={currentLevel === level}
              onClick={() => {
                editor.chain().focus().toggleHeading({ level }).run();
                closeDropdown();
              }}
              className={`block w-full px-3 py-1.5 text-left transition-colors ${
                currentLevel === level
                  ? "bg-primary-deep/5 font-medium text-primary-deep"
                  : "text-text-secondary hover:bg-gray-50"
              }`}
              style={{ fontSize: `${Math.max(0.75, 1.1 - level * 0.08)}rem`, fontWeight: 600 }}
            >
              {t("heading", { level })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations("richTextEditor");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  return (
    <>
      <div
        role="toolbar"
        aria-label={t("textFormatting")}
        className="flex flex-wrap items-center gap-0.5 border-b border-border-light bg-gray-50/50 px-2 py-1.5"
      >
        {/* Headings */}
        <HeadingDropdown editor={editor} />

        <ToolbarDivider />

        {/* Inline formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title={t("bold")}
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("italic")}
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title={t("underline")}
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title={t("strikethrough")}
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("bulletList")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title={t("orderedList")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12" />
            <text x="2" y="8" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">1</text>
            <text x="2" y="14" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">2</text>
            <text x="2" y="19.5" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">3</text>
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Blockquote & code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title={t("blockquote")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title={t("inlineCode")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title={t("codeBlock")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={() => setShowLinkDialog(true)}
          active={editor.isActive("link")}
          title={t("insertLink")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.239a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.503" />
          </svg>
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton
          onClick={() => setShowImageDialog(true)}
          title={t("insertImage")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Horizontal rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t("horizontalRule")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M3 12h18" />
          </svg>
        </ToolbarButton>

        {/* Undo / Redo */}
        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={t("undo")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={t("redo")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </ToolbarButton>
      </div>

      {showLinkDialog && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
      {showImageDialog && (
        <ImageDialog editor={editor} onClose={() => setShowImageDialog(false)} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main editor component
// ---------------------------------------------------------------------------

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const t = useTranslations("richTextEditor");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      CustomLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none px-4 py-3 min-h-[300px] outline-none focus:outline-none " +
          "prose-headings:font-bold prose-a:text-blue-600 prose-a:underline " +
          "prose-img:rounded-lg prose-img:mx-auto prose-blockquote:border-l-4 prose-blockquote:border-gray-300 " +
          "prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 " +
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg",
        "aria-label": t("blogContent"),
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  // Sync external content changes (e.g. loading saved post)
  const lastContent = useRef(content);
  useEffect(() => {
    if (editor && content !== lastContent.current) {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
      lastContent.current = content;
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-[350px] animate-pulse rounded-lg border border-border-light bg-gray-50" />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-light bg-white focus-within:border-primary-deep focus-within:ring-1 focus-within:ring-primary-deep/20 transition-colors">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {placeholder && editor.isEmpty && (
        <div className="pointer-events-none absolute px-4 py-3 text-sm text-text-muted opacity-50">
          {placeholder}
        </div>
      )}
    </div>
  );
}
