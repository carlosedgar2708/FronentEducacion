import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SessionCard({
  title,
  subtitle,
  time,
  minutes,
  color = "#6c63ff",
  onPress,
}: {
  title: string;
  subtitle: string;
  time: string;
  minutes: number;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,

        // 👇 COLOR POR MATERIA
        borderLeftWidth: 6,
        borderLeftColor: color,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "800" }}>
        {title}
      </Text>

      <Text style={{ color: "#666", marginTop: 2 }}>
        {subtitle}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
        <Ionicons name="time-outline" size={14} color="#555" />
        <Text style={{ marginLeft: 6, fontWeight: "700", color: "#555" }}>
          {time} • {minutes} min
        </Text>
      </View>
    </TouchableOpacity>
  );
}
