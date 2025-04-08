import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import BackButton from '@/components/createorder/BackButton';
import { OrderItem, Voucher } from '@/types';
import { createDonghoadon } from '@/services/createorderapi';

export default function BillScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const subtotal = Number(params.subtotal || 0);
  const discountAmount = Number(params.discountAmount || 0);
  const totalAmount = Number(params.totalAmount || 0);
  const items: OrderItem[] = params.items ? JSON.parse(params.items as string) : [];
  const activeVoucher: Voucher | null = params.voucherInfo 
    ? JSON.parse(params.voucherInfo as string) 
    : null;

  // Hàm gửi đơn hàng lên API
  const submitOrderToAPI = async () => {
    try {
      // Chuyển đổi từ OrderItem sang DonghoadonAPI
      const orderItems = items.map(item => ({
        sanpham: parseInt(item.id),
        soluongsp: item.quantity,
        ghichu: '',
        // Kiểm tra nếu activeVoucher tồn tại và id là số hợp lệ
        voucher: activeVoucher && !isNaN(parseInt(activeVoucher.id)) 
          ? parseInt(activeVoucher.id) 
          : null
      }));
      
      console.log('Đang gửi đơn hàng lên API:', orderItems);
      
      // Gửi từng sản phẩm lên API với timeout dài hơn
      for (const item of orderItems) {
        try {
          console.log('Đơn hàng đã được gửi thành công');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // Tăng timeout lên 15 giây
          
          await createDonghoadon({
            sanpham: item.sanpham,
            soluongsp: item.soluongsp,
            ghichu: item.ghichu,
            voucher: item.voucher || undefined
          });
          
          clearTimeout(timeoutId);
          console.log('Đơn hàng đã được gửi thành công:', item);
        } catch (itemError) {
          console.error('Lỗi khi gửi sản phẩm:', itemError);
          // Tiếp tục với sản phẩm tiếp theo thay vì dừng lại
        }
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return false;
    }
  };

  // Cập nhật hàm handleCashPayment
  const handleCashPayment = async () => {
    const success = await submitOrderToAPI();
    if (success) {
      Alert.alert('Thành công', 'Đơn hàng đã được thanh toán bằng tiền mặt', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    }
  };

  // Cập nhật hàm handleQRPayment
  const handleQRPayment = async () => {
    try {
      // Thêm log để kiểm tra
      console.log('Bắt đầu xử lý thanh toán QR');
      
      const success = await submitOrderToAPI();
      console.log('Kết quả gửi API:', success);
      
      if (success) {
        console.log('Chuyển đến trang QR với số tiền:', totalAmount);
        
        // Sử dụng push thay vì replace để dễ quay lại
        // Chuyển trang ngay với trạng thái pending
        router.push({
          pathname: './Payment-QR',
          params: { 
            totalAmount: totalAmount.toString(),
            paymentInfo: JSON.stringify({
              items: items.map(item => item.name).join(', '),
              isPending: true // Thêm flag để biết đang chờ API
            })
          }
        });
      } else {
        console.log('Không thể chuyển đến trang QR do lỗi API');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán QR:', error);
      Alert.alert('Lỗi', 'Không thể xử lý thanh toán QR. Vui lòng thử lại.');
    }
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
});