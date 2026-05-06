// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/Chat.tsx
// Admin Chat & AI Support — Threads + Messages + Knowledge
// Chat
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import ChatThreadsPanel from './components/ChatThreadsPanel';
import ChatKnowledgePanel from './components/ChatKnowledgePanel';
import ChatSettingsPanel from './components/ChatSettingsPanel';

export default function ChatAdminPage() {
  const t = useAdminT('admin.chat');

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Müşteri Destek</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('header.title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {t('header.description')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="bg-gm-surface/30 border border-gm-border-soft p-1 rounded-2xl h-auto mb-8">
          <TabsTrigger 
            value="threads" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-gm-surface data-[state=active]:text-gm-gold data-[state=active]:shadow-lg text-gm-muted font-bold tracking-widest uppercase text-[10px] transition-all"
          >
            {t('tabs.threads')}
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-gm-surface data-[state=active]:text-gm-gold data-[state=active]:shadow-lg text-gm-muted font-bold tracking-widest uppercase text-[10px] transition-all"
          >
            {t('tabs.knowledge')}
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-gm-surface data-[state=active]:text-gm-gold data-[state=active]:shadow-lg text-gm-muted font-bold tracking-widest uppercase text-[10px] transition-all"
          >
            {t('tabs.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <ChatThreadsPanel />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <ChatKnowledgePanel />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ChatSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
