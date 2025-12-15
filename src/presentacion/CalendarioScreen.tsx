import TimelineDay from "@/src/componentes/calendario/TimelineDay";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarHeader from "@/src/componentes/calendario/CalendarHeader";
import DayStrip from "@/src/componentes/calendario/DayStrip";
import EmptyCalendar from "@/src/componentes/calendario/EmptyCalendar";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";

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

// Derivamos fecha/hora desde created_at (temporal)
function deriveFecha(isoDateTime?: string) {
  if (!isoDateTime) return "";
  return isoDateTime.split("T")[0] ?? "";
}
function deriveHora(isoDateTime?: string) {
  if (!isoDateTime) return "08:00";
  const time = isoDateTime.split("T")[1] ?? "";
  const hhmm = time.substring(0, 5);
  return hhmm || "08:00";
}

export default function CalendarioScreen() {
  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [loading, setLoading] = useState(false);

  const MATERIA_COLORS: Record<number, string> = {
    1: "#6C63FF",
    2: "#4CAF50",
    3: "#FF9800",
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await SesionEstudioData.getAll();
      setSesiones(data);
    } catch (e) {
      console.log("Error sesiones:", e);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .map((s) => ({
        ...s,
        _fecha: deriveFecha(s.created_at),
        _hora: deriveHora(s.created_at),
      }))
      .filter((s) => s._fecha === selectedISO)
      .sort((a, b) => a._hora.localeCompare(b._hora));
  }, [sesiones, selectedISO]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[0, 1]}>
        {/* HEADER */}
        <View style={{ backgroundColor: "#F6F6FB" }}>
          <CalendarHeader
            title={monthTitle(selectedISO)}
            onToday={() => setSelectedISO(toISODate(new Date()))}
          />
        </View>

        {/* DAY STRIP */}
        <View style={{ backgroundColor: "#F6F6FB" }}>
          <DayStrip selectedISO={selectedISO} onSelect={setSelectedISO} />
        </View>

        {/* CONTENT */}
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
              sessions={sesionesDelDia.map((s) => ({
                id: s.id,
                title: s.Nombre,
                subtitle: s.descripcion,
                start: s._hora,
                duration: s.duracion,
                color: MATERIA_COLORS[s.Materias_id] ?? "#999",
              }))}
              onSessionPress={(ses) =>
                router.push({
                  pathname: "/detalle-sesion",
                  params: {
                    id: String(ses.id),
                    title: ses.title,
                    desc: ses.subtitle,
                    time: ses.start,
                    minutes: String(ses.duration),
                    color: ses.color ?? "#6c63ff",
                  },
                })
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Botón IA */}
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

      {/* Botón + */}
      <TouchableOpacity
        onPress={() => console.log("Crear sesión manual (pendiente backend/UI)")}
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
