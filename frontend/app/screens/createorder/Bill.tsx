import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import BackButton from '@/components/createorder/BackButton';
import { OrderItem, Voucher } from '@/types';
import { submitOrderToAPI, getCurrentUser } from '@/services/createorderapi';
import * as SecureStore from 'expo-secure-store';

// Interface cho token JWT có thêm các trường tùy chỉnh
interface CustomJwtPayload extends JwtPayload {
  IDNhanVien?: number;
  SDTNV?: number;
  TenNV?: string;
  ChucVuNV?: number;
}

export default function BillScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [success, setSuccess] = useState(false);

  const subtotal = Number(params.subtotal || 0);
  const discountAmount = Number(params.discountAmount || 0);
  const totalAmount = Number(params.totalAmount || 0);
  const items: OrderItem[] = params.items ? JSON.parse(params.items as string) : [];
  const activeVoucher: Voucher | null = params.voucherInfo
    ? JSON.parse(params.voucherInfo as string)
    : null;

  // Hàm gửi đơn hàng lên API - với debug chi tiết 
  const handleOrderSubmission = async () => {
    try {
      console.log('Đang gửi đơn hàng lên API:', items);

      // Thử tạo payload đơn hàng trực tiếp ở đây để debug
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = SecureStore.getItem('access_token');
      }

      const decoded = token ? jwtDecode(token) : null;

      if (!decoded) {
        Alert.alert('Lỗi', 'Không thể đọc thông tin người dùng từ token');
        return false;
      }

      // Sử dụng hàm submitOrderToAPI
      const orderIdResponse = await submitOrderToAPI(
        items,
        activeVoucher,
        '' // Ghi chú
      );

      console.log('Đơn hàng đã được gửi thành công, ID:', orderIdResponse);
      
      // Hiển thị thông báo khi đơn hàng đã được lưu vào database
      Alert.alert('Thành công', `Đơn hàng #${orderIdResponse} đã được lưu vào hệ thống`);
      
      // Hiển thị success container
      setSuccess(true);
      
      return true;

    } catch (error) {
      console.error('Lỗi khi gửi đơn hàng:', error);

      // Hiển thị thông báo lỗi cụ thể hơn
      let errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';

      if (error instanceof Error) {
        // Nếu có lỗi từ API, hiển thị thông báo cụ thể hơn
        if (error.message.includes('400')) {
          errorMessage = 'Dữ liệu gửi đi không hợp lệ. Vui lòng kiểm tra lại thông tin đơn hàng.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        } else {
          // Hiển thị message lỗi từ API nếu có
          errorMessage = error.message;
        }
      }

      Alert.alert('Lỗi', errorMessage);
      return false;
    }
  };

  // Cập nhật hàm handleCashPayment
  const handleCashPayment = async () => {
    const success = await handleOrderSubmission();
    if (success) {
      Alert.alert('Thành công', 'Đơn hàng đã được thanh toán bằng tiền mặt', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    }
  };

  // Cập nhật hàm handleQRPayment
  const handleQRPayment = async () => {
    try {
      console.log('===== Bắt đầu xử lý thanh toán QR =====');

      // Thử kiểm tra token trước khi gửi
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = SecureStore.getItem('access_token');
      }

      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token đăng nhập!');
        return;
      }

      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        console.log('Staff ID info before sending request:');
        if (decoded.IDNhanVien) console.log('- IDNhanVien:', decoded.IDNhanVien);
        if (decoded.SDTNV) console.log('- SDTNV:', decoded.SDTNV);
      } catch (e) {
        console.error('Lỗi giải mã token:', e);
      }

      console.log('Chuyển đến trang QR với số tiền:', totalAmount);

      // Chuyển trang với thông tin thanh toán
      router.push({
        pathname: './Payment-QR',
        params: {
          totalAmount: totalAmount.toString(),
          items: JSON.stringify(items),
          voucherInfo: activeVoucher ? JSON.stringify(activeVoucher) : null,
          paymentInfo: JSON.stringify({
            isPending: true
          })
        }
      });
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán QR:', error);
      Alert.alert('Lỗi', 'Không thể chuyển đến trang thanh toán QR. Vui lòng thử lại.');
    }
  };

  // Hàm quay về trang CreateOrder
  const handleReturnToCreateOrder = () => {
    router.replace('./CreateOrderScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hóa đơn</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.topBar}>
            <BackButton onPress={() => router.replace('./CreateOrderScreen')} />
            <TouchableOpacity style={styles.billButton}>
              <Text style={styles.billButtonText}>HÓA ĐƠN</Text>
            </TouchableOpacity>
            <View style={styles.logoSmall}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoSmallImage}
              />
            </View>
          </View>

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Đơn hàng đã được lưu thành công!</Text>
            </View>
          )}

          <View style={styles.receiptContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.jpg')}
                style={styles.logoImage}
              />
            </View>

            <Text style={styles.receiptTitle}>PHIEU TINH TIEN</Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, styles.smallCol]}>STT</Text>
              <Text style={[styles.tableCol, styles.largeCol]}>SAN PHAM</Text>
              <Text style={[styles.tableCol, styles.mediumCol]}>GIA TRI</Text>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.smallCol]}>{index + 1}</Text>
                <Text style={[styles.tableCol, styles.largeCol]}>{item.name.toUpperCase()}</Text>
                <Text style={[styles.tableCol, styles.mediumCol]}>
                  {item.price.toLocaleString()}đ
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>TONG CONG</Text>
              <Text style={styles.subtotalAmount}>{subtotal.toLocaleString()}đ</Text>
            </View>

            {activeVoucher && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>
                  GIAM GIA ({activeVoucher.discountValue}%)
                </Text>
                <Text style={styles.discountAmount}>-{discountAmount.toLocaleString()}đ</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>= THANH TIEN</Text>
              <Text style={styles.totalAmount}>{totalAmount.toLocaleString()}đ</Text>
            </View>
          </View>

          <View style={styles.paymentButtons}>
            <TouchableOpacity
              style={[styles.paymentButton, styles.cashButton]}
              onPress={handleCashPayment}
            >
              <Text style={styles.paymentButtonText}>Tiền mặt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentButton, styles.qrButton]}
              onPress={handleQRPayment}
            >
              <Text style={styles.paymentButtonText}>QR CODE</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleReturnToCreateOrder}
          >
            <Text style={styles.returnButtonText}>Quay lại tạo đơn hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Các style hiện tại
  safeArea: {
    flex: 1,
    backgroundColor: '#222',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: '#222',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  billButton: {
    backgroundColor: '#ffb6b6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
  },
  billButtonText: {
    fontWeight: 'bold',
  },
  logoSmall: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSmallImage: {
    width: 30,
    height: 30,
  },
  receiptContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
    width: '100%',
  },
  tableCol: {
    paddingVertical: 5,
  },
  smallCol: {
    width: '10%',
  },
  largeCol: {
    width: '60%',
  },
  mediumCol: {
    width: '30%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 10,
  },
  // Thêm style cho phần giảm giá
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  subtotalLabel: {
    fontWeight: 'bold',
  },
  subtotalAmount: {
    fontWeight: 'bold',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  discountLabel: {
    color: '#f74848',
    fontWeight: 'bold',
  },
  discountAmount: {
    color: '#f74848',
    fontWeight: 'bold',
  },

  // Thêm style cho totalRow, totalLabel, và totalAmount
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  paymentButtons: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  paymentButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 5,
  },
  cashButton: {
    backgroundColor: '#f74848',
  },
  qrButton: {
    backgroundColor: '#f74848',
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#4287f5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Style cho nút quay lại
  returnButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  returnButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Style cho success container
  successContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  successText: {
    color: '#155724',
    fontWeight: 'bold',
  },
});