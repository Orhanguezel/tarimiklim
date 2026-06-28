export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard locale={locale}>
      <div className="dashboard-shell">
        <div className="dashboard-grid">
          <DashboardSidebar locale={locale} />

          <main className="dashboard-main">
            {children}
          </main>
        </div>

        <DashboardMobileNav locale={locale} />
      </div>
    </AuthGuard>
  );
}
