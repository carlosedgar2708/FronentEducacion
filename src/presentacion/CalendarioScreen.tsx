import TimelineDay from "@/src/componentes/calendario/TimelineDay";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarHeader from "@/src/componentes/calendario/CalendarHeader";
import DayStrip from "@/src/componentes/calendario/DayStrip";
import EmptyCalendar from "@/src/componentes/calendario/EmptyCalendar";
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

// MOCK (hasta que se complete el backend)
const MOCK_SESIONES: (SesionEstudio & { fecha: string; hora_inicio: string })[] = [
  { id: 1, Usuarios_id: 1, Materias_id: 1, Planes_id: null, Nombre: "Mate - Integrales", descripcion: "Repasar integrales", duracion: 60, estado: true, created_at: "", updated_at: "", fecha: "2025-12-14", hora_inicio: "08:30" },
  { id: 2, Usuarios_id: 1, Materias_id: 2, Planes_id: null, Nombre: "React Native", descripcion: "UI calendario", duracion: 90, estado: true, created_at: "", updated_at: "", fecha: "2025-12-14", hora_inicio: "16:00" },
  { id: 3, Usuarios_id: 1, Materias_id: 2, Planes_id: null, Nombre: "Historia", descripcion: "Leer resumen", duracion: 45, estado: true, created_at: "", updated_at: "", fecha: "2025-12-15", hora_inicio: "10:00" },
];

export default function CalendarioScreen() {
  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
    const MATERIA_COLORS: Record<number, string> = {
    1: "#6C63FF", // Mate
    2: "#4CAF50", // Programación
    3: "#FF9800", // Historia
  };


  const sesionesDelDia = useMemo(() => {
    return MOCK_SESIONES
      .filter((s) => s.fecha === selectedISO)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  }, [selectedISO]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[0,1]}>
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

          {sesionesDelDia.length === 0 ? (
            <EmptyCalendar />
          ) : (
            <TimelineDay
              sessions={sesionesDelDia.map((s) => ({
                id: s.id,
                title: s.Nombre,
                subtitle: s.descripcion,
                start: s.hora_inicio,
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

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => console.log("Abrir crear sesión (pendiente backend)")}
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
