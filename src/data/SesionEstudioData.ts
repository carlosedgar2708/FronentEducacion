import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import { http } from "./http";

export const SesionEstudioData = {
  getAll: () => http.get<SesionEstudio[]>("/secciones/"),
  show: (id: number) => http.get<SesionEstudio>(`/secciones/${id}/`),

  byUsuario: (usuarioId: number) =>
    http.get<SesionEstudio[]>(`/secciones/?usuario_id=${usuarioId}`),

  byDate: (fecha: string) =>
    http.get<SesionEstudio[]>(`/secciones/?fecha=${fecha}`),

  // ✅ NUEVO: ambos filtros juntos (tu backend ya lo soporta)
  byUsuarioYFecha: (usuarioId: number, fecha: string) =>
    http.get<SesionEstudio[]>(`/secciones/?usuario_id=${usuarioId}&fecha=${fecha}`),

  create: (payload: Partial<SesionEstudio>) =>
    http.post<SesionEstudio>("/secciones/", payload),

  update: (id: number, payload: Partial<SesionEstudio>) =>
    http.put<SesionEstudio>(`/secciones/${id}/`, payload),

  remove: (id: number) =>
    http.delete<{ ok: boolean }>(`/secciones/${id}/`),
};
