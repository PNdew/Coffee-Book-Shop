import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ingredientService } from '@/services/ingredientapi';
import ToastMessage from '@/components/ToastMessage';
import AlertDialog from '@/components/AlertDialog';
import { Platform } from 'react-native';

export default function EditIngredientScreen() {
  const { id } = useLocalSearchParams();
  const idString = Array.isArray(id) ? id[0] : id || '';
  const [tenNguyenLieu, setTenNguyenLieu] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [giaNhap, setGiaNhap] = useState('');
  const [donVi, setDonVi] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'error' | 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    if (id) {
      fetchIngredient();
    }
  }, [id]);

  const fetchIngredient = async () => {
    try {
      setLoadingInitial(true);
      const ingredient = await ingredientService.getIngredient(idString);
      setTenNguyenLieu(ingredient.ten_nguyen_lieu);
      setSoLuong(ingredient.so_luong);
      setGiaNhap(ingredient.gia_nhap.toString());
      setDonVi(ingredient.don_vi);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Không thể thêm voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleUpdateIngredient = async () => {
    // Validation
    if (!tenNguyenLieu.trim() || !soLuong.trim() || !giaNhap.trim() || !donVi.trim()) {
      showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    try {
      setLoading(true);
      await ingredientService.updateIngredient(idString, {
        ten_nguyen_lieu: tenNguyenLieu,
        so_luong: parseInt(soLuong),
        don_vi: donVi,
        gia_nhap: parseInt(giaNhap)
      });

      showMessage('Cập nhật nguyên liệu thành công!', 'success');

      // Navigate back to list with refresh parameter
      setTimeout(() => {
        router.push({
          pathname: './IngredientScreen',
          params: { refresh: new Date().getTime() }
        });
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể cập nhật nguyên liệu. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIngredient = async () => {
    try {
      setLoading(true);
      await ingredientService.deleteIngredient(idString);

      showMessage('Đã xóa nguyên liệu thành công!', 'success');

      // Navigate back to list with refresh parameter
      setTimeout(() => {
        router.push({
          pathname: './IngredientScreen',
          params: { refresh: new Date().getTime() }
        });
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa nguyên liệu. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E4434A" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="./IngredientScreen" asChild>
          <Pressable style={styles.backButton} onPress={() => router.push('./IngredientScreen')}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nguyên liệu cần sửa đổi</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconContainer}>
          <FontAwesome name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Tên nguyên liệu *</Text>
          <TextInput
            style={styles.input}
            value={tenNguyenLieu}
            onChangeText={setTenNguyenLieu}
            placeholder="Nhập tên nguyên liệu"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Số Lượng *</Text>
          <TextInput
            style={styles.input}
            value={soLuong}
            onChangeText={setSoLuong}
            placeholder="Nhập số lượng"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Giá nhập *</Text>
          <TextInput
            style={styles.input}
            value={giaNhap}
            onChangeText={setGiaNhap}
            placeholder="Nhập giá nhập"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Đơn vị *</Text>
          <TextInput
            style={styles.input}
            value={donVi}
            onChangeText={setDonVi}
            placeholder="Nhập đơn vị"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.deleteButton, loading && styles.disabledButton]}
          onPress={() => setConfirmDialog(true)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Xóa nguyên liệu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.disabledButton]}
          onPress={handleUpdateIngredient}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>
      </View>

      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <AlertDialog
        visible={confirmDialog}
        title="Xác nhận cập nhật"
        message="Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa"
        cancelText="Thoát"
        onConfirm={handleDeleteIngredient}
        onCancel={() => setConfirmDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  formContainer: {
    backgroundColor: "none",
    marginTop: 20,
  },
  formSection: {
    backgroundColor: "none",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  deleteButton: {
    backgroundColor: '#cccccc',
    borderRadius: 5,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: '#E4434A',
    borderRadius: 5,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
