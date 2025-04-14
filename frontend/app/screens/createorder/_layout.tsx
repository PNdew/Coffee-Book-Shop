import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateOrderScreen" />
      <Stack.Screen name="Bill" />
      <Stack.Screen name="Vouchers" />
      <Stack.Screen name="Payment-QR" />
      <Stack.Screen name="Menu" /> {/* Thêm route cho menu */}
    </Stack>
  );
}