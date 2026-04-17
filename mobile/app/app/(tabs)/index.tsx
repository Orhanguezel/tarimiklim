import { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, font, radius } from '@/theme/tokens';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastRow } from '@/components/ForecastRow';
import { FrostBadge } from '@/components/FrostBadge';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { loc } = useLocation();
  const { current, forecast, frost, loading } = useWeather(loc?.lat ?? null, loc?.lon ?? null);

  const maxFrost = useMemo(() => {
    return forecast.reduce((m, d) => Math.max(m, d.frostRisk ?? 0), frost?.frostRisk ?? 0);
  }, [forecast, frost]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              /* useWeather re-fetches on loc change; pull-to-refresh triggers state update via key */
            }}
          />
        }
      >
        <Text style={styles.brand}>
          Tarım<Text style={styles.brandItalic}>İKlim</Text>
        </Text>

        <WeatherCard
          location={loc?.name ?? '—'}
          subtitle={loc?.subtitle}
          current={current}
          loading={loading && !current}
        />

        <View style={styles.badgeWrap}>
          <FrostBadge score={maxFrost} />
        </View>

        <Pressable onPress={() => router.push('/location/search')} style={styles.editLink}>
          <Text style={styles.editText}>{t('home.editLocation')} →</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>{t('home.forecast7')}</Text>
        {forecast.length === 0 ? (
          <Text style={styles.empty}>{loading ? t('home.loading') : t('home.error')}</Text>
        ) : (
          forecast.slice(0, 7).map((d, i) => <ForecastRow key={`${d.date}-${i}`} day={d} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  brand: {
    fontSize: 24,
    fontFamily: font.display,
    letterSpacing: -0.5,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  brandItalic: { color: colors.moss, fontStyle: 'italic' },
  badgeWrap: { marginTop: spacing.md },
  editLink: { marginTop: spacing.sm, alignSelf: 'flex-end' },
  editText: { color: colors.terra, fontSize: 12, fontFamily: font.mono, letterSpacing: 0.6 },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 11,
    fontFamily: font.mono,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.moss,
  },
  empty: {
    textAlign: 'center',
    color: colors.inkSoft,
    padding: spacing.lg,
    backgroundColor: colors.paperDim,
    borderRadius: radius.sm,
  },
});
