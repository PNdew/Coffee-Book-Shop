import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Pressable, ActivityIndicator, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { billService, HoaDon } from '@/services/billapi';
import AlertDialog from '@/components/AlertDialog';

export default function HoaDonScreen() {
  const [hoaDons, setHoaDons] = useState<HoaDon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<HoaDon | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [refresh]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await billService.getAllHoaDon();
      setHoaDons(data || []);
      setError(null);
    } catch (err) {
      console.error('Chi tiết lỗi:', err);
      setError(`Không thể tải danh sách hóa đơn: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setHoaDons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = (order: HoaDon) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleLongPress = (id: string) => {
    setSelectedOrderId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrderId) return;
    
    try {
      await billService.deleteHoaDon(selectedOrderId);
      setHoaDons(hoaDons.filter(order => order.idhoadon.toString() !== selectedOrderId));
      setShowDeleteDialog(false);
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Lỗi khi xóa hóa đơn:', error);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${hours}:${minutes} | ${day}/${month}/${year}`;
    } catch (error) {
      return dateTimeStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Lọc hóa đơn theo ngày đã chọn
  const filteredOrders = hoaDons.filter(order => {
    const orderDate = new Date(order.ngayhd);
    return (
      orderDate.getDate() === selectedDate.getDate() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Tạo danh sách các ngày trong tháng hiện tại
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Lấy số ngày trong tháng
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Lấy ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Lấy thứ của ngày đầu tiên (0 = CN, 1 = T2, ...)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Điều chỉnh để 0 = T2, ..., 6 = CN theo tiêu chuẩn Việt Nam
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Tạo mảng chứa các ngày trong tháng
    const days = [];
    
    // Thêm các ô trống cho những ngày trước ngày đầu tiên của tháng
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Thêm các ngày trong tháng
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Đảm bảo hiển thị đủ 6 hàng (42 ô) trong lịch
    const totalCells = 42; // 7 ngày x 6 tuần
    if (days.length < totalCells) {
      const remainingCells = totalCells - days.length;
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  // Chuyển sang tháng trước
  const goToPreviousMonth = () => {
    const previousMonth = new Date(selectedDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setSelectedDate(previousMonth);
  };

  // Chuyển sang tháng sau
  const goToNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedDate(nextMonth);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Link href="../" asChild>
          <Pressable style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="black" />
          </Pressable>
        </Link>
        <View style={styles.titleWrapper}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Quản lý hóa đơn</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconContainer} onPress={fetchOrders}>
          <FontAwesome name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Nút DANH SÁCH HÓA ĐƠN */}
      <View style={styles.listButtonContainer}>
        <TouchableOpacity style={styles.listButton}>
          <Text style={styles.listButtonText}>DANH SÁCH HÓA ĐƠN</Text>
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthArrow}>
          <FontAwesome name="chevron-left" size={18} color="#333" />
        </TouchableOpacity>
        <View style={styles.monthTextContainer}>
          <Text style={styles.monthText}>
            Tháng {selectedDate.getMonth() + 1} / {selectedDate.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
          <FontAwesome name="chevron-right" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Days of Week */}
      <View style={styles.daysOfWeekContainer}>
        <Text style={styles.dayOfWeek}>T2</Text>
        <Text style={styles.dayOfWeek}>T3</Text>
        <Text style={styles.dayOfWeek}>T4</Text>
        <Text style={styles.dayOfWeek}>T5</Text>
        <Text style={styles.dayOfWeek}>T6</Text>
        <Text style={styles.dayOfWeek}>T7</Text>
        <Text style={styles.dayOfWeek}>CN</Text>
      </View>

      {/* Calendar Days */}
      <View style={styles.calendarContainer}>
        <FlatList
          data={getDaysInMonth()}
          renderItem={({ item: day }) => {
            if (day === null) {
              // Trả về ô trống cho những ngày không thuộc tháng này
              return <View style={styles.calendarDay} />;
            }
            
            const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isSelected = 
              dayDate.getDate() === selectedDate.getDate() && 
              dayDate.getMonth() === selectedDate.getMonth() && 
              dayDate.getFullYear() === selectedDate.getFullYear();
            
            return (
              <TouchableOpacity
                style={[
                  styles.calendarDay,
                  isSelected && styles.selectedDay
                ]}
                onPress={() => setSelectedDate(dayDate)}
              >
                <Text style={[styles.calendarDayText, isSelected && styles.selectedDayText]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          numColumns={7}
          columnWrapperStyle={styles.calendarRow}
        />
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E4434A" />
          <Text style={styles.loadingText}>Đang tải danh sách hóa đơn...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.idhoadon.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderItem}
              onPress={() => handleOrderPress(item)}
              onLongPress={() => handleLongPress(item.idhoadon.toString())}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{String(item.idhoadon).padStart(3, '0')}</Text>
                <Text style={styles.orderDateTime}>{formatDateTime(item.ngayhd)}</Text>
              </View>
              <View style={styles.divider} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có hóa đơn nào vào ngày này</Text>
            </View>
          }
        />
      )}

      {/* Tạo order button */}
      <TouchableOpacity style={styles.createOrderButton} onPress={() => router.push('../createorder/CreateOrderScreen')}>
        <FontAwesome name="plus" size={18} color="white" style={styles.plusIcon} />
        <Text style={styles.createOrderText}>Tạo order</Text>
      </TouchableOpacity>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order {String(selectedOrder.idhoadon).padStart(3, '0')}</Text>
              <TouchableOpacity onPress={() => setShowOrderDetail(false)} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <Text style={styles.orderTime}>{formatDateTime(selectedOrder.ngayhd)}</Text>
            
            <View style={styles.orderDetailsHeader}>
              <Text style={[styles.orderDetailHeaderItem, { flex: 2 }]}>Tên món</Text>
              <Text style={[styles.orderDetailHeaderItem, { flex: 1 }]}>Loại</Text>
              <Text style={[styles.orderDetailHeaderItem, { flex: 1 }]}>Giá tiền</Text>
              <Text style={[styles.orderDetailHeaderItem, { flex: 1 }]}>Số lượng</Text>
            </View>
            
            <FlatList
              data={selectedOrder.donghoadon || []}
              keyExtractor={(item) => `${selectedOrder.idhoadon}-${item.so_tt_dong}`}
              renderItem={({ item: dongHoaDon }) => (
                <View style={styles.orderDetailItemContainer}>
                  <View style={styles.orderDetailItem}>
                    <Text style={[styles.orderDetailItemName, { flex: 2 }]}>
                      {dongHoaDon.sanpham_info?.tensp || 'Không có tên sản phẩm'}
                    </Text>
                    <Text style={[styles.orderDetailItemType, { flex: 1 }]}>
                      {dongHoaDon.sanpham_info?.loaisp || ''}
                    </Text>
                    <Text style={[styles.orderDetailItemPrice, { flex: 1 }]}>
                      {formatCurrency(dongHoaDon.sanpham_info?.giasp || 0)}
                    </Text>
                    <Text style={[styles.orderDetailItemQuantity, { flex: 1 }]}>
                      {dongHoaDon.soluongsp}
                    </Text>
                  </View>
                  {dongHoaDon.ghichu && (
                    <View style={styles.itemNoteContainer}>
                      <Text style={styles.itemNoteText}>Ghi chú: {dongHoaDon.ghichu}</Text>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyDetailContainer}>
                  <Text style={styles.emptyDetailText}>Không có sản phẩm nào trong hóa đơn</Text>
                </View>
              }
            />
            
            {selectedOrder.donghoadon.some(item => item.voucher_info) && (
              <View style={styles.voucherContainer}>
                <Text style={styles.voucherTitle}>Áp dụng Voucher:</Text>
                {selectedOrder.donghoadon
                  .filter(item => item.voucher_info)
                  .map((item, index) => (
                    <View key={index} style={styles.voucherItem}>
                      <Text style={styles.voucherText}>
                        {item.sanpham_info?.tensp || 'Sản phẩm'}: Giảm {item.voucher_info?.giamgia}%
                      </Text>
                    </View>
                  ))}
              </View>
            )}
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.deleteOrderButton} onPress={() => {
                setShowOrderDetail(false);
                handleLongPress(selectedOrder.idhoadon.toString());
              }}>
                <Text style={styles.deleteOrderText}>Xóa order</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowOrderDetail(false)}
              >
                <Text style={styles.closeModalText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        visible={showDeleteDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa hóa đơn này?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F3F3E7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: '#FF8F8F',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
  },
  listButtonContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  listButton: {
    backgroundColor: '#FF8F8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  listButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f5e1e1',
  },
  monthArrow: {
    padding: 10,
  },
  monthTextContainer: {
    backgroundColor: '#f5e1e1',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  calendarContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
  },
  calendarRow: {
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  calendarDay: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  selectedDay: {
    backgroundColor: '#FF8F8F',
    borderRadius: 15,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E4434A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDateTime: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  createOrderButton: {
    backgroundColor: '#E4434A',
    flexDirection: 'row',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  plusIcon: {
    marginRight: 8,
  },
  createOrderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  orderDetailHeaderItem: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderDetailItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  orderDetailItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  orderDetailItemName: {
    textAlign: 'left',
    paddingLeft: 5,
  },
  orderDetailItemType: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
  orderDetailItemPrice: {
    textAlign: 'center',
  },
  orderDetailItemQuantity: {
    textAlign: 'center',
  },
  itemNoteContainer: {
    backgroundColor: '#FFEBAD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    marginBottom: 5,
    borderRadius: 5,
  },
  itemNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#555',
  },
  emptyDetailContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDetailText: {
    color: '#666',
    fontStyle: 'italic',
  },
  voucherContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E6F7FF',
    borderRadius: 5,
  },
  voucherTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  voucherItem: {
    marginVertical: 3,
  },
  voucherText: {
    fontSize: 13,
    color: '#555',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  deleteOrderButton: {
    backgroundColor: '#aaa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteOrderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#E4434A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  closeModalText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
