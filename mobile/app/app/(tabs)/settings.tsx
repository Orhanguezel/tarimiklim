import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors, spacing, font, radius } from '@/theme/tokens';
import { storage } from '@/lib/storage';
import { useLocation } from '@/hooks/useLocation';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { loc } = useLocation();
  const [tier, setTier] = useState<'free' | 'starter' | 'pro'>('free');

  useEffect(() => {
    storage.getTier().then(setTier);
  }, []);

  const switchLang = async () => {
    const next = i18n.language === 'tr' ? 'en' : 'tr';
    await i18n.changeLanguage(next);
    await storage.setLanguage(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>AYAR</Text>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <SettingRow
          label={t('settings.location')}
          value={loc?.name ?? '—'}
          onPress={() => router.push('/location/search')}
        />

        <SettingRow
          label={t('settings.language')}
          value={i18n.language === 'en' ? 'English' : 'Türkçe'}
          onPress={switchLang}
        />

        <View style={styles.planCard}>
          <Text style={styles.planLabel}>{t('settings.plan')}</Text>
          <Text style={styles.planName}>
            {tier === 'free' ? 'Çiftçi (Ücretsiz)' : tier === 'starter' ? 'Başlangıç' : 'Profesyonel'}
          </Text>
          {tier !== 'pro' && (
            <Pressable style={styles.planCta} onPress={() => router.push('/paywall')}>
              <Text style={styles.planCtaText}>{t('settings.upgradeCTA')}</Text>
            </Pressable>
          )}
        </View>

        <SettingRow label={t('settings.notifications')} value="Telegram · Push" onPress={() => router.push('/(tabs)/alerts')} />

        <View style={styles.about}>
          <Text style={styles.aboutTitle}>TarımİKlim</Text>
          <Text style={styles.aboutText}>
            Tarvista Tarım Teknolojileri A.Ş.{'\n'}Antalya · Türkiye{'\n'}v0.1.0
          </Text>
          <Text style={styles.aboutLink}>destek@tarimiklim.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  eyebrow: { fontSize: 11, fontFamily: font.mono, letterSpacing: 1.4, color: colors.moss, textTransform: 'uppercase' },
  title: { fontSize: 28, fontFamily: font.display, color: colors.ink, marginTop: 4, marginBottom: spacing.lg, letterSpacing: -0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowLabel: { fontSize: 11, fontFamily: font.mono, color: colors.moss, letterSpacing: 1, textTransform: 'uppercase' },
  rowValue: { fontSize: 15, color: colors.ink, fontFamily: font.sansMedium, marginTop: 4 },
  chevron: { fontSize: 22, color: colors.inkSoft, marginLeft: spacing.md },
  planCard: {
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  planLabel: { color: colors.paper, opacity: 0.55, fontSize: 11, fontFamily: font.mono, letterSpacing: 1.4, textTransform: 'uppercase' },
  planName: { color: colors.paper, fontSize: 22, fontFamily: font.display, marginTop: 6 },
  planCta: {
    marginTop: spacing.md,
    backgroundColor: colors.wheat,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  planCtaText: { color: colors.ink, fontFamily: font.sansBold, fontSize: 14 },
  about: { marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.lg },
  aboutTitle: { fontSize: 18, fontFamily: font.display, color: colors.ink },
  aboutText: { color: colors.inkSoft, fontSize: 12, textAlign: 'center', marginTop: 8, fontFamily: font.mono, lineHeight: 18 },
  aboutLink: { color: colors.terra, fontSize: 12, marginTop: 6, fontFamily: font.mono },
});
