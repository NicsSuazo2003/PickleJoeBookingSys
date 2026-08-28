import { APP_CONFIG } from '@/utils/constants';

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const BASE_URL = APP_CONFIG.apiUrl;

const CLIENT_SUBDOMAIN = import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'picklejoe';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // ✅ Ensure path starts with /api
  const fullPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${BASE_URL}${fullPath}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client-Subdomain': CLIENT_SUBDOMAIN,
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}