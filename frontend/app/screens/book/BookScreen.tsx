import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { bookService, Book } from '@/services/bookapi';
import AlertDialog from '@/components/AlertDialog';

export default function SachScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [refresh]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      console.log('Đang kết nối để lấy danh sách sách...');
      const data = await bookService.getAllBooks();
      console.log('Dữ liệu nhận được:', data);
      
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
    router.push(`./suasach?id=${id}`);
  };

  const handleLongPress = (id: string) => {
    setSelectedBookId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookId) return;
    
    try {
      await bookService.deleteBook(selectedBookId);
      setBooks(books.filter(book => book.id.toString() !== selectedBookId));
      setShowDeleteDialog(false);
      setSelectedBookId(null);
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
      // Có thể thêm thông báo lỗi ở đây
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
          placeholder="Tìm kiếm theo tên sách, tác giả"
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
        <>
          <FlatList
            data={filteredBooks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.bookItem}
                onPress={() => handleBookPress(item.id.toString())}
                onLongPress={() => handleLongPress(item.id.toString())}
              >
                <Text style={styles.bookName}>{item.ten_sach}</Text>
                <Text style={styles.bookAuthor}>Tác giả: {item.tac_gia}</Text>
                <Text style={styles.bookDetails}>
                  Thể loại: {item.the_loai} | Số lượng: {item.so_luong_sach}
                </Text>
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
        </>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('./themsach')}
      >
        <Text style={styles.addButtonText}>Thêm sách</Text>
      </TouchableOpacity>

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
});
