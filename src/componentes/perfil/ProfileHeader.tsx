import type { Usuario } from "@/src/entidades/Usuario";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function ProfileHeader({
  user,
  onEdit,
}: {
  user: Usuario;
  onEdit?: () => void;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      {/* fila superior: botón editar */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          onPress={onEdit}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: "#f2f2f2",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="create-outline" size={18} color="#333" />
          <Text style={{ color: "#333", fontWeight: "700" }}>Editar</Text>
        </Pressable>
      </View>

      {/* avatar + nombre */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#e0e0e0",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="person" size={48} color="#666" />
        </View>

        <Text style={{ fontSize: 22, fontWeight: "800" }}>{user.Nombre}</Text>
        <Text style={{ color: "#888" }}>{user.Correo}</Text>
      </View>
    </View>
  );
}
