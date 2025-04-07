import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderItem as OrderItemType } from '@/types';

interface OrderItemProps {
  item: OrderItemType;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, onIncrement, onDecrement }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={item.image ? { uri: item.image } : require('@/assets/images/default-coffee.png')} 
        style={styles.image} 
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.price}>{item.price.toLocaleString()}</Text>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.button} onPress={() => onIncrement(item.id)}>
          <Ionicons name="add-circle" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => onDecrement(item.id)}>
          <Ionicons name="remove-circle" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 80,
    textAlign: 'right',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
    minWidth: 25,
    textAlign: 'center',
  },
});

export default OrderItem;