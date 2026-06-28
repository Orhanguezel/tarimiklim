import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushRegistrationResult =
  | { ok: true; token: string; savedToBackend: boolean }
  | {
      ok: false;
      reason:
        | 'not_device'
        | 'permission_denied'
        | 'missing_project_id'
        | 'token_failed'
        | 'backend_failed';
    };

function getExpoProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId || (Constants.easConfig as { projectId?: string } | undefined)?.projectId || null;
}

async function saveTokenToBackend(token: string, accessToken?: string | null): Promise<boolean> {
  const authToken = accessToken ?? (await storage.getAccessToken());
  if (!authToken) return false;
  const deviceId = await storage.getPushDeviceId();
  await api.registerPushToken(
    {
      token,
      provider: 'expo',
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'unknown',
      device_id: deviceId,
    },
    authToken,
  );
  return true;
}

/**
 * Push izni iste, Expo Push token al, AsyncStorage'a kaydet,
 * kullanici oturumu varsa backend'e ilet.
 */
export async function enablePushNotifications(): Promise<PushRegistrationResult> {
  if (!Constants.isDevice) return { ok: false, reason: 'not_device' };

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return { ok: false, reason: 'permission_denied' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('don-uyari', {
      name: 'Don Uyarı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C23B2C',
    });
  }

  try {
    const projectId = getExpoProjectId();
    if (!projectId) return { ok: false, reason: 'missing_project_id' };
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await storage.setPushToken(token);
    const savedToBackend = await saveTokenToBackend(token).catch(() => false);
    return savedToBackend ? { ok: true, token, savedToBackend } : { ok: false, reason: 'backend_failed' };
  } catch {
    return { ok: false, reason: 'token_failed' };
  }
}

export async function registerPushToken(): Promise<string | null> {
  const result = await enablePushNotifications();
  return result.ok ? result.token : null;
}

export async function syncStoredPushToken(accessToken?: string | null): Promise<boolean> {
  const token = await storage.getPushToken();
  if (!token) return false;
  return saveTokenToBackend(token, accessToken).catch(() => false);
}
