import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Push izni iste, Expo Push token al, AsyncStorage'a kaydet,
 * backend'e (FAZ 2'de) ilet.
 */
export async function registerPushToken(): Promise<string | null> {
  if (!Constants.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('don-uyari', {
      name: 'Don Uyarı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C23B2C',
    });
  }

  try {
    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
        ?.projectId ||
      (Constants.easConfig as { projectId?: string } | undefined)?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await storage.setPushToken(token);
    // FAZ 2: await fetch('/api/v1/push/tokens', { method: 'POST', body: { token, platform } });
    return token;
  } catch {
    return null;
  }
}
