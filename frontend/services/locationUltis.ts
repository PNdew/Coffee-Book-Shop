// import * as Location from 'expo-location';

// export const getCurrentLocation = async () => {
//   const { status } = await Location.requestForegroundPermissionsAsync();
  
//   if (status !== 'granted') {
//     throw new Error('Quyền truy cập vị trí bị từ chối');
//   }

//   const location = await Location.getCurrentPositionAsync({});
//   return {
//     latitude: location.coords.latitude,
//     longitude: location.coords.longitude
//   };
// };