// ============================================================================
// Shared CORS Configuration
// Import this in every Edge Function for consistent CORS handling
// ============================================================================

const appUrlEnv = Deno.env.get("APP_URL") || "http://localhost:3000";

function extractOrigins(url: string): string[] {
  try {
    const parsed = new URL(url);
    return [`${parsed.protocol}//${parsed.host}`];
  } catch {
    return [];
  }
}

const ALLOWED_ORIGINS = [
  ...appUrlEnv.split(",").map((s) => s.trim()).filter(Boolean).flatMap(extractOrigins),
  ...appUrlEnv.split(",").map((s) => s.trim()).filter(Boolean),
  "http://localhost:3000",
  "http://localhost:5173",
];

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : "";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, stripe-signature",
    "Access-Control-Max-Age": "86400",
    // SEC 4: Prevent MIME sniffing on all responses
    "X-Content-Type-Options": "nosniff",
  };

  // Only set origin + credentials when origin is allowed (BUG D fix)
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function jsonResponse(
  data: unknown,
  status: number,
  req?: Request
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }
  return null;
}

// ============================================================================
// Request Validation Helpers
// ============================================================================

const MAX_BODY_SIZE = 1024 * 1024; // 1MB

export async function safeReadBody(req: Request): Promise<string> {
  const contentLength = parseInt(
    req.headers.get("content-length") || "0",
    10
  );
  if (contentLength > MAX_BODY_SIZE) {
    throw new Error("Request body too large");
  }
  const body = await req.text();
  if (body.length > MAX_BODY_SIZE) {
    throw new Error("Request body too large");
  }
  return body;
}

// ============================================================================
// Input Sanitization
// ============================================================================

export function sanitizeString(
  input: unknown,
  maxLength: number = 5000
): string {
  if (typeof input !== "string") return "";
  return input.slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

export function validateRequired(
  obj: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

// ============================================================================
// Timeout Wrapper for External API Calls
// ============================================================================

export async function fetchWithTimeout(
  url: string | URL | Request,
  init?: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Error Response (sanitized - no internal details leaked)
// ============================================================================

export function errorResponse(
  message: string,
  status: number,
  req?: Request,
  details?: unknown
): Response {
  // Log the full error server-side
  if (details) {
    console.error("Error details:", details);
  }

  // Never expose internal error details to client
  return jsonResponse({ error: message }, status, req);
}

// ============================================================================
// Rate Limit Key Generator
// ============================================================================

export function getRateLimitKey(userId: string, endpoint: string): string {
  return `${userId}:${endpoint}`;
}

// ============================================================================
// Snake_case to camelCase Converter
// ============================================================================

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function snakeToCamel<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as T;
  }
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = snakeToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}
