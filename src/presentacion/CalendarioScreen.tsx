import AsyncStorage from "@react-native-async-storage/async-storage";
import TimelineDay from "@/src/componentes/calendario/TimelineDay";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DeviceEventEmitter, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import CalendarHeader from "@/src/componentes/calendario/CalendarHeader";
import DayStrip from "@/src/componentes/calendario/DayStrip";
import EmptyCalendar from "@/src/componentes/calendario/EmptyCalendar";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";

const [usuarioId, setUsuarioId] = useState<number>(1);

useEffect(() => {
  (async () => {
    const id = await AsyncStorage.getItem("userId");
    if (id) setUsuarioId(Number(id));
  })();
}, []);

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function monthTitle(iso: string) {
  const d = new Date(iso);
  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function normalizeHora(h: string | null | undefined) {
  if (!h) return "08:00";
  return String(h).slice(0, 5); // "10:55:56.20" -> "10:55"
}

export default function CalendarioScreen() {
  const usuarioId = 1;

  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [loading, setLoading] = useState(false);

  const MATERIA_COLORS: Record<number, string> = {
    1: "#6C63FF",
    2: "#4CAF50",
    3: "#FF9800",
    4: "#F44336",
    5: "#9C27B0",
    6: "#03A9F4",
    7: "#E91E63",
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // si quieres filtrar por usuario:
      const data = await SesionEstudioData.byUsuario(usuarioId);
      setSesiones(data);
    } catch (e) {
      console.log("Error sesiones:", e);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  // ✅ 1) recarga al volver (cuando SÍ hay focus)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ✅ 2) recarga SIEMPRE que alguien cree/edite sesión (aunque el focus falle)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("sesion:changed", () => {
      load();
    });
    return () => sub.remove();
  }, [load]);

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .filter((s) => s.fecha === selectedISO)
      .map((s) => ({
        ...s,
        _hora: normalizeHora(s.hora_inicio),
      }))
      .sort((a: any, b: any) => a._hora.localeCompare(b._hora));
  }, [sesiones, selectedISO]);

  const onToggleDone = async (id: number, current: boolean) => {
    try {
      // optimista
      setSesiones((prev) => prev.map((s) => (s.id === id ? { ...s, estado: !current } : s)));
      await SesionEstudioData.toggleEstado(id, !current);
      DeviceEventEmitter.emit("sesion:changed");
    } catch (e) {
      console.log(e);
      // rollback
      setSesiones((prev) => prev.map((s) => (s.id === id ? { ...s, estado: current } : s)));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[0, 1]}>
        <View style={{ backgroundColor: "#F6F6FB" }}>
          <CalendarHeader
            title={monthTitle(selectedISO)}
            onToday={() => setSelectedISO(toISODate(new Date()))}
          />
        </View>

        <View style={{ backgroundColor: "#F6F6FB" }}>
          <DayStrip selectedISO={selectedISO} onSelect={setSelectedISO} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 120 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", marginBottom: 10 }}>
            Sesiones del día
          </Text>

          {loading ? (
            <Text style={{ color: "#666" }}>Cargando sesiones...</Text>
          ) : sesionesDelDia.length === 0 ? (
            <EmptyCalendar />
          ) : (
            <TimelineDay
              sessions={sesionesDelDia.map((s: any) => ({
                id: s.id,
                title: s.Nombre,
                subtitle: s.descripcion,
                start: s._hora,
                duration: s.duracion,
                done: !!s.estado,
                color:
                  MATERIA_COLORS[(s.Materias_id ?? Number(s.materia)) as number] ?? "#999",
              }))}
              onSessionPress={(ses) =>
                router.push({
                  pathname: "/detalle-sesion",
                  params: { id: String(ses.id) },
                })
              }
              onToggleDone={(s) => onToggleDone(s.id, !!s.done)}
            />
          )}
        </View>
      </ScrollView>

      {/* IA */}
      <TouchableOpacity
        onPress={() => router.push("/generar-calendario")}
        style={{
          position: "absolute",
          right: 18,
          bottom: 24 + 58 + 12,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </TouchableOpacity>

      {/* + */}
      <TouchableOpacity
        onPress={() => router.push("/crear-sesion")}
        style={{
          position: "absolute",
          right: 18,
          bottom: 24,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#6c63ff",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
