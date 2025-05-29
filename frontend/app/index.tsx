import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Lưu token an toàn
import { login } from "../services/authapi"; // Sử dụng hàm login từ authapi

const LoginScreen = () => {
  const router = useRouter();
  const [SDTNV, setSDTNV] = useState("");
  const [MatKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      const user = await login(SDTNV, MatKhau);
      
      if (user) {
        Alert.alert("Đăng nhập thành công", "Chào mừng " + user.TenNV);
        // Điều hướng đến trang Home
        router.push("./screens/HomeScreen");
      } else {
        Alert.alert("Lỗi", "Sai tài khoản hoặc mật khẩu");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    } finally {
      setLoading(false);
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
          <TouchableOpacity 
            style={[styles.logInBtn, loading && styles.logInBtnDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.logInTxt}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Text>
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
  logInBtnDisabled: {
    backgroundColor: "#cccccc",
  },
  logInTxt: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
  },
});

export default LoginScreen;
