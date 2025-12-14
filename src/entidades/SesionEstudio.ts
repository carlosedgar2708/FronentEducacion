export interface SesionEstudio {
  id: number;
  Usuarios_id: number;
  usuario?: string;

  Materias_id: number;
  materia?: string;

  Planes_id: number | null;
  plan?: string;

  Nombre: string;
  descripcion: string;
  duracion: number;
  estado: boolean;

  created_at: string;
  updated_at: string;
}
