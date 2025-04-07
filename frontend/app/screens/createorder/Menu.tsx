import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchSanpham, convertSanphamToOrderItem } from '@/services/createorderapi';
import { SanphamAPI, OrderItem } from '@/types';
import BackButton from '@/components/createorder/BackButton';

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryType = params.category as string || 'all'; // 'DoUong', 'DoAn', hoặc 'all'
  
  const [sanphams, setSanphams] = useState<SanphamAPI[]>([]);
  const [filteredSanphams, setFilteredSanphams] = useState<SanphamAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSanpham = async () => {
      try {
        setLoading(true);
        const data = await fetchSanpham();
        
        if (!data || data.length === 0) {
          setError('Không có sản phẩm nào');
          return;
        }
        
        setSanphams(data);
        
        // Lọc sản phẩm theo loại
        if (categoryType && categoryType !== 'all') {
          const filtered = data.filter(item => item.loaisp === categoryType);
          if (filtered.length === 0) {
            setError(`Không có sản phẩm nào thuộc loại ${categoryType}`);
          }
          setFilteredSanphams(filtered);
        } else {
          setFilteredSanphams(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadSanpham();
  }, [categoryType]);

  const handleAddToOrder = (sanpham: SanphamAPI) => {
    const orderItem = convertSanphamToOrderItem(sanpham);
    // Chuyển đến trang create với sản phẩm đã chọn
    router.push({
      pathname: './CreateOrderScreen',
      params: { 
        newItem: JSON.stringify(orderItem)
      }
    });
  };

  // Xử lý tăng/giảm số lượng trực tiếp trong menu
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});

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

  const addToCart = (sanpham: SanphamAPI) => {
    const id = sanpham.idsanpham.toString();
    const quantity = quantities[id] || 1;
    
    const orderItem = {
      ...convertSanphamToOrderItem(sanpham),
      quantity
    };
    
    router.push({
      pathname: './create',
      params: { 
        newItem: JSON.stringify(orderItem)
      }
    });
  };

  const getCategoryTitle = () => {
    switch(categoryType) {
      case 'DoUong': return 'Đồ uống';
      case 'DoAn': return 'Đồ ăn';
      default: return 'Thực đơn';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{getCategoryTitle()}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
            </View>
            <Text style={styles.message}>Đang tải...</Text>
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
            <Text style={styles.title}>{getCategoryTitle()}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
            </View>
            <Text style={styles.message}>Lỗi: {error}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{getCategoryTitle()}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={() => router.back()} />
          </View>
          <FlatList
            data={filteredSanphams}
            keyExtractor={(item) => item.idsanpham.toString()}
            renderItem={({ item }) => {
              const id = item.idsanpham.toString();
              const quantity = quantities[id] || 1;
              
              return (
                <View style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.tensp}</Text>
                    <Text style={styles.itemPrice}>{item.giasp.toLocaleString('vi-VN')} đ</Text>
                  </View>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => decrementQuantity(id)}
                    >
                      <Ionicons name="remove-circle" size={24} color="#f74848" />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{quantity}</Text>
                    
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => incrementQuantity(id)}
                    >
                      <Ionicons name="add-circle" size={24} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.addButtonText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
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
    alignItems: 'center',
    marginBottom: 15,
  },
  message: {
    padding: 20,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 25,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#f74848',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});