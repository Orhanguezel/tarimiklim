"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { useToast } from "@/components/providers/ToastProvider";
import { Skeleton } from "@/components/ui/Skeleton";

type FormState = {
  full_name: string;
  phone: string;
  city: string;
  address_line1: string;
  bio: string;
};

export function ProfileForm() {
  const t = useTranslations("dashboard.profile");
  const { data, loading, update } = useProfile();
  const toast = useToast();
  const [form, setForm] = useState<FormState>({
    full_name: "", phone: "", city: "", address_line1: "", bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        full_name:    data.full_name    ?? "",
        phone:        data.phone        ?? "",
        city:         data.city         ?? "",
        address_line1: data.address_line1 ?? "",
        bio:          data.bio          ?? "",
      });
    }
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await update(form);
      toast.success(t("saveSuccess"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-panel dashboard-panel-body">
        <div className="dashboard-form-stack">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="dashboard-form-grid">
          <div className="dashboard-form-stack"><Skeleton className="h-4 w-20" /><Skeleton className="h-12 w-full" /></div>
          <div className="dashboard-form-stack"><Skeleton className="h-4 w-20" /><Skeleton className="h-12 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-panel">
      <div className="dashboard-panel-head">
        <h2>
          {t("title")}
        </h2>
        <p>{t("subtitle")}</p>
      </div>

      <div className="dashboard-panel-body">
        <div className="dashboard-form-grid">
          <Field label={t("fullName")}>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
              placeholder={t("fullNamePlaceholder")}
              className={inputCls}
            />
          </Field>

          <Field label={t("phone")}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              placeholder={t("phonePlaceholder")}
              className={inputCls}
            />
          </Field>

          <Field label={t("city")}>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
              placeholder={t("cityPlaceholder")}
              className={inputCls}
            />
          </Field>

          <Field label={t("address")}>
            <input
              type="text"
              value={form.address_line1}
              onChange={(e) => setForm((s) => ({ ...s, address_line1: e.target.value }))}
              placeholder={t("addressPlaceholder")}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={t("bio")}>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
            rows={4}
            placeholder={t("bioPlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            disabled={saving}
            className="dashboard-button"
          >
            {saving ? (
               <div className="dashboard-button-spinner" />
            ) : null}
            <span>{saving ? t("saving") : t("updateButton")}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dashboard-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "dashboard-input";
