import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font } from '@/theme/tokens';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.pine,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: {
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="hourly"   options={{ title: t('tabs.hourly') }} />
      <Tabs.Screen name="alerts"   options={{ title: t('tabs.alerts') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
