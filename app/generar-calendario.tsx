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
  // valida que no se "corrija" sola (ej 2025-02-40)
  if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) return null;
  return d;
}

function pickHoraInicio(pref: Preferencia): string {
  switch (pref) {
    case "Mañana":
      return "08:00";
    case "Tarde":
      return "15:00";
    case "Noche":
      return "20:00";
    case "Indiferente":
    default:
      return "10:00";
  }
}

function splitTemas(temas: string): string[] {
  // separa por coma o saltos de línea
  return temas
    .split(/[\n,]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function GenerarCalendarioScreen() {
  const usuarioId = 1; // TODO: saca esto de tu auth / perfil

  const [temas, setTemas] = useState("");
  const [fechaPresentacion, setFechaPresentacion] = useState("2025-12-20");
  const [horasDia, setHorasDia] = useState("2");

  // materias reales
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [materiasError, setMateriasError] = useState<string | null>(null);

  // dropdown
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

        // ordena por Nombre si existe
        const sorted = [...data].sort((a: any, b: any) => {
          const an = (a?.Nombre ?? "").toString();
          const bn = (b?.Nombre ?? "").toString();
          return an.localeCompare(bn);
        });

        if (!alive) return;
        setMaterias(sorted);

        // si no hay materia seleccionada, preselecciona la primera
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
    if (!materiaSel) {
      Alert.alert("Falta info", "Selecciona una materia.");
      return;
    }
    if (!temas.trim()) {
      Alert.alert("Falta info", "Escribe los temas.");
      return;
    }

    const fechaObj = parseYYYYMMDD(fechaPresentacion);
    if (!fechaObj) {
      Alert.alert("Fecha inválida", "Usa formato YYYY-MM-DD (ej: 2025-12-20).");
      return;
    }

    const horas = Number(horasDia);
    if (!Number.isFinite(horas) || horas <= 0) {
      Alert.alert("Horas inválidas", "Horas por día debe ser un número mayor a 0.");
      return;
    }

    // 1) llamar IA
    const pregunta = [
      `Materia: ${materiaSel.Nombre ?? materiaSel.Nombre}`, // por si tu type usa Nombre
      `Temas: ${temas}`,
      `Fecha objetivo: ${fechaPresentacion}`,
      `Horas por día: ${horasDia}`,
      `Preferencia: ${preferencia}`,
      "",
      "Devuélveme una recomendación clara.",
    ].join("\n");

    setLoadingGenerar(true);
    try {
      const ia = await IAData.recomendarMateria(usuarioId, pregunta);

      // 2) crear sesiones reales (una por día) desde HOY hasta la fecha objetivo
      const temasList = splitTemas(temas);
      const hoy = new Date();
      const start = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const end = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());

      if (end < start) {
        Alert.alert("Fecha objetivo inválida", "La fecha objetivo no puede ser menor a hoy.");
        return;
      }

      const hora_inicio = pickHoraInicio(preferencia);
      const duracionMin = Math.round(horas * 60);

      // cuántos días hay disponibles
      const days: string[] = [];
      {
        const d = new Date(start);
        while (d <= end) {
          days.push(toYYYYMMDD(d));
          d.setDate(d.getDate() + 1);
        }
      }

      // distribuye temas por día (simple)
      // ej: si hay 10 temas y 5 días => 2 temas por día aprox
      const sesionesPayloads = days.map((fecha, idx) => {
        const tema = temasList[idx % temasList.length] ?? "Repaso";
        return {
          Usuarios_id: usuarioId,
          Materias_id: materiaSel.id,
          Planes_id: null,
          Nombre: `Estudio: ${materiaSel.Nombre ?? ""}`.trim(),
          descripcion: `Tema: ${tema}\nPreferencia: ${preferencia}\nObjetivo: ${fechaPresentacion}`,
          duracion: duracionMin,
          estado: false,
          fecha,
          hora_inicio,
        };
      });

      // crea todas las sesiones (secuencial para que sea simple y estable)
      for (const payload of sesionesPayloads) {
        await SesionEstudioData.create(payload as any);
      }

      Alert.alert(
        "Calendario generado ✅",
        `Se crearon ${sesionesPayloads.length} sesiones.\n\nIA dice:\n${ia.recomendacion}`
      );

      // vuelve atrás
      if (router.canGoBack()) router.back();
      else router.replace("/"); // ajusta a tu ruta principal si quieres
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace("/");
              }}
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
                  materias.map((m) => (
                    <DropdownItem
                      key={m.id}
                      text={(m as any).Nombre ?? (m as any).nombre ?? `Materia ${m.id}`}
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
              {loadingGenerar ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#fff" />
              )}
              <Text style={{ color: "#fff", fontWeight: "900" }}>
                {loadingGenerar ? "Generando..." : "Generar calendario"}
              </Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 12, color: "#777", fontSize: 12 }}>
              Esto crea sesiones reales en /api/secciones/ desde hoy hasta la fecha objetivo.
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
