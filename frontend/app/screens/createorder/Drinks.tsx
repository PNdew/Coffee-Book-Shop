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
import { fetchSanpham, convertSanphamToOrderItem } from '@/services/createorderapi';


// Danh sách đồ uống đơn giản với tên và giá
const DRINKS_DATA = [
  { id: '1', name: 'Cà phê đen', price: 25000 },
  { id: '2', name: 'Cà phê sữa', price: 30000 },
  { id: '3', name: 'Cà phê bạc xỉu', price: 35000 },
  { id: '4', name: 'Espresso', price: 40000 },
  { id: '5', name: 'Americano', price: 45000 },
  { id: '6', name: 'Latte', price: 50000 },
  { id: '7', name: 'Cappuccino', price: 50000 },
  { id: '8', name: 'Mocha', price: 55000 },
  { id: '9', name: 'Trà đào cam sả', price: 40000 },
  { id: '10', name: 'Trà chanh mật ong', price: 35000 },
  { id: '11', name: 'Trà hoa cúc', price: 35000 },
  { id: '12', name: 'Trà xanh matcha', price: 50000 },
  { id: '13', name: 'Trà sữa trân châu', price: 45000 },
  { id: '14', name: 'Trà ô long đào', price: 48000 },
  { id: '15', name: 'Soda chanh dây', price: 40000 },
  { id: '16', name: 'Soda việt quất', price: 42000 },
  { id: '17', name: 'Soda dâu tây', price: 42000 },
  { id: '18', name: 'Sinh tố bơ', price: 50000 },
  { id: '19', name: 'Sinh tố xoài', price: 48000 },
  { id: '20', name: 'Sinh tố dâu', price: 48000 },
  { id: '21', name: 'Nước ép cam', price: 45000 },
  { id: '22', name: 'Nước ép dứa', price: 45000 },
  { id: '23', name: 'Nước ép cà rốt', price: 40000 },
  { id: '24', name: 'Nước ép táo', price: 45000 },
  { id: '25', name: 'Nước ép ổi', price: 40000 },
  { id: '26', name: 'Chanh đá xay', price: 42000 },
  { id: '27', name: 'Dừa đá xay', price: 42000 },
  { id: '28', name: 'Cacao nóng', price: 50000 }
];

export default function DrinksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  
  useEffect(() => {
    // Khởi tạo số lượng ban đầu
    const initialQuantities: {[key: string]: number} = {};
    DRINKS_DATA.forEach(item => {
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
          
          <FlatList
            data={DRINKS_DATA}
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