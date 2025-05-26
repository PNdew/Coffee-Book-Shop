import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Thêm import này nếu chưa có

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSuccess?: boolean; // Thêm prop này
}

export default function AlertDialog({
  visible, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel,
  isSuccess = false // Mặc định là false
}: AlertDialogProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Icon thành công/thất bại */}
          <View style={[styles.iconContainer, isSuccess ? styles.successIconContainer : styles.errorIconContainer]}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "alert-circle"} 
              size={40} 
              color="white" 
            />
          </View>
          
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {cancelText ? (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity
              style={[
                styles.button, 
                isSuccess ? styles.successButton : styles.confirmButton,
                !cancelText && { flex: 1 } // Nếu không có nút hủy, cho nút xác nhận chiếm hết chiều rộng
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    paddingTop: 30, // Thêm padding trên để cho icon
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIconContainer: {
    backgroundColor: '#4CAF50', // Màu xanh lá cho thành công
  },
  errorIconContainer: {
    backgroundColor: '#E4434A', // Màu đỏ cho lỗi
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#cccccc',
  },
  confirmButton: {
    backgroundColor: '#E4434A', // Màu đỏ cho nút xác nhận khi lỗi
  },
  successButton: {
    backgroundColor: '#4CAF50', // Màu xanh lá cho nút xác nhận khi thành công
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
