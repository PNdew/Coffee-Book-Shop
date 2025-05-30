import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Link, useRouter } from 'expo-router';
import { voucherService } from '@/services/voucherapi';
import ToastMessage from '@/components/ToastMessage';
import { Platform } from 'react-native';
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

export default function ThemVoucherScreen() {
  const [tenVoucher, setTenVoucher] = useState('');
  const [loaiSP, setLoaiSP] = useState<LoaiSanPham>(LOAI_SAN_PHAM.TAT_CA);
  const [giamGia, setGiamGia] = useState('');
  const [ngayBatDau, setNgayBatDau] = useState('');
  const [ngayKetThuc, setNgayKetThuc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [toast, setToast] = useState<{ 
    visible: boolean, 
    message: string, 
    type: 'info' | 'error' | 'success' 
  }>({ visible: false, message: '', type: 'info' });
  const router = useRouter();

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Invalid date:', date);
      return '';
    }
  };

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

  const handleAddVoucher = async () => {
    // Validation
    if (!tenVoucher.trim() || !giamGia.trim() || !ngayBatDau.trim() || !ngayKetThuc.trim()) {
      showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Đảm bảo chỉ gửi định dạng YYYY-MM-DD mà không có phần thời gian
      const startDate = ngayBatDau.split('T')[0];
      const endDate = ngayKetThuc.split('T')[0];
      
      await voucherService.addVoucher({
        tenvoucher: tenVoucher,
        loaisp: loaiSP,
        giamgia: Number(giamGia),
        thoigianbatdauvoucher: startDate,
        thoigianketthucvoucher: endDate
      });
      
      showMessage('Thêm voucher thành công!', 'success');
      
      // Clear fields
      setTenVoucher('');
      setGiamGia('');
      setNgayBatDau('');
      setNgayKetThuc('');
      
      // Navigate back to list with refresh parameter
      setTimeout(() => {
        router.push({
          pathname: './VoucherScreen',
          params: { refresh: new Date().getTime() }
        });
      }, 1500);
    } catch (error: any) {
      // Handle backend error response
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Không thể thêm voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderDateInput = (
    value: string,
    onChange: (event: any, date?: Date) => void,
    placeholder: string,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void,
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
      <>
        <TouchableOpacity
          style={styles.dateInputContainer}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.dateText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
          <FontAwesome name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (event.type !== 'dismissed' && selectedDate) {
                onChange(event, selectedDate);
              }
            }}
            minimumDate={minDate ? new Date(minDate) : undefined}
          />
        )}
      </>
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
            <Text style={styles.title}>Thêm voucher mới</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <FontAwesome name="refresh" size={20} color="#ccc" />
        </View>
      </View>

      <View style={styles.formContainer}>
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
            (event: any, selectedDate?: Date) => {
              if (Platform.OS === 'web') {
                setNgayBatDau(event.target.value);
              } else {
                if (selectedDate) {
                  setNgayBatDau(formatDate(selectedDate));
                }
              }
            },
            'Chọn ngày bắt đầu',
            showStartDatePicker,
            setShowStartDatePicker,
            formatDate(new Date())
          )}
          <Text style={styles.helperText}>
            Voucher sẽ bắt đầu có hiệu lực từ ngày này
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Ngày kết thúc *</Text>
          {renderDateInput(
            ngayKetThuc,
            (event: any, selectedDate?: Date) => {
              if (Platform.OS === 'web') {
                setNgayKetThuc(event.target.value);
              } else {
                if (selectedDate) {
                  setNgayKetThuc(formatDate(selectedDate));
                }
              }
            },
            'Chọn ngày kết thúc',
            showEndDatePicker,
            setShowEndDatePicker,
            ngayBatDau || formatDate(new Date())
          )}
          <Text style={styles.helperText}>
            Voucher sẽ hết hiệu lực sau ngày này
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.addButton, loading && styles.disabledButton]} 
        onPress={handleAddVoucher}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Thêm voucher</Text>
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
    marginTop: 20,
    backgroundColor: 'none',
  },
  formSection: {
    backgroundColor: 'none',
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
  placeholderText: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
