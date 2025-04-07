import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/createorder/BackButton';

// Danh sách đồ ăn đơn giản với tên và giá
const FOODS_DATA = [
  { id: '31', name: 'Bánh mì nướng bơ tỏi', price: 30000 },
  { id: '32', name: 'Bánh mì sandwich kẹp thịt', price: 35000 },
  { id: '33', name: 'Bánh croissant', price: 40000 },
  { id: '34', name: 'Bánh sừng bò nhân phô mai', price: 45000 },
  { id: '35', name: 'Bánh ngọt socola', price: 40000 },
  { id: '36', name: 'Bánh mousse matcha', price: 50000 },
  { id: '37', name: 'Bánh su kem', price: 35000 },
  { id: '38', name: 'Khoai tây chiên', price: 45000 },
  { id: '39', name: 'Gà viên chiên', price: 50000 },
  { id: '40', name: 'Xúc xích nướng', price: 45000 }
];

export default function FoodsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  
  useEffect(() => {
    // Khởi tạo số lượng ban đầu
    const initialQuantities: {[key: string]: number} = {};
    FOODS_DATA.forEach(item => {
      initialQuantities[item.id] = 0;
    });
    setQuantities(initialQuantities);
    
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

  const addToOrder = (item: { id: string, name: string, price: number }) => {
    const quantity = quantities[item.id] || 0;
    if (quantity <= 0) return;
    
    const orderItem = {
      id: item.id,
      name: item.name,
      price: item.price,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Đồ ăn</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
              <Text style={styles.pageTitle}>ĐỒ ĂN</Text>
              <View style={{width: 40}} />
            </View>
            <ActivityIndicator size="large" color="#f74848" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Đồ ăn</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={() => router.back()} />
            <Text style={styles.pageTitle}>ĐỒ ĂN</Text>
            <View style={{width: 40}} />
          </View>
          
          <FlatList
            data={FOODS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price.toLocaleString()}đ</Text>
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
});