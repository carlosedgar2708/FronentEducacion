// src/data/UsuarioData.ts
import type { Usuario } from "@/src/entidades/Usuario";
import { http } from "./http";

export const UsuarioData = {
  getAll: () => http.get<Usuario[]>("/usuarios/"),
  show: (id: number) => http.get<Usuario>(`/usuarios/${id}/`),
  patch: (id: number, usuario: Partial<Usuario>) =>
    http.patch<Usuario>(`/usuarios/${id}/`, usuario),
};
