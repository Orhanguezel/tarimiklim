"use client";

import { useState } from "react";
import { ApiError, apiPost } from "@/lib/api-client";
import { useToast } from "@/components/providers/ToastProvider";
import { useTranslations } from "next-intl";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useProfile } from "@/lib/hooks/useProfile";

export function NewTicketForm({ onCreated }: { onCreated?: () => void }) {
  const t = useTranslations("dashboard.support");
  const toast = useToast();
  const { user } = useAuthSession();
  const { data: profile } = useProfile();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (subject.length < 2) {
      toast.error(t("subjectMinError"));
      return;
    }
    if (message.length < 10) {
      toast.error(t("messageMinError"));
      return;
    }

    setLoading(true);
    try {
      const email = (user?.email || "").trim();
      const name = (profile?.full_name || user?.full_name || email.split("@")[0] || "").trim();
      if (!email) {
        toast.error(t("emailMissingError"));
        return;
      }

      await apiPost("/support/tickets", {
        name,
        email,
        subject,
        message,
        category: "genel",
      });
      toast.success(t("created"));
      setForm({ subject: "", message: "" });
      onCreated?.();
    } catch (error) {
      if (error instanceof ApiError && error.code) {
        toast.error(`${t("createError")} (${error.code})`);
      } else {
        toast.error(t("createError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-panel dashboard-panel-body">
      <h2 className="dashboard-panel-title">
        {t("newTitle")}
      </h2>

      <div className="dashboard-field">
        <label>{t("subject")}</label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
          placeholder={t("subjectPlaceholder")}
          className={inputCls}
        />
      </div>

      <div className="dashboard-field">
        <label>{t("message")}</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
          placeholder={t("messagePlaceholder")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="dashboard-button is-full"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

const inputCls =
  "dashboard-input";
