import { http } from "./http";
import type { Materia } from "../entidades/Materia";

export const MateriaData = {
  getAll: () => http<Materia[]>("/api/materias/"),
  show: (id: number) => http<Materia>(`/api/materias/${id}/`),
  create: (materia: Partial<Materia>) =>
    http<Materia>("/api/materias/", { method: "POST", body: JSON.stringify(materia) }),
  update: (id: number, materia: Partial<Materia>) =>
    http<Materia>(`/api/materias/${id}/`, { method: "PUT", body: JSON.stringify(materia) }),
  patch: (id: number, materia: Partial<Materia>) =>
    http<Materia>(`/api/materias/${id}/`, { method: "PATCH", body: JSON.stringify(materia) }),
  delete: (id: number) => http<void>(`/api/materias/${id}/`, { method: "DELETE" }),
};
