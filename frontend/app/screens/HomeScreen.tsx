import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import jwt_decode from 'jwt-decode';

type UserInfo = {
  SDTNV: string;
  TenNV: string;
  ChucVuNV: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const getUserFromToken = async () => {
      try {
        let token;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('access_token');
        } else {
          token = await SecureStore.getItemAsync('access_token');
        }

        if (token) {
          const decoded = jwt_decode<UserInfo>(token);
          setUserInfo(decoded);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    getUserFromToken();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth * 0.9; // 90% độ rộng màn hình
  const buttonWidth = (containerWidth - 40) / 3; // 40 = padding (20*2) + margin (10*2)

  const menuItems: { title: string; icon: "list-alt" | "coffee" | "file-text-o" | "cutlery" | "book" | "bar-chart"; screen: string; onPress: () => void }[] = [
    { title: 'Tạo Order', icon: 'list-alt', screen: 'CreateOrderScreen', onPress: () => router.push('./createorder/CreateOrderScreen') },
    { title: 'Quản lý nguyên liệu', icon: 'coffee', screen: 'IngredientScreen', onPress: () => router.push('./ingredient/IngredientScreen') },
    { title: 'Danh sách hóa đơn', icon: 'file-text-o', screen: 'OrderScreen', onPress: () => router.push('./OrderScreen') },
    { title: 'Quản lý menu', icon: 'cutlery', screen: 'MenuScreen', onPress: () => router.push('./MenuScreen') },
    { title: 'Quản lý sách', icon: 'book', screen: 'BookScreen', onPress: () => router.push('./book/BookScreen') },
    { title: 'Chấm công', icon: 'bar-chart', screen: 'AttendanceScreen', onPress: () => router.push('./AttendanceScreen') }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.welcomeText}>
        Chào mừng trở lại, {userInfo?.TenNV || 'Người dùng'}!
      </Text>
      <Text style={styles.locationText}>
        Vị trí: {userInfo?.ChucVuNV || 'Vị trí không xác định'}
      </Text>

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
            <FontAwesome name={item.icon} size={30} color="#000" />
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
  welcomeText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 40,
    marginBottom: 30,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 2,
  },
  searchContainerFocused: {
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    borderWidth: 0,
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
});

export default HomeScreen;
