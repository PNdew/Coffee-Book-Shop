import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/createorder/BackButton';
import { fetchSanpham, convertSanphamToOrderItem } from '@/services/createorderapi';
import { OrderItem } from '@/types';

// Hàm format giá tiền sang định dạng Việt Nam
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function DrinksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drinksData, setDrinksData] = useState<OrderItem[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<OrderItem[]>([]);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sanphamData = await fetchSanpham();
        
        // Lọc các sản phẩm đồ uống (có thể cần điều chỉnh dựa vào cấu trúc dữ liệu thực tế)
        const drinks = sanphamData
          .filter(item => item.loaisp?.toLowerCase() === 'douong');

        const drinkItems = drinks.map(item => convertSanphamToOrderItem(item));
        
        setDrinksData(drinkItems);
        setFilteredDrinks(drinkItems);
        
        // Khởi tạo số lượng ban đầu
        const initialQuantities: {[key: string]: number} = {};
        drinkItems.forEach(item => {
          initialQuantities[item.id] = 0;
        });
        setQuantities(initialQuantities);
        
      } catch (err) {
        console.error('Failed to fetch drinks:', err);
        setError('Không thể tải danh sách đồ uống');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Lấy danh sách món đã chọn từ trang create
    if (params.currentItems) {
      try {
        const items = JSON.parse(params.currentItems as string);
        setCurrentItems(items);
      } catch (e) {
        console.error('Error parsing current items:', e);
      }
    }
  }, [params.currentItems]);

  // Hàm tìm kiếm sản phẩm theo tên
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredDrinks(drinksData);
    } else {
      const filtered = drinksData.filter(item => 
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDrinks(filtered);
    }
  };

  const incrementQuantity = (id: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const decrementQuantity = (id: string) => {
    if (quantities[id] && quantities[id] > 0) {
      setQuantities(prev => ({
        ...prev,
        [id]: prev[id] - 1
      }));
    }
  };

  const addToOrder = (item: OrderItem) => {
    const quantity = quantities[item.id] || 0;
    if (quantity <= 0) return;
    
    const orderItem = {
      ...item,
      quantity: quantity
    };
    
    router.push({
      pathname: './CreateOrderScreen',
      params: { 
        newItem: JSON.stringify(orderItem),
        currentItems: JSON.stringify(currentItems)
      }
    });
  };

  const addAllToOrder = () => {
    const selectedItems = drinksData.filter(item => quantities[item.id] && quantities[item.id] > 0)
      .map(item => ({
        ...item,
        quantity: quantities[item.id]
      }));
    
    if (selectedItems.length === 0) return;
    
    router.push({
      pathname: './CreateOrderScreen',
      params: { 
        selectedItems: JSON.stringify(selectedItems),
        currentItems: JSON.stringify(currentItems)
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Đồ uống</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
              <Text style={styles.pageTitle}>ĐỒ UỐNG</Text>
              <View style={{width: 40}} />
            </View>
            <ActivityIndicator size="large" color="#f74848" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Đồ uống</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
              <Text style={styles.pageTitle}>ĐỒ UỐNG</Text>
              <View style={{width: 40}} />
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Đồ uống</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={() => router.back()} />
            <Text style={styles.pageTitle}>ĐỒ UỐNG</Text>
            <View style={{width: 40}} />
          </View>
          
          {/* Thêm thanh tìm kiếm */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm đồ uống..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <FlatList
            data={filteredDrinks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    onPress={() => incrementQuantity(item.id)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add-circle" size={24} color="#000" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>
                    {quantities[item.id] || 0}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => decrementQuantity(item.id)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove-circle" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.addButton,
                    (!quantities[item.id] || quantities[item.id] <= 0) 
                      ? styles.addButtonDisabled 
                      : {}
                  ]}
                  onPress={() => addToOrder(item)}
                  disabled={!quantities[item.id] || quantities[item.id] <= 0}
                >
                  <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                {searchQuery ? "Không tìm thấy đồ uống phù hợp" : "Không có đồ uống nào"}
              </Text>
            }
          />
          
          {/* Nút "Thêm tất cả" đặt ở ngoài FlatList để dễ nhìn hơn */}
          {filteredDrinks.length > 0 && (
            <TouchableOpacity 
              style={[
                styles.addAllButton,
                !Object.values(quantities).some(quantity => quantity > 0) 
                  ? styles.addButtonDisabled 
                  : {}
              ]}
              onPress={addAllToOrder}
              disabled={!Object.values(quantities).some(quantity => quantity > 0)}
            >
              <Text style={styles.addAllButtonText}>THÊM TẤT CẢ</Text>
            </TouchableOpacity>
          )}
        </View>
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
  },
  header: {
    height: 50,
    backgroundColor: '#222',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#f74848',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#f74848',
  },
  addAllButton: {
    backgroundColor: '#f74848',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
    width: '90%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});