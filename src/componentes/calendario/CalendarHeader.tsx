import { Text, View } from "react-native";

export default function CalendarHeader() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Calendario
      </Text>
      <Text style={{ color: "#666", marginTop: 4 }}>
        Tus sesiones de estudio
      </Text>
    </View>
  );
}
