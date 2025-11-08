const DEFAULT_BACKEND_URL = "http://localhost:8080";

export function getBackendUrl() {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
      DEFAULT_BACKEND_URL
    );
  }

  return (
    process.env.BACKEND_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    DEFAULT_BACKEND_URL
  );
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

