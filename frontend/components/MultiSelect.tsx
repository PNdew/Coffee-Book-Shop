import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  TextInput,
  ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Item {
  id: number;
  label: string;
}

interface MultiSelectProps {
  items: Item[];
  selectedIds: number[];
  onSelectedItemsChange: (selectedIds: number[]) => void;
  placeholder?: string;
  label: string;
  required?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  items,
  selectedIds,
  onSelectedItemsChange,
  placeholder = 'Chọn các mục',
  label,
  required = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const toggleItem = (id: number) => {
    let newSelectedIds;
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter(itemId => itemId !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }
    onSelectedItemsChange(newSelectedIds);
  };

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  const selectedLabels = selectedItems.map(item => item.label).join(', ');

  const theLoaiItems = items.map(item => ({
    id: item.id,
    label: item.label
  }));
  console.log('theLoaiItems:', theLoaiItems);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedLabels ? styles.selectorText : styles.placeholder}>
          {selectedLabels || placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={searchText}
                onChangeText={setSearchText}
              />
              <FontAwesome name="search" size={16} color="gray" style={styles.searchIcon} />
            </View>
            
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.item}
                  onPress={() => toggleItem(item.id)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedIds.includes(item.id) && styles.checkboxSelected
                  ]}>
                    {selectedIds.includes(item.id) && (
                      <FontAwesome name="check" size={12} color="white" />
                    )}
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchText ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'}
                  </Text>
                </View>
              }
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  selector: {
    backgroundColor: 'white',
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  searchIcon: {
    marginLeft: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#E4434A',
    borderColor: '#E4434A',
  },
  itemLabel: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#E4434A',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MultiSelect; 