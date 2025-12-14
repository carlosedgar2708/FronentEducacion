import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GenerarCalendarioScreen() {
  const [temas, setTemas] = useState("");
  const [fechaPresentacion, setFechaPresentacion] = useState("2025-12-20");
  const [horasDia, setHorasDia] = useState("2");

  // 🔽 DROPDOWNS
  const [materia, setMateria] = useState<string | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);

  const [preferencia, setPreferencia] = useState<string | null>(null);
  const [showPreferencia, setShowPreferencia] = useState(false);

  // MOCK materias (luego backend)
  const MATERIAS = ["Matemática", "Programación", "Historia"];

  const PREFERENCIAS = ["Mañana", "Tarde", "Noche", "Indiferente"];

  const onGenerar = () => {
    if (!materia || !temas.trim()) {
      Alert.alert("Falta info", "Completa los campos obligatorios.");
      return;
    }

    const payload = {
      materia,
      fecha_objetivo: fechaPresentacion,
      temas,
      horas_por_dia: Number(horasDia),
      preferencia_horario: preferencia ?? "Indiferente",
    };

    console.log("📤 JSON para IA:", payload);

    Alert.alert(
      "Demo",
      "Cuando el backend esté listo, esto se enviará a la IA."
    );

    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "900" }}>
              Generar con IA
            </Text>

            <View style={{ width: 24 }} />
          </View>

          {/* CARD */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 18,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {/* ICON + TITLE */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#111",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "900" }}>
                  Datos para tu calendario
                </Text>
                <Text style={{ color: "#666", marginTop: 2 }}>
                  La IA organizará tu estudio automáticamente.
                </Text>
              </View>
            </View>

            {/* MATERIA */}
            <Label text="Materia *" />
            <Dropdown
              value={materia}
              placeholder="Selecciona una materia"
              open={showMaterias}
              onToggle={() => setShowMaterias(!showMaterias)}
            />
            {showMaterias &&
              MATERIAS.map((m) => (
                <DropdownItem
                  key={m}
                  text={m}
                  onPress={() => {
                    setMateria(m);
                    setShowMaterias(false);
                  }}
                />
              ))}

            {/* TEMAS */}
            <Label text="Temas *" />
            <TextInput
              value={temas}
              onChangeText={setTemas}
              placeholder="Ej: Integrales, React Native, Historia..."
              multiline
              style={[input, { minHeight: 90, textAlignVertical: "top" }]}
            />

            {/* FECHA */}
            <Label text="Fecha objetivo" />
            <TextInput
              value={fechaPresentacion}
              onChangeText={setFechaPresentacion}
              placeholder="YYYY-MM-DD"
              style={input}
            />

            {/* HORAS */}
            <Label text="Horas de estudio por día" />
            <TextInput
              value={horasDia}
              onChangeText={setHorasDia}
              keyboardType="numeric"
              style={input}
            />

            {/* PREFERENCIA */}
            <Label text="Preferencia de horario" />
            <Dropdown
              value={preferencia}
              placeholder="Indiferente"
              open={showPreferencia}
              onToggle={() => setShowPreferencia(!showPreferencia)}
            />
            {showPreferencia &&
              PREFERENCIAS.map((p) => (
                <DropdownItem
                  key={p}
                  text={p}
                  onPress={() => {
                    setPreferencia(p);
                    setShowPreferencia(false);
                  }}
                />
              ))}

            {/* BOTÓN */}
            <TouchableOpacity
              onPress={onGenerar}
              style={{
                marginTop: 20,
                backgroundColor: "#111",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                Generar calendario
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================== COMPONENTES ================== */

function Label({ text }: { text: string }) {
  return <Text style={{ fontWeight: "800", marginBottom: 6 }}>{text}</Text>;
}

function Dropdown({
  value,
  placeholder,
  open,
  onToggle,
}: {
  value: string | null;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        backgroundColor: "#F6F6FB",
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: value ? "#000" : "#888" }}>
        {value ?? placeholder}
      </Text>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} />
    </TouchableOpacity>
  );
}

function DropdownItem({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#EDEDFC",
        padding: 10,
        borderRadius: 12,
        marginBottom: 6,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{text}</Text>
    </TouchableOpacity>
  );
}

const input = {
  backgroundColor: "#F6F6FB",
  borderRadius: 14,
  padding: 12,
  marginBottom: 12,
};
