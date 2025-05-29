import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { checkAttendance, getAttendanceStatus } from '../../services/attendanceapi';
import { getCurrentLocation } from '../../services/locationUltis';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const AttendanceScreen = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const getEmployeeId = async (): Promise<string> => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) throw new Error('Vui lòng đăng nhập lại');

    const decoded = jwtDecode<any>(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    return decoded.IDNhanVien;
  };

  const checkStatus = async () => {
    try {
      console.log('Đang kiểm tra trạng thái chấm công...');
      const status = await getAttendanceStatus();
      if (status.success) {
        setIsCheckedIn(status.is_checked_in ?? false);
        setCheckInTime(status.checkInTime ?? null);
        setCheckOutTime(status.checkOutTime ?? null);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái:', error);
    }
  };

  const handleAttendance = async () => {
    try {
      const location = await getCurrentLocation();
      
      // Kiểm tra xem có phải vị trí mặc định không
      // Nếu location có thuộc tính isDefaultLocation, kiểm tra nó; nếu không, bỏ qua kiểm tra này
      if ('isDefaultLocation' in location && (location as any).isDefaultLocation) {
        // Nếu là nhân viên thường, sử dụng vị trí mặc định
        console.log('Sử dụng vị trí mặc định của nhà hàng');
      } else {
        // Nếu là quản lý, có thể xem/sử dụng vị trí thực tế
        console.log('Sử dụng vị trí hiện tại:', location);
      }

      const employeeId = await getEmployeeId();

      const result = await checkAttendance(employeeId, location.latitude, location.longitude);

      if (result.success) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();

        if (!isCheckedIn) {
          setCheckInTime(timeString);
          Alert.alert(
            'Check-in thành công',
            `Bạn đã check-in lúc ${timeString}${result.is_late ? ' (Đi trễ)' : ''}\nKhoảng cách: ${result.distance}m`
          );
        } else {
          setCheckOutTime(timeString);
          Alert.alert('Check-out thành công', `Bạn đã check-out lúc ${timeString}`);
        }

        setIsCheckedIn((prev) => !prev);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể chấm công. Vui lòng thử lại!');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi chấm công');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chấm công</Text>

      <View style={styles.statusContainer}>
        <FontAwesome
          name={isCheckedIn ? 'check-circle' : 'times-circle'}
          size={50}
          color={isCheckedIn ? '#4CAF50' : '#F44336'}
        />
        <Text style={styles.statusText}>
          {isCheckedIn ? 'Đang làm việc' : 'Chưa check-in'}
        </Text>
      </View>

      {checkInTime && <Text style={styles.timeText}>Check-in: {checkInTime}</Text>}
      {checkOutTime && <Text style={styles.timeText}>Check-out: {checkOutTime}</Text>}

      <TouchableOpacity
        style={[styles.button, isCheckedIn ? styles.checkOutButton : styles.checkInButton]}
        onPressIn={handleAttendance}
      >
        <Text style={styles.buttonText}>{isCheckedIn ? 'CHECK-OUT' : 'CHECK-IN'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => Alert.alert('Thông báo', 'Quay lại')}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f5e4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
});

export default AttendanceScreen;
