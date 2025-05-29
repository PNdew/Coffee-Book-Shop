import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, TextInput, Modal, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SanphamAPI } from '@/types';
import { productService } from '@/services/productapi';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertDialog from '@/components/AlertDialog';

export default function MenuScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [products, setProducts] = useState<SanphamAPI[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SanphamAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<SanphamAPI | null>(null);
  const [showProductDetails, setShowProductDetails] = useState<boolean>(false);
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);

  // Form data
  const [formData, setFormData] = useState({
    tensp: '',
    loaisp: 'DoUong',
    giasp: '',
    trangthai: 'Còn'
  });

  // Permission states
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  // Categories
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'douong', name: 'Đồ uống' },
    { id: 'doan', name: 'Đồ ăn' },
  ];

  useEffect(() => {
    // Check user permissions when component mounts
    checkUserPermissions();

    // Load products
    loadProducts();
  }, [refresh]);

  const checkUserPermissions = async () => {
    try {
      // Get user info from token
      const user = await getUserFromToken();

      if (!user) {
        // No token or invalid token
        setPermissions({
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false
        });
        return;
      }

      // Check menu view permission
      const canView = await checkPermissionAPI(user.ChucVuNV, 'menu.view');

      // Check add/edit/delete permissions if can view
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
      console.error('Error checking permissions:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();

      if (!data || data.length === 0) {
        setError('No products available');
        return;
      }

      setProducts(data);
      filterProducts(data, activeCategory, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category and search query
  // Filter products by category and search query
  const filterProducts = (products: SanphamAPI[], category: string, query: string = '') => {
    let filtered = products;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(item =>
        item.loaisp?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(item =>
        item.tensp.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Sort products alphabetically by name (A-Z)
    filtered = [...filtered].sort((a, b) =>
      a.tensp.localeCompare(b.tensp, 'vi-VN')
    );

    setFilteredProducts(filtered);
  };

  // Handle category selection
  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    filterProducts(products, category, searchQuery);
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterProducts(products, activeCategory, text);
  };

  // Display product type name based on code
  const getDisplayProductType = (loaisp: string): string => {
    if (loaisp === 'DoUong' || loaisp?.toLowerCase() === 'douong') return 'Đồ uống';
    if (loaisp === 'DoAn' || loaisp?.toLowerCase() === 'doan') return 'Đồ ăn';
    if (loaisp === 'Khac' || loaisp?.toLowerCase() === 'khac') return 'Khác';
    return loaisp;
  };

  // Handle viewing product details
  const handleViewProductDetails = (product: SanphamAPI) => {
    setSelectedProduct(product);

    // Map product type from old to new
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

  // Handle adding new product
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

  // Handle saving new product
  const handleSaveProduct = async () => {
    try {
      // Check if user has permission to add products
      if (!permissions.canAdd) {
        console.log('Không có quyền thêm sản phẩm mới');
        Alert.alert('Thông báo', 'Bạn không có quyền thêm sản phẩm mới.');
        return;
      }

      // Validate form data
      if (!formData.tensp.trim()) {
        console.log('Vui lòng nhập tên sản phẩm');
        Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm');
        return;
      }

      if (!formData.giasp.trim() || isNaN(parseFloat(formData.giasp))) {
        console.log('Vui lòng nhập giá sản phẩm hợp lệ');
        Alert.alert('Thông báo', 'Vui lòng nhập giá sản phẩm hợp lệ');
        return;
      }

      // Check if product with same name already exists
      const productExists = products.some(
        product => product.tensp.toLowerCase() === formData.tensp.toLowerCase()
      );

      if (productExists) {
        console.log('Sản phẩm với tên này đã tồn tại. Vui lòng chọn tên khác.');
        Alert.alert(
          'Thông báo',
          'Sản phẩm với tên này đã tồn tại. Vui lòng chọn tên khác.'
        );
        return;
      }

      const user = await getUserFromToken();
      if (!user) {
        console.log('Lỗi xác thực');
        Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại để thực hiện chức năng này.');
        return;
      }

      const productData = {
        tensp: formData.tensp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0,
        loaisp: formData.loaisp
      };

      await productService.createProduct(productData);

      // Update product list
      loadProducts();
      setShowAddProduct(false);
      Alert.alert('Thành công', 'Đã thêm sản phẩm mới thành công');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Handle updating product
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      // Check if user has permission to edit products
      if (!permissions.canEdit) {
        Alert.alert('Permission Denied', 'You do not have permission to edit products.');
        return;
      }

      const productData = {
        idsanpham: selectedProduct.idsanpham,
        tensp: formData.tensp,
        loaisp: formData.loaisp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0
      };

      await productService.updateProduct(selectedProduct.idsanpham.toString(), productData);

      // Update product list
      loadProducts();
      setShowProductDetails(false);
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Could not update product. Please try again later.');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedProductId || !permissions.canDelete) return;

    try {
      await productService.deleteProduct(selectedProductId.toString());

      // Reload products from server instead of just filtering the state
      await loadProducts();

      setShowDeleteDialog(false);
      setSelectedProductId(null);
      Alert.alert('Thành công', 'Đã xóa sản phẩm thành công');
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Form input handling
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle long press on product item
  const handleLongPress = (id: number) => {
    if (permissions.canDelete) {
      setSelectedProductId(id);
      setShowDeleteDialog(true);
    }
  };

  // Component for list footer spacing
  const ListFooterComponent = () => (
    <View style={{ height: 70, backgroundColor: 'transparent' }} />
  );

  // If user doesn't have view permission, show error
  if (!permissions.canView && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Link href="./HomeScreen" asChild>
            <Pressable style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="black" />
            </Pressable>
          </Link>
          <View style={styles.titleWrapper}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Danh sách món</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconContainer} onPress={loadProducts}>
            <FontAwesome name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên món"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
        </View>

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E4434A" />
            <Text style={styles.loadingText}>Đang tải danh sách sản phẩm...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.idsanpham.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => (permissions.canEdit || permissions.canDelete) ? handleViewProductDetails(item) : null}
                  onLongPress={() => permissions.canDelete && handleLongPress(item.idsanpham)}
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
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                  </Text>
                </View>
              }
              ListFooterComponent={ListFooterComponent}
            />
          </ScrollView>
        )}

        {/* Add Product Button */}
        {permissions.canAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>Thêm món</Text>
          </TouchableOpacity>
        )}

        {/* Product Details Modal */}
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
                <Text style={{ color: '#666', marginTop: 8 }}>Chọn ảnh</Text>
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
                <Text style={styles.label}>Trạng thái</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('trangthai', 'Còn')}
                    disabled={!permissions.canEdit}
                  >
                    <View style={[
                      styles.radio,
                      formData.trangthai === 'Còn' && styles.radioSelected
                    ]} />
                    <Text style={styles.radioLabel}>Còn hàng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('trangthai', 'Hết')}
                    disabled={!permissions.canEdit}
                  >
                    <View style={[
                      styles.radio,
                      formData.trangthai === 'Hết' && styles.radioSelected
                    ]} />
                    <Text style={styles.radioLabel}>Hết hàng</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                {permissions.canDelete && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      setSelectedProductId(selectedProduct?.idsanpham || null);
                      setShowDeleteDialog(true);
                      setShowProductDetails(false);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Xóa món</Text>
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

        {/* Add Product Modal */}
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
                <Text style={{ color: '#666', marginTop: 8 }}>Chọn ảnh</Text>
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>Trạng thái</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('trangthai', 'Còn')}
                  >
                    <View style={[
                      styles.radio,
                      formData.trangthai === 'Còn' && styles.radioSelected
                    ]} />
                    <Text style={styles.radioLabel}>Còn hàng</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('trangthai', 'Hết')}
                  >
                    <View style={[
                      styles.radio,
                      formData.trangthai === 'Hết' && styles.radioSelected
                    ]} />
                    <Text style={styles.radioLabel}>Hết hàng</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.updateButton, { flex: 1 }]}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          visible={showDeleteDialog}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa sản phẩm này?"
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3E7',
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: "none",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "none",
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
    marginBottom: 10,
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
  categoryContainer: {
    marginVertical: 10,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    backgroundColor: '#E4434A',
  },
  categoryText: {
    color: '#333',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
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
    color: '#E4434A',
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
    borderColor: '#E4434A',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#E4434A',
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
    backgroundColor: '#E4434A',
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
    borderColor: '#E4434A',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: '#007bff',
    marginLeft: 4,
    fontSize: 12,
  },
  deleteButtonText: {
    color: '#dc3545',
    marginLeft: 4,
    fontSize: 12,
  },
});