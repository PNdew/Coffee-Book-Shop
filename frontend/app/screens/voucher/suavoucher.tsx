import { useState, useEffect } from 'react';
import { Text, View } from '@/components/Themed';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Pressable, Platform, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { voucherService } from '@/services/voucherapi';
import AlertDialog from '@/components/AlertDialog';
import { Voucher } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';

// Định nghĩa các loại sản phẩm
const LOAI_SAN_PHAM = {
  TAT_CA: 'TatCa',
  DO_UONG: 'ThucUong',
  DO_AN: 'DoAn',
  KHAC: 'Khac'
} as const;

type LoaiSanPham = typeof LOAI_SAN_PHAM[keyof typeof LOAI_SAN_PHAM];

// Map hiển thị text cho từng loại
const LOAI_SAN_PHAM_TEXT = {
  [LOAI_SAN_PHAM.TAT_CA]: 'Tất cả',
  [LOAI_SAN_PHAM.DO_UONG]: 'Đồ uống',
  [LOAI_SAN_PHAM.DO_AN]: 'Đồ ăn',
  [LOAI_SAN_PHAM.KHAC]: 'Khác'
} as const;

export default function SuaVoucherScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const voucherId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State cho các trường dữ liệu
  const [tenVoucher, setTenVoucher] = useState('');
  const [loaiSP, setLoaiSP] = useState<LoaiSanPham>(LOAI_SAN_PHAM.TAT_CA);
  const [giamGia, setGiamGia] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Parse date from YYYY-MM-DD
  const parseDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    if (ngayBatDau) {
      setStartDate(parseDate(ngayBatDau));
    }
    if (ngayKetThuc) {
      setEndDate(parseDate(ngayKetThuc));
    }
  }, [ngayBatDau, ngayKetThuc]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'web') {
      const newDate = event.target.value;
      setNgayBatDau(newDate);
      setStartDate(parseDate(newDate));
    } else {
      setShowStartDatePicker(false);
      if (selectedDate) {
        setStartDate(selectedDate);
        setNgayBatDau(formatDate(selectedDate));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'web') {
      const newDate = event.target.value;
      setNgayKetThuc(newDate);
      setEndDate(parseDate(newDate));
    } else {
      setShowEndDatePicker(false);
      if (selectedDate) {
        setEndDate(selectedDate);
        setNgayKetThuc(formatDate(selectedDate));
      }
    }
  };

  // Lấy thông tin voucher khi component được mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchVoucherDetails();
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại!');
      }
    };
    
    loadData();
  }, [voucherId]);

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const voucherData = await voucherService.getVoucher(voucherId);
      
      console.log('Dữ liệu voucher:', voucherData);
      
      // Cập nhật state từ dữ liệu lấy được
      setTenVoucher(voucherData.tenvoucher || '');
      setLoaiSP(voucherData.loaisp || LOAI_SAN_PHAM.TAT_CA);
      setGiamGia(voucherData.giamgia ? voucherData.giamgia.toString() : '0');
      setNgayBatDau(voucherData.thoigianbatdauvoucher || '');
      setNgayKetThuc(voucherData.thoigianketthucvoucher || '');
      
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin voucher:', err);
      setError('Không thể tải thông tin voucher. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra form trước khi gửi
  const validateForm = () => {
    if (!tenVoucher.trim()) return 'Tên voucher không được để trống';
    if (!loaiSP.trim()) return 'Loại sản phẩm không được để trống';
    if (!giamGia.trim() || isNaN(Number(giamGia))) return 'Giảm giá phải là số';
    if (!ngayBatDau.trim()) return 'Ngày bắt đầu không được để trống';
    if (!ngayKetThuc.trim()) return 'Ngày kết thúc không được để trống';
    return null;
  };

  const showMessage = (message: string, type: 'info' | 'error' | 'success') => {
    if (Platform.OS === 'web') {
      setError(type === 'error' ? message : null);
      setSuccess(type === 'success');
    } else {
      Alert.alert(
        type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo',
        message,
        [{ text: 'OK' }]
      );
    }
  };

  // Xử lý sự kiện cập nhật voucher
  const handleUpdateVoucher = async () => {
    // Kiểm tra dữ liệu
    const validationError = validateForm();
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Đảm bảo định dạng ngày tháng đúng YYYY-MM-DD không có phần thời gian
      const startDate = ngayBatDau.split('T')[0];
      const endDate = ngayKetThuc.split('T')[0];

      const voucherData = {
        tenvoucher: tenVoucher,
        loaisp: loaiSP,
        giamgia: Number(giamGia),
        thoigianbatdauvoucher: startDate,
        thoigianketthucvoucher: endDate
      };

      await voucherService.updateVoucher(voucherId, voucherData);
      showMessage('Cập nhật voucher thành công!', 'success');
      
      // Điều hướng về trang danh sách sau 1.5 giây
      setTimeout(() => {
        router.push({
          pathname: './VoucherScreen',
          params: { refresh: Date.now().toString() }
        });
      }, 1500);
    } catch (error: any) {
      // Handle backend error response
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể cập nhật voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Xử lý sự kiện xóa voucher
  const handleDeleteVoucher = async () => {
    try {
      await voucherService.deleteVoucher(voucherId);
      showMessage('Xóa voucher thành công!', 'success');
      
      // Điều hướng về trang danh sách sau khi xóa
      router.push({
        pathname: './VoucherScreen',
        params: { refresh: Date.now().toString() }
      });
    } catch (error: any) {
      // Handle backend error response
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể xóa voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
      setShowDeleteDialog(false);
    }
  };

  const renderDateInput = (
    value: string,
    onChange: (event: any, date?: Date) => void,
    placeholder: string,
    minDate?: string
  ) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.dateInputContainer}>
          <input
            type="date"
            value={value}
            onChange={onChange}
            min={minDate}
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: '#333',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.dateInputContainer}
        onPress={() => onChange({}, new Date())}
      >
        <Text style={styles.dateText}>
          {value || placeholder}
        </Text>
        <FontAwesome name="calendar" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="./VoucherScreen" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sửa thông tin voucher</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={fetchVoucherDetails}>
          <FontAwesome name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4434A" />
          <Text style={styles.loadingText}>Đang tải thông tin voucher...</Text>
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
            <Text style={styles.label}>Tên voucher *</Text>
            <TextInput
              style={styles.input}
              value={tenVoucher}
              onChangeText={setTenVoucher}
              placeholder="Nhập tên voucher"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Loại sản phẩm *</Text>
            <View style={styles.radioGroup}>
              {Object.entries(LOAI_SAN_PHAM).map(([key, value]) => (
                <TouchableOpacity
                  key={value}
                  style={styles.radioOption}
                  onPress={() => setLoaiSP(value as LoaiSanPham)}
                >
                  <View style={styles.radioButton}>
                    {loaiSP === value && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>{LOAI_SAN_PHAM_TEXT[value]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Giảm giá (%) *</Text>
            <TextInput
              style={styles.input}
              value={giamGia}
              onChangeText={setGiamGia}
              placeholder="Nhập phần trăm giảm giá"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Ngày bắt đầu *</Text>
            {renderDateInput(
              ngayBatDau,
              handleStartDateChange,
              'Chọn ngày bắt đầu',
              formatDate(new Date())
            )}
            {Platform.OS !== 'web' && showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
            <Text style={styles.helperText}>
              Voucher sẽ bắt đầu có hiệu lực từ ngày này
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Ngày kết thúc *</Text>
            {renderDateInput(
              ngayKetThuc,
              handleEndDateChange,
              'Chọn ngày kết thúc',
              ngayBatDau || formatDate(new Date())
            )}
            {Platform.OS !== 'web' && showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={startDate}
              />
            )}
            <Text style={styles.helperText}>
              Voucher sẽ hết hiệu lực sau ngày này
            </Text>
          </View>
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
            onPress={handleUpdateVoucher}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <AlertDialog
        visible={showDeleteDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa voucher này?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteVoucher}
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
    flex: 1,
  },
  formSection: {
    backgroundColor: "none",
    marginBottom: 15,
  },
  label: {
    color: '#000',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#F3F3E7',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  updateButton: {
    flex: 3,
    backgroundColor: '#E4434A',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#707070',
    borderRadius: 5,
    marginRight: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
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
  radioGroup: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E4434A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E4434A',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  dateInputContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  calendarIcon: {
    marginLeft: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});