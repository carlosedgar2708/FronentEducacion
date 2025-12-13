import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ProfileOption({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
    >
      <Ionicons name={icon} size={22} color="#777" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>{title}</Text>
        {subtitle && (
          <Text style={{ color: "#888", fontSize: 13 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </View>
  );
}
