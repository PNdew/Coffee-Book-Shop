import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserFromToken, getPermissionsByRole, logout } from '../../services/authapi';
import type { UserInfo, Permissions } from '../../services/authapi';

const ROLE = {
  MANAGER: 1,
  STAFF: 2
};

const HomeScreen = () => {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    canView: true,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getUserFromToken();
        console.log("User info từ token:", user); // Thêm log để debug
        
        if (!user) {
          await logout();
          router.replace('../index');
          return;
        }
        
        setUserInfo(user);
        
        // Lấy quyền hạn dựa trên vai trò
        const userPermissions = getPermissionsByRole(user.ChucVuNV);
        setPermissions(userPermissions);
        
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        await logout();
        router.replace('../index');
      }
    };

    fetchUserInfo();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.9;
  const buttonWidth = (containerWidth - 40) / 3;

  // Danh sách các chức năng cơ bản mà tất cả người dùng đều thấy
  const baseMenuItems: { 
    title: string; 
    icon: string; 
    screen: string; 
    onPress: () => void 
  }[] = [
    { title: 'Tạo Order', icon: 'list-alt', screen: 'CreateOrderScreen', onPress: () => router.push('./createorder/CreateOrderScreen') },
    { title: 'Quản lý nguyên liệu', icon: 'coffee', screen: 'IngredientScreen', onPress: () => router.push('./ingredient/IngredientScreen') },
    { title: 'Quản lý hóa đơn', icon: 'file-text-o', screen: 'BillScreen', onPress: () => router.push('./bill/hoadon') },
    { title: 'Quản lý menu', icon: 'cutlery', screen: 'MenuScreen', onPress: () => router.push('./MenuScreen') },
    { title: 'Quản lý sách', icon: 'book', screen: 'BookScreen', onPress: () => router.push('./book/BookScreen') },
    { title: 'Quản lý chấm công', icon: 'bar-chart', screen: 'AttendanceScreen', onPress: () => router.push('./AttendanceScreen') }
  ];

  // Danh sách các chức năng chỉ dành cho quản lý
  const managerMenuItems: { 
    title: string; 
    icon: string; 
    screen: string; 
    onPress: () => void 
  }[] = [
    { title: 'Quản lý nhân viên', icon: 'users', screen: 'StaffScreen', onPress: () => router.push('./staff/StaffScreen') },
    { title: 'Quản lý thống kê', icon: 'line-chart', screen: 'StatisticsScreen', onPress: () => router.push('./statistics/StatisticsScreen') },
    { title: 'Quản lý voucher', icon: 'ticket', screen: 'VoucherScreen', onPress: () => router.push('./voucher/VoucherScreen') }
  ];

  // Hiển thị menu dựa trên vai trò người dùng
  const menuItems = userInfo?.ChucVuNV === ROLE.MANAGER
    ? [...baseMenuItems, ...managerMenuItems]
    : baseMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất, vui lòng thử lại');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { width: containerWidth }]}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.welcomeText}>
              Chào mừng trở lại, {userInfo?.TenNV || 'Người dùng'}!
            </Text>
            <Text style={styles.locationText}>
              Vị trí: {userInfo?.ChucVuNV === ROLE.MANAGER ? 'Quản lý' : 'Nhân viên'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => router.push('./auth/ChangePasswordScreen')} 
            style={styles.changePasswordButton}
          >
            <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />

      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused, { width: containerWidth }]}>
        <TextInput placeholder="Tìm kiếm nhanh" style={styles.searchInput} />
        <Feather name="search" size={20} color="gray" />
      </View>

      <View style={[styles.gridContainer, { width: containerWidth }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuButton, { width: buttonWidth }]}
            onPress={item.onPress}
          >
            <FontAwesome name={item.icon as any} size={30} color="#000" />
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f8f5e4',
    padding: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuButton: {
    backgroundColor: '#ff8a8a',
    padding: 15,
    marginBottom: 15,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  userInfoContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changePasswordButton: {
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  changePasswordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
