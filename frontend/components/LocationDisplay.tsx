import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import { getCurrentLocation } from '../services/locationUltis';

const LocationDisplay: React.FC = () => {
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể lấy vị trí');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Lấy vị trí hiện tại" onPress={handleGetLocation} />
      {location && (
        <Text style={styles.text}>
          Vĩ độ: {location.latitude}, Kinh độ: {location.longitude}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default LocationDisplay;