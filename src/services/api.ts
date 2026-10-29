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

  get userMessage(): string {
    const b = this.body as { message?: string } | string | undefined;
    if (typeof b === 'string' && b.trim()) return b;
    if (b && typeof b === 'object' && typeof b.message === 'string' && b.message.trim()) {
      return b.message;
    }
    return this.message;
  }
}

const BASE_URL = APP_CONFIG.apiUrl;
const CLIENT_SUBDOMAIN = import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'picklejoe';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const fullPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${BASE_URL}${fullPath}`;

  const token = localStorage.getItem('admin_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Client-Subdomain': CLIENT_SUBDOMAIN,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // ✅ Clone the response so we can safely read it multiple times without
      //    "body stream already read" errors.
      const cloned = res.clone();
      let body: unknown;

      // Try JSON first (most error responses are JSON)
      try {
        body = await cloned.json();
      } catch {
        // If JSON parsing fails, read the original response as text
        try {
          body = await res.text();
        } catch {
          body = undefined;
        }
      }

      throw new ApiError(
        `Request failed: ${res.status} ${res.statusText}`,
        res.status,
        body
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out — the server may be waking up, please try again', 0);
    }
    throw err;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}