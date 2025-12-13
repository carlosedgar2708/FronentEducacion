import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

function getHora(iso: string) {
  // "2025-01-20T15:00:00Z" => "15:00"
  if (!iso) return "—";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function SessionCard({ sesion }: { sesion: SesionEstudio }) {
  return (
    <View
      style={{
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        {sesion.Nombre}
      </Text>

      <Text style={{ color: "#555", marginVertical: 4 }}>
        {sesion.descripcion}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <Ionicons name="time-outline" size={16} color="#555" />
        <Text style={{ marginLeft: 6, color: "#555" }}>
          {getHora(sesion.created_at)} · {sesion.duracion} min
        </Text>
      </View>
    </View>
  );
}
