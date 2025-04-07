import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="bill" />
      <Stack.Screen name="vouchers" />
      <Stack.Screen name="payment-qr" />
      <Stack.Screen name="menu" /> {/* Thêm route cho menu */}
    </Stack>
  );
}