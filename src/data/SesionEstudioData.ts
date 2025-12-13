import type { SesionEstudio } from "../entidades/SesionEstudio";
import { http } from "./http";

export const SesionEstudioData = {
  getAll: () => http<SesionEstudio[]>("/api/secciones/"),
  show: (id: number) => http<SesionEstudio>(`/api/secciones/${id}/`),
  create: (sesion: Partial<SesionEstudio>) =>
    http<SesionEstudio>("/api/secciones/", { method: "POST", body: JSON.stringify(sesion) }),
  update: (id: number, sesion: Partial<SesionEstudio>) =>
    http<SesionEstudio>(`/api/secciones/${id}/`, { method: "PUT", body: JSON.stringify(sesion) }),
  patch: (id: number, sesion: Partial<SesionEstudio>) =>
    http<SesionEstudio>(`/api/secciones/${id}/`, { method: "PATCH", body: JSON.stringify(sesion) }),
  delete: (id: number) => http<void>(`/api/secciones/${id}/`, { method: "DELETE" }),
};
