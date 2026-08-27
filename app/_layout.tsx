import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  useEffect(() => {
    if (!isExpoGo) {
      require('react-native-google-mobile-ads').default().initialize();
    }
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