// =============================================================
// FILE: src/app/(main)/admin/(admin)/telegram/telegram.tsx
// Admin Telegram Page (Settings + Inbound + AutoReply)
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { useTelegramTestMutation } from '@/integrations/hooks';

import TelegramSettingsPanel from './_components/telegram-settings-panel';
import TelegramInboundPanel from './_components/telegram-inbound-panel';
import TelegramAutoReplyPanel from './_components/telegram-auto-reply-panel';

export default function TelegramAdminPage() {
  const t = useAdminT('admin.telegram');
  const [telegramTest] = useTelegramTestMutation();
  const [isTesting, setIsTesting] = React.useState(false);

  const handleHeaderTest = async () => {
    setIsTesting(true);
    try {
      await telegramTest().unwrap();
      toast.success(t('settings.testSent'));
    } catch {
      toast.error(t('settings.testFailed'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-gm-gold" />
            <span className="text-gm-gold font-bold text-[10px] tracking-[0.2em] uppercase">Sistem</span>
          </div>
          <h1 className="font-serif text-4xl text-gm-text">{t('header.title')}</h1>
          <p className="text-gm-muted text-sm font-serif italic max-w-xl">
            {t('header.description')}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleHeaderTest} 
            disabled={isTesting}
            className="rounded-full border-gm-border-soft bg-gm-surface/20 hover:bg-gm-surface hover:text-gm-gold font-bold tracking-widest uppercase text-[10px] px-6 h-12"
          >
            <Send className="h-4 w-4 mr-2" />
            {isTesting ? t('settings.testSending') : t('header.test')}
          </Button>
        </div>
      </div>

      <Card className="bg-gm-surface/20 border-gm-border-soft rounded-[32px] overflow-hidden backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-gm-border-soft/50 pb-6 p-8">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
              <TabsTrigger value="autoreply">{t('tabs.autoreply')}</TabsTrigger>
              <TabsTrigger value="inbound">{t('tabs.inbound')}</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 pt-4">
              <TelegramSettingsPanel />
            </TabsContent>

            <TabsContent value="autoreply" className="space-y-4 pt-4">
              <TelegramAutoReplyPanel />
            </TabsContent>

            <TabsContent value="inbound" className="space-y-4 pt-4">
              <TelegramInboundPanel />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
