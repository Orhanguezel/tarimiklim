"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocale, useTranslations } from "next-intl";

type Message = {
  id: number;
  sender_type: "user" | "staff";
  body: string;
  created_at: string;
};

interface Props {
  ticketId: number;
  onBack: () => void;
}

export function TicketDetail({ ticketId, onBack }: Props) {
  const t = useTranslations("dashboard.support");
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ items: Message[] }>(`/support/tickets/${ticketId}/messages`);
      setMessages(res.items ?? []);
    } catch {
      // sessizce
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void fetch(); }, [fetch]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await apiPost(`/support/tickets/${ticketId}/messages`, { body: reply });
      setReply("");
      await fetch();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
      >
        ← {t("back")}
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border px-5 py-4 ${
                m.sender_type === "user"
                  ? "ml-8 border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5"
                  : "mr-8 border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              <p className="text-[12px] font-medium text-[var(--color-muted)] mb-1.5">
                {m.sender_type === "user" ? t("you") : t("supportTeam")} ·{" "}
                {new Date(m.created_at).toLocaleString(locale)}
              </p>
              <p className="text-[13px] text-[var(--color-foreground)] whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleReply} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
        <textarea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("replyPlaceholder")}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[13px] text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand)] resize-none transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !reply.trim()}
          className="h-9 w-full rounded-lg bg-[var(--color-brand)] text-[13px] font-semibold text-[var(--color-navy)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {sending ? t("submitting") : t("reply")}
        </button>
      </form>
    </div>
  );
}
