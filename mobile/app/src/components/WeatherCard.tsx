import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, shadows, font } from '@/theme/tokens';
import type { CurrentWeather } from '@/types/weather';

interface Props {
  location: string;
  subtitle?: string;
  current: CurrentWeather | null;
  loading?: boolean;
}

export function WeatherCard({ location, subtitle, current, loading }: Props) {
  const { t } = useTranslation();

  const temp = typeof current?.temp === 'number' ? `${Math.round(current.temp)}°` : '—';
  const humidity = typeof current?.humidity === 'number' ? `${Math.round(current.humidity)}%` : '—';
  const wind = typeof current?.windSpeed === 'number' ? `${(current.windSpeed * 3.6).toFixed(0)} km/sa` : '—';
  const cond = current?.condition || (loading ? t('home.loading') : '—');

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{t('home.location')}</Text>
          <Text style={styles.name}>{location}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.live}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{t('home.live')}</Text>
        </View>
      </View>
      <Text style={styles.temp}>{temp}</Text>
      <Text style={styles.cond}>{cond}</Text>
      <View style={styles.metrics}>
        <Metric label={t('home.humidity')} value={humidity} />
        <Metric label={t('home.wind')} value={wind} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.pine,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  label: {
    color: colors.paper,
    opacity: 0.55,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: font.mono,
    marginBottom: 4,
  },
  name: { color: colors.paper, fontSize: 22, fontFamily: font.display, letterSpacing: -0.5 },
  subtitle: { color: colors.paper, opacity: 0.6, fontSize: 12, marginTop: 2, fontFamily: font.mono },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241,235,221,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: colors.wheat },
  liveText: {
    color: colors.paper,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: font.mono,
  },
  temp: { color: colors.paper, fontSize: 72, fontFamily: font.display, lineHeight: 78, marginTop: spacing.sm },
  cond: { color: colors.paper, opacity: 0.82, fontSize: 14, marginTop: 6, textTransform: 'capitalize' },
  metrics: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(241,235,221,0.14)',
    paddingTop: spacing.md,
  },
  metric: { flex: 1 },
  metricLabel: {
    color: colors.paper,
    opacity: 0.55,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: font.mono,
    marginBottom: 4,
  },
  metricValue: { color: colors.paper, fontSize: 20, fontFamily: font.sansBold },
});
