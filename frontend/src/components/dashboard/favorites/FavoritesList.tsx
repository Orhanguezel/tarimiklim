"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFavorites } from "@/lib/hooks/useFavorites";

interface Props {
  locale: string;
}

export function FavoritesList({ locale }: Props) {
  const t = useTranslations("dashboard.favorites");
  const commonT = useTranslations("dashboard.overview");
  const { remoteItems, loadingRemote, toggle, refetch } = useFavorites();

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (loadingRemote) {
    return (
      <div className="dashboard-list">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="dashboard-list-skeleton" />
        ))}
      </div>
    );
  }

  if (remoteItems.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>{t("empty")}</p>
        <Link
          href={`/${locale}/don-uyarisi`}
          className="dashboard-empty-action"
        >
          {commonT("viewForecast")}
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-card-grid">
      {remoteItems.map((item) => (
        <div
          key={item.slug}
          className="dashboard-list-item"
        >
          <div className="dashboard-list-content">
            <p className="dashboard-list-title">
              {item.nameTr}
            </p>
            <p className="dashboard-list-note">
              {item.categorySlug} · {item.unit}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void toggle(item.slug)}
            className="dashboard-outline-button is-danger"
          >
            {t("remove")}
          </button>
        </div>
      ))}
    </div>
  );
}
