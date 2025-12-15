export type SesionEstudio = {
  id: number;
  Usuarios_id: number;
  Materias_id: number;
  Planes_id: number | null;

  Nombre: string;
  descripcion: string;
  duracion: number;
  estado: boolean;

  // 👇 NECESARIOS para el calendario
  fecha: string;       // "2025-12-15"
  hora_inicio: string; // "08:30"

  created_at?: string;
  updated_at?: string;
};
