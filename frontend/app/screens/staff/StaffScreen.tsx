import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getNhanVien, NhanVien, updateStaff, deleteStaff } from '@/services/staffapi';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';
import AlertDialog from '@/components/AlertDialog';

export default function StaffScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [staff, setStaff] = useState<NhanVien[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<NhanVien[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [permissions, setPermissions] = useState({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<NhanVien | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'info' | 'error' | 'success';
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    checkUserPermissions();
    fetchStaff();
  }, []);

  const showMessage = (message: string, type: 'info' | 'error' | 'success') => {
    if (Platform.OS === 'web') {
      setToast({
        visible: true,
        message,
        type
      });
    } else {
      Alert.alert(
        type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo',
        message,
        [{ text: 'OK' }]
      );
    }
  };

  const checkUserPermissions = async () => {
    try {
      const user = await getUserFromToken();

      if (!user) {
        setPermissions({
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        });
        return;
      }

      const canView = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.view');
      let canCreate = false;
      let canUpdate = false;
      let canDelete = false;

      if (canView) {
        canCreate = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.create');
        canUpdate = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.update');
        canDelete = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.delete');
      }

      setPermissions({
        canView,
        canCreate,
        canUpdate,
        canDelete
      });

      if (!canView) {
        showMessage('Bạn không có quyền xem trang này.', 'error');
        router.push('../HomeScreen');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể kiểm tra quyền truy cập';
      showMessage(errorMessage, 'error');
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const staffData = await getNhanVien();
      setStaff(staffData);
      setFilteredStaff(staffData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lấy danh sách nhân viên';
      showMessage(errorMessage, 'error');
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

  const handleUpdateStaff = (staff: NhanVien) => {
    if (!permissions.canUpdate) {
      showMessage('Bạn không có quyền cập nhật thông tin nhân viên.', 'error');
      return;
    }
    router.push({
      pathname: '/screens/staff/UpdateStaffScreen',
      params: { staffData: JSON.stringify(staff) }
    });
  };

  const handleDeleteStaff = (staff: NhanVien) => {
    if (!permissions.canDelete) {
      showMessage('Bạn không có quyền xóa nhân viên.', 'error');
      return;
    }
    setSelectedStaff(staff);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;

    try {
      setLoading(true);
      await deleteStaff(selectedStaff.IDNhanVien.toString());
      setStaff(staff.filter(item => item.IDNhanVien !== selectedStaff.IDNhanVien));
      setFilteredStaff(filteredStaff.filter(item => item.IDNhanVien !== selectedStaff.IDNhanVien));
      showMessage('Đã xóa nhân viên thành công', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa nhân viên';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setSelectedStaff(null);
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
        <View style={styles.staffActions}>
          {permissions.canUpdate && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleUpdateStaff(item)}
            >
              <Ionicons name="pencil" size={24} color="#e4434a" />
            </TouchableOpacity>
          )}
          {permissions.canDelete && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteStaff(item)}
            >
              <Ionicons name="trash" size={24} color="#e4434a" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // If user doesn't have view permission, show error
  if (!permissions.canView && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Bạn không có quyền xem trang này.</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push('../HomeScreen')}
          >
            <Text style={styles.backToHomeText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <ActivityIndicator size="large" color="#e4434a" style={styles.loader} />
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
      
      {permissions.canCreate && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/screens/staff/RegisterStaffScreen')}
        >
          <MaterialIcons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <AlertDialog
        visible={showDeleteDialog}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa nhân viên ${selectedStaff?.TenNV}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedStaff(null);
        }}
      />
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
    gap: 20,
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
    backgroundColor: '#e4434a',
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
    backgroundColor: '#e4434a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
  attendanceButton: {
    backgroundColor: '#e4434a',
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
    backgroundColor: '#e4434a',
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: '#E4434A',
    padding: 10,
    borderRadius: 5,
  },
  backToHomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
});