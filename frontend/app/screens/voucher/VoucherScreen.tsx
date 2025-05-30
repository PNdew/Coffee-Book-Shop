import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucherapi';
import { Voucher } from '@/types';
import AlertDialog from '@/components/AlertDialog';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';

// Map hiển thị text cho từng loại sản phẩm
const LOAI_SAN_PHAM_TEXT: { [key: string]: string } = {
  'TatCa': 'Tất cả',
  'ThucUong': 'Đồ uống',
  'DoAn': 'Đồ ăn',
  'Khac': 'Khác'
};

// Kiểm tra voucher có hết hạn chưa
const isVoucherExpired = (voucher: Voucher): boolean => {
  const now = new Date();
  const endDate = new Date(voucher.thoigianketthucvoucher);
  return now > endDate;
};

export default function VoucherScreen() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  const router = useRouter();
  const { refresh } = useLocalSearchParams();

  useEffect(() => {
    // Check user permissions when component mounts
    checkUserPermissions();
    fetchVouchers();
  }, [refresh]);

  const checkUserPermissions = async () => {
    try {
      // Get user info from token
      const user = await getUserFromToken();

      if (!user) {
        // No token or invalid token
        setPermissions({
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false
        });
        return;
      }

      // Check voucher view permission
      const canView = await checkPermissionAPI(user.ChucVuNV, 'voucher.view');

      // Check add/edit/delete permissions if can view
      let canAdd = false;
      let canEdit = false;
      let canDelete = false;

      if (canView) {
        canAdd = await checkPermissionAPI(user.ChucVuNV, 'voucher.create');
        canEdit = await checkPermissionAPI(user.ChucVuNV, 'voucher.update');
        canDelete = await checkPermissionAPI(user.ChucVuNV, 'voucher.delete');
      }

      setPermissions({
        canView,
        canAdd,
        canEdit,
        canDelete
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.getAllVouchers();
      setVouchers(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Chi tiết lỗi:', err);
      const errorMessage = err.response?.data?.error || err.error || err.message || 'Lỗi không xác định';
      setError(`Không thể tải danh sách voucher: ${errorMessage}`);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter(item =>
    item.tenvoucher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVoucherPress = (id: string) => {
    // Chỉ cho phép xem hoặc sửa voucher nếu có quyền
    if (permissions.canEdit) {
      router.push(`./suavoucher?id=${id}`);
    } else {
      // Nếu chỉ có quyền xem, hiển thị thông báo
      Alert.alert(
        "Thông báo",
        "Bạn chỉ có quyền xem thông tin voucher, không thể chỉnh sửa.",
        [{ text: "Đã hiểu" }]
      );
    }
  };

  const handleLongPress = (id: string) => {
    // Chỉ hiển thị dialog xóa nếu có quyền xóa
    if (permissions.canDelete) {
      setSelectedVoucherId(id);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVoucherId || !permissions.canDelete) return;

    try {
      await voucherService.deleteVoucher(selectedVoucherId);
      setVouchers(vouchers.filter(voucher => voucher.idvoucher.toString() !== selectedVoucherId));
      setShowDeleteDialog(false);
      setSelectedVoucherId(null);
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
      Alert.alert("Lỗi", "Không thể xóa voucher, vui lòng thử lại sau");
    }
  };

  // If user doesn't have view permission, show error
  if (!permissions.canView && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Bạn không có quyền xem trang này.</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push('./HomeScreen')}
          >
            <Text style={styles.backToHomeText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Link href="../HomeScreen" asChild>
            <Pressable style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="black" />
            </Pressable>
          </Link>
          <View style={styles.titleWrapper}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Danh sách voucher</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconContainer} onPress={fetchVouchers}>
            <FontAwesome name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm voucher theo tên"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E4434A" />
            <Text style={styles.loadingText}>Đang tải danh sách voucher...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchVouchers}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <FlatList
              data={filteredVouchers}
              keyExtractor={item => item.idvoucher.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.voucherItem}
                  onPress={() => handleVoucherPress(item.idvoucher.toString())}
                  onLongPress={() => permissions.canDelete && handleLongPress(item.idvoucher.toString())}
                >
                  <Text style={styles.voucherName}>{item.tenvoucher}</Text>
                  <Text style={styles.voucherDetails}>
                    Loại sản phẩm: {item.loaisp} | Giảm giá: {item.giamgia}%
                  </Text>
                  <Text style={styles.voucherDate}>
                    Thời gian: {new Date(item.thoigianbatdauvoucher).toLocaleDateString()} - {new Date(item.thoigianketthucvoucher).toLocaleDateString()}
                  </Text>

                  {/* Hiển thị các nút tùy theo quyền */}
                  {permissions.canEdit && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`./suavoucher?id=${item.idvoucher}`)}
                      >
                        <FontAwesome name="edit" size={16} color="#007bff" />
                        <Text style={styles.editButtonText}>Sửa</Text>
                      </TouchableOpacity>

                      {permissions.canDelete && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleLongPress(item.idvoucher.toString())}
                        >
                          <FontAwesome name="trash" size={16} color="#dc3545" />
                          <Text style={styles.deleteButtonText}>Xóa</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {searchQuery ? 'Không tìm thấy voucher phù hợp' : 'Chưa có voucher nào'}
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* Chỉ hiển thị nút thêm voucher nếu có quyền thêm */}
        {permissions.canAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('./themvoucher')}
          >
            <Text style={styles.addButtonText}>Thêm voucher</Text>
          </TouchableOpacity>
        )}

        <AlertDialog
          visible={showDeleteDialog}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa voucher này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: "none",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "none",
  },
  titleContainer: {
    backgroundColor: '#FF8F8F',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 35,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 5,
  },
  listContent: {
    backgroundColor: '#F3F3E7',
    paddingBottom: 20,
  },
  voucherItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
  },
  voucherName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  voucherDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  voucherDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  addButton: {
    backgroundColor: '#E4434A',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E4434A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    backgroundColor: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#007bff',
    marginLeft: 4,
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#dc3545',
    marginLeft: 4,
    fontSize: 12,
  },
  centeredContent: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
});
