import { Stack } from 'expo-router';
import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {
  useEffect(() => {
    mobileAds().initialize();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="levels"  options={{ headerShown: false }} />
      <Stack.Screen name="game"    options={{ headerShown: false }} />
      <Stack.Screen name="modal"   options={{ presentation: 'modal' }} />
    </Stack>
  );
}