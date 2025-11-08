const DEFAULT_BACKEND_URL = "http://127.0.0.1:8080";

export function getBackendUrl() {
  let base: string;
  
  if (typeof window !== "undefined") {
    base = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  } else {
    base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  }
  
  // Clean trailing slashes
  base = base.replace(/\/$/, "");
  
  // Ensure /api suffix
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  
  return base;
}

export async function fetchJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const base = getBackendUrl();
  const response = await fetch(`${base}${path}`, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getBackendApiUrl(path: string): string {
  const base = getBackendUrl();
  return `${base}${path}`;
}

