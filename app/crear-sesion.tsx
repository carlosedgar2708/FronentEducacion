import { MateriaData } from "@/src/data/MateriaData";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { Materia } from "@/src/entidades/Materia";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
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

type Preferencia = "Mañana" | "Tarde" | "Noche" | "Indiferente";

function hhmm(s: string) {
  const t = s.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  return "08:00";
}

export default function CrearSesionScreen() {
  const usuarioId = 1;

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaSel, setMateriaSel] = useState<Materia | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  const [nombre, setNombre] = useState("Estudio");
  const [tema, setTema] = useState("");
  const [fecha, setFecha] = useState("2025-12-15");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [duracion, setDuracion] = useState("60");
  const [preferencia, setPreferencia] = useState<Preferencia>("Indiferente");

  const PREFERENCIAS = useMemo<Preferencia[]>(
    () => ["Mañana", "Tarde", "Noche", "Indiferente"],
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMaterias(true);
        const data = await MateriaData.getAll();
        const sorted = [...data].sort((a: any, b: any) =>
          String((a as any).Nombre ?? (a as any).nombre ?? "").localeCompare(
            String((b as any).Nombre ?? (b as any).nombre ?? "")
          )
        );
        if (!alive) return;
        setMaterias(sorted);
        if (sorted.length) setMateriaSel(sorted[0]);
      } catch (e) {
        console.log(e);
      } finally {
        if (alive) setLoadingMaterias(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onCrear = async () => {
    if (!materiaSel) return Alert.alert("Falta", "Selecciona una materia.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())) return Alert.alert("Fecha inválida", "Usa YYYY-MM-DD.");
    if (!/^\d{2}:\d{2}$/.test(horaInicio.trim())) return Alert.alert("Hora inválida", "Usa HH:mm (ej 08:30).");

    const mins = Number(duracion);
    if (!Number.isFinite(mins) || mins <= 0) return Alert.alert("Duración inválida", "Pon minutos > 0.");

    const materiaNombre = (materiaSel as any).Nombre ?? (materiaSel as any).nombre ?? `Materia ${materiaSel.id}`;
    const payload = {
      Usuarios_id: usuarioId,
      Materias_id: (materiaSel as any).id,
      Planes_id: null,
      Nombre: `${nombre}: ${materiaNombre}`.trim(),
      descripcion: `Tema: ${tema || "Repaso"}\nPreferencia: ${preferencia}`,
      duracion: mins,
      estado: false,
      fecha: fecha.trim(),
      hora_inicio: hhmm(horaInicio),
    };

    try {
      await SesionEstudioData.create(payload as any);
      Alert.alert("OK", "Sesión creada ✅");
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e: any) {
      console.log(e?.message ?? e);
      Alert.alert("Error", e?.message ?? "No se pudo crear la sesión.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "900" }}>Crear sesión</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 18, shadowOpacity: 0.06, elevation: 2 }}>
            <Label text="Materia *" />
            {loadingMaterias ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ActivityIndicator />
                <Text style={{ color: "#666" }}>Cargando…</Text>
              </View>
            ) : (
              <>
                <Dropdown
                  value={(materiaSel as any)?.Nombre ?? (materiaSel as any)?.nombre ?? null}
                  placeholder="Selecciona materia"
                  open={showMaterias}
                  onToggle={() => setShowMaterias((v) => !v)}
                />
                {showMaterias &&
                  materias.map((m: any) => (
                    <DropdownItem
                      key={m.id}
                      text={m.Nombre ?? m.nombre ?? `Materia ${m.id}`}
                      onPress={() => {
                        setMateriaSel(m);
                        setShowMaterias(false);
                      }}
                    />
                  ))}
              </>
            )}

            <Label text="Nombre" />
            <TextInput value={nombre} onChangeText={setNombre} style={input} />

            <Label text="Tema" />
            <TextInput value={tema} onChangeText={setTema} style={input} />

            <Label text="Fecha (YYYY-MM-DD) *" />
            <TextInput value={fecha} onChangeText={setFecha} style={input} />

            <Label text="Hora inicio (HH:mm) *" />
            <TextInput value={horaInicio} onChangeText={setHoraInicio} style={input} />

            <Label text="Duración (min) *" />
            <TextInput value={duracion} onChangeText={setDuracion} keyboardType="numeric" style={input} />

            <Label text="Preferencia" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {PREFERENCIAS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPreferencia(p)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    backgroundColor: preferencia === p ? "#6c63ff" : "#F6F6FB",
                    borderWidth: 1,
                    borderColor: preferencia === p ? "#6c63ff" : "#ececf3",
                  }}
                >
                  <Text style={{ color: preferencia === p ? "#fff" : "#111", fontWeight: "800" }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={onCrear}
              style={{ backgroundColor: "#111", paddingVertical: 14, borderRadius: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Crear sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
      <Text style={{ color: value ? "#000" : "#888" }}>{value ?? placeholder}</Text>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} />
    </TouchableOpacity>
  );
}
function DropdownItem({ text, onPress }: { text: string; onPress: () => void }) {
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
} as const;
