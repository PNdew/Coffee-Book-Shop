import { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { bookService } from '@/services/bookapi';
import AlertDialog from '@/components/AlertDialog';

export default function SuaSachScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bookId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State cho các trường dữ liệu
  const [tenSach, setTenSach] = useState('');
  const [tacGia, setTacGia] = useState('');
  const [theLoai, setTheLoai] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [trangThai, setTrangThai] = useState('Còn');

  // Lấy thông tin sách khi component được mount
  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await bookService.getBook(bookId);
      
      console.log('Dữ liệu sách:', bookData);
      
      // Cập nhật state từ dữ liệu lấy được, kiểm tra undefined
      setTenSach(bookData.ten_sach || '');
      setTacGia(bookData.tac_gia || '');
      setTheLoai(bookData.the_loai || '');
      setSoLuong(bookData.so_luong_sach ? bookData.so_luong_sach.toString() : '0');
      setTrangThai(bookData.trang_thai || 'Còn');
      
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin sách:', err);
      setError('Không thể tải thông tin sách. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra form trước khi gửi
  const validateForm = () => {
    if (!tenSach.trim()) return 'Tên sách không được để trống';
    if (!tacGia.trim()) return 'Tác giả không được để trống';
    //if (!theLoai.trim()) return 'Thể loại không được để trống';
    if (!soLuong.trim() || isNaN(Number(soLuong))) return 'Số lượng phải là số';
    return null;
  };

  // Xử lý sự kiện cập nhật sách
  const handleUpdateBook = async () => {
    // Kiểm tra dữ liệu
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const bookData = {
        ten_sach: tenSach,
        tac_gia: tacGia,
        the_loai: theLoai,
        so_luong_sach: Number(soLuong),
        trang_thai: trangThai
      };

      await bookService.updateBook(bookId, bookData);
      setSuccess(true);
      
      // Điều hướng về trang danh sách sau 1.5 giây
      setTimeout(() => {
        router.push({
          pathname: './BookScreen',
          params: { refresh: Date.now().toString() }
        });
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi cập nhật sách:', err);
      setError('Không thể cập nhật sách. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  // Xử lý sự kiện xóa sách
  const handleDeleteBook = async () => {
    try {
      await bookService.deleteBook(bookId);
      
      // Điều hướng về trang danh sách sau khi xóa
      router.push({
        pathname: './BookScreen',
        params: { refresh: Date.now().toString() }
      });
    } catch (err) {
      console.error('Lỗi khi xóa sách:', err);
      setError('Không thể xóa sách. Vui lòng thử lại!');
      setShowDeleteDialog(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="./BookScreen" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sửa thông tin sách</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={fetchBookDetails}>
          <FontAwesome name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4434A" />
          <Text style={styles.loadingText}>Đang tải thông tin sách...</Text>
        </View>
      ) : (
        <ScrollView style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Cập nhật thành công!</Text>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.label}>Tên sách *</Text>
            <TextInput
              style={styles.input}
              value={tenSach}
              onChangeText={setTenSach}
              placeholder="Nhập tên sách"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Tác giả *</Text>
            <TextInput
              style={styles.input}
              value={tacGia}
              onChangeText={setTacGia}
              placeholder="Nhập tên tác giả"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Thể loại *</Text>
            <TextInput
              style={styles.input}
              value={theLoai}
              onChangeText={setTheLoai}
              placeholder="Nhập thể loại sách"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Số lượng *</Text>
            <TextInput
              style={styles.input}
              value={soLuong}
              onChangeText={setSoLuong}
              placeholder="Nhập số lượng"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setTrangThai('Còn')}
              >
                <View style={[
                  styles.radioButton, 
                  trangThai === 'Còn' && styles.radioSelected
                ]}>
                  {trangThai === 'Còn' && (
                    <FontAwesome name="circle" size={10} color="white" />
                  )}
                </View>
                <Text style={styles.radioLabel}>Còn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setTrangThai('Hết')}
              >
                <View style={[
                  styles.radioButton, 
                  trangThai === 'Hết' && styles.radioSelected
                ]}>
                  {trangThai === 'Hết' && (
                    <FontAwesome name="circle" size={10} color="white" />
                  )}
                </View>
                <Text style={styles.radioLabel}>Hết</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Thêm khoảng trống để tránh nút ở dưới che nội dung */}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {!loading && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setShowDeleteDialog(true)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.updateButton, saving && styles.disabledButton]}
            onPress={handleUpdateBook}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Cập nhật</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <AlertDialog
        visible={showDeleteDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa sách này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteBook}
        onCancel={() => setShowDeleteDialog(false)}
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
  formContainer: {
    flex: 1,
  },
  formSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#777',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#E4434A',
    backgroundColor: '#E4434A',
  },
  radioLabel: {
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  successText: {
    color: '#388e3c',
    textAlign: 'center',
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});