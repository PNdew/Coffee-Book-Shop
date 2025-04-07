import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

import BackButton from '@/components/createorder/BackButton';
import { createDonghoadon } from '@/services/createorderapi';
import { OrderItem, Voucher } from '@/types';

export default function QRPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalAmount = Number(params.totalAmount || 0);
  const paymentInfo = params.paymentInfo ? JSON.parse(params.paymentInfo as string) : null;
  const items: OrderItem[] = params.items ? JSON.parse(params.items as string) : [];
  const activeVoucher: Voucher | null = params.voucherInfo 
    ? JSON.parse(params.voucherInfo as string) 
    : null;

  // Thêm qrValue ở đây
  // Tạo giá trị QR dựa trên thông tin thanh toán
  const qrValue = JSON.stringify({
    amount: totalAmount,  // Số tiền thanh toán
    reference: `INV-${Date.now()}`,  // Mã tham chiếu cho giao dịch
    timestamp: new Date().toISOString(),  // Thời gian thanh toán
    merchant: "NGUYEN VAN LONG",  // Tên cửa hàng / chủ tài khoản
    account: "0000 5181 751",  // Tài khoản TP (có thể là số tài khoản hoặc mã cổng thanh toán)
    items: items.map(item => item.name).join(', ')  // Tên các món hàng (nếu cần)
  });


  const submitOrderToAPI = async () => {
    try {
      const orderItems = items.map(item => ({
        sanpham: parseInt(item.id),
        soluongsp: item.quantity,
        ghichu: '',
        voucher: activeVoucher && !isNaN(parseInt(activeVoucher.id)) 
          ? parseInt(activeVoucher.id) 
          : null
      }));
      
      for (const item of orderItems) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        await createDonghoadon({
          sanpham: item.sanpham,
          soluongsp: item.soluongsp,
          ghichu: item.ghichu,
          voucher: item.voucher || undefined
        });
        
        clearTimeout(timeoutId);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi đơn hàng:', error);
      return false;
    }
  };

  useEffect(() => {
    const submitOrder = async () => {
      try {
        // Gọi API từ trang QR
        const success = await submitOrderToAPI();
        if (!success) {
          setError('Không thể xử lý đơn hàng. Vui lòng thử lại.');
          router.back(); // Quay lại trang bill nếu lỗi
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Lỗi khi xử lý thanh toán:', error);
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
        router.back();
      }
    };

    if (paymentInfo?.isPending) {
      submitOrder();
    }
  }, []);

  if (error) {
    return null; // Sẽ chuyển về trang bill
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#351b47" />
            <Text style={styles.loadingText}>Đang xử lý đơn hàng...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Thanh toán bằng mã QR</Text>
            </View>
            
            <View style={styles.topBar}>
              <BackButton onPress={() => router.push('./bill')} />
            </View>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrCard}>
                <Text style={styles.nameText}>NGUYEN VAN LONG</Text>
                <Text style={styles.phoneText}>0000 5181 751</Text>
                <Text style={styles.amountText}>{totalAmount.toLocaleString()}đ</Text>
                
                <View style={styles.qrImage}>
                  <QRCode
                    value={qrValue}
                    size={250}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
                
                <Text style={styles.scanText}>Quét mã để thanh toán</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff', // Using white background for the QR screen
  },
  topBar: {
    padding: 15,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrCard: {
    backgroundColor: '#351b47',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  scanText: {
    fontSize: 14,
    color: 'white',
    marginTop: 15,
  },
  qrImage: {
    width: 250,
    height: 250,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#351b47'
  }
});