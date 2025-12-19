// app/login.tsx
import { AuthData } from "@/src/data/AuthData";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert("Falta info", "Escribe correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthData.login(correo.trim(), password);

      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("userId", String(res.user.id));

      router.replace("/(tabs)/calendario"); // ajusta a tu ruta real
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 18, elevation: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#6c63ff", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "900" }}>Iniciar sesión</Text>
          </View>

          <Text style={{ fontWeight: "800", marginBottom: 6 }}>Correo</Text>
          <TextInput value={correo} onChangeText={setCorreo} autoCapitalize="none" style={input} />

          <Text style={{ fontWeight: "800", marginBottom: 6 }}>Contraseña</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry style={input} />

          <TouchableOpacity
            onPress={onLogin}
            disabled={loading}
            style={{
              marginTop: 12,
              backgroundColor: "#111",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const input = {
  backgroundColor: "#F6F6FB",
  borderRadius: 14,
  padding: 12,
  marginBottom: 12,
};
