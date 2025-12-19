import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MateriaData } from "@/src/data/MateriaData";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import { UsuarioData } from "@/src/data/UsuarioData";
// Si tienes PlanData, úsalo. Si no, abajo dejo fallback.
import { PlanData } from "@/src/data/PlanData"; // ✅ si existe en tu proyecto

import type { Materia } from "@/src/entidades/Materia";
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import type { Usuario } from "@/src/entidades/Usuario";

import ProfileHeader from "@/src/componentes/perfil/ProfileHeader";
import ProfileOption from "@/src/componentes/perfil/ProfileOption";
import StatCard from "@/src/componentes/perfil/StatCard";

export default function PerfilScreen() {
  const userId = 1;

  const [user, setUser] = useState<Usuario | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [planesCount, setPlanesCount] = useState<number>(0);

  const loadAll = useCallback(async () => {
    try {
      const [u, m, s] = await Promise.all([
        UsuarioData.show(userId),
        MateriaData.getAll(),
        SesionEstudioData.byUsuario(userId),
      ]);

      setUser(u);
      setMaterias(m);
      setSesiones(s);

      // ✅ Planes reales si tienes PlanData
      try {
        const planes = await PlanData.getAll();
        // si tu API devuelve todos, filtra por usuario si aplica:
        const count = Array.isArray(planes)
          ? planes.filter((p: any) => Number(p?.Usuarios_id ?? p?.usuario ?? p?.usuario_id) === userId).length
          : 0;
        setPlanesCount(count);
      } catch {
        // fallback si no existe endpoint o no quieres contar planes aún
        setPlanesCount(0);
      }
    } catch (e) {
      console.log("Error cargando perfil:", e);
    }
  }, [userId]);

  // ✅ Esto se ejecuta cada vez que entras / vuelves a esta tab
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const sesionesHechas = useMemo(
    () => sesiones.filter((s) => !!s.estado).length,
    [sesiones]
  );

  // si quieres mostrar “materias estudiadas” en vez de “materias existentes”
  const materiasEstudiadasCount = useMemo(() => {
    const setIds = new Set<number>();
    for (const s of sesiones) {
      const mid = s.Materias_id ?? Number((s as any).materia);
      if (mid) setIds.add(Number(mid));
    }
    return setIds.size;
  }, [sesiones]);

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
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
          <ProfileHeader user={user} onEdit={() => router.push("/editar-perfil")} />

          {/* Stats (reales) */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <StatCard value={planesCount} label="Planes" active />
            {/* opción A: todas las materias existentes */}
            {/* <StatCard value={materias.length} label="Materias" /> */}

            {/* opción B: materias realmente estudiadas */}
            <StatCard value={materiasEstudiadasCount} label="Materias" />

            <StatCard value={sesiones.length} label="Sesiones" />
          </View>

          {/* Opciones (reales) */}
          <ProfileOption
            icon="school-outline"
            title="Nivel de estudios"
            subtitle={user.nivel_estudios}
          />
          <ProfileOption
            icon="calendar-outline"
            title="Días libres"
            subtitle={user.Dias_Libres}
          />
          <ProfileOption
            icon="time-outline"
            title="Periodo preferencia"
            subtitle={user.periodo_prefencia}
          />
          <ProfileOption
            icon="checkmark-circle-outline"
            title="Disponibilidad"
            subtitle={user.disponibilidad ? "Disponible" : "No disponible"}
          />

          {/* Bonus útil */}
          <ProfileOption
            icon="checkmark-done-outline"
            title="Sesiones completadas"
            subtitle={`${sesionesHechas} de ${sesiones.length}`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
