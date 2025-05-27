import { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { bookService, theLoaiService } from '@/services/bookapi';
import { TheLoai } from "@/types";
import MultiSelect from '@/components/MultiSelect';

export default function ThemSachScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingTheLoai, setLoadingTheLoai] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // State cho các trường dữ liệu
  const [tenSach, setTenSach] = useState('');
  const [tacGia, setTacGia] = useState('');
  const [selectedTheLoaiIds, setSelectedTheLoaiIds] = useState<number[]>([]);
  const [soLuong, setSoLuong] = useState('');
  const [trangThai, setTrangThai] = useState('Còn');
  const [danhSachTheLoai, setDanhSachTheLoai] = useState<TheLoai[]>([]);

  // Lấy danh sách thể loại khi component được mount
  useEffect(() => {
    fetchTheLoai();
  }, []);

  const fetchTheLoai = async () => {
    try {
      setLoadingTheLoai(true);
      const data = await theLoaiService.getAllTheLoai();
      setDanhSachTheLoai(data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách thể loại:', err);
    } finally {
      setLoadingTheLoai(false);
    }
  };

  // Kiểm tra form trước khi gửi
  const validateForm = () => {
    if (!tenSach.trim()) return 'Tên sách không được để trống';
    if (!tacGia.trim()) return 'Tác giả không được để trống';
    //if (!theLoai.trim()) return 'Thể loại không được để trống';
    if (!soLuong.trim() || isNaN(Number(soLuong))) return 'Số lượng phải là số';
    //if (!maSach.trim()) return 'Mã sách không được để trống';
    return null;
  };

  // Xử lý sự kiện thêm sách
  const handleAddBook = async () => {
    // Kiểm tra dữ liệu
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookData = {
        ten_sach: tenSach,
        tac_gia: tacGia,
        so_luong_sach: Number(soLuong),
        trang_thai: trangThai,
        the_loai_ids: selectedTheLoaiIds
      };

      await bookService.addBook(bookData);
      setSuccess(true);
      
      // Điều hướng về trang danh sách sau khi thêm thành công
      setTimeout(() => {
        router.push({
          pathname: '../sach',
          params: { refresh: Date.now().toString() }
        });
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi thêm sách:', err);
      setError(`Không thể thêm sách: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi danh sách thể loại sang định dạng cho MultiSelect
  const theLoaiItems = danhSachTheLoai.map(item => ({
    id: item.id,
    label: item.ten_the_loai
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="../sach" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Thêm sách mới</Text>
          </View>
        </View>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>Thêm sách thành công!</Text>
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
          {loadingTheLoai ? (
            <View>
              <Text style={styles.label}>Thể loại *</Text>
              <View style={[styles.input, styles.loadingContainer]}>
                <ActivityIndicator size="small" color="#E4434A" />
                <Text style={styles.loadingText}>Đang tải thể loại...</Text>
              </View>
            </View>
          ) : (
            <MultiSelect
              label="Thể loại"
              items={theLoaiItems}
              selectedIds={selectedTheLoaiIds}
              onSelectedItemsChange={setSelectedTheLoaiIds}
              placeholder="Chọn thể loại sách"
              required={true}
            />
          )}
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

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleAddBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Thêm sách</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#E4434A',
    borderColor: '#E4434A',
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#E4434A',
    borderRadius: 5,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FFD0D0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#D63031',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  }
});
