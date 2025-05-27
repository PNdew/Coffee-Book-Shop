import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, TextInput, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { fetchSanpham } from '@/services/createorderapi';
import { SanphamAPI } from '@/types';
import axios from 'axios';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<SanphamAPI[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SanphamAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SanphamAPI[]>([]);
  
  // State cho quyền người dùng
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });
  
  // State cho modal chỉnh sửa và thêm mới sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<SanphamAPI | null>(null);
  const [showProductDetails, setShowProductDetails] = useState<boolean>(false);
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  
  // Form dữ liệu
  const [formData, setFormData] = useState({
    tensp: '',
    loaisp: 'DoUong',
    giasp: '',
    trangthai: 'Còn'
  });
  
  // Các danh mục sản phẩm
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'douong', name: 'Đồ uống' },
    { id: 'doan', name: 'Đồ ăn' },
  ];

  useEffect(() => {
    // Kiểm tra quyền người dùng khi component được mount
    checkUserPermissions();
    
    // Tải danh sách sản phẩm
    loadProducts();
  }, []);

  const checkUserPermissions = async () => {
    try {
      // Lấy thông tin người dùng từ token
      const user = await getUserFromToken();
      
      if (!user) {
        // Không có token hoặc token không hợp lệ
        setPermissions({
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false
        });
        return;
      }
      
      // Kiểm tra quyền xem menu
      const canView = await checkPermissionAPI(user.ChucVuNV, 'menu.view');
      
      // Kiểm tra quyền thêm/sửa/xóa nếu có quyền xem
      let canAdd = false;
      let canEdit = false;
      let canDelete = false;
      
      if (canView) {
        canAdd = await checkPermissionAPI(user.ChucVuNV, 'menu.create');
        canEdit = await checkPermissionAPI(user.ChucVuNV, 'menu.update');
        canDelete = await checkPermissionAPI(user.ChucVuNV, 'menu.delete');
      }
      
      setPermissions({
        canView,
        canAdd,
        canEdit,
        canDelete
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchSanpham();
      
      if (!data || data.length === 0) {
        setError('Không có sản phẩm nào');
        return;
      }
      
      setProducts(data);
      filterProducts(data, activeCategory, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  const filterProducts = (products: SanphamAPI[], category: string, query: string = '') => {
    let filtered = products;
    
    // Lọc theo danh mục
    if (category !== 'all') {
      filtered = filtered.filter(item => 
        item.loaisp?.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (query.trim()) {
      filtered = filtered.filter(item => 
        item.tensp.toLowerCase().startsWith(query.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
    
    // Cập nhật kết quả tìm kiếm nếu đang tìm kiếm
    if (showSearch) {
      setSearchResults(filtered);
    }
  };

  // Xử lý khi chọn danh mục
  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    filterProducts(products, category, searchQuery);
  };

  // Xử lý khi nhập từ khóa tìm kiếm
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterProducts(products, activeCategory, text);
  };

  // Hiển thị tên loại sản phẩm dựa vào mã loại
  const getDisplayProductType = (loaisp: string): string => {
    if (loaisp === 'DoUong' || loaisp?.toLowerCase() === 'douong') return 'Đồ uống';
    if (loaisp === 'DoAn' || loaisp?.toLowerCase() === 'doan') return 'Đồ ăn';
    if (loaisp === 'Khac' || loaisp?.toLowerCase() === 'khac') return 'Khác';
    return loaisp;
  };
  
  // Xử lý xem chi tiết sản phẩm
  const handleViewProductDetails = (product: SanphamAPI) => {
    setSelectedProduct(product);
    
    // Map loại sản phẩm từ cũ sang mới
    let loaisp = 'DoUong';
    if (product.loaisp?.toLowerCase() === 'douong' || product.loaisp === 'DoUong') {
      loaisp = 'DoUong';
    } else if (product.loaisp?.toLowerCase() === 'doan' || product.loaisp === 'DoAn') {
      loaisp = 'DoAn';
    } else if (product.loaisp?.toLowerCase() === 'khac' || product.loaisp === 'Khac') {
      loaisp = 'Khac';
    }
    
    setFormData({
      tensp: product.tensp,
      loaisp: loaisp,
      giasp: product.giasp.toString(),
      trangthai: product.trangthaisp === 1 ? 'Còn' : 'Hết'
    });
    
    setShowProductDetails(true);
  };

  // Xử lý thêm sản phẩm mới
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      tensp: '',
      loaisp: 'DoUong',
      giasp: '',
      trangthai: 'Còn'
    });
    setShowAddProduct(true);
  };

  // Xử lý lưu sản phẩm mới
  const handleSaveProduct = async () => {
    try {
      // Kiểm tra nếu người dùng có quyền thêm sản phẩm
      if (!permissions.canAdd) {
        alert('Bạn không có quyền thêm sản phẩm mới.');
        return;
      }
      
      const user = await getUserFromToken();
      if (!user) {
        alert('Vui lòng đăng nhập lại để thực hiện chức năng này.');
        return;
      }
      
      const token = await AsyncStorage.getItem('access_token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const productData = {
        tensp: formData.tensp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0,
        loaisp: formData.loaisp
      };
      
      console.log(productData);
      await axios.post(`http://localhost:8000/api/sanpham/`, productData, { headers });
      
      // Cập nhật lại danh sách sản phẩm
      loadProducts();
      setShowAddProduct(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Không thể thêm sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Xử lý cập nhật sản phẩm
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      // Kiểm tra nếu người dùng có quyền sửa sản phẩm
      if (!permissions.canEdit) {
        alert('Bạn không có quyền sửa sản phẩm.');
        return;
      }
      
      const token = await AsyncStorage.getItem('access_token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const productData = {
        idsanpham: selectedProduct.idsanpham,
        tensp: formData.tensp,
        loaisp: formData.loaisp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0
      };
      
      await axios.put(`http://localhost:8000/api/sanpham/${selectedProduct.idsanpham}/`, productData, { headers });
      
      // Cập nhật lại danh sách sản phẩm
      loadProducts();
      setShowProductDetails(false);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      // Kiểm tra nếu người dùng có quyền xóa sản phẩm
      if (!permissions.canDelete) {
        alert('Bạn không có quyền xóa sản phẩm.');
        return;
      }
      
      const token = await AsyncStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      await axios.delete(`http://localhost:8000/api/sanpham/${selectedProduct.idsanpham}/`, { headers });
      
      // Cập nhật lại danh sách sản phẩm
      loadProducts();
      setShowProductDetails(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Form input handling
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Đóng thanh tìm kiếm
  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    filterProducts(products, activeCategory, '');
  };

  // Nếu không có quyền xem, hiển thị thông báo lỗi
  if (!permissions.canView && !loading) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('./HomeScreen')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>QUẢN LÝ MENU</Text>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons name={showSearch ? "close" : "search"} size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Thanh tìm kiếm và kết quả dự đoán */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm món..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {/* Hiển thị kết quả dự đoán khi có nhập liệu */}
          {searchQuery && searchResults.length > 0 && (
            <View style={styles.predictiveResultsContainer}>
              {searchResults.slice(0, 5).map((item) => (
                <TouchableOpacity 
                  key={item.idsanpham.toString()} 
                  style={styles.predictiveItem}
                  onPress={() => {
                    setSearchQuery(item.tensp);
                    filterProducts(products, activeCategory, item.tensp);
                  }}
                >
                  <Text style={styles.predictiveItemText}>{item.tensp}</Text>
                  <Text style={styles.predictiveItemType}>{getDisplayProductType(item.loaisp)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
      
      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryTabsRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                activeCategory === category.id && styles.activeCategory
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Product Count and Filter */}
      <View style={styles.productCountContainer}>
        <Text style={styles.productCount}>
          {filteredProducts.length} sản phẩm
        </Text>
        
        <TouchableOpacity style={styles.filterButton}>
          <FontAwesome name="filter" size={20} color="#FF0000" />
        </TouchableOpacity>
      </View>
      
      {/* Product List */}
      {loading ? (
        <View style={styles.centeredContent}>
          <Text>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centeredContent}>
          <Text style={styles.noResultsText}>
            {searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Không có sản phẩm nào'}
          </Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.idsanpham.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.productItem}
                onPress={() => (permissions.canEdit || permissions.canDelete) ? handleViewProductDetails(item) : null}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.tensp}</Text>
                  <Text style={styles.productPrice}>Giá: {item.giasp.toLocaleString('vi-VN')} VNĐ</Text>
                  <Text style={styles.productCategory}>Loại: {getDisplayProductType(item.loaisp)}</Text>
                </View>
                
                <Image
                  source={require('@/assets/images/default-coffee.png')}
                  style={styles.productImage}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.productList}
          />
          
          {/* Nút "Thêm món" chỉ hiển thị với người dùng có quyền thêm */}
          {permissions.canAdd && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.addButtonText}>Thêm món</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Modal Chi tiết sản phẩm */}
      <Modal
        visible={showProductDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông tin món</Text>
            
            <View style={styles.imagePickerContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={{color: '#666', marginTop: 8}}>Chọn ảnh</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên món *</Text>
              <TextInput
                style={styles.input}
                value={formData.tensp}
                onChangeText={(value) => handleInputChange('tensp', value)}
                editable={permissions.canEdit}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loại *</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'DoUong')}
                  disabled={!permissions.canEdit}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'DoUong' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Đồ uống</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'DoAn')}
                  disabled={!permissions.canEdit}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'DoAn' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Đồ ăn</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'Khac')}
                  disabled={!permissions.canEdit}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'Khac' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Khác</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Giá *</Text>
              <TextInput
                style={styles.input}
                value={formData.giasp}
                onChangeText={(value) => handleInputChange('giasp', value)}
                keyboardType="numeric"
                editable={permissions.canEdit}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trạng thái (Còn, hết)</Text>
              <TextInput
                style={styles.input}
                value={formData.trangthai}
                onChangeText={(value) => handleInputChange('trangthai', value)}
                editable={permissions.canEdit}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              {permissions.canDelete && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDeleteProduct}
                >
                  <Text style={[styles.buttonText, {color: '#ff4757'}]}>Xóa món</Text>
                </TouchableOpacity>
              )}
              
              {permissions.canEdit && (
                <TouchableOpacity 
                  style={styles.updateButton}
                  onPress={handleUpdateProduct}
                >
                  <Text style={styles.buttonText}>Cập nhật</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowProductDetails(false)}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal Thêm sản phẩm */}
      <Modal
        visible={showAddProduct}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddProduct(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm món</Text>
            
            <View style={styles.imagePickerContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={{color: '#666', marginTop: 8}}>Chọn ảnh</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên món *</Text>
              <TextInput
                style={styles.input}
                value={formData.tensp}
                onChangeText={(value) => handleInputChange('tensp', value)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Loại *</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'DoUong')}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'DoUong' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Đồ uống</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'DoAn')}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'DoAn' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Đồ ăn</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleInputChange('loaisp', 'Khac')}
                >
                  <View style={[
                    styles.radio,
                    formData.loaisp === 'Khac' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioLabel}>Khác</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Giá *</Text>
              <TextInput
                style={styles.input}
                value={formData.giasp}
                onChangeText={(value) => handleInputChange('giasp', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.updateButton, {flex: 1}]}
                onPress={handleSaveProduct}
              >
                <Text style={styles.buttonText}>Tạo món</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAddProduct(false)}
            >
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffb6b9',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchButton: {
    padding: 5,
  },
  searchSection: {
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  predictiveResultsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  predictiveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  predictiveItemText: {
    fontSize: 16,
    color: '#333',
  },
  predictiveItemType: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  categoryContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  activeCategory: {
    backgroundColor: '#ff4757',
  },
  categoryText: {
    color: '#333',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productCount: {
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  productList: {
    padding: 10,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    borderRadius: 10,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f5f5f0',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ff4757',
    paddingVertical: 10,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ff4757',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    alignSelf: 'center',
  },
  backToHomeButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  backToHomeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  radioSelected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 6,
    borderColor: '#ff4757',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
});