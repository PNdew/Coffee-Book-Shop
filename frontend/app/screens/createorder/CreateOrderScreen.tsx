import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '@/components/createorder/BackButton';
import OrderItem from '@/components/createorder/OrderItem';
import { OrderItem as OrderItemType, Voucher } from '@/types';
import { fetchSanpham, convertSanphamToOrderItem } from '@/services/createorderapi';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';

export default function CreateOrderScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'drink' | 'food'>('drink');
  const [items, setItems] = useState<OrderItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<OrderItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  
  // Thêm state để lưu trữ dữ liệu sản phẩm từ API
  const [allProducts, setAllProducts] = useState<OrderItemType[]>([]);
  const [searchResults, setSearchResults] = useState<OrderItemType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canCreate: false
  });

  // Tính tổng tiền trước khi áp dụng voucher
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Tính số tiền giảm từ voucher
  const discountAmount = activeVoucher 
    ? activeVoucher.loaisp === 'percentage'
      ? (subtotal * activeVoucher.giamgia / 100)
      : activeVoucher.giamgia
    : 0;
  
  // Tổng tiền sau khi áp dụng voucher
  const totalAmount = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    checkUserPermissions();
    fetchAllProducts();
  }, []);

  const checkUserPermissions = async () => {
    try {
      // Get user info from token
      const user = await getUserFromToken();

      if (!user) {
        // No token or invalid token
        setPermissions({
          canCreate: false
        });
        return;
      }

      // Check order create permission
      const canCreate = await checkPermissionAPI(user.ChucVuNV, 'order.create');

      setPermissions({
        canCreate
      });

      // If user doesn't have create permission, redirect to home
      if (!canCreate) {
        Alert.alert(
          "Thông báo",
          "Bạn không có quyền tạo hóa đơn.",
          [
            { 
              text: "Đã hiểu",
              onPress: () => router.push('../HomeScreen')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  // Fetch tất cả sản phẩm khi component mount
  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      const sanphamData = await fetchSanpham();
      const productItems = sanphamData.map(item => convertSanphamToOrderItem(item));
      setAllProducts(productItems);
    } catch (err) {
      console.error('Failed to fetch all products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrement = (id: string) => {
    setItems(items.map(item => 
      item.id === id && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0));
  };

  // Thêm vào giỏ hàng từ kết quả tìm kiếm
  const addToOrder = (item: OrderItemType) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Sản phẩm đã tồn tại, tăng số lượng lên 1
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Sản phẩm mới, thêm vào với số lượng là 1
        return [...prevItems, {...item, quantity: 1}];
      }
    });
    
    // Xóa tìm kiếm sau khi thêm
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // Nếu không có text, hiển thị các sản phẩm trong order hiện tại
      setIsSearching(false);
    } else {
      // Nếu có text, tìm kiếm trong tất cả sản phẩm
      setIsSearching(true);
      const filtered = allProducts.filter(item => 
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  // Update filteredItems when items changes
  useEffect(() => {
    if (!isSearching) {
      setFilteredItems(items);
    }
  }, [items, isSearching]);

  const handleConfirm = () => {
    if (!permissions.canCreate) {
      Alert.alert(
        "Thông báo",
        "Bạn không có quyền tạo hóa đơn.",
        [{ text: "Đã hiểu" }]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    
    router.push({
      pathname: './Bill',
      params: { 
        totalAmount: totalAmount.toString(),
        subtotal: subtotal.toString(),
        discountAmount: discountAmount.toString(),
        items: JSON.stringify(items),
        voucherInfo: activeVoucher ? JSON.stringify(activeVoucher) : null
      }
    });
  };

  const handleVoucherSelect = () => {
    router.push({
      pathname: './Vouchers',
      params: { 
        currentVoucher: activeVoucher ? JSON.stringify(activeVoucher) : null,
        currentItems: JSON.stringify(items) // Thêm dòng này để truyền danh sách món đã chọn
      }
    });
  };

  const params = useLocalSearchParams();
  
  // Xử lý voucher và sản phẩm mới
  useEffect(() => {
    // Xử lý voucher đã chọn
    if (params.selectedVoucher) {
      try {
        const voucher = JSON.parse(params.selectedVoucher as string);
        setActiveVoucher(voucher);
      } catch (e) {
        console.error('Error parsing voucher:', e);
      }
    }
    
    // Xử lý danh sách sản phẩm hiện tại từ trang menu
    if (params.currentItems && !params.newItem && !params.selectedItems) {
      try {
        const currentItems = JSON.parse(params.currentItems as string);
        setItems(currentItems);
      } catch (e) {
        console.error('Error parsing current items:', e);
      }
    }
    
    // Xử lý danh sách các sản phẩm được chọn từ nút "Thêm tất cả"
    if (params.selectedItems) {
      try {
        const selectedItems = JSON.parse(params.selectedItems as string);
        console.log('Received selected items:', selectedItems);
        
        // Nếu có danh sách sản phẩm hiện tại từ trang menu
        if (params.currentItems) {
          try {
            const currentItems = JSON.parse(params.currentItems as string);
            setItems(prevItems => {
              // Đặt lại danh sách sản phẩm từ trang menu
              const updatedItems = [...currentItems];
              
              // Thêm hoặc cập nhật các sản phẩm mới
              selectedItems.forEach((newItem: OrderItemType) => {
                const existingItemIndex = updatedItems.findIndex(item => item.id === newItem.id);
                if (existingItemIndex >= 0) {
                  updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
                } else {
                  updatedItems.push(newItem);
                }
              });
              
              return updatedItems;
            });
          } catch (e) {
            console.error('Error parsing current items with selected items:', e);
          }
        } else {
          // Xử lý khi không có danh sách sản phẩm hiện tại
          setItems(prevItems => {
            const updatedItems = [...prevItems];
            
            selectedItems.forEach((newItem: OrderItemType) => {
              const existingItemIndex = updatedItems.findIndex(item => item.id === newItem.id);
              if (existingItemIndex >= 0) {
                updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
              } else {
                updatedItems.push(newItem);
              }
            });
            
            return updatedItems;
          });
        }
      } catch (e) {
        console.error('Error parsing selected items:', e);
      }
    }
    
    // Xử lý sản phẩm mới từ trang menu
    if (params.newItem) {
      try {
        const newItem = JSON.parse(params.newItem as string);
        console.log('Received new item:', newItem);
        
        // Nếu có danh sách sản phẩm hiện tại từ trang menu
        if (params.currentItems) {
          try {
            const currentItems = JSON.parse(params.currentItems as string);
            setItems(prevItems => {
              // Đặt lại danh sách sản phẩm từ trang menu
              const updatedItems = [...currentItems];
              
              // Thêm hoặc cập nhật sản phẩm mới
              const existingItemIndex = updatedItems.findIndex(item => item.id === newItem.id);
              if (existingItemIndex >= 0) {
                updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
              } else {
                updatedItems.push(newItem);
              }
              
              return updatedItems;
            });
          } catch (e) {
            console.error('Error parsing current items with new item:', e);
          }
        } else {
          // Xử lý như trước nếu không có danh sách sản phẩm hiện tại
          setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
            
            if (existingItemIndex >= 0) {
              const updatedItems = [...prevItems];
              updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
              return updatedItems;
            } else {
              return [...prevItems, newItem];
            }
          });
        }
      } catch (e) {
        console.error('Error parsing new item:', e);
      }
    }
  }, [params.selectedVoucher, params.newItem, params.currentItems, params.selectedItems]);

  // Xử lý chuyển đến trang menu khi nhấn vào tab
  const handleTabPress = (tab: 'drink' | 'food') => {
    setActiveTab(tab);
    if (tab === 'drink') {
      router.push({
        pathname: './Drinks',
        params: { currentItems: JSON.stringify(items) }
      });
    } else if (tab === 'food') {
      router.push({
        pathname: './Foods',
        params: { currentItems: JSON.stringify(items) }
      });
    }
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#f74848" style={{marginTop: 20}} />;
    }
    
    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.searchResultItem}
            onPress={() => addToOrder(item)}
          >
            <View style={styles.searchResultInfo}>
              <Text style={styles.searchResultName}>{item.name}</Text>
              <Text style={styles.searchResultPrice}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0,
                }).format(item.price)}
              </Text>
            </View>
            <Ionicons name="add-circle" size={24} color="#f74848" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            Không tìm thấy sản phẩm phù hợp
          </Text>
        }
      />
    );
  };

  // If user doesn't have create permission, show error
  if (!permissions.canCreate && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Bạn không có quyền tạo hóa đơn.</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push('../HomeScreen')}
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
          <Text style={styles.title}>Tạo Order</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.topBar}>
            <View style={styles.leftSection}>
              <BackButton onPress={() => router.push({pathname: '../HomeScreen'})} />
            </View>
            
            <View style={styles.centerSection}>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Nhận Order</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.rightSection}>
              {/* Phần này để trống để cân bằng layout */}
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearching(false); }}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {!isSearching ? (
            <>
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[
                    styles.tabButton, 
                    activeTab === 'drink' && styles.activeTabButton
                  ]}
                  onPress={() => handleTabPress('drink')}
                >
                  <Text style={styles.tabButtonText}>Đồ uống</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.tabButton, 
                    activeTab === 'food' && styles.activeTabButton
                  ]}
                  onPress={() => handleTabPress('food')}
                >
                  <Text style={styles.tabButtonText}>Đồ ăn</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.itemsList}>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <OrderItem 
                      key={item.id} 
                      item={item} 
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyListText}>
                    Chưa có món nào được chọn
                  </Text>
                )}
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.voucherSection}
                onPress={handleVoucherSelect}
              >
                <Text style={styles.voucherLabel}>Voucher</Text>
                <Text style={styles.voucherValue}>
                  {activeVoucher ? activeVoucher.tenvoucher : 'Chọn voucher'}
                </Text>
              </TouchableOpacity>
              
              {activeVoucher && (
                <View style={styles.discountSection}>
                  <Text style={styles.discountLabel}>Giảm giá:</Text>
                  <Text style={styles.discountAmount}>-{discountAmount.toLocaleString()} đ</Text>
                </View>
              )}
              
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Tổng:</Text>
                <Text style={styles.totalAmount}>{totalAmount.toLocaleString()} đ</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionConfirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.actionConfirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                  <Text style={styles.cancelButtonText}>Huỷ</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>Kết quả tìm kiếm</Text>
              {renderSearchResults()}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Các style hiện tại
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
    marginBottom: 15,
  },
  leftSection: {
    width: '20%',
  },
  centerSection: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: '20%',
  },
  confirmButton: {
    backgroundColor: '#f74848',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#ccc',
  },
  tabButtonText: {
    fontWeight: 'bold',
  },
  itemsList: {
    flex: 1,
    marginVertical: 10,
  },
  voucherSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  voucherLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  voucherValue: {
    fontSize: 16,
    color: '#f74848',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingVertical: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionConfirmButton: {
    flex: 3,
    backgroundColor: '#f74848',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  actionConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  // Thêm các style còn thiếu
  discountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingVertical: 5,
  },
  discountLabel: {
    fontSize: 16,
    color: '#f74848',
  },
  discountAmount: {
    fontSize: 16,
    color: '#f74848',
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: 5,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchResultPrice: {
    fontSize: 14,
    color: '#f74848',
    fontWeight: '500',
  },
  centeredContent: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
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