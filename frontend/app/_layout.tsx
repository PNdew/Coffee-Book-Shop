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

      // Các trang không yêu cầu đăng nhập
      const publicRoutes = [
        '/',  // Trang đăng nhập
        '/screens/auth/ForgotPasswordScreen',
        '/screens/auth/VerifyOTPScreen',
        '/screens/auth/ChangePasswordScreen',
        '/screens/auth/ResetPasswordScreen'
      ];

      const isPublicRoute = publicRoutes.includes(pathname);

      if (!token && !isPublicRoute) {
        router.replace('/');
        return;
      }

      // Các trường hợp còn lại không cần làm gì
    };

    checkAuth();
  }, [pathname]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/HomeScreen" options={{ headerShown: false }} />
      {/* Create Order */}
      <Stack.Screen name="screens/createorder/CreateOrderScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Bill" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Payment-QR" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Foods" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Vouchers" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Drinks" options={{ headerShown: false }} />
      <Stack.Screen name="screens/createorder/Menu" options={{ headerShown: false }} />
      {/* Ingredient */}
      <Stack.Screen name="screens/ingredient/IngredientScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ingredient/suanguyenlieu" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ingredient/themnguyenlieu" options={{ headerShown: false }} />
      {/* Order */}
      <Stack.Screen name="screens/OrderScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/MenuScreen" options={{ headerShown: false }} />
      {/* Book */}
      <Stack.Screen name="screens/book/BookScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/book/suasach" options={{ headerShown: false }} />
      <Stack.Screen name="screens/book/themsach" options={{ headerShown: false }} />
      {/* Attendance */}
      <Stack.Screen name="screens/AttendanceScreen" options={{ headerShown: false }} />
      {/* Staff */}
      <Stack.Screen name="screens/staff/StaffScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/staff/RegisterStaffScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/staff/UpdateStaffScreen" options={{ headerShown: false }} />
      {/* Statistics */}
      <Stack.Screen name="screens/StatisticsScreen" options={{ headerShown: false }} />
      {/* Voucher */}
      <Stack.Screen name="screens/voucher/VoucherScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/voucher/suavoucher" options={{ headerShown: false }} />
      <Stack.Screen name="screens/voucher/themvoucher" options={{ headerShown: false }} />
      {/* Auth */}
      <Stack.Screen name="screens/auth/ChangePasswordScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/auth/ResetPasswordScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/auth/ForgotPasswordScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/auth/VerifyOTPScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
