import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getNhanVien, NhanVien } from '../../../services/staffapi';
import { getUserFromToken } from '../../../services/authapi';

export default function StaffScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [staff, setStaff] = useState<NhanVien[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<NhanVien[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    checkAuth();
    fetchStaff();
  }, []);

  const checkAuth = async () => {
    const user = await getUserFromToken();
    if (!user || user.ChucVuNV !== 1) {
      Alert.alert('Không có quyền', 'Bạn không có quyền truy cập chức năng này');
      router.back();
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const staffData = await getNhanVien();
      setStaff(staffData);
      setFilteredStaff(staffData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      filterByRole(activeFilter);
    } else {
      const filtered = staff.filter(
        item => item.TenNV.toLowerCase().includes(text.toLowerCase()) ||
               item.SDTNV.includes(text)
      );
      setFilteredStaff(filtered);
    }
  };

  const filterByRole = (role: string) => {
    setActiveFilter(role);
    
    if (role === 'all') {
      setFilteredStaff(staff);
    } else if (role === 'quanly') {
      const filteredByRole = staff.filter(item => item.ChucVuNV === '1');
      setFilteredStaff(filteredByRole);
    } else if (role === 'nhanvien') {
      const filteredByRole = staff.filter(item => item.ChucVuNV === '2');
      setFilteredStaff(filteredByRole);
    } else {
      setFilteredStaff([]);
    }
  };

  const renderCategoryButton = (title: string, filter: string) => (
    <TouchableOpacity
      style={[styles.categoryButton, activeFilter === filter && styles.activeButton]}
      onPress={() => filterByRole(filter)}
    >
      <Text style={[styles.categoryButtonText, activeFilter === filter && styles.activeButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderStaffItem = ({ item }: { item: NhanVien }) => {
    let chucVu = "Nhân viên";
    if (item.ChucVuNV === "1") {
      chucVu = "Quản lý";
    }
    
    return (
      <View style={styles.staffItem}>
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{item.TenNV}</Text>
          <Text style={styles.staffDetail}>SĐT: {item.SDTNV}</Text>
          <Text style={styles.staffDetail}>Công việc: {chucVu}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý nhân viên</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhanh"
          value={searchText}
          onChangeText={handleSearch}
        />
        <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
      </View>

      <View style={styles.categoryContainer}>
        {renderCategoryButton('Tất cả', 'all')}
        {renderCategoryButton('Quản lý', 'quanly')}
        {renderCategoryButton('Nhân viên', 'nhanvien')}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF8F8F" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredStaff}
          renderItem={renderStaffItem}
          keyExtractor={(item) => item.IDNhanVien.toString()}
          style={styles.staffList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.buttonText}>Xem báo cáo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.attendanceButton}>
          <Text style={styles.buttonText}>Bảng chấm công</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/screens/staff/RegisterStaffScreen')}
      >
        <MaterialIcons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: '#FF8F8F',
  },
  categoryButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },
  staffList: {
    flex: 1,
  },
  staffItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  staffDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reportButton: {
    backgroundColor: '#FF8F8F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
  attendanceButton: {
    backgroundColor: '#FF8F8F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    backgroundColor: '#FF8F8F',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});