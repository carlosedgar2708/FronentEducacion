import { Text, View } from "react-native";

export default function StatCard({
  value,
  label,
  active = false,
}: {
  value: number;
  label: string;
  active?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: active ? "#cdb4f5" : "#f2f2f2",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        {value}
      </Text>
      <Text style={{ color: "#666" }}>{label}</Text>
    </View>
  );
}
