// src/data/SesionEstudioData.ts
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import { http } from "./http";

export const SesionEstudioData = {
  getAll: () => http.get<SesionEstudio[]>("/secciones/"),
  show: (id: number) => http.get<SesionEstudio>(`/secciones/${id}/`),

  // si tu backend soporta filtros (opcional)
  byUsuario: (usuarioId: number) =>
    http.get<SesionEstudio[]>(`/secciones/?usuario_id=${usuarioId}`),

  byDate: (fecha: string) =>
    http.get<SesionEstudio[]>(`/secciones/?fecha=${fecha}`),

  create: (payload: Partial<SesionEstudio>) =>
    http.post<SesionEstudio>("/secciones/", payload),

  update: (id: number, payload: Partial<SesionEstudio>) =>
    http.put<SesionEstudio>(`/secciones/${id}/`, payload),

  remove: (id: number) =>
    http.delete<{ ok: boolean }>(`/secciones/${id}/`),
};
