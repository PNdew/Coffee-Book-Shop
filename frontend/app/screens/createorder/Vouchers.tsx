import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '@/components/createorder/BackButton';
import VoucherItem from '@/components/createorder/VoucherItem';
import { Voucher, VoucherAPI, OrderItem } from '@/types';
import { fetchVoucher, convertVoucherAPIToVoucher } from '@/services/createorderapi';

// Lấy chiều rộng màn hình để tính toán kích thước
const SCREEN_WIDTH = Dimensions.get('window').width;

// Hàm format giá tiền sang định dạng Việt Nam
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

// Định nghĩa tabs với ID và tên hiển thị
const tabs = [
  { id: 'all', name: 'Tất cả' },
  { id: 'applicable', name: 'Áp dụng' },
  { id: 'thucuong', name: 'Thức uống' },
  { id: 'doan', name: 'Đồ ăn' },
  { id: 'khac', name: 'Khác' }
];

// Chuyển đổi loại sản phẩm từ backend sang tiếng Việt có dấu
const getDisplayNameForCategory = (category: string): string => {
  switch(category?.toLowerCase()) {
    case 'thucuong': return 'thức uống';
    case 'doan': return 'đồ ăn';
    case 'khac': return 'khác';
    default: return category || '';
  }
};

// Kiểm tra xem voucher có áp dụng được cho các món đã chọn hay không
const isVoucherApplicable = (voucher: Voucher, items: OrderItem[]): boolean => {
  if (!items || items.length === 0) return false;
  
  // Tính tổng tiền đơn hàng
  const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Kiểm tra giá trị tối thiểu
  if (voucher.minimumOrderValue && orderTotal < voucher.minimumOrderValue) {
    return false;
  }
  
  // Nếu voucher áp dụng cho tất cả sản phẩm
  if (voucher.applicableItems?.includes('khac') || voucher.title.includes('tất cả')) {
    return true;
  }
  
  // Kiểm tra danh sách áp dụng
  const hasDoUong = items.some(item => item.id.startsWith('1') || item.id.startsWith('2'));
  const hasDoAn = items.some(item => item.id.startsWith('3') || item.id.startsWith('4'));
  
  if (voucher.applicableItems?.includes('thucuong') || voucher.title.toLowerCase().includes('thức uống')) {
    return hasDoUong;
  }
  
  if (voucher.applicableItems?.includes('doan') || voucher.title.toLowerCase().includes('đồ ăn')) {
    return hasDoAn;
  }
  
  return false;
};

