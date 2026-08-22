import { isSupabaseConfigured, supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Request cache (TTL-based, scoped per user)
const requestCache = new Map<string, { data: unknown; timestamp: number; userId?: string }>();
const CACHE_TTL = 30_000; // 30 seconds

// Pending request deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

// Clear cache on sign-out to prevent cross-user data leakage
if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      requestCache.clear();
      pendingRequests.clear();
    }
  });
}

export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    queryParams?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, queryParams } = options;

  if (!isSupabaseConfigured || !SUPABASE_URL) {
    throw new Error('Backend services are not configured for this deployment.');
  }

  // Offline check
  if (!navigator.onLine) {
    throw new Error('You are offline. Please check your connection.');
  }

  // Build cache key for GET requests (include user ID to prevent cross-user leakage)
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || 'anon';
  const cacheKey = method === 'GET'
    ? `${functionName}:${userId}:${JSON.stringify(queryParams || {})}`
    : null;

  // Check cache for GET requests
  if (cacheKey) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  // Deduplicate concurrent identical GET requests
  if (cacheKey && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  let url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const requestPromise = fetch(url, {
    method,
    headers,
    body: method === 'POST' && body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `Edge function ${functionName} failed (${res.status})`);
    }
    const data = await res.json();

    // Cache GET responses
    if (cacheKey) {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      pendingRequests.delete(cacheKey);
    }

    return data;
  }).catch((err) => {
    // Clean up pending request on error
    if (cacheKey) {
      pendingRequests.delete(cacheKey);
    }
    throw err;
  });

  // Store pending request for deduplication
  if (cacheKey) {
    pendingRequests.set(cacheKey, requestPromise);
  }

  return requestPromise as Promise<T>;
}

// Export cache invalidation helper
export function invalidateCache(functionName?: string) {
  if (functionName) {
    for (const key of requestCache.keys()) {
      if (key.startsWith(functionName + ':')) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
}
