import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Voucher } from '@/types';

interface VoucherItemProps {
  voucher: Voucher;
  onSelect?: (voucher: Voucher) => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, onSelect }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onSelect && onSelect(voucher)}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{voucher.title}</Text>
        <Text style={styles.expireDate}>Ngày hết hạn: {voucher.expireDate}</Text>
        <Text style={styles.discountValue}>
          Giá trị giảm: {voucher.discountValue}
          {voucher.discountType === 'percentage' ? '%' : ' VND'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  expireDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  discountValue: {
    fontSize: 14,
    color: '#666',
  },
});

export default VoucherItem;