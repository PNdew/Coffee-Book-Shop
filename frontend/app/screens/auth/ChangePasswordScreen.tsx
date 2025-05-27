import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { changePassword, ChangePasswordData } from '../../../services/authapi';
import AlertDialog from '../../../components/AlertDialog';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordData>({
    oldPassword: '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State cho AlertDialog
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ 
    title: '', 
    message: '', 
    isSuccess: false 
  });

  // Hàm xử lý đóng AlertDialog
  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertInfo.isSuccess) {
      router.back();
    }
  };

  const handleChangePassword = async () => {
    // Kiểm tra dữ liệu
    if (!formData.oldPassword || !formData.newPassword) {
      setAlertInfo({ 
        title: 'Lỗi', 
        message: 'Vui lòng điền đầy đủ thông tin', 
        isSuccess: false 
      });
      setAlertVisible(true);
      return;
    }

    if (formData.newPassword.length < 6) {
      setAlertInfo({ 
        title: 'Lỗi', 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự', 
        isSuccess: false 
      });
      setAlertVisible(true);
      return;
    }

    if (formData.newPassword !== confirmPassword) {
      setAlertInfo({ 
        title: 'Lỗi', 
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp', 
        isSuccess: false 
      });
      setAlertVisible(true);
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setAlertInfo({ 
        title: 'Lỗi', 
        message: 'Mật khẩu mới phải khác mật khẩu cũ', 
        isSuccess: false 
      });
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(formData);
      
      if (response.success) {
        setAlertInfo({ 
          title: 'Thành công', 
          message: 'Đổi mật khẩu thành công', 
          isSuccess: true 
        });
      } else {
        setAlertInfo({ 
          title: 'Lỗi', 
          message: response.message || 'Đổi mật khẩu thất bại', 
          isSuccess: false 
        });
      }
      setAlertVisible(true);
    } catch (error: any) {
      console.error("Change password error:", error);
      setAlertInfo({ 
        title: 'Lỗi', 
        message: error.message || 'Đã xảy ra lỗi khi đổi mật khẩu', 
        isSuccess: false 
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Mật khẩu cũ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu cũ *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.oldPassword}
              onChangeText={(text) => setFormData({...formData, oldPassword: text})}
              placeholder="Nhập mật khẩu cũ"
              secureTextEntry={!showOldPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Ionicons 
                name={showOldPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mật khẩu mới */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.newPassword}
              onChangeText={(text) => setFormData({...formData, newPassword: text})}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Xác nhận mật khẩu mới */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nút đổi mật khẩu */}
        <TouchableOpacity 
          style={[styles.changeButton, loading && styles.disabledButton]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>

        {/* Ghi chú */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            * Mật khẩu mới phải có ít nhất 6 ký tự
          </Text>
          <Text style={styles.noteText}>
            * Mật khẩu mới phải khác mật khẩu cũ
          </Text>
        </View>
      </View>

      {/* Alert Dialog */}
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  changeButton: {
    backgroundColor: '#FF8F8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8F8F',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default ChangePasswordScreen;