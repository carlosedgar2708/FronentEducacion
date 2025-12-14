import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Materia = {
  id: number;
  nombre: string;
  dificultad?: string;
  notas?: string;
};

export default function MateriasScreen() {
  const [nombre, setNombre] = useState("");
  const [dificultad, setDificultad] = useState("");
  const [notas, setNotas] = useState("");
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [contador, setContador] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animar = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const agregarOEditarMateria = () => {
    if (!nombre.trim()) return;

    if (editandoId) {
      setMaterias((prev) =>
        prev.map((m) =>
          m.id === editandoId
            ? { ...m, nombre, dificultad, notas }
            : m
        )
      );
      setEditandoId(null);
    } else {
      setMaterias((prev) => [
        ...prev,
        { id: contador, nombre, dificultad, notas },
      ]);
      setContador(contador + 1);
    }

    setNombre("");
    setDificultad("");
    setNotas("");
    animar();
  };

  const editarMateria = (m: Materia) => {
    setNombre(m.nombre);
    setDificultad(m.dificultad ?? "");
    setNotas(m.notas ?? "");
    setEditandoId(m.id);
  };

  const eliminarMateria = (id: number) => {
    Alert.alert("Eliminar materia", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          setMaterias((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const colorPorDificultad = (d?: string) => {
    const n = Number(d);
    if (n <= 2) return "#4CAF50";
    if (n === 3) return "#FFC107";
    if (n >= 4) return "#F44336";
    return "#999";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F4F6F8" }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          backgroundColor: "#F4F6F8",
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <Ionicons name="book" size={28} color="#1e90ff" />
          <Text style={{ fontSize: 22, fontWeight: "bold", marginLeft: 10 }}>
            Gestión de Materias
          </Text>
        </View>

        {/* INPUTS */}
        <TextInput
          placeholder="Nombre de la materia"
          value={nombre}
          onChangeText={setNombre}
          style={inputStyle}
        />
        <TextInput
          placeholder="Dificultad (1 - 5)"
          value={dificultad}
          onChangeText={setDificultad}
          keyboardType="numeric"
          style={inputStyle}
        />
        <TextInput
          placeholder="Notas (opcional)"
          value={notas}
          onChangeText={setNotas}
          multiline
          style={[inputStyle, { minHeight: 60 }]}
        />

        {/* BOTÓN */}
        <TouchableOpacity
          onPress={agregarOEditarMateria}
          style={buttonStyle}
        >
          <Ionicons
            name={editandoId ? "save-outline" : "add-circle-outline"}
            size={22}
            color="#fff"
          />
          <Text style={buttonText}>
            {editandoId ? "GUARDAR CAMBIOS" : "AGREGAR MATERIA"}
          </Text>
        </TouchableOpacity>

        {/* LISTA */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={materias}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={cardStyle}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={titleStyle}>📘 {item.nombre}</Text>

                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => editarMateria(item)}>
                      <Ionicons name="create-outline" size={20} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminarMateria(item.id)}
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                {item.dificultad ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <Ionicons
                      name="star"
                      size={16}
                      color={colorPorDificultad(item.dificultad)}
                    />
                    <Text style={{ marginLeft: 6 }}>
                      Dificultad: {item.dificultad}
                    </Text>
                  </View>
                ) : null}

                {item.notas ? (
                  <Text style={{ marginTop: 4, color: "#555" }}>
                    📝 {item.notas}
                  </Text>
                ) : null}
              </View>
            )}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* 🎨 ESTILOS */
const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#ddd",
};

const buttonStyle = {
  backgroundColor: "#1e90ff",
  padding: 15,
  borderRadius: 10,
  marginBottom: 25,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
};

const buttonText = {
  color: "#fff",
  fontWeight: "bold",
  marginLeft: 8,
};

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: "#e1e1e1",
};

const titleStyle = {
  fontSize: 16,
  fontWeight: "bold",
};
