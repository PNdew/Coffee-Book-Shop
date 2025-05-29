import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { registerStaff, getChucVu, RegisterStaffData, ChucVu } from '@/services/staffapi';
import AlertDialog from '@/components/AlertDialog'; // Giả sử đường dẫn tới AlertDialog
import { getUserFromToken } from '@/services/authapi';
import { checkPermissionAPI } from '@/services/checkpermissionapi';

const RegisterStaffScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', isSuccess: false });
  const [permissions, setPermissions] = useState({
    canCreate: false
  });

  // Form state
  const [formData, setFormData] = useState<RegisterStaffData>({
    TenNV: "",
    SDTNV: "",
    EmailNV: "",
    CCCDNV: "",
    ChucVuNV: "2", // Mặc định là nhân viên (2)
    MatKhau: ""
  });

  useEffect(() => {
    checkUserPermissions();
    fetchChucVu();
  }, []);

  const checkUserPermissions = async () => {
    try {
      // Get user info from token
      const user = await getUserFromToken();

      if (!user) {
        // No token or invalid token
        setPermissions({
          canCreate: false
        });
        return;
      }

      // Check staff create permission
      const canCreate = await checkPermissionAPI(user.ChucVuNV, 'nhanvien.create');

      setPermissions({
        canCreate
      });

      // If user doesn't have create permission, redirect to home
      if (!canCreate) {
        Alert.alert(
          "Thông báo",
          "Bạn không có quyền tạo nhân viên mới.",
          [
            { 
              text: "Đã hiểu",
              onPress: () => router.push('../HomeScreen')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const fetchChucVu = async () => {
    try {
      const data = await getChucVu();
      setChucVuList(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chức vụ:', error);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field: keyof RegisterStaffData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Đóng thông báo
  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertInfo.isSuccess) {
      router.back();
    }
  };

  // Xử lý đăng ký nhân viên
  const handleRegister = async () => {
    console.log(">>> Button pressed - starting register process");
    
    // Kiểm tra các trường bắt buộc
    if (!formData.TenNV || !formData.SDTNV || !formData.CCCDNV || !formData.MatKhau) {
      setAlertInfo({ title: 'Lỗi', message: 'Vui lòng điền đầy đủ thông tin bắt buộc', isSuccess: false });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra email hợp lệ
    if (formData.EmailNV && !formData.EmailNV.includes('@')) {
      setAlertInfo({ title: 'Lỗi', message: 'Email không hợp lệ', isSuccess: false });
      setAlertVisible(true);
      return;
    }

    // Kiểm tra mật khẩu khớp nhau
    if (formData.MatKhau !== confirmPassword) {
      setAlertInfo({ title: 'Lỗi', message: 'Mật khẩu không khớp', isSuccess: false });
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);
      console.log(">>> Submitting data:", formData);
      
      const response = await registerStaff(formData);
      console.log(">>> Register response:", response);
      
      if (response.success) {
        setAlertInfo({ title: 'Thành công', message: 'Đăng ký nhân viên mới thành công', isSuccess: true });
      } else {
        setAlertInfo({ title: 'Lỗi', message: response.message || 'Đăng ký thất bại', isSuccess: false });
      }
      setAlertVisible(true);
    } catch (error: any) {
      console.error(">>> Register error:", error);
      setAlertInfo({ title: 'Lỗi', message: error.message || 'Đã xảy ra lỗi khi đăng ký nhân viên', isSuccess: false });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have create permission, show error
  if (!permissions.canCreate && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>Bạn không có quyền tạo nhân viên mới.</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký nhân viên mới</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Họ và tên */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            value={formData.TenNV}
            onChangeText={(text) => handleInputChange('TenNV', text)}
            placeholder="Nhập họ và tên"
          />
        </View>

        {/* Số điện thoại */}
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

        {/* Email */}
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

        {/* CCCD */}
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

        {/* Chức vụ */}
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

        {/* Mật khẩu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu *</Text>
          <TextInput
            style={styles.input}
            value={formData.MatKhau}
            onChangeText={(text) => handleInputChange('MatKhau', text)}
            placeholder="Nhập mật khẩu"
            secureTextEntry
          />
        </View>

        {/* Xác nhận mật khẩu */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu *</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
          />
        </View>

        {/* Nút đăng ký */}
        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Đăng ký nhân viên</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertVisible}
        title={alertInfo.title}
        message={alertInfo.message}
        confirmText="OK"
        cancelText={alertInfo.isSuccess ? "" : "Hủy"} // Chỉ hiện nút Hủy khi không thành công
        onConfirm={handleCloseAlert}
        onCancel={() => setAlertVisible(false)}
        isSuccess={alertInfo.isSuccess} // Truyền trạng thái thành công/thất bại
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
    backgroundColor: '#FF8F8F',
    borderColor: '#FF8F8F',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#FF8F8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
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

export default RegisterStaffScreen;
