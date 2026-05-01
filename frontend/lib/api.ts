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

/**
 * Post FormData and return a parsed JSON response (used by video info).
 */
export async function postJSON<T = unknown>(
  endpoint: string,
  body: Record<string, string>,
): Promise<T> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    formData.append(key, value);
  }
  const response = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as T;
}

/**
 * Post FormData to an endpoint and trigger a browser file download from the
 * streamed response.  Keeps memory usage low for large files.
 */
export async function downloadStream(
  endpoint: string,
  body: Record<string, string>,
  fallbackFilename: string = "download",
): Promise<void> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    formData.append(key, value);
  }

  const response = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
    timeout: 300_000, // 5 min for large video downloads
  });

  // Extract filename from Content-Disposition header if available
  const disposition = response.headers["content-disposition"] as string | undefined;
  let filename = fallbackFilename;
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match) filename = match[1];
  }

  const blob = response.data as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default api;

