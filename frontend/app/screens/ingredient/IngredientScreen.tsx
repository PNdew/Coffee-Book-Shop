import React from 'react';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ingredientService, Ingredient } from '@/services/ingredientapi';

export default function NguyenLieuScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { refresh } = useLocalSearchParams();

  useEffect(() => {
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
    router.push(`./suanguyenlieu?id=${id}`);
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
              >
                <Text style={styles.ingredientName}>{item.ten_nguyen_lieu}</Text>
                <Text style={styles.ingredientQuantity}>
                  Số lượng: {item.so_luong} | Giá nhập: {item.gia_nhap.toLocaleString()} đ
                </Text>
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

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('./themnguyenlieu')}
      >
        <Text style={styles.addButtonText}>Thêm nguyên liệu</Text>
      </TouchableOpacity>
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
});