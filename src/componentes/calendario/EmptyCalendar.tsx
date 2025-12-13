import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function EmptyCalendar() {
  return (
    <View style={{ alignItems: "center", marginTop: 80 }}>
      <Ionicons name="calendar-outline" size={72} color="#bbb" />
      <Text style={{ fontSize: 18, marginTop: 16 }}>
        No hay sesiones registradas
      </Text>
      <Text style={{ color: "#777", marginTop: 6 }}>
        Aquí aparecerán tus sesiones de estudio
      </Text>
    </View>
  );
}
