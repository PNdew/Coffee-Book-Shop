import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Lưu token an toàn

const getApiUrl = () => {
  if (Platform.OS === "web") {
    return Constants.expoConfig?.extra?.API_URL;
  } else {
    return Constants.expoConfig?.extra?.API_URL_MOBILE;
  }
};

const LoginScreen = () => {
  const router = useRouter();
  const apiUrl = getApiUrl();
  const [SDTNV, setSDTNV] = useState("");
  const [MatKhau, setMatKhau] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiUrl}login/`, {
        SDTNV: SDTNV,
        MatKhau: MatKhau,
      }) ;

      const { access, refresh } = response.data;

      // Lưu access token và refresh token vào SecureStore
      if (Platform.OS === 'web') {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
      } else {
        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", refresh);
      }
      
      Alert.alert("Đăng nhập thành công");

      // Điều hướng đến trang Home
      // router.push("./screens/HomeScreen");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("Lỗi", error.response.data || "Sai tài khoản hoặc mật khẩu")
        Alert.alert("Lỗi", error.response.data.detail || "Sai tài khoản hoặc mật khẩu");
      } else {
        Alert.alert("Lỗi", "Không thể kết nối đến server");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo}></Image>

        <View>
          <TextInput
            style={styles.input}
            value={SDTNV}
            onChangeText={setSDTNV}
            placeholder="Số điện thoại"
          />
          <TextInput
            style={styles.input}
            value={MatKhau}
            onChangeText={setMatKhau}
            placeholder="Mật khẩu"
            secureTextEntry={true}
          />
        </View>

        <View>
          <TouchableOpacity style={styles.forgotPwBtn}>
            <Text style={{ color: "#00000080" }}>Quên mật khẩu</Text>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity style={styles.logInBtn} onPress={handleLogin}>
            <Text style={styles.logInTxt}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F3F3E7",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    alignSelf: "center",
    backgroundColor: "#F3F3E7",
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
  },
  input: {
    height: 50,
    borderColor: "#00000080",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    borderWidth: 1,
    color: "#000000D9",
    fontSize: 16,
    marginTop: 18,
    margin: 5,
    borderRadius: 5,
  },
  forgotPwBtn: {
    fontSize: 16,
    margin: 5,
    marginLeft: "auto",
  },
  logInBtn: {
    height: 50,
    marginTop: 30,
    borderRadius: 5,
    backgroundColor: "#FF8F8F",
    justifyContent: "center",
    alignItems: "center",
  },
  logInTxt: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
  },
});

export default LoginScreen;
