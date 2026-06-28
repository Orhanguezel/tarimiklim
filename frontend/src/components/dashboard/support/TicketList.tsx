"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { TicketDetail } from "./TicketDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLocale, useTranslations } from "next-intl";

type Ticket = {
  id: number;
  subject: string;
  status: "open" | "answered" | "closed";
  priority: string;
  created_at: string;
  updated_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  open: "is-warning",
  answered: "is-success",
  closed: "",
};

interface Props { locale: string }

export function TicketList({ locale }: Props) {
  const t = useTranslations("dashboard.support");
  const localeCode = useLocale();
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ items: Ticket[] }>("/support/tickets/my");
      setItems(res.items ?? []);
    } catch {
      // sessizce
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  if (loading) {
    return (
      <div className="dashboard-list">
        {[1, 2].map((i) => <Skeleton key={i} className="dashboard-list-skeleton" />)}
      </div>
    );
  }

  if (selected !== null) {
    return <TicketDetail ticketId={selected} onBack={() => { setSelected(null); void fetch(); }} />;
  }

  if (items.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      <h2 className="dashboard-panel-title">
        {t("listTitle")}
      </h2>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelected(item.id)}
          className="dashboard-list-item dashboard-list-button"
        >
          <div className="dashboard-list-content">
            <p className="dashboard-list-title">{item.subject}</p>
            <p className="dashboard-list-note">
              {new Date(item.updated_at).toLocaleDateString(localeCode)}
            </p>
          </div>
          <span className={`dashboard-badge ${STATUS_COLOR[item.status] ?? ""}`}>
            {t(`status.${item.status}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
