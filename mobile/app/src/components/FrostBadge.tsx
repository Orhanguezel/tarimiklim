import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, font } from '@/theme/tokens';
import type { RiskTier } from '@/types/weather';

const TONE: Record<RiskTier, { bg: string; color: string; icon: string }> = {
  ok:       { bg: colors.moss,   color: colors.paper, icon: '✓' },
  warn:     { bg: colors.sage,   color: colors.paper, icon: '•' },
  alert:    { bg: colors.terra,  color: colors.paper, icon: '⚠' },
  critical: { bg: colors.danger, color: colors.paper, icon: '⚠' },
};

function tier(score: number): RiskTier {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'alert';
  if (score >= 15) return 'warn';
  return 'ok';
}

interface Props {
  score: number;
}

export function FrostBadge({ score }: Props) {
  const { t } = useTranslation();
  const r = tier(score);
  const c = TONE[r];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.icon, { color: c.color }]}>{c.icon}</Text>
      <Text style={[styles.text, { color: c.color }]}>
        {score < 15 ? t('home.frostNone') : t('home.frostAlert', { score })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    gap: 10,
  },
  icon: { fontSize: 18 },
  text: { fontSize: 15, fontFamily: font.sansMedium },
});
