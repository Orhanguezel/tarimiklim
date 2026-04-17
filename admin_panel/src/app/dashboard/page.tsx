'use client';

import Link from 'next/link';

export default function DashboardHome() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Özet</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">
        Konumlar, gönderilen uyarılar ve don kurallarını sol menüden yönetin.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/locations"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-[var(--color-brand)] hover:underline"
        >
          Konum yönetimi
        </Link>
        <Link
          href="/dashboard/alerts"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-[var(--color-brand)] hover:underline"
        >
          Uyarı geçmişi
        </Link>
        <Link
          href="/dashboard/alerts/rules"
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-[var(--color-brand)] hover:underline"
        >
          Uyarı kuralları
        </Link>
      </ul>
    </div>
  );
}
