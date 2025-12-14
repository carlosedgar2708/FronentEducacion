import type { GenerarCalendarioInput, GenerarCalendarioOutput } from "../entidades/GeneracionCalendario";
// import { http } from "./http";

const USE_MOCK = true;

export const IAData = {
  generarCalendario: async (input: GenerarCalendarioInput): Promise<GenerarCalendarioOutput> => {
    if (USE_MOCK) {
      // simulación: crea 3 sesiones simples a partir de la fecha
      return {
        sesiones: [
          { id: 1, Nombre: "Tema 1", descripcion: input.temas.slice(0, 40) || "Repaso", duracion: 60, fecha: input.fecha_presentacion, hora_inicio: "08:30" },
          { id: 2, Nombre: "Tema 2", descripcion: "Ejercicios", duracion: 90, fecha: input.fecha_presentacion, hora_inicio: "16:00" },
        ],
      };
    }

    // cuando esté listo:
    // return http<GenerarCalendarioOutput>("api/ia/generar/", { method: "POST", body: JSON.stringify(input) });

    return { sesiones: [] };
  },
};
