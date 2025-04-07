import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '@/components/createorder/BackButton';
import VoucherItem from '@/components/createorder/VoucherItem';
import { Voucher, VoucherAPI } from '@/types';
import { fetchVoucher, convertVoucherAPIToVoucher } from '@/services/createorderapi';

const tabs = ['Tất cả', 'Đồ uống', 'Đồ ăn', 'Khác'];

// Danh sách voucher mẫu từ ảnh
const MOCK_VOUCHERS: Voucher[] = [
  { 
    id: '1', 
    title: 'Giảm giá 10% cho Đồ uống', 
    expireDate: '31/03/2025', 
    discountValue: '10', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoUong']
  },
  { 
    id: '2', 
    title: 'Giảm giá 15% cho Đồ ăn', 
    expireDate: '05/04/2025', 
    discountValue: '15', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoAn']
  },
  { 
    id: '3', 
    title: 'Giảm giá 20% cho tất cả sản phẩm', 
    expireDate: '10/04/2025', 
    discountValue: '20', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['Khac']
  },
  { 
    id: '4', 
    title: 'Giảm giá 5% cho Đồ uống', 
    expireDate: '30/03/2025', 
    discountValue: '5', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoUong']
  },
  { 
    id: '5', 
    title: 'Giảm giá 25% cho Đồ ăn', 
    expireDate: '15/04/2025', 
    discountValue: '25', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoAn']
  },
  { 
    id: '6', 
    title: 'Giảm giá 30% cho tất cả sản phẩm', 
    expireDate: '12/04/2025', 
    discountValue: '30', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['Khac']
  },
  { 
    id: '7', 
    title: 'Giảm giá 12% cho Đồ uống', 
    expireDate: '20/04/2025', 
    discountValue: '12', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoUong']
  },
  { 
    id: '8', 
    title: 'Giảm giá 18% cho Đồ ăn', 
    expireDate: '07/04/2025', 
    discountValue: '18', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoAn']
  },
  { 
    id: '9', 
    title: 'Giảm giá 22% cho tất cả sản phẩm', 
    expireDate: '17/04/2025', 
    discountValue: '22', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['Khac']
  },
  { 
    id: '10', 
    title: 'Giảm giá 8% cho Đồ uống', 
    expireDate: '29/03/2025', 
    discountValue: '8', 
    discountType: 'percentage', 
    minimumOrderValue: 0,
    applicableItems: ['DoUong']
  }
];

export default function VoucherManagementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [currentItems, setCurrentItems] = useState<any[]>([]); // Thêm state này

  // Lấy voucher hiện tại từ params (nếu có)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  // Lấy danh sách món đã chọn từ params
  useEffect(() => {
    if (params.currentItems) {
      try {
        const items = JSON.parse(params.currentItems as string);
        setCurrentItems(items);
      } catch (e) {
        console.error('Error parsing current items:', e);
      }
    }
  }, [params.currentItems]);

  // Lấy danh sách voucher từ API
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        // Đặt dữ liệu mẫu trước để giao diện hiển thị nhanh
        setVouchers(MOCK_VOUCHERS);
        setFilteredVouchers(MOCK_VOUCHERS);
        setLoading(false); // Tắt loading ngay lập tức để hiển thị UI
        
        // Sau đó thử lấy dữ liệu từ API (nếu có)
        try {
          const voucherData = await fetchVoucher();
          
          if (voucherData && voucherData.length > 0) {
            const formattedVouchers = voucherData.map(convertVoucherAPIToVoucher);
            setVouchers(formattedVouchers);
            
            // Cập nhật lại danh sách đã lọc theo tab hiện tại
            if (activeTab === 0) {
              setFilteredVouchers(formattedVouchers);
            } else {
              const loaisp = tabs[activeTab];
              setFilteredVouchers(
                formattedVouchers.filter(voucher => {
                  if (loaisp === 'Đồ uống') {
                    return voucher.title.includes('Đồ uống') || voucher.applicableItems?.includes('DoUong');
                  } else if (loaisp === 'Đồ ăn') {
                    return voucher.title.includes('Đồ ăn') || voucher.applicableItems?.includes('DoAn');
                  } else if (loaisp === 'Khác') {
                    return voucher.title.includes('tất cả sản phẩm') || voucher.applicableItems?.includes('Khac');
                  }
                  return false;
                })
              );
            }
          }
        } catch (err) {
          console.error('Error loading vouchers from API:', err);
          // Đã có dữ liệu mẫu nên không cần xử lý lỗi
        }
      } catch (err) {
        console.error('Error loading vouchers:', err);
        setError('Không thể tải danh sách voucher');
        setLoading(false);
      }
    };
    
    loadVouchers();
  }, []);
  
  // Lọc voucher theo tab đã chọn
  useEffect(() => {
    if (activeTab === 0) {
      // Tất cả
      setFilteredVouchers(vouchers);
    } else {
      // Lọc theo loại
      const loaisp = tabs[activeTab];
      setFilteredVouchers(
        vouchers.filter(voucher => {
          if (loaisp === 'Đồ uống') {
            return voucher.title.includes('Đồ uống') || voucher.applicableItems?.includes('DoUong');
          } else if (loaisp === 'Đồ ăn') {
            return voucher.title.includes('Đồ ăn') || voucher.applicableItems?.includes('DoAn');
          } else if (loaisp === 'Khác') {
            return voucher.title.includes('tất cả sản phẩm') || voucher.applicableItems?.includes('Khac');
          }
          return false;
        })
      );
    }
  }, [activeTab, vouchers]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Quản lý voucher</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={handleBackToOrder} />
            </View>
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
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
            <Text style={styles.title}>Quản lý voucher</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <BackButton onPress={handleBackToOrder} />
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
          <Text style={styles.title}>Quản lý voucher</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={handleBackToOrder} />
            <TouchableOpacity style={styles.voucherButton}>
              <Text style={styles.voucherButtonText}>QUẢN LÝ VOUCHER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContainer}>
            <FlatList
              data={tabs}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={[
                    styles.tabButton, 
                    activeTab === index && styles.activeTabButton
                  ]}
                  onPress={() => setActiveTab(index)}
                >
                  <Text 
                    style={[
                      styles.tabText, 
                      activeTab === index && styles.activeTabText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.productsCount}>{filteredVouchers.length} voucher</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={20} color="#f00" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredVouchers}
            renderItem={({ item }) => (
              <VoucherItem 
                voucher={item} 
                onSelect={(voucher) => handleSelectVoucher(voucher)}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.vouchersList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có voucher nào</Text>
            }
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
    marginBottom: 15,
  },
  voucherButton: {
    backgroundColor: '#ffb6b6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
  },
  voucherButtonText: {
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    marginBottom: 15,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTabButton: {
    backgroundColor: '#f74848',
  },
  tabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productsCount: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    padding: 5,
  },
  vouchersList: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  }
});