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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="screens/HomeScreen"/>
      {/* <Stack.Screen name="screens/createorder/CreateOrderScreen"/>
      <Stack.Screen name="screens/ingredient/IngredientScreen"/> */}
      <Stack.Screen name="screens/OrderScreen"/>
      <Stack.Screen name="screens/MenuScreen"/>
      {/* <Stack.Screen name="screens/book/BookScreen"/> */}
      <Stack.Screen name="screens/AttendanceScreen"/>
      <Stack.Screen name="screens/staff/StaffScreen"/>
      <Stack.Screen name="screens/statistics/StatisticsScreen"/>
      <Stack.Screen name="screens/voucher/VoucherScreen"/>
    </Stack>
  );
}
