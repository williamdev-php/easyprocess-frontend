"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_CHAT_CONVERSATION } from "@/graphql/queries";
import { SEND_CHAT_REPLY, CLOSE_CHAT_CONVERSATION, REOPEN_CHAT_CONVERSATION } from "@/graphql/mutations";

interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: string;
  senderName: string | null;
  content: string;
  createdAt: string;
}

interface ChatConversation {
  id: string;
  siteId: string;
  visitorEmail: string;
  visitorName: string | null;
  status: string;
  subject: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
}

export default function ChatConversationDetailPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const conversationId = params.conversationId as string;
  const t = useTranslations("chat");

  const [replyContent, setReplyContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, refetch } = useQuery<{
    chatConversation: {
      conversation: ChatConversation;
      messages: ChatMessage[];
    } | null;
  }>(GET_CHAT_CONVERSATION, {
    variables: { siteId, conversationId },
    fetchPolicy: "cache-and-network",
    pollInterval: 10000,
  });

  const [sendReply, { loading: sending }] = useMutation(SEND_CHAT_REPLY);
  const [closeConversation] = useMutation(CLOSE_CHAT_CONVERSATION);
  const [reopenConversation] = useMutation(REOPEN_CHAT_CONVERSATION);

  const conversation = data?.chatConversation?.conversation;
  const messages = data?.chatConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim() || sending) return;
    await sendReply({
      variables: {
        input: { conversationId, siteId, content: replyContent.trim() },
      },
    });
    setReplyContent("");
    refetch();
  }

  async function handleClose() {
    if (!window.confirm(t("closeConfirm"))) return;
    await closeConversation({ variables: { siteId, conversationId } });
    refetch();
  }

  async function handleReopen() {
    await reopenConversation({ variables: { siteId, conversationId } });
    refetch();
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading && !data) {
    return <div className="py-12 text-center text-sm text-text-secondary">...</div>;
  }

  if (!conversation) {
    return <div className="py-12 text-center text-sm text-text-secondary">Conversation not found</div>;
  }

  const isOpen = conversation.status === "open";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/sites/${siteId}/apps/chat/conversations` as "/dashboard"}
          className="rounded-lg border border-border-light px-3 py-1.5 text-sm hover:bg-gray-50 transition"
        >
          &larr; {t("backToConversations")}
        </Link>
      </div>

      {/* Conversation info */}
      <div className="rounded-xl border border-border-light bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {conversation.visitorName || conversation.visitorEmail.split("@")[0]}
            </h2>
            <p className="text-sm text-text-secondary">{conversation.visitorEmail}</p>
            {conversation.subject && (
              <p className="mt-1 text-sm text-text-secondary">
                <span className="font-medium">{t("subject")}:</span> {conversation.subject}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {isOpen ? t("open") : t("closed")}
            </span>
            {isOpen ? (
              <button
                onClick={handleClose}
                className="rounded-lg border border-border-light px-3 py-1.5 text-sm hover:bg-gray-50 transition"
              >
                {t("close")}
              </button>
            ) : (
              <button
                onClick={handleReopen}
                className="rounded-lg border border-border-light px-3 py-1.5 text-sm hover:bg-gray-50 transition"
              >
                {t("reopen")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-xl border border-border-light bg-white">
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-8">{t("noMessages")}</p>
          ) : (
            messages.map((msg) => {
              const isAgent = msg.senderType === "agent";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                      isAgent
                        ? "bg-primary-deep text-white"
                        : "bg-gray-100 text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${isAgent ? "text-white/80" : "text-text-secondary"}`}>
                        {msg.senderName || (isAgent ? t("agent") : t("visitor"))}
                      </span>
                      <span className={`text-xs ${isAgent ? "text-white/60" : "text-text-secondary/60"}`}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply form */}
        <div className="border-t border-border-light p-4">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("replyPlaceholder")}
              className="flex-1 rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={!replyContent.trim() || sending}
              className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
            >
              {sending ? t("sending") : t("send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
