import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { bookService } from '@/services/bookapi';
import { Book } from '@/types';
import AlertDialog from '@/components/AlertDialog';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';

export default function SachScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
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
    fetchBooks();
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

      // Check book view permission
      const canView = await checkPermissionAPI(user.ChucVuNV, 'sach.view');

      // Check add/edit/delete permissions if can view
      let canAdd = false;
      let canEdit = false;
      let canDelete = false;

      if (canView) {
        canAdd = await checkPermissionAPI(user.ChucVuNV, 'sach.create');
        canEdit = await checkPermissionAPI(user.ChucVuNV, 'sach.update');
        canDelete = await checkPermissionAPI(user.ChucVuNV, 'sach.delete');
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

  const fetchBooks = async () => {
    try {
      setLoading(true);

      console.log('Đang kết nối để lấy danh sách sách...');
      const data = await bookService.getAllBooks();
      // console.log('Dữ liệu nhận được:', data);

      setBooks(data || []);
      setError(null);
    } catch (err) {
      console.error('Chi tiết lỗi:', err);
      setError(`Không thể tải danh sách sách: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(item =>
    item.ten_sach.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tac_gia.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookPress = (id: string) => {
    // Chỉ cho phép xem hoặc sửa sách nếu có quyền
    if (permissions.canEdit) {
      router.push(`./suasach?id=${id}`);
    } else {
      // Nếu chỉ có quyền xem, hiển thị thông báo
      Alert.alert(
        "Thông báo",
        "Bạn chỉ có quyền xem thông tin sách, không thể chỉnh sửa.",
        [{ text: "Đã hiểu" }]
      );
    }
  };

  const handleLongPress = (id: string) => {
    // Chỉ hiển thị dialog xóa nếu có quyền xóa
    if (permissions.canDelete) {
      setSelectedBookId(id);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookId || !permissions.canDelete) return;

    try {
      await bookService.deleteBook(selectedBookId);
      setBooks(books.filter(book => book.id.toString() !== selectedBookId));
      setShowDeleteDialog(false);
      setSelectedBookId(null);
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
      Alert.alert("Lỗi", "Không thể xóa sách, vui lòng thử lại sau");
    }
  };

  // Hàm hiển thị danh sách thể loại của sách
  const renderTheLoai = (book: Book) => {
    if (book.the_loai_list && book.the_loai_list.length > 0) {
      return book.the_loai_list.map(tl => tl.ten_the_loai).join(', ');
    }
    return 'Chưa phân loại';
  };

  // Component trống để thêm vào cuối danh sách, tạo khoảng trống
  const ListFooterComponent = () => (
    <View style={{ height: 70, backgroundColor: 'transparent' }} />
  );

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
              <Text style={styles.title}>Danh sách sách</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconContainer} onPress={fetchBooks}>
            <FontAwesome name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sách theo tên, tác giả"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E4434A" />
            <Text style={styles.loadingText}>Đang tải danh sách sách...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredBooks}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookItem}
                  onPress={() => handleBookPress(item.id.toString())}
                  onLongPress={() => permissions.canDelete && handleLongPress(item.id.toString())}
                >
                  <Text style={styles.bookName}>{item.ten_sach}</Text>
                  <Text style={styles.bookAuthor}>Tác giả: {item.tac_gia}</Text>
                  <Text style={styles.bookDetails}>
                    Thể loại: {renderTheLoai(item)} | Số lượng: {item.so_luong_sach}
                  </Text>

                  {/* Hiển thị các nút tùy theo quyền */}
                  {permissions.canEdit && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`./suasach?id=${item.id}`)}
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
                    {searchQuery ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách nào trong thư viện'}
                  </Text>
                </View>
              }
              ListFooterComponent={ListFooterComponent}
            />
          </ScrollView>
        )}

        {/* Chỉ hiển thị nút thêm sách nếu có quyền thêm */}
        {permissions.canAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('./themsach')}
          >
            <Text style={styles.addButtonText}>Thêm sách</Text>
          </TouchableOpacity>
        )}

        <AlertDialog
          visible={showDeleteDialog}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa sách này?"
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
  bookItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
  },
  bookName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 13,
    color: '#333',
    marginTop: 3,
  },
  bookDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  bookCode: {
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
  centeredContent: {
    flex: 1,
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
