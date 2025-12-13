import { http } from "./http";
import type { Usuario } from "../entidades/Usuario";

export const UsuarioData = {
  getAll: () => http<Usuario[]>("/api/usuarios/"),
  show: (id: number) => http<Usuario>(`/api/usuarios/${id}/`),
  create: (usuario: Partial<Usuario>) =>
    http<Usuario>("/api/usuarios/", { method: "POST", body: JSON.stringify(usuario) }),
  update: (id: number, usuario: Partial<Usuario>) =>
    http<Usuario>(`/api/usuarios/${id}/`, { method: "PUT", body: JSON.stringify(usuario) }),
  patch: (id: number, usuario: Partial<Usuario>) =>
    http<Usuario>(`/api/usuarios/${id}/`, { method: "PATCH", body: JSON.stringify(usuario) }),
  delete: (id: number) => http<void>(`/api/usuarios/${id}/`, { method: "DELETE" }),
};
