import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, font } from '@/theme/tokens';
import { matchProvinces, type Province } from '@/lib/turkey-provinces';
import { searchPlaces, reverseGeocode, requestGeolocation, type SearchPlace } from '@/lib/location';
import { storage } from '@/lib/storage';

export default function LocationSearchScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<SearchPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const provinceMatches: Province[] = matchProvinces(query);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setRemote([]);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await searchPlaces(q, ctrl.signal);
        if (!ctrl.signal.aborted) setRemote(res);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  async function pickProvince(p: Province) {
    await storage.setLocation({ lat: p.lat, lon: p.lon, name: p.name, source: 'province', subtitle: p.region });
    router.back();
  }

  async function pickGeocode(r: SearchPlace) {
    await storage.setLocation({ lat: r.lat, lon: r.lon, name: r.name, source: 'search', subtitle: r.displayName });
    router.back();
  }

  async function useMyLocation() {
    const geo = await requestGeolocation();
    if (geo.status !== 'granted' || geo.lat == null || geo.lon == null) return;
    const meta = await reverseGeocode(geo.lat, geo.lon);
    await storage.setLocation({
      lat: geo.lat,
      lon: geo.lon,
      name: meta?.name ?? 'Mevcut konum',
      source: 'geolocation',
      subtitle: meta?.subtitle,
      accuracy: geo.accuracy,
    });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.title}>{t('locationSearch.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Pressable onPress={useMyLocation} style={styles.geoBtn}>
          <Text style={styles.geoText}>📍 {t('locationSearch.useMyLocation')}</Text>
        </Pressable>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('locationSearch.placeholder')}
          placeholderTextColor={colors.inkSoft}
          style={styles.input}
          autoFocus
          returnKeyType="search"
        />

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          {provinceMatches.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.groupLabel}>{t('locationSearch.provinces')}</Text>
              {provinceMatches.map((p) => (
                <Pressable key={p.slug} onPress={() => pickProvince(p)} style={styles.item}>
                  <Text style={styles.itemName}>{p.name}</Text>
                  <Text style={styles.itemSub}>{p.region}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {loading && <Text style={styles.hint}>{t('home.loading')}</Text>}

          {remote.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.groupLabel}>{t('locationSearch.results')}</Text>
              {remote.map((r) => (
                <Pressable key={`${r.lat}-${r.lon}`} onPress={() => pickGeocode(r)} style={styles.item}>
                  <Text style={styles.itemName}>{r.name}</Text>
                  <Text style={styles.itemSub} numberOfLines={2}>{r.displayName}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {query.trim().length >= 3 && !loading && provinceMatches.length === 0 && remote.length === 0 && (
            <Text style={styles.hint}>{t('locationSearch.noResults')}</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  close: { fontSize: 22, color: colors.ink },
  title: { fontSize: 16, fontFamily: font.sansBold, color: colors.ink },
  body: { padding: spacing.md, flex: 1 },
  geoBtn: {
    backgroundColor: colors.pine,
    padding: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  geoText: { color: colors.paper, fontFamily: font.sansMedium },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paper,
    fontFamily: font.sans,
  },
  groupLabel: {
    fontSize: 10,
    fontFamily: font.mono,
    color: colors.moss,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  item: {
    padding: spacing.md,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    backgroundColor: colors.paper,
    marginBottom: 6,
  },
  itemName: { fontSize: 15, fontFamily: font.sansMedium, color: colors.ink },
  itemSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  hint: { textAlign: 'center', color: colors.inkSoft, marginTop: spacing.lg },
});
