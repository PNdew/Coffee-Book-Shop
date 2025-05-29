import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, TextInput, Modal, Pressable, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SanphamAPI } from '@/types';
import { productService } from '@/services/productapi';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';
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
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'info' | 'error' | 'success';
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check user permissions when component mounts
    checkUserPermissions();

    // Load products
    loadProducts();

    // Add image picker permission request
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh để chọn ảnh sản phẩm.');
        }
      }
    })();
  }, [refresh]);

  const showMessage = (message: string, type: 'info' | 'error' | 'success') => {
    if (Platform.OS === 'web') {
      setToast({
        visible: true,
        message,
        type
      });
    } else {
      Alert.alert(
        type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo',
        message,
        [{ text: 'OK' }]
      );
    }
  };

  const checkUserPermissions = async () => {
    try {
      const user = await getUserFromToken();
      if (!user) {
        setPermissions({
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false
        });
        return;
      }

      const canView = await checkPermissionAPI(user.ChucVuNV, 'menu.view');
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể kiểm tra quyền truy cập';
      showMessage(errorMessage, 'error');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      if (!data || data.length === 0) {
        setError('Không có sản phẩm nào');
        return;
      }
      setProducts(data);
      filterProducts(data, activeCategory, searchQuery);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải danh sách sản phẩm';
      setError(errorMessage);
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (products: SanphamAPI[], category: string, query: string = '') => {
    let filtered = products;

    if (category !== 'all') {
      filtered = filtered.filter(item =>
        item.loaisp?.toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim()) {
      filtered = filtered.filter(item =>
        item.tensp.toLowerCase().includes(query.toLowerCase())
      );
    }

    filtered = [...filtered].sort((a, b) =>
      a.tensp.localeCompare(b.tensp, 'vi-VN')
    );

    setFilteredProducts(filtered);
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    filterProducts(products, category, searchQuery);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterProducts(products, activeCategory, text);
  };

  const getDisplayProductType = (loaisp: string): string => {
    if (loaisp === 'DoUong' || loaisp?.toLowerCase() === 'douong') return 'Đồ uống';
    if (loaisp === 'DoAn' || loaisp?.toLowerCase() === 'doan') return 'Đồ ăn';
    if (loaisp === 'Khac' || loaisp?.toLowerCase() === 'khac') return 'Khác';
    return loaisp;
  };

  const handleViewProductDetails = (product: SanphamAPI) => {
    setSelectedProduct(product);
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

  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
              Alert.alert('Lỗi', 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.');
              return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
              setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh để chọn ảnh sản phẩm.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled) {
          setSelectedImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (!permissions.canAdd) {
        showMessage('Bạn không có quyền thêm sản phẩm mới.', 'error');
        return;
      }

      if (!formData.tensp.trim()) {
        showMessage('Vui lòng nhập tên sản phẩm', 'error');
        return;
      }

      if (!formData.giasp.trim() || isNaN(parseFloat(formData.giasp))) {
        showMessage('Vui lòng nhập giá sản phẩm hợp lệ', 'error');
        return;
      }

      const productExists = products.some(
        product => product.tensp.toLowerCase() === formData.tensp.toLowerCase()
      );

      if (productExists) {
        showMessage('Sản phẩm với tên này đã tồn tại. Vui lòng chọn tên khác.', 'error');
        return;
      }

      const user = await getUserFromToken();
      if (!user) {
        showMessage('Vui lòng đăng nhập lại để thực hiện chức năng này.', 'error');
        return;
      }

      const productData = {
        tensp: formData.tensp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0,
        loaisp: formData.loaisp,
        image: selectedImage
      };

      await productService.createProduct(productData);
      loadProducts();
      setShowAddProduct(false);
      setSelectedImage(null);
      showMessage('Đã thêm sản phẩm mới thành công', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Không thể thêm voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      if (!permissions.canEdit) {
        showMessage('Bạn không có quyền chỉnh sửa sản phẩm.', 'error');
        return;
      }

      const productData = {
        idsanpham: selectedProduct.idsanpham,
        tensp: formData.tensp,
        loaisp: formData.loaisp,
        giasp: parseFloat(formData.giasp),
        trangthaisp: formData.trangthai === 'Còn' ? 1 : 0,
        image: selectedImage
      };

      await productService.updateProduct(selectedProduct.idsanpham.toString(), productData);
      loadProducts();
      setShowProductDetails(false);
      setSelectedImage(null);
      showMessage('Cập nhật sản phẩm thành công', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Không thể thêm voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductId || !permissions.canDelete) return;

    try {
      await productService.deleteProduct(selectedProductId.toString());
      await loadProducts();
      setShowDeleteDialog(false);
      setSelectedProductId(null);
      showMessage('Đã xóa sản phẩm thành công', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
      showMessage(errorMessage, 'error');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleLongPress = (id: number) => {
    if (permissions.canDelete) {
      setSelectedProductId(id);
      setShowDeleteDialog(true);
    }
  };

  const ListFooterComponent = () => (
    <View style={{ height: 70, backgroundColor: 'transparent' }} />
  );

  // Update the image display in product list
  const renderProductImage = (item: SanphamAPI) => {
    if (item.hinhanh) {
      return (
        <Image
          source={{ uri: item.hinhanh }}
          style={styles.productImage}
          defaultSource={require('@/assets/images/default-coffee.png')}
        />
      );
    }
    return (
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={40} color="#ccc" />
      </View>
    );
  };

  // Update the image picker container in modals
  const renderImagePicker = (isEdit: boolean = false) => (
    <TouchableOpacity 
      style={styles.imagePickerContainer}
      onPress={pickImage}
    >
      {selectedImage ? (
        <Image
          source={{ uri: selectedImage }}
          style={styles.previewImage}
        />
      ) : isEdit && selectedProduct?.hinhanh ? (
        <Image
          source={{ uri: selectedProduct.hinhanh }}
          style={styles.previewImage}
        />
      ) : (
        <>
          <Ionicons name="image-outline" size={50} color="#ccc" />
          <Text style={{ color: '#666', marginTop: 8 }}>Chọn ảnh</Text>
        </>
      )}
    </TouchableOpacity>
  );

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
                  {renderProductImage(item)}
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

        {permissions.canAdd && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>Thêm món</Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={showProductDetails}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProductDetails(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông tin món</Text>
              {renderImagePicker(true)}
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

        <Modal
          visible={showAddProduct}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddProduct(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thêm món</Text>
              {renderImagePicker()}
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
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
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
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
});