import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { updateStaff, getChucVu, ChucVu } from '@/services/staffapi';
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';
import AlertDialog from '@/components/AlertDialog';

interface UpdateStaffData {
  IDNhanVien: string;
  TenNV: string;
  SDTNV: string;
  EmailNV: string;
  CCCDNV: string;
  ChucVuNV: string;
}

const UpdateStaffScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', isSuccess: false });
  const [permissions, setPermissions] = useState({
    canUpdate: false
  });

  // Form state
  const [formData, setFormData] = useState<UpdateStaffData>({
    IDNhanVien: '',
    TenNV: '',
    SDTNV: '',
    EmailNV: '',
    CCCDNV: '',
    ChucVuNV: '2'
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'info' | 'error' | 'success';
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    checkUserPermissions();
    fetchChucVu();
    if (params.staffData) {
      const staffData = JSON.parse(params.staffData as string);
      setFormData(staffData);
    }
  }, [params.staffData]);

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
          canUpdate: false
        });
        return;
      }

      const canUpdate = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.update');

      setPermissions({
        canUpdate
      });

      if (!canUpdate) {
        showMessage('Bạn không có quyền cập nhật thông tin nhân viên.', 'error');
        router.push('../HomeScreen');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể kiểm tra quyền truy cập';
      showMessage(errorMessage, 'error');
    }
  };

  const fetchChucVu = async () => {
    try {
      const data = await getChucVu();
      setChucVuList(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lấy danh sách chức vụ';
      showMessage(errorMessage, 'error');
    }
  };

  const handleInputChange = (field: keyof UpdateStaffData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertInfo.isSuccess) {
      router.back();
    }
  };

  const handleUpdate = async () => {
    if (!formData.TenNV || !formData.SDTNV || !formData.CCCDNV) {
      showMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    if (formData.EmailNV && !formData.EmailNV.includes('@')) {
      showMessage('Email không hợp lệ', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await updateStaff(formData);
      
      if (response) {
        showMessage('Cập nhật thông tin nhân viên thành công', 'success');
        router.back();
      } else {
        showMessage('Cập nhật thất bại', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.error || error.message || 'Không thể thêm voucher. Vui lòng thử lại!';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.canUpdate && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Bạn không có quyền cập nhật thông tin nhân viên.</Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push('../HomeScreen')}
          >
            <Text style={styles.backToHomeText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật thông tin nhân viên</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            value={formData.TenNV}
            onChangeText={(text) => handleInputChange('TenNV', text)}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            value={formData.SDTNV}
            onChangeText={(text) => handleInputChange('SDTNV', text)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.EmailNV}
            onChangeText={(text) => handleInputChange('EmailNV', text)}
            placeholder="Nhập email (tùy chọn)"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Căn cước công dân *</Text>
          <TextInput
            style={styles.input}
            value={formData.CCCDNV}
            onChangeText={(text) => handleInputChange('CCCDNV', text)}
            placeholder="Nhập số CCCD"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Chức vụ *</Text>
          {chucVuList.map((chucVu) => (
            <TouchableOpacity
              key={chucVu.idchucvu}
              style={styles.radioOption}
              onPress={() => handleInputChange("ChucVuNV", String(chucVu.idchucvu))}
            >
              <View style={[
                styles.radioButton,
                formData.ChucVuNV === String(chucVu.idchucvu) && styles.radioButtonSelected
              ]} />
              <Text style={styles.radioText}>{chucVu.loaichucvu}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, loading && styles.disabledButton]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
          )}
        </TouchableOpacity>
      </View>

      <AlertDialog
        visible={alertVisible}
        title={alertInfo.title}
        message={alertInfo.message}
        confirmText="OK"
        cancelText={alertInfo.isSuccess ? "" : "Hủy"}
        onConfirm={handleCloseAlert}
        onCancel={() => setAlertVisible(false)}
        isSuccess={alertInfo.isSuccess}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#e4434a',
    borderColor: '#e4434a',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#e4434a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: '#E4434A',
    padding: 10,
    borderRadius: 5,
  },
  backToHomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateStaffScreen; 