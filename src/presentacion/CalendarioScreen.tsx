import CalendarHeader from "@/src/componentes/calendario/CalendarHeader";
import EmptyCalendar from "@/src/componentes/calendario/EmptyCalendar";
import SessionCard from "@/src/componentes/calendario/SessionCard";
import { SesionEstudio } from "@/src/entidades/SesionEstudio";
import { ScrollView, View } from "react-native";

const MOCK_SESIONES: SesionEstudio[] = [
  {
    id: 1,
    Usuarios_id: 1,
    Materias_id: 1,
    Planes_id: null,
    Nombre: "Estudiar Matemáticas",
    descripcion: "Integrales y derivadas",
    duracion: 60,
    estado: true,
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-01-20T10:00:00Z",
  },
  {
    id: 2,
    Usuarios_id: 1,
    Materias_id: 2,
    Planes_id: null,
    Nombre: "Programación",
    descripcion: "Repasar React Native",
    duracion: 90,
    estado: true,
    created_at: "2025-01-20T15:00:00Z",
    updated_at: "2025-01-20T15:00:00Z",
  },
];


export default function CalendarioScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <CalendarHeader />

      <View style={{ paddingHorizontal: 16 }}>
        {MOCK_SESIONES.length === 0 ? (
          <EmptyCalendar />
        ) : (
          MOCK_SESIONES.map((s) => (
            <SessionCard key={s.id} sesion={s} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
