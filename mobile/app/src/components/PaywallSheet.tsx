import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { colors, radius, spacing, font, shadows } from '@/theme/tokens';

const FEATURES = [
  { tr: 'Sınırsız parsel ve lokasyon', en: 'Unlimited parcels & locations' },
  { tr: '5 günlük saatlik tahmin', en: '5-day hourly forecast' },
  { tr: 'Push bildirim (don, yağış, ilaçlama)', en: 'Push alerts (frost, rain, spraying)' },
  { tr: '30 gün geçmiş arşivi', en: '30-day history archive' },
  { tr: 'SMS/WhatsApp uyarı satın alma', en: 'SMS/WhatsApp alert purchase' },
  { tr: 'Kooperatif paneli (Pro)', en: 'Cooperative panel (Pro)' },
];

export function PaywallSheet() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'tr';

  return (
    <View style={styles.wrap}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.eyebrow}>PRO</Text>
        <Text style={styles.title}>{t('paywall.title')}</Text>
        <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.tr} style={styles.feature}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.featureText}>{lang === 'tr' ? f.tr : f.en}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable style={[styles.plan, styles.planRecommended]}>
            <Text style={styles.planLabel}>{t('paywall.yearly')}</Text>
            <Text style={styles.planBadge}>%25 OFF</Text>
          </Pressable>
          <Pressable style={styles.plan}>
            <Text style={styles.planLabel}>{t('paywall.monthly')}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>{t('paywall.subscribe')}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.later}>
          <Text style={styles.laterText}>{t('paywall.later')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: 'rgba(20,27,20,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  handle: { alignSelf: 'center', width: 48, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: spacing.md },
  eyebrow: { fontSize: 11, fontFamily: font.mono, color: colors.terraDeep, letterSpacing: 2, textTransform: 'uppercase' },
  title: { fontSize: 28, fontFamily: font.display, color: colors.ink, marginTop: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginTop: 6 },
  features: { marginTop: spacing.lg, marginBottom: spacing.md },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  check: { color: colors.moss, fontSize: 16, width: 16 },
  featureText: { color: colors.ink, fontSize: 14, flex: 1 },
  plans: { gap: spacing.sm, marginTop: spacing.md },
  plan: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planRecommended: { borderColor: colors.moss, borderWidth: 2 },
  planLabel: { color: colors.ink, fontSize: 15, fontFamily: font.sansMedium },
  planBadge: {
    color: colors.paper,
    backgroundColor: colors.moss,
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: font.mono,
    letterSpacing: 1,
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.pine,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { color: colors.paper, fontSize: 16, fontFamily: font.sansBold },
  later: { alignItems: 'center', marginTop: spacing.md },
  laterText: { color: colors.inkSoft, fontSize: 13 },
});
