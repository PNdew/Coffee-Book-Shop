import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { voucherService } from '@/services/voucherapi';
import { Voucher } from '@/types';
import AlertDialog from '@/components/AlertDialog';
import { getUserFromToken, getPermissionsByRole } from '@/services/authapi';
import type { Permissions } from '@/services/authapi';
import { fetchVoucher } from '@/services/createorderapi';

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
  const [voucher, setVoucher] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    canView: true,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  const router = useRouter();
  const { refresh } = useLocalSearchParams();

  useEffect(() => {
    // Lấy thông tin quyền hạn
    const getPermissions = async () => {
      try {
        const user = await getUserFromToken();
        if (user) {
          setPermissions(getPermissionsByRole(user.ChucVuNV));
        }
      } catch (error) {
        console.error('Lỗi khi lấy quyền hạn:', error);
      }
    };

    getPermissions();
    fetchVoucher();
  }, [refresh]);

  const fetchVoucher = async () => {
    try {
      setLoading(true);

      console.log('Đang kết nối để lấy danh sách sách...');
      const data = await voucherService.getAllVouchers();
      // console.log('Dữ liệu nhận được:', data);

      setVoucher(data || []);
      setError(null);
    } catch (err) {
      console.error('Chi tiết lỗi:', err);
      setError(`Không thể tải danh sách sách: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setVoucher([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = voucher
    .filter(item =>
      item.tenvoucher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.loaisp.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by expiration status first (active vouchers first)
      const aExpired = isVoucherExpired(a);
      const bExpired = isVoucherExpired(b);
      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1;
      }
      // Then sort by end date (earlier end dates first)
      return new Date(a.thoigianketthucvoucher).getTime() - new Date(b.thoigianketthucvoucher).getTime();
    });

  const handleVoucherPress = (id: string) => {
    if (permissions.canEdit) {
      router.push(`./suavoucher?id=${id}`);
    } else {
      Alert.alert(
        "Thông báo",
        "Bạn chỉ có quyền xem thông tin voucher, không thể chỉnh sửa.",
        [{ text: "Đã hiểu" }]
      );
    }
  };

  const handleLongPress = (id: string) => {
    if (permissions.canDelete) {
      setSelectedVoucherId(id);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVoucherId || !permissions.canDelete) return;

    try {
      await voucherService.deleteVoucher(selectedVoucherId);
      setVoucher(voucher.filter(voucher => voucher.idvoucher.toString() !== selectedVoucherId));
      setShowDeleteDialog(false);
      setSelectedVoucherId(null);
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
      Alert.alert("Lỗi", "Không thể xóa sách, vui lòng thử lại sau");
    }
  };

  const handleQuickDelete = async (id: string) => {
    if (!permissions.canDelete) {
      Alert.alert(
        "Thông báo",
        "Bạn không có quyền xóa voucher.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    try {
      await voucherService.deleteVoucher(id);
      setVoucher(voucher.filter(voucher => voucher.idvoucher.toString() !== id));
    } catch (error) {
      console.error('Lỗi khi xóa voucher:', error);
      Alert.alert("Lỗi", "Không thể xóa voucher, vui lòng thử lại sau");
    }
  };

  const handleDeleteAllExpired = async () => {
    if (!permissions.canDelete) {
      Alert.alert(
        "Thông báo",
        "Bạn không có quyền xóa voucher.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tất cả voucher đã hết hạn?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const expiredVouchers = voucher.filter(v => isVoucherExpired(v));
              for (const v of expiredVouchers) {
                await voucherService.deleteVoucher(v.idvoucher.toString());
              }
              setVoucher(voucher.filter(v => !isVoucherExpired(v)));
            } catch (error) {
              console.error('Lỗi khi xóa voucher hết hạn:', error);
              Alert.alert("Lỗi", "Không thể xóa một số voucher, vui lòng thử lại sau");
            }
          }
        }
      ]
    );
  };

  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    const isExpired = isVoucherExpired(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.voucherItem,
          isExpired && styles.expiredVoucherItem
        ]}
        onPress={() => handleVoucherPress(item.idvoucher.toString())}
        onLongPress={() => permissions.canDelete && handleLongPress(item.idvoucher.toString())}
      >
        <View style={styles.voucherHeader}>
          <Text style={[
            styles.voucherName,
            isExpired && styles.expiredText
          ]}>
            {item.tenvoucher}
          </Text>
          {isExpired && (
            <View style={styles.expiredLabel}>
              <Text style={styles.expiredLabelText}>Đã hết hạn</Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.voucherType,
          isExpired && styles.expiredText
        ]}>
          Loại sản phẩm: {LOAI_SAN_PHAM_TEXT[item.loaisp] || item.loaisp}
        </Text>
        
        <Text style={[
          styles.voucherDiscount,
          isExpired && styles.expiredText
        ]}>
          Giảm giá: {item.giamgia}%
        </Text>

        <View style={styles.actionButtons}>
          {permissions.canEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`./suavoucher?id=${item.idvoucher}`)}
            >
              <FontAwesome name="edit" size={16} color="#007bff" />
              <Text style={styles.editButtonText}>Sửa</Text>
            </TouchableOpacity>
          )}

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
      </TouchableOpacity>
    );
  };

  // Component trống để thêm vào cuối danh sách, tạo khoảng trống
  const ListFooterComponent = () => (
    <View style={{ height: 70, backgroundColor: 'transparent' }} />
  );

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
          <TouchableOpacity style={styles.iconContainer} onPress={fetchVoucher}>
            <FontAwesome name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tên voucher"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
        </View>

        {permissions.canDelete && voucher.some(isVoucherExpired) && (
          <TouchableOpacity 
            style={styles.deleteAllExpiredButton}
            onPress={handleDeleteAllExpired}
          >
            <FontAwesome name="trash" size={16} color="#fff" />
            <Text style={styles.deleteAllExpiredButtonText}>Xóa tất cả voucher hết hạn</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E4434A" />
            <Text style={styles.loadingText}>Đang tải danh sách voucher...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchVoucher}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredVouchers}
              keyExtractor={item => item.idvoucher.toString()}
              renderItem={renderVoucherItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {searchQuery ? 'Không tìm thấy voucher phù hợp' : 'Chưa có voucher nào trong thư viện'}
                  </Text>
                </View>
              }
            />
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('./themvoucher')}
        >
          <Text style={styles.addButtonText}>Thêm voucher</Text>
        </TouchableOpacity>
        {/* Chỉ hiển thị nút thêm sách nếu có quyền thêm */}
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
    height: 35,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  voucherItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
  },
  expiredVoucherItem: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  voucherName: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  voucherType: {
    fontSize: 13,
    color: '#333',
    marginTop: 3,
  },
  voucherDiscount: {
    fontSize: 13,
    color: '#E4434A',
    marginTop: 3,
    fontWeight: 'bold',
  },
  expiredText: {
    color: '#999',
  },
  expiredLabel: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quantityLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  deleteAllExpiredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  deleteAllExpiredButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
