import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { submitOrderToAPI } from '@/services/createorderapi';
import { OrderItem, Voucher } from '@/types';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY_PREFIX = 'QR_PAY_RECEIVED_';

export default function QRPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('Đang chờ thanh toán...');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [extraAmount, setExtraAmount] = useState(0);
  const ws = useRef<WebSocket | null>(null);

  const totalAmount = Number(params.totalAmount || 0);
  const items: OrderItem[] = params.items ? JSON.parse(params.items as string) : [];
  const activeVoucher: Voucher | null = params.voucherInfo
    ? JSON.parse(params.voucherInfo as string)
    : null;

  const orderRef = (params.reference as string) || `INV-${Date.now()}`;
  const storageKey = STORAGE_KEY_PREFIX + orderRef;

  const qrValue = JSON.stringify({
    amount: totalAmount,
    reference: orderRef,
    timestamp: new Date().toISOString(),
    merchant: "NGUYEN VAN LONG",
    account: "0000 5181 751",
    items: items.map(item => item.name).join(', '),
  });

  const handleConfirmPayment = async () => {
    try {
      // Lấy token từ SecureStore hoặc AsyncStorage tùy theo platform
      let token;
      if (Platform.OS === 'web') {
        token = await AsyncStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token đăng nhập');
        return;
      }

      await submitOrderToAPI(
        items,
        activeVoucher,
        extraAmount > 0 ? 'Thanh toán thừa tiền' : 'Thanh toán thành công'
      );
      
      // Xóa dữ liệu thanh toán
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(storageKey);
      } else {
        await SecureStore.deleteItemAsync(storageKey);
      }
      
      router.replace('./CreateOrderScreen');
    } catch (error) {
      console.error('Lỗi khi xác nhận thanh toán:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
    }
  };

  const loadSavedAmount = async () => {
    try {
      let saved;
      if (Platform.OS === 'web') {
        saved = await AsyncStorage.getItem(storageKey);
      } else {
        saved = await SecureStore.getItemAsync(storageKey);
      }
      
      if (saved) {
        const amount = Number(saved);
        setReceivedAmount(amount);
        
        if (amount >= totalAmount) {
          const extra = amount - totalAmount;
          setExtraAmount(extra);
          setShowConfirmation(true);
          setPaymentStatus(
            `Đã nhận đủ tiền thanh toán${extra > 0 ? ` (thừa ${extra.toLocaleString()}đ)` : ''}`
          );
        } else {
          const remaining = totalAmount - amount;
          setPaymentStatus(`Đã nhận ${amount.toLocaleString()}đ. Còn thiếu ${remaining.toLocaleString()}đ.`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thanh toán:', error);
    }
  };

  const handlePaymentMessage = async (message: string) => {
    try {
      const paymentData = JSON.parse(message);
      const amountThisTime = Number(paymentData.amount) || 0;

      setReceivedAmount(prev => {
        const totalReceived = prev + amountThisTime;
        
        // Lưu vào SecureStore hoặc AsyncStorage
        const saveAmount = async () => {
          try {
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem(storageKey, totalReceived.toString());
            } else {
              await SecureStore.setItemAsync(storageKey, totalReceived.toString());
            }
          } catch (error) {
            console.error('Lỗi khi lưu dữ liệu thanh toán:', error);
          }
        };
        saveAmount();

        if (totalReceived >= totalAmount) {
          const extra = totalReceived - totalAmount;
          setExtraAmount(extra);
          setShowConfirmation(true);
          setPaymentStatus(
            `Đã nhận đủ tiền thanh toán${extra > 0 ? ` (thừa ${extra.toLocaleString()}đ)` : ''}`
          );
        } else {
          const remaining = totalAmount - totalReceived;
          setPaymentStatus(`Đã nhận ${totalReceived.toLocaleString()}đ. Còn thiếu ${remaining.toLocaleString()}đ.`);
        }

        return totalReceived;
      });
    } catch (err) {
      console.error('Lỗi khi xử lý dữ liệu thanh toán:', err);
      setPaymentStatus('Lỗi trong quá trình xử lý thanh toán.');
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      ws.current = new WebSocket('ws://localhost:8001');
    } else {
      ws.current = new WebSocket('ws://192.168.225.15:8001');
    }
    
    ws.current.onopen = () => console.log('Kết nối WebSocket đã mở');
    ws.current.onmessage = e => handlePaymentMessage(e.data as string);
    ws.current.onerror = e => {
      console.error('Lỗi WebSocket:', e);
      setError('Lỗi kết nối thanh toán. Vui lòng thử lại.');
    };
    ws.current.onclose = () => console.log('Kết nối WebSocket đã đóng');
    return () => { ws.current?.close(); };
  }, []);

  if (error) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Thanh toán bằng mã QR</Text>
          </View>
          
          <View style={styles.qrContainer}>
            <View style={styles.qrCard}>
              <Text style={styles.nameText}>NGUYEN VAN LONG</Text>
              <Text style={styles.phoneText}>0000 5181 751</Text>
              <Text style={styles.amountText}>{totalAmount.toLocaleString()}đ</Text>
              
              <View style={styles.qrImage}>
                <QRCode value={qrValue} size={250} backgroundColor="white" color="black" />
              </View>
              
              <Text style={styles.scanText}>Quét mã để thanh toán</Text>
              <Text style={styles.paymentStatus}>{paymentStatus}</Text>
              
              {showConfirmation && (
                <View style={styles.confirmationContainer}>
                  {extraAmount > 0 && (
                    <Text style={styles.extraAmountText}>
                      Số tiền thừa: {extraAmount.toLocaleString()}đ
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmPayment}
                  >
                    <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#222' 
  },
  container: { 
    flex: 1 
  },
  header: { 
    height: 50, 
    backgroundColor: '#222', 
    justifyContent: 'center', 
    paddingHorizontal: 15 
  },
  title: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  content: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  qrContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  qrCard: { 
    backgroundColor: '#351b47', 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  nameText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 5 },
  phoneText: { 
    fontSize: 16, 
    color: 'white', 
    marginBottom: 15 },
  amountText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 15 },
  qrImage: { 
    width: 250, 
    height: 250, 
    backgroundColor: 'white', 
    borderRadius: 5, 
    justifyContent: 'center', 
    alignItems: 'center' },
  scanText: { 
    fontSize: 14, 
    color: 'white', 
    marginTop: 15 
  },
  paymentStatus: { 
    fontSize: 16, 
    color: 'white', 
    marginTop: 10, 
    textAlign: 'center' 
  },
  confirmationContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10
  },
  extraAmountText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold'
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
