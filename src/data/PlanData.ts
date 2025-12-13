import { http } from "./http";
import type { Plan } from "../entidades/Plan";

export const PlanData = {
  getAll: () => http<Plan[]>("/api/planes/"),
  show: (id: number) => http<Plan>(`/api/planes/${id}/`),
  create: (plan: Partial<Plan>) =>
    http<Plan>("/api/planes/", { method: "POST", body: JSON.stringify(plan) }),
  update: (id: number, plan: Partial<Plan>) =>
    http<Plan>(`/api/planes/${id}/`, { method: "PUT", body: JSON.stringify(plan) }),
  patch: (id: number, plan: Partial<Plan>) =>
    http<Plan>(`/api/planes/${id}/`, { method: "PATCH", body: JSON.stringify(plan) }),
  delete: (id: number) => http<void>(`/api/planes/${id}/`, { method: "DELETE" }),
};
