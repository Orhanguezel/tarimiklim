// =============================================================
// FILE: src/app/(main)/admin/(admin)/db/_components/admin-db-client.tsx
// FINAL — App Router + shadcn standards
// ✅ No Bootstrap classes (container-fluid, d-flex, etc.)
// ✅ No inline styles
// ✅ shadcn Card / UI components
// ✅ Correct import path for AdminDbAuthGate
// =============================================================
"use client";

import type React from "react";

import { Lightbulb } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { FullDbHeader } from "../fullDb/full-db-header";
import { FullDbImportPanel } from "../fullDb/full-db-import-panel";
import { SnapshotsPanel } from "../fullDb/snapshots-panel";
import { ModuleTabs } from "../modules/module-tabs";
import { AdminDbAuthGate } from "./admin-db-auth-gate";

export const AdminDbClient: React.FC = () => {
  const t = useAdminT("admin.db");

  return (
    <AdminDbAuthGate>
      {({ adminSkip }) => (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-gm-gold" />
                <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-4xl text-gm-text">{t("title")}</h1>
                {/* Help Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-gm-surface/30 hover:bg-gm-surface border border-gm-border-soft transition-all text-gm-muted hover:text-gm-gold">
                      <Lightbulb className="size-4" />
                      <span className="sr-only">{t("help.pageTitle")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-80 bg-gm-bg border-gm-border-soft shadow-xl rounded-2xl">
                    <div className="space-y-3">
                      <p className="font-serif text-sm text-gm-gold">{t("help.dbAdmin")}</p>
                      <ul className="space-y-2 text-gm-muted text-sm italic font-serif">
                        <li>
                          <span className="font-medium text-gm-text">Full DB</span>: {t("help.fullDbDesc")}
                        </li>
                        <li>
                          <span className="font-medium text-gm-text">Snapshot</span>: {t("help.snapshotDesc")}
                        </li>
                        <li>
                          <span className="font-medium text-gm-text">Module Export/Import</span>:{" "}
                          {t("help.moduleDesc")}
                        </li>
                        <li>
                          <span className="font-medium text-gm-text">UI (site_settings ui_*)</span>:{" "}
                          {t("help.uiDesc")}
                        </li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-gm-muted text-sm font-serif italic max-w-xl">{t("description")}</p>
            </div>
          </div>

          {/* Full DB Operations */}
          <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-gm-border-soft/50 pb-6 p-8">
              <CardTitle className="font-serif text-2xl text-gm-text">Full DB</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              <FullDbHeader />
              <FullDbImportPanel />
            </CardContent>
          </Card>

          {/* Snapshots */}
          <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-gm-border-soft/50 pb-6 p-8">
              <CardTitle className="font-serif text-2xl text-gm-text">Snapshots</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <SnapshotsPanel adminSkip={adminSkip} />
            </CardContent>
          </Card>

          {/* Module Operations */}
          <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
            <CardHeader className="border-b border-gm-border-soft/50 pb-6 p-8">
              <CardTitle className="font-serif text-2xl text-gm-text">Module Export / Import</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ModuleTabs adminSkip={adminSkip} />
            </CardContent>
          </Card>
        </div>
      )}
    </AdminDbAuthGate>
  );
};
