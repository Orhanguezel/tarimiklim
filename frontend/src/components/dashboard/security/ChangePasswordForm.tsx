"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api-client";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useTranslations } from "next-intl";

export function ChangePasswordForm() {
  const t = useTranslations("dashboard.security");
  const { user } = useAuthSession();
  const emailVerified = typeof (user as { email_verified?: unknown } | null)?.email_verified === "number"
    ? Boolean((user as { email_verified?: number }).email_verified)
    : Boolean((user as { email_verified?: boolean } | null)?.email_verified);
  const toast = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.next.length < 8) {
      setError(t("errorMinLength"));
      return;
    }
    if (form.next !== form.confirm) {
      setError(t("errorMismatch"));
      return;
    }
    setSaving(true);
    try {
      await apiPost("/user/change-password", {
        currentPassword: form.current,
        newPassword: form.next,
      });
      toast.success(t("success"));
      setForm({ current: "", next: "", confirm: "" });
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      toast.error(msg === "Mevcut sifre yanlis" ? t("errorCurrentWrong") : t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-panel dashboard-panel-body">
        <p className="dashboard-kicker">E-posta adresi</p>
        <p className="dashboard-info-value">{user?.email}</p>
        {emailVerified ? (
          <span className="dashboard-badge is-success">
            ✓ {t("verified")}
          </span>
        ) : (
          <span className="dashboard-badge is-danger">
            {t("notVerified")}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="dashboard-panel dashboard-panel-body">
        <h2 className="dashboard-panel-title">
          {t("title")}
        </h2>

        {[
          { key: "current", label: t("currentPassword"), placeholder: "••••••••" },
          { key: "next",    label: t("newPassword"),   placeholder: t("newPasswordPlaceholder") },
          { key: "confirm", label: t("confirmPassword"), placeholder: "••••••••" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="dashboard-field">
            <label>{label}</label>
            <input
              type="password"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
              placeholder={placeholder}
              className="dashboard-input"
            />
          </div>
        ))}

        {error && (
          <p className="dashboard-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="dashboard-button is-full"
        >
          {saving ? t("saving") : t("submit")}
        </button>
      </form>
    </div>
  );
}
