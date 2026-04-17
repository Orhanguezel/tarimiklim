import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { InterTight_400Regular, InterTight_500Medium, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import { initI18n } from '@/lib/i18n';

initI18n();
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsReady] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_700Bold,
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
      setReady(true);
    }
  }, [fontsReady]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="onboarding/index"
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="location/search"
            options={{ presentation: 'modal', title: 'Konum' }}
          />
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
