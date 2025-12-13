import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { UsuarioData } from "@/src/data/UsuarioData";
import type { Usuario } from "@/src/entidades/Usuario";

import ProfileHeader from "@/src/componentes/perfil/ProfileHeader";
import ProfileOption from "@/src/componentes/perfil/ProfileOption";
import StatCard from "@/src/componentes/perfil/StatCard";

export default function PerfilScreen() {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    UsuarioData.show(1).then(setUser);
  }, []);

  if (!user) return null;

  return (
    
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 20 }}>
        <ProfileHeader user={user} onEdit={() => console.log("Abrir pantalla editar")}/>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <StatCard value={3} label="Planes" active />
          <StatCard value={5} label="Materias" />
          <StatCard value={12} label="Sesiones" />
        </View>

        {/* Opciones */}
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
      </View>
    </ScrollView>
  );
}
