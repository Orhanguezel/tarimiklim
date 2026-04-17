import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedLocation } from '@/types/weather';

const KEYS = {
  location: 'tarimiklim.location.v1',
  onboarded: 'tarimiklim.onboarded.v1',
  subscriptionTier: 'tarimiklim.tier.v1',
  pushToken: 'tarimiklim.pushToken.v1',
  language: 'tarimiklim.lang.v1',
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sessiz geç — quota/izin sorunları uygulamayı durdurmamalı */
  }
}

export const storage = {
  async getLocation(): Promise<SavedLocation | null> {
    return readJson<SavedLocation>(KEYS.location);
  },

  async setLocation(loc: Omit<SavedLocation, 'savedAt'>): Promise<void> {
    await writeJson(KEYS.location, { ...loc, savedAt: Date.now() });
  },

  async clearLocation(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.location);
  },

  async isOnboarded(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.onboarded)) === '1';
  },

  async markOnboarded(): Promise<void> {
    await AsyncStorage.setItem(KEYS.onboarded, '1');
  },

  async getTier(): Promise<'free' | 'starter' | 'pro'> {
    const raw = await AsyncStorage.getItem(KEYS.subscriptionTier);
    if (raw === 'starter' || raw === 'pro') return raw;
    return 'free';
  },

  async setTier(tier: 'free' | 'starter' | 'pro'): Promise<void> {
    await AsyncStorage.setItem(KEYS.subscriptionTier, tier);
  },

  async getPushToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.pushToken);
  },

  async setPushToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.pushToken, token);
  },

  async getLanguage(): Promise<'tr' | 'en'> {
    const raw = await AsyncStorage.getItem(KEYS.language);
    return raw === 'en' ? 'en' : 'tr';
  },

  async setLanguage(lang: 'tr' | 'en'): Promise<void> {
    await AsyncStorage.setItem(KEYS.language, lang);
  },
};
