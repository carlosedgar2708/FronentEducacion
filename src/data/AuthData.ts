// src/data/AuthData.ts
import { http } from "./http";

export type LoginResponse = {
  token: string;
  user: any; // si quieres lo tipamos con Usuario
};

export const AuthData = {
  login(correo: string, password: string) {
    return http.post<LoginResponse>("/auth/login/", { correo, password });
  },
};
