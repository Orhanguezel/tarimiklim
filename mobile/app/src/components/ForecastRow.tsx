import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, font, shadows } from '@/theme/tokens';
import type { ForecastDay, RiskTier } from '@/types/weather';

function tier(score: number): RiskTier {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'alert';
  if (score >= 15) return 'warn';
  return 'ok';
}

const TONE_COLOR: Record<RiskTier, string> = {
  ok: colors.sage,
  warn: colors.wheat,
  alert: colors.terra,
  critical: colors.danger,
};

interface Props {
  day: ForecastDay;
}

export function ForecastRow({ day }: Props) {
  const d = (day.date || day.forecastDate || '').slice(0, 10);
  const t = tier(day.frostRisk);
  return (
    <View style={styles.row}>
      <Text style={styles.date}>{d}</Text>
      <View style={styles.temps}>
        <Text style={styles.tempMin}>{day.tempMin.toFixed(0)}°</Text>
        <Text style={styles.slash}>/</Text>
        <Text style={styles.tempMax}>{day.tempMax.toFixed(0)}°</Text>
      </View>
      <Text style={styles.cond} numberOfLines={1}>
        {day.condition}
      </Text>
      <View style={[styles.risk, { backgroundColor: TONE_COLOR[t] + '22', borderColor: TONE_COLOR[t] }]}>
        <Text style={[styles.riskText, { color: TONE_COLOR[t] }]}>{day.frostRisk}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    backgroundColor: colors.paper,
    ...shadows.soft,
    borderRadius: radius.xs,
    marginBottom: 6,
  },
  date: {
    width: 88,
    fontSize: 11,
    fontFamily: font.mono,
    color: colors.moss,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  temps: { flexDirection: 'row', alignItems: 'baseline', width: 88, gap: 4 },
  tempMin: { fontSize: 18, fontFamily: font.display, color: colors.sky },
  tempMax: { fontSize: 18, fontFamily: font.display, color: colors.terraDeep },
  slash: { fontSize: 14, color: colors.inkSoft },
  cond: { flex: 1, fontSize: 13, color: colors.inkSoft, textTransform: 'capitalize' },
  risk: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  riskText: { fontSize: 12, fontFamily: font.mono, fontWeight: '600' },
});
