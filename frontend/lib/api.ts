import axios, { type AxiosInstance } from "axios";

/**
 * Pre-configured axios instance pointing at the FastAPI backend.
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 120_000, // 2 min — Render free-tier cold starts can take 30-50s
});

/**
 * Upload a FormData payload to the given endpoint and return the response as
 * a Blob (for file downloads).
 */
export async function uploadFile(
  endpoint: string,
  formData: FormData,
): Promise<Blob> {
  const response = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
  });
  return response.data as Blob;
}

/**
 * Post FormData to an endpoint and return JSON (used by password-generate).
 */
export async function postForm<T = unknown>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  const response = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as T;
}

export default api;
