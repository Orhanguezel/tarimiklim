import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, font, radius } from '@/theme/tokens';
import { useLocation } from '@/hooks/useLocation';
import { api } from '@/lib/api';
import type { HourlySlot } from '@/types/weather';

function frostTier(s: number): 'low' | 'medium' | 'high' {
  if (s >= 70) return 'high';
  if (s >= 30) return 'medium';
  return 'low';
}
const FROST_COLOR = { low: colors.sage, medium: colors.wheat, high: colors.danger };

export default function HourlyScreen() {
  const { t } = useTranslation();
  const { loc } = useLocation();
  const [slots, setSlots] = useState<HourlySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await api.hourly(loc.lat, loc.lon, 40);
        if (!cancelled) setSlots(res.hourly ?? []);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loc?.lat, loc?.lon]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{loc?.name ?? '—'}</Text>
        <Text style={styles.title}>{t('hourly.title')}</Text>
      </View>

      {loading ? (
        <Text style={styles.empty}>{t('home.loading')}</Text>
      ) : slots.length === 0 ? (
        <Text style={styles.empty}>{t('hourly.empty')}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md }}>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{t('hourly.temp')}</Text></View>
              {slots.map((s, i) => (
                <View key={`t-${i}`} style={styles.cell}><Text style={styles.tempText}>{s.temp}°</Text></View>
              ))}
            </View>
            <View style={[styles.row, { backgroundColor: 'rgba(198,155,58,0.06)' }]}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{t('hourly.wind')}</Text></View>
              {slots.map((s, i) => (
                <View key={`w-${i}`} style={styles.cell}>
                  <Text style={styles.val}>{s.windSpeedKmh.toFixed(0)}</Text>
                  <Text style={styles.tiny}>{s.windDir}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.row, { backgroundColor: 'rgba(93,122,140,0.06)' }]}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{t('hourly.rain')}</Text></View>
              {slots.map((s, i) => (
                <View key={`r-${i}`} style={styles.cell}><Text style={styles.val}>{s.precipitationLabel}</Text></View>
              ))}
            </View>
            <View style={styles.row}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{t('hourly.frost')}</Text></View>
              {slots.map((s, i) => (
                <View key={`f-${i}`} style={styles.cell}>
                  <Text style={[styles.val, { color: FROST_COLOR[frostTier(s.frostScore)] }]}>{s.frostShort}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.row, styles.footRow]}>
              <View style={styles.labelCell}><Text style={[styles.labelText, styles.footLabel]}>Saat</Text></View>
              {slots.map((s, i) => (
                <View key={`h-${i}`} style={styles.cell}><Text style={styles.tiny}>{s.timeRangeLabel}</Text></View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: { padding: spacing.md },
  eyebrow: { fontSize: 11, fontFamily: font.mono, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.moss },
  title: { fontSize: 26, fontFamily: font.display, color: colors.ink, marginTop: 4, letterSpacing: -0.5 },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: spacing.xl },
  table: { borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  labelCell: {
    width: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paperDim,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  labelText: {
    fontSize: 10,
    fontFamily: font.mono,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cell: { minWidth: 60, paddingHorizontal: 8, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  tempText: { fontSize: 13, fontFamily: font.sansBold, color: colors.ink },
  val: { fontSize: 12, color: colors.ink },
  tiny: { fontSize: 9, color: colors.inkSoft, fontFamily: font.mono },
  footRow: { backgroundColor: colors.paperDim },
  footLabel: { opacity: 0.7 },
});
