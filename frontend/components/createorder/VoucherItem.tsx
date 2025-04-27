import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Voucher } from '@/types';
import { Ionicons } from '@expo/vector-icons';

// Hàm format giá tiền sang định dạng Việt Nam
const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export interface VoucherItemProps {
  voucher: Voucher;
  isSelected?: boolean;
  isApplicable?: boolean;
  onSelect?: (voucher: Voucher) => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ 
  voucher, 
  isSelected = false, 
  isApplicable = true, 
  onSelect 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isSelected && styles.selectedContainer,
        !isApplicable && styles.disabledContainer
      ]} 
      onPress={() => onSelect && onSelect(voucher)}
      disabled={!isApplicable}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.title, 
            isSelected && styles.selectedText,
            !isApplicable && styles.disabledText
          ]}>
            {voucher.title}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </View>
        
        <Text style={[
          styles.expireDate,
          !isApplicable && styles.disabledText
        ]}>
          Ngày hết hạn: {voucher.expireDate}
        </Text>
        
        <Text style={[
          styles.discountValue,
          !isApplicable && styles.disabledText
        ]}>
          Giá trị giảm: {voucher.discountType === 'percentage' 
            ? `${voucher.discountValue}%` 
            : formatCurrency(Number(voucher.discountValue))}
        </Text>
        
        {voucher.minimumOrderValue !== undefined && voucher.minimumOrderValue > 0 && (
          <Text style={[
            styles.minimumValue,
            !isApplicable && styles.disabledText
          ]}>
            Giá trị đơn hàng tối thiểu: {formatCurrency(voucher.minimumOrderValue)}
          </Text>
        )}
        
        {!isApplicable && (
          <Text style={styles.notApplicableText}>
            Không áp dụng được cho đơn hàng này
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  selectedContainer: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  disabledContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    flex: 1,
  },
  selectedText: {
    color: '#4CAF50',
  },
  disabledText: {
    color: '#999',
  },
  expireDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  discountValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  minimumValue: {
    fontSize: 14,
    color: '#e57373',
    marginBottom: 3,
  },
  notApplicableText: {
    fontSize: 12,
    color: '#e57373',
    fontStyle: 'italic',
    marginTop: 5,
  }
});

export default VoucherItem;