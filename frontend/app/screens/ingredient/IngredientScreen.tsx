import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ingredientService, Ingredient } from '@/services/ingredientapi';
import { getUserFromToken, getPermissionsByRole } from '../../../services/authapi';
import type { Permissions } from '../../../services/authapi';
import AlertDialog from '@/components/AlertDialog';

export default function NguyenLieuScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
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
    fetchIngredients();
  }, [refresh]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      
      console.log('Đang kết nối để lấy danh sách nguyên liệu...');
      // Gọi API để lấy danh sách nguyên liệu
      const data = await ingredientService.getAllIngredients();
      console.log('Dữ liệu nhận được:', data);
      
      // Cập nhật state với dữ liệu từ API
      setIngredients(data || []);
      setError(null);
    } catch (err) {
      console.error('Chi tiết lỗi:', err);
      setError(`Không thể tải danh sách nguyên liệu: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(item => 
    item.ten_nguyen_lieu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIngredientPress = (id: string) => {
    // Chỉ cho phép xem hoặc sửa nếu có quyền
    if (permissions.canEdit) {
      router.push(`./suanguyenlieu?id=${id}`);
    } else {
      // Nếu chỉ có quyền xem, hiển thị thông báo
      Alert.alert(
        "Thông báo", 
        "Bạn chỉ có quyền xem thông tin nguyên liệu, không thể chỉnh sửa.",
        [{ text: "Đã hiểu" }]
      );
    }
  };

  const handleLongPress = (id: string) => {
    // Chỉ hiển thị dialog xóa nếu có quyền xóa
    if (permissions.canDelete) {
      setSelectedIngredientId(id);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIngredientId || !permissions.canDelete) return;
    
    try {
      await ingredientService.deleteIngredient(selectedIngredientId);
      setIngredients(ingredients.filter(ingredient => ingredient.id.toString() !== selectedIngredientId));
      setShowDeleteDialog(false);
      setSelectedIngredientId(null);
    } catch (error) {
      console.error('Lỗi khi xóa nguyên liệu:', error);
      Alert.alert("Lỗi", "Không thể xóa nguyên liệu, vui lòng thử lại sau");
    }
  };

  // Component trống để thêm vào cuối danh sách, tạo khoảng trống
  const ListFooterComponent = () => (
    <View style={{ height: 70, backgroundColor: 'transparent' }} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="../" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Danh sách nguyên liệu</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={fetchIngredients}>
          <FontAwesome name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Tìm kiếm nhanh"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4434A" />
          <Text style={styles.loadingText}>Đang tải nguyên liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchIngredients}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredIngredients}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.ingredientItem}
                onPress={() => handleIngredientPress(item.id.toString())}
                onLongPress={() => permissions.canDelete && handleLongPress(item.id.toString())}
              >
                <Text style={styles.ingredientName}>{item.ten_nguyen_lieu}</Text>
                <Text style={styles.ingredientQuantity}>
                  Số lượng: {item.so_luong} | Giá nhập: {item.gia_nhap?.toLocaleString() || '0'} đ
                </Text>
                
                {/* Hiển thị các nút tùy theo quyền */}
                {permissions.canEdit && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => router.push(`./suanguyenlieu?id=${item.id}`)}
                    >
                      <FontAwesome name="edit" size={16} color="#007bff" />
                      <Text style={styles.editButtonText}>Sửa</Text>
                    </TouchableOpacity>
                    
                    {permissions.canDelete && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleLongPress(item.id.toString())}
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
                  {searchQuery ? 'Không tìm thấy nguyên liệu phù hợp' : 'Chưa có nguyên liệu nào'}
                </Text>
              </View>
            }
            ListFooterComponent={ListFooterComponent}
          />
        </>
      )}

      {/* Chỉ hiển thị nút thêm nguyên liệu nếu có quyền thêm */}
      {permissions.canAdd && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('./themnguyenlieu')}
        >
          <Text style={styles.addButtonText}>Thêm nguyên liệu</Text>
        </TouchableOpacity>
      )}

      <AlertDialog
        visible={showDeleteDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa nguyên liệu này?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
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
    paddingBottom: 20, // Tăng khoảng cách ở dưới để tránh bị che bởi nút thêm
  },
  ingredientItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  ingredientQuantity: {
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
});