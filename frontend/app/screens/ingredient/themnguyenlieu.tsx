import { StyleSheet, TextInput, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ingredientService } from '@/services/ingredientapi';
import ToastMessage from '@/components/ToastMessage';

export default function AddIngredientScreen() {
  const [tenNguyenLieu, setTenNguyenLieu] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [giaNhap, setGiaNhap] = useState('');
  const [donVi, setDonVi] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ 
    visible: boolean, 
    message: string, 
    type: 'info' | 'error' | 'success' 
  }>({ visible: false, message: '', type: 'info' });
  const router = useRouter();

  const handleAddIngredient = async () => {
    // Validation
    if (!tenNguyenLieu.trim() || !soLuong.trim() || !giaNhap.trim()) {
      setToast({
        visible: true,
        message: 'Vui lòng điền đầy đủ thông tin!',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await ingredientService.addIngredient({
        ten_nguyen_lieu: tenNguyenLieu,
        so_luong: parseInt(soLuong),
        don_vi: donVi,
        gia_nhap: parseInt(giaNhap),
      });
      
      setToast({
        visible: true,
        message: 'Thêm nguyên liệu thành công!',
        type: 'success'
      });
      
      // Clear fields
      setTenNguyenLieu('');
      setSoLuong('');
      setGiaNhap('');
      
      // Navigate back to list with refresh parameter
      setTimeout(() => {
        router.push({
          pathname: '../IngredientScreen',
          params: { refresh: new Date().getTime() }
        });
      }, 1500);
    } catch (error) {
      setToast({
        visible: true,
        message: 'Không thể thêm nguyên liệu. Vui lòng thử lại!',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="./IngredientScreen" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nguyên liệu cần bổ sung</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <FontAwesome name="refresh" size={20} color="#ccc" />
        </View>
      </View>

  <View style={styles.formContainer}>
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Tên nguyên liệu *</Text>
      <TextInput
        style={styles.input}
        value={tenNguyenLieu}
        onChangeText={setTenNguyenLieu}
        placeholder=""
      />
    </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số Lượng *</Text>
          <TextInput
            style={styles.input}
            value={soLuong}
            onChangeText={setSoLuong}
            placeholder=""
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Đơn vị *</Text>
          <TextInput
            style={styles.input}
            value={donVi}
            onChangeText={setDonVi}
            placeholder=""
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giá nhập *</Text>
          <TextInput
            style={styles.input}
            value={giaNhap}
            onChangeText={setGiaNhap}
            placeholder=""
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.addButton, loading && styles.disabledButton]} 
        onPress={handleAddIngredient}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Thêm nguyên liệu</Text>
        )}
      </TouchableOpacity>

      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
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
    marginBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
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
    marginTop: 20,
  },
  inputGroup: {
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
  disabledButton: {
    opacity: 0.7,
  },
});
