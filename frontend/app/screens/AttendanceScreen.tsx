import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const AttendanceScreen = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setCheckInTime(timeString);
    setIsCheckedIn(true);
    Alert.alert('Chấm công thành công', `Bạn đã check-in lúc ${timeString}`);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setCheckOutTime(timeString);
    setIsCheckedIn(false);
    Alert.alert('Chấm công thành công', `Bạn đã check-out lúc ${timeString}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chấm công</Text>
      
      <View style={styles.statusContainer}>
        <FontAwesome 
          name={isCheckedIn ? 'check-circle' : 'times-circle'} 
          size={50} 
          color={isCheckedIn ? '#4CAF50' : '#F44336'} 
        />
        <Text style={styles.statusText}>
          {isCheckedIn ? 'Đang làm việc' : 'Chưa check-in'}
        </Text>
      </View>

      {checkInTime && (
        <Text style={styles.timeText}>Check-in: {checkInTime}</Text>
      )}
      
      {checkOutTime && (
        <Text style={styles.timeText}>Check-out: {checkOutTime}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, isCheckedIn ? styles.checkOutButton : styles.checkInButton]}
        onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
      >
        <Text style={styles.buttonText}>
          {isCheckedIn ? 'CHECK-OUT' : 'CHECK-IN'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        // onPress={() => navigation.goBack()}  
      >
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f5e4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
});

export default AttendanceScreen;