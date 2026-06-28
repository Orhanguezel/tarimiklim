import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors, spacing, font, radius } from '@/theme/tokens';
import { enablePushNotifications, type PushRegistrationResult } from '@/lib/notifications';

const TELEGRAM_URL = 'https://t.me/tarimiklim';

export default function AlertsScreen() {
  const { t } = useTranslation();
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

  const enablePush = async () => {
    setPushLoading(true);
    const result = await enablePushNotifications();
    setPushStatus(pushMessage(result));
    setPushLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BİLDİRİM</Text>
        <Text style={styles.title}>{t('alerts.title')}</Text>

        <View style={styles.telegramCard}>
          <Text style={styles.telegramTitle}>Telegram Kanalı</Text>
          <Text style={styles.telegramBody}>
            Don, yağış ve ilaçlama uyarılarını anlık alın. Ücretsiz ve sınırsız.
          </Text>
          <Pressable style={styles.telegramBtn} onPress={() => Linking.openURL(TELEGRAM_URL)}>
            <Text style={styles.telegramBtnText}>{t('alerts.telegramCTA')}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t('alerts.subTitle')}</Text>

        <View style={styles.card}>
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Push bildirim</Text>
              <Text style={styles.prefSub}>Don uyarısı ve kampanyaları bu cihaza alın.</Text>
            </View>
            <Pressable style={styles.enableBtn} onPress={enablePush} disabled={pushLoading}>
              <Text style={styles.enableBtnText}>{pushLoading ? '...' : 'AÇ'}</Text>
            </Pressable>
          </View>
          {pushStatus ? <Text style={styles.pushStatus}>{pushStatus}</Text> : null}
          <View style={styles.divider} />
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>SMS uyarı</Text>
              <Text style={styles.prefSub}>Kritik don anında kısa mesaj</Text>
            </View>
            <Pressable style={styles.proBadge} onPress={() => router.push('/paywall')}>
              <Text style={styles.proBadgeText}>EK</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>WhatsApp Business</Text>
              <Text style={styles.prefSub}>Resmi kanaldan bildirim</Text>
            </View>
            <Pressable style={styles.proBadge} onPress={() => router.push('/paywall')}>
              <Text style={styles.proBadgeText}>EK</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.empty}>{t('alerts.empty')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function pushMessage(result: PushRegistrationResult): string {
  if (result.ok) return 'Push bildirimleri bu cihaz için etkin.';
  if (result.reason === 'not_device') return 'Push bildirimi fiziksel cihazda test edilir.';
  if (result.reason === 'permission_denied') return 'Bildirim izni verilmedi.';
  if (result.reason === 'missing_project_id') return 'Expo EAS projectId eksik. app.json içindeki extra.eas.projectId alanını doldurun.';
  if (result.reason === 'backend_failed') return 'Token alındı fakat kullanıcı oturumu olmadığı için backend’e kaydedilemedi.';
  return 'Expo push token üretilemedi.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  eyebrow: { fontSize: 11, fontFamily: font.mono, letterSpacing: 1.4, color: colors.moss, textTransform: 'uppercase' },
  title: { fontSize: 28, fontFamily: font.display, color: colors.ink, marginTop: 4, marginBottom: spacing.lg, letterSpacing: -0.5 },
  telegramCard: {
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  telegramTitle: { color: colors.paper, fontSize: 18, fontFamily: font.sansBold },
  telegramBody: { color: colors.paper, opacity: 0.78, fontSize: 13, marginTop: 6, lineHeight: 18 },
  telegramBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.wheat,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  telegramBtnText: { color: colors.ink, fontFamily: font.sansBold, fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: font.mono,
    color: colors.moss,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  card: { backgroundColor: colors.paper, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
  prefRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  prefTitle: { fontSize: 15, fontFamily: font.sansMedium, color: colors.ink },
  prefSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  proBadge: {
    backgroundColor: colors.wheat,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  proBadgeText: { color: colors.ink, fontFamily: font.mono, fontSize: 10, letterSpacing: 1 },
  enableBtn: {
    backgroundColor: colors.pine,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  enableBtnText: { color: colors.paper, fontFamily: font.mono, fontSize: 10, letterSpacing: 1 },
  pushStatus: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  divider: { height: 1, backgroundColor: colors.lineSoft, marginHorizontal: spacing.md },
  empty: { marginTop: spacing.xl, textAlign: 'center', color: colors.inkSoft, fontSize: 13 },
});
