import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UsuarioData } from "@/src/data/UsuarioData";
import type { Usuario } from "@/src/entidades/Usuario";

export default function EditarPerfilScreen() {
  const userId = 1; // por ahora fijo

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<Usuario | null>(null);

  // Campos editables
  const [Nombre, setNombre] = useState("");
  const [Correo, setCorreo] = useState("");
  const [nivel_estudios, setNivel] = useState("");
  const [disponibilidad, setDisponibilidad] = useState(true);
  const [Dias_Libres, setDiasLibres] = useState("");
  const [periodo_prefencia, setPeriodo] = useState("");

  useEffect(() => {
    setLoading(true);
    UsuarioData.show(userId)
      .then((u) => {
        setUser(u);
        setNombre(u.Nombre ?? "");
        setCorreo(u.Correo ?? "");
        setNivel(u.nivel_estudios ?? "");
        setDisponibilidad(!!u.disponibilidad);
        setDiasLibres(u.Dias_Libres ?? "");
        setPeriodo(u.periodo_prefencia ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const canSave = useMemo(() => {
    return Nombre.trim().length > 0 && Correo.trim().length > 0;
  }, [Nombre, Correo]);

  async function onSave() {
    if (!canSave) {
      Alert.alert("Faltan datos", "Nombre y Correo son obligatorios.");
      return;
    }

    try {
      setSaving(true);

      const payload: Partial<Usuario> = {
        Nombre: Nombre.trim(),
        Correo: Correo.trim(),
        nivel_estudios: nivel_estudios.trim(),
        disponibilidad,
        Dias_Libres: Dias_Libres.trim(),
        periodo_prefencia: periodo_prefencia.trim(),
      };

      await UsuarioData.patch(userId, payload);

      Alert.alert("Listo", "Perfil actualizado ✅", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ padding: 20 }}>
          <Text>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView>
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>
            Editar Perfil
          </Text>

          <Field label="Nombre" value={Nombre} onChangeText={setNombre} />
          <Field label="Correo" value={Correo} onChangeText={setCorreo} keyboardType="email-address" />
          <Field label="Nivel de estudios" value={nivel_estudios} onChangeText={setNivel} />
          <Field label="Días libres" value={Dias_Libres} onChangeText={setDiasLibres} multiline />
          <Field label="Periodo preferencia" value={periodo_prefencia} onChangeText={setPeriodo} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Disponibilidad</Text>
            <Switch value={disponibilidad} onValueChange={setDisponibilidad} />
          </View>

          <TouchableOpacity
            onPress={onSave}
            disabled={saving || !canSave}
            style={{
              marginTop: 10,
              backgroundColor: saving || !canSave ? "#bbb" : "#6c63ff",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: "#eee",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}
