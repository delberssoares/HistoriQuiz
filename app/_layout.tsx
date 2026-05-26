import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="levels"  options={{ headerShown: false }} />
      <Stack.Screen name="game"    options={{ headerShown: false }} />
      <Stack.Screen name="modal"   options={{ presentation: 'modal' }} />
    </Stack>
  );
}