export default function VoucherManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  
  // Lấy voucher hiện tại từ params (nếu có)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  // Lấy danh sách món đã chọn từ params
  useEffect(() => {
    if (params.currentItems) {
      try {
        const items = JSON.parse(params.currentItems as string);
        setCurrentItems(items);
        console.log('Items for voucher filtering:', items);
      } catch (e) {
        console.error('Error parsing current items:', e);
      }
    }
  }, [params.currentItems]);

  // Lấy danh sách voucher từ API
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ API
        try {
          const voucherData = await fetchVoucher();
          console.log('Voucher data from API:', voucherData);
          
          if (voucherData && voucherData.length > 0) {
            const formattedVouchers = voucherData.map(item => {
              const voucher = convertVoucherAPIToVoucher(item);
              // Thêm thông tin applicableItems dựa vào loaisp từ API
              voucher.applicableItems = [item.loaisp?.toLowerCase()];

              // Cập nhật tiêu đề với tên hiển thị đúng
              const displayCategory = getDisplayNameForCategory(item.loaisp);
              voucher.title = `Giảm giá ${item.giamgia}% cho ${displayCategory}`;
              
              return voucher;
            });
            
            setVouchers(formattedVouchers);
            
            // Cập nhật lại danh sách đã lọc theo tab hiện tại
            filterVouchersByTab(activeTab, formattedVouchers);
          } else {
            console.log('No vouchers found from API, using mock data');
            setVouchers([]);
            setFilteredVouchers([]);
          }
        } catch (err) {
          console.error('Error loading vouchers from API:', err);
          setError('Không thể tải danh sách voucher');
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading vouchers:', err);
        setError('Không thể tải danh sách voucher');
        setLoading(false);
      }
    };
    
    loadVouchers();
  }, []);
  
  // Hàm lọc voucher theo tab
  const filterVouchersByTab = (tabIndex: number, voucherList = vouchers) => {
    if (tabIndex === 0) {
      // Tất cả
      setFilteredVouchers(voucherList);
    } else if (tabIndex === 1) {
      // Áp dụng được cho giỏ hàng hiện tại
      setFilteredVouchers(
        voucherList.filter(voucher => isVoucherApplicable(voucher, currentItems))
      );
    } else {
      // Lọc theo loại
      const selectedTab = tabs[tabIndex].id;
      
      setFilteredVouchers(
        voucherList.filter(voucher => {
          if (selectedTab === 'thucuong') { // Thức uống
            return voucher.applicableItems?.includes('thucuong') || 
                   voucher.title.toLowerCase().includes('thức uống');
          } else if (selectedTab === 'doan') { // Đồ ăn
            return voucher.applicableItems?.includes('doan') || 
                   voucher.title.toLowerCase().includes('đồ ăn');
          } else if (selectedTab === 'khac') { // Khác
            return voucher.applicableItems?.includes('khac') || 
                   voucher.title.toLowerCase().includes('tất cả');
          }
          return false;
        })
      );
    }
  };
  
  // Lọc voucher theo tab đã chọn
  useEffect(() => {
    filterVouchersByTab(activeTab);
  }, [activeTab, vouchers, currentItems]);

  useEffect(() => {
    if (params.currentVoucher) {
      try {
        const voucherData = JSON.parse(params.currentVoucher as string);
        setSelectedVoucher(voucherData);
      } catch (e) {
        console.error('Error parsing voucher data:', e);
      }
    }
  }, [params.currentVoucher]);

  // Xử lý chọn voucher
  const handleSelectVoucher = (voucher: Voucher) => {
    // Kiểm tra xem voucher có áp dụng được không
    if (!isVoucherApplicable(voucher, currentItems)) {
      // Hiển thị thông báo hoặc xử lý khi voucher không áp dụng được
      alert('Voucher này không áp dụng được cho đơn hàng hiện tại');
      return;
    }
    
    // Trở về trang Order kèm voucher đã chọn và danh sách món đã chọn
    router.push({
      pathname: './CreateOrderScreen',
      params: { 
        selectedVoucher: JSON.stringify(voucher),
        currentItems: JSON.stringify(currentItems)
      }
    });
  };
  
  // Xử lý quay lại không chọn voucher
  const handleBackToOrder = () => {
    router.back(); // Sử dụng router.back() thay vì router.replace để nhanh hơn
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#f74848" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (filteredVouchers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy voucher nào</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredVouchers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VoucherItem 
            voucher={item} 
            isSelected={selectedVoucher?.id === item.id}
            isApplicable={isVoucherApplicable(item, currentItems)}
            onSelect={() => handleSelectVoucher(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý voucher</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={handleBackToOrder} />
            <Text style={styles.pageTitle}>VOUCHER</Text>
            <View style={{width: 40}} />
          </View>
          
          <View style={styles.tabScrollContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabContainer}
            >
              {tabs.map((tab, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tabButton,
                    activeTab === index ? styles.activeTabButton : {}
                  ]}
                  onPress={() => setActiveTab(index)}
                >
                  <Text 
                    style={[
                      styles.tabButtonText,
                      activeTab === index ? styles.activeTabButtonText : {}
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.listContainer}>
            {renderContent()}
          </View>
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
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabScrollContainer: {
    height: 50,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    minWidth: 80,
    width: (SCREEN_WIDTH - 100) / 3, // Adjust width based on screen size
    maxWidth: 120,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#f74848',
  },
  tabButtonText: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: 'white',
  },
  listContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});