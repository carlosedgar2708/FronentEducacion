export const API_URL = "http://192.168.0.3:8000"; 
// para emulador Android: "http://10.0.2.2:8000"; 
// Si usas celular físico: "http://192.168.x.x:8000"

export async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });


  if (res.status === 204) return undefined as T;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data as T;
}
