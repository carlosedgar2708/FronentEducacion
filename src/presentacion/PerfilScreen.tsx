import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UsuarioData } from "@/src/data/UsuarioData";
import type { Usuario } from "@/src/entidades/Usuario";

import ProfileHeader from "@/src/componentes/perfil/ProfileHeader";
import ProfileOption from "@/src/componentes/perfil/ProfileOption";
import StatCard from "@/src/componentes/perfil/StatCard";

export default function PerfilScreen() {
  const userId = 1;
  const [user, setUser] = useState<Usuario | null>(null);

  const loadUser = useCallback(() => {
    UsuarioData.show(userId)
      .then(setUser)
      .catch((e) => console.log("Error cargando usuario:", e));
  }, []);

  // ✅ Esto se ejecuta cada vez que entras / vuelves a esta tab
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

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

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <StatCard value={3} label="Planes" active />
            <StatCard value={5} label="Materias" />
            <StatCard value={12} label="Sesiones" />
          </View>

          {/* Opciones */}
          <ProfileOption icon="school-outline" title="Nivel de estudios" subtitle={user.nivel_estudios} />
          <ProfileOption icon="calendar-outline" title="Días libres" subtitle={user.Dias_Libres} />
          <ProfileOption icon="time-outline" title="Periodo preferencia" subtitle={user.periodo_prefencia} />
          <ProfileOption
            icon="checkmark-circle-outline"
            title="Disponibilidad"
            subtitle={user.disponibilidad ? "Disponible" : "No disponible"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
