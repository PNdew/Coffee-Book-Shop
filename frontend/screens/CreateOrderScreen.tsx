// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   SafeAreaView,
// } from 'react-native';
// import { useNavigation, RouteProp } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// type RootStackParamList = {
//   CreateOrder: undefined;
//   Bill: {
//     totalAmount: string;
//     items: string;
//     voucherInfo: string | null;
//   };
//   Vouchers: {
//     currentVoucher: string | null;
//   };
// };

// type CreateOrderScreenNavigationProp =  NativeStackNavigationProp<RootStackParamList>;
// type CreateOrderScreenRouteProp = RouteProp<RootStackParamList, 'CreateOrder'>;

// const CreateOrderScreen = ({ route }: { route: CreateOrderScreenRouteProp }) => {
//   const navigation = useNavigation<CreateOrderScreenNavigationProp>();

//   const [activeTab, setActiveTab] = useState<'drink' | 'food'>('drink');
//   const [items, setItems] = useState([
//     { id: '1', name: 'Coffe đen', price: 35000, quantity: 2, image: 'coffee.png' },
//     { id: '2', name: 'Hương dương', price: 15000, quantity: 2, image: 'sunflower.jpg' },
//     { id: '3', name: 'Freeze', price: 45000, quantity: 1, image: 'freeze.png' },
//   ]);
//   const [activeVoucher, setActiveVoucher] = useState(null);

//   const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   const handleIncrement = (id: string) => {
//     setItems(items.map(item => 
//       item.id === id ? { ...item, quantity: item.quantity + 1 } : item
//     ));
//   };

//   const handleDecrement = (id: string) => {
//     setItems(items.map(item => 
//       item.id === id && item.quantity > 0 ? { ...item, quantity: item.quantity - 1 } : item
//     ).filter(item => item.quantity > 0));
//   };

//   const handleConfirm = () => {
//     navigation.navigate('Bill', { 
//       totalAmount: totalAmount.toString(),
//       items: JSON.stringify(items),
//       voucherInfo: activeVoucher ? JSON.stringify(activeVoucher) : null
//     });
//   };

//   const handleVoucherSelect = () => {
//     navigation.navigate('Vouchers', { 
//       currentVoucher: activeVoucher ? JSON.stringify(activeVoucher) : null 
//     });
//   };

//   useEffect(() => {
//     if (route.params?.selectedVoucher) {
//       try {
//         const voucher = JSON.parse(route.params.selectedVoucher);
//         setActiveVoucher(voucher);
//       } catch (e) {
//         console.error('Error parsing voucher:', e);
//       }
//     }
//   }, [route.params?.selectedVoucher]);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Tạo Order</Text>
//         <ScrollView>
//           {items.map(item => (
//             <View key={item.id} style={styles.itemContainer}>
//               <Text>{item.name} - {item.price} đ</Text>
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity onPress={() => handleDecrement(item.id)}>
//                   <Text>-</Text>
//                 </TouchableOpacity>
//                 <Text>{item.quantity}</Text>
//                 <TouchableOpacity onPress={() => handleIncrement(item.id)}>
//                   <Text>+</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </ScrollView>
//         <Text>Tổng tiền: {totalAmount.toLocaleString()} đ</Text>
//         <TouchableOpacity onPress={handleConfirm}>
//           <Text>Xác nhận Order</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 10,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   }
// });

// export default CreateOrderScreen;

