import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      // Nếu không có token và đang cố truy cập trang khác trang đăng nhập
      if (!token && pathname !== '/') {
        router.replace('/');
        return;
      }

      // Nếu không có token và đang ở trang đăng nhập, cho phép truy cập
      if (!token && pathname === '/') {
        return;
      }

      // Nếu có token và đang ở trang khác, cho phép truy cập
      if (token && pathname !== '/') {
        return;
      }
    };

    checkAuth();
  }, [pathname]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/CreateOrderScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ingredient/IngredientScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/OrderScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/MenuScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/book/BookScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/AttendanceScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/staff/StaffScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/statistics/StatisticsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/voucher/VoucherScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
