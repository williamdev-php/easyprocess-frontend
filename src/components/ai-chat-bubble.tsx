"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAIChat, type AIChatMessage } from "@/hooks/use-ai-chat";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIChatBubbleProps {
  siteId: string;
  onSiteUpdate: (siteData: Record<string, unknown>) => void;
  enabled: boolean;
  defaultOpen?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIChatBubble({
  siteId,
  onSiteUpdate,
  enabled,
  defaultOpen = false,
}: AIChatBubbleProps) {
  const t = useTranslations("aiChat");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sendMessage,
    isConnected,
    isStreaming,
    streamingContent,
    error,
    reconnect,
  } = useAIChat({ siteId, onSiteUpdate, enabled: enabled && isOpen });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInputValue("");
  }, [inputValue, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // --- Collapsed: floating button ---
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[200] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 animate-[pulse_3s_ease-in-out_2]"
        title={t("title")}
      >
        {/* Sparkle / chat icon */}
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </button>
    );
  }

  // --- Expanded: chat panel ---
  return (
    <div className="fixed bottom-0 right-0 z-[200] flex flex-col md:bottom-4 md:right-4 md:rounded-2xl md:h-[520px] md:w-[380px] h-full w-full bg-[#1a1a2e] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0 bg-[#1a1a2e]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/90 leading-tight">{t("title")}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-[10px] text-white/40">
                {isConnected ? t("connected") : t("disconnected")}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 mb-3">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/70 mb-1">{t("greeting")}</p>
            <p className="text-xs text-white/40 max-w-[260px]">
              {t("hint")}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-3.5 py-2.5">
              <p className="text-sm text-white/80 whitespace-pre-wrap break-words">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 animate-pulse" />
              </p>
            </div>
          </div>
        )}

        {/* Streaming indicator (no content yet) */}
        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 text-center">
              {error}
              {!isConnected && (
                <button
                  onClick={reconnect}
                  className="ml-2 underline hover:text-red-300 transition-colors"
                >
                  {t("reconnect")}
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 px-3 py-3 shrink-0 bg-[#1a1a2e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            disabled={!isConnected || isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 disabled:opacity-50 max-h-24"
            style={{ minHeight: "40px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected || isStreaming}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble sub-component
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: AIChatMessage }) {
  const isUser = message.role === "user";

  // Strip ```json blocks from display (they're technical, not user-facing)
  const displayContent = message.content
    .replace(/```json[\s\S]*?```/g, "")
    .trim();

  // Don't render empty messages (purely JSON responses)
  if (!displayContent) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-white/5 border border-white/5 text-white/80"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
      </div>
    </div>
  );
}
