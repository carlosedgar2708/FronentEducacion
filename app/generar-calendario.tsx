import { IAData } from "@/src/data/IAData";
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

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYYYYMMDD(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const d = new Date(y, mo - 1, da);
  if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) return null;
  return d;
}
function pickHoraInicio(pref: Preferencia): string {
  switch (pref) {
    case "Mañana": return "08:00";
    case "Tarde": return "15:00";
    case "Noche": return "20:00";
    default: return "10:00";
  }
}
function splitTemas(temas: string): string[] {
  return temas
    .split(/[\n,]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}
function addMinutesToHHmm(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function GenerarCalendarioScreen() {
  const usuarioId = 1; // TODO: saca esto de tu auth

  const [temas, setTemas] = useState("");
  const [fechaPresentacion, setFechaPresentacion] = useState("2025-12-20");
  const [horasDia, setHorasDia] = useState("2");

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [materiasError, setMateriasError] = useState<string | null>(null);

  const [materiaSel, setMateriaSel] = useState<Materia | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);

  const [preferencia, setPreferencia] = useState<Preferencia>("Indiferente");
  const [showPreferencia, setShowPreferencia] = useState(false);

  const [loadingGenerar, setLoadingGenerar] = useState(false);

  const PREFERENCIAS = useMemo<Preferencia[]>(
    () => ["Mañana", "Tarde", "Noche", "Indiferente"],
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMaterias(true);
        setMateriasError(null);
        const data = await MateriaData.getAll();

        const sorted = [...data].sort((a: any, b: any) => {
          const an = (a?.Nombre ?? a?.nombre ?? "").toString();
          const bn = (b?.Nombre ?? b?.nombre ?? "").toString();
          return an.localeCompare(bn);
        });

        if (!alive) return;
        setMaterias(sorted);
        if (!materiaSel && sorted.length > 0) setMateriaSel(sorted[0]);
      } catch (e: any) {
        if (!alive) return;
        setMateriasError(e?.message ?? "No se pudieron cargar las materias");
      } finally {
        if (alive) setLoadingMaterias(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGenerar = async () => {
    if (!materiaSel) return Alert.alert("Falta info", "Selecciona una materia.");
    if (!temas.trim()) return Alert.alert("Falta info", "Escribe los temas.");

    const fechaObj = parseYYYYMMDD(fechaPresentacion);
    if (!fechaObj) return Alert.alert("Fecha inválida", "Usa YYYY-MM-DD (ej: 2025-12-20).");

    const horas = Number(horasDia);
    if (!Number.isFinite(horas) || horas <= 0) {
      return Alert.alert("Horas inválidas", "Horas por día debe ser un número mayor a 0.");
    }

    const materiaNombre = (materiaSel as any).Nombre ?? (materiaSel as any).nombre ?? "";

    const pregunta = [
      `Materia: ${materiaNombre}`,
      `Temas: ${temas}`,
      `Fecha objetivo: ${fechaPresentacion}`,
      `Horas por día: ${horasDia}`,
      `Preferencia: ${preferencia}`,
      "",
      "Devuélveme una recomendación clara.",
    ].join("\n");

    setLoadingGenerar(true);
    try {
      // 1) IA (solo texto)
      const ia = await IAData.recomendarMateria(usuarioId, pregunta);

      // 2) Armar plan real de sesiones
      const temasList = splitTemas(temas);
      const hoy = new Date();
      const start = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const end = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());

      if (end < start) {
        return Alert.alert("Fecha objetivo inválida", "La fecha objetivo no puede ser menor a hoy.");
      }

      // días disponibles
      const days: string[] = [];
      {
        const d = new Date(start);
        while (d <= end) {
          days.push(toYYYYMMDD(d));
          d.setDate(d.getDate() + 1);
        }
      }

      const baseHora = pickHoraInicio(preferencia);

      // ✅ sesiones por día (1..3)
      const sesionesPorDia = Math.max(1, Math.min(3, Math.ceil(horas)));
      const minutosDia = Math.round(horas * 60);

      // ✅ duración por sesión (reparte las horas del día)
      const duracionPorSesion = Math.max(20, Math.round(minutosDia / sesionesPorDia));
      const pausa = 15;

      const sesionesPayloads = days.flatMap((fecha, dayIdx) => {
        return Array.from({ length: sesionesPorDia }).map((_, j) => {
          const tema = temasList[(dayIdx * sesionesPorDia + j) % temasList.length] ?? "Repaso";
          const hora_inicio = addMinutesToHHmm(baseHora, j * (duracionPorSesion + pausa));

          return {
            Usuarios_id: usuarioId,
            Materias_id: (materiaSel as any).id,
            Planes_id: null,
            Nombre: `Estudio: ${materiaNombre}`.trim(),
            descripcion: `Tema: ${tema}\nPreferencia: ${preferencia}\nObjetivo: ${fechaPresentacion}`,
            duracion: duracionPorSesion,
            estado: false,
            fecha,
            hora_inicio, // ✅ lo que el calendario usa
          };
        });
      });

      for (const payload of sesionesPayloads) {
        await SesionEstudioData.create(payload as any);
      }

      Alert.alert(
        "Calendario generado ✅",
        `Se crearon ${sesionesPayloads.length} sesiones.\n\nIA dice:\n${ia.recomendacion}`
      );

      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e: any) {
      console.log(e?.message ?? e);
      Alert.alert("Error", e?.message ?? "No se pudo generar con IA / registrar sesiones.");
    } finally {
      setLoadingGenerar(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            >
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "900" }}>Generar con IA</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Card */}
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "900" }}>Datos para tu calendario</Text>
                <Text style={{ color: "#666", marginTop: 2 }}>
                  La IA recomienda y luego se crean sesiones reales automáticamente.
                </Text>
              </View>
            </View>

            {/* Materia */}
            <Label text="Materia *" />
            {loadingMaterias ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ActivityIndicator />
                <Text style={{ color: "#666" }}>Cargando materias…</Text>
              </View>
            ) : materiasError ? (
              <Text style={{ color: "red", marginBottom: 8 }}>{materiasError}</Text>
            ) : (
              <>
                <Dropdown
                  value={(materiaSel as any)?.Nombre ?? (materiaSel as any)?.nombre ?? null}
                  placeholder="Selecciona una materia"
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

            {/* Temas */}
            <Label text="Temas *" />
            <TextInput
              value={temas}
              onChangeText={setTemas}
              placeholder="Ej: Integrales, Derivadas, Límites..."
              multiline
              style={[input, { minHeight: 90, textAlignVertical: "top" }]}
            />

            {/* Fecha */}
            <Label text="Fecha objetivo (YYYY-MM-DD)" />
            <TextInput
              value={fechaPresentacion}
              onChangeText={setFechaPresentacion}
              placeholder="2025-12-20"
              style={input}
            />

            {/* Horas */}
            <Label text="Horas de estudio por día" />
            <TextInput
              value={horasDia}
              onChangeText={setHorasDia}
              keyboardType="numeric"
              placeholder="2"
              style={input}
            />

            {/* Preferencia */}
            <Label text="Preferencia de horario" />
            <Dropdown
              value={preferencia}
              placeholder="Indiferente"
              open={showPreferencia}
              onToggle={() => setShowPreferencia((v) => !v)}
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

            {/* Botón */}
            <TouchableOpacity
              onPress={onGenerar}
              disabled={loadingGenerar || loadingMaterias}
              style={{
                marginTop: 14,
                backgroundColor: "#111",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                opacity: loadingGenerar || loadingMaterias ? 0.6 : 1,
              }}
            >
              {loadingGenerar ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {loadingGenerar ? "Generando..." : "Generar calendario"}
              </Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 12, color: "#777", fontSize: 12 }}>
              Esto crea sesiones reales con fecha/hora_inicio desde hoy hasta la fecha objetivo.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* helpers UI */
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
