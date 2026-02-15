/**
 * Centralized API Client for Mubasharat Frontend
 * Communicates with standalone backend server on port 5000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://b-ahlamy.developteam.site";
  // process.env.NEXT_PUBLIC_API_URL || "https://b-ahlamy.developteam.site/api";

/**
 * Backend origin for WebSocket (Socket.io). Set NEXT_PUBLIC_SOCKET_URL in production
 * to your backend URL (e.g. https://api.example.com). Defaults to http://localhost:5000 for dev.
 */
export function getSocketServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && (apiUrl.startsWith("http://") || apiUrl.startsWith("https://"))) {
    return apiUrl.replace(/\/api\/?$/, "") || apiUrl;
  }
  return "http://localhost:5000";
}

// ============================================
// TypeScript Interfaces
// ============================================

/**
 * User interface representing the current authenticated user
 */
export interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Profile interface with additional user information
 */
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  isAvailable: boolean;
  totalInterpretations: number;
  rating: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  currentPlan?: {
    id: string;
    name: string;
    price: string;
    currency: string;
    letterQuota: number | null;
  } | null;
  subscription?: {
    id: string;
    planId: string;
    startedAt: string;
    expiresAt: string | null;
    lettersUsed: number;
    audioMinutesUsed: number;
    plan: {
      id: string;
      name: string;
      price: string;
      currency: string;
      letterQuota: number | null;
    } | null;
  } | null;
}

export function buildApiUrl(path: string) {
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

const AUTH_TOKEN_COOKIE_NAME = "auth_token";

/**
 * Get auth token from cookies (for client-side use)
 */
export function getAuthTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === AUTH_TOKEN_COOKIE_NAME && value) {
      return value;
    }
  }
  return null;
}

/**
 * Clear the auth_token cookie (e.g. when backend returns "Invalid or expired token")
 */
export function clearAuthTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Fetch from the external API with auth token in Authorization header.
 * Use this when calling the backend from the client: the auth_token cookie is
 * set on the app domain, so cross-origin requests must send the token as Bearer.
 */
export function fetchWithAuth(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthTokenFromCookie();
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(buildApiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });
}

/**
 * Base fetch wrapper with error handling
 */
export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;

  // Prepare headers with authentication if needed
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Try to get token from cookie and add to Authorization header as fallback
  if (authenticated) {
    const token = getAuthTokenFromCookie();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildApiUrl(path), {
    credentials: authenticated ? "include" : "same-origin",
    headers,
    ...fetchOptions,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    if (response.status === 401 && data?.error === "Invalid or expired token") {
      clearAuthTokenCookie();
    }
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data;
}

// ============================================
// Authentication API
// ============================================

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role: "dreamer" | "interpreter";
  }) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () => apiFetch("/auth/logout", { method: "POST" }),

  getCurrentUser: () => apiFetch<{ user: User; profile: Profile }>("/auth/me"),
};

// ============================================
// Convenience Functions (for backward compatibility)
// ============================================

/**
 * Login a user with email and password
 * Calls same-origin Next.js API route so the route can set auth_token cookie on this domain.
 * (apiFetch uses buildApiUrl which points to the external backend - we must hit our own /api/auth/login.)
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: User; profile: Profile } | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const contentType = response.headers.get("content-type");
    const data =
      contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  fullName: string,
  role: "dreamer" | "interpreter" = "dreamer"
): Promise<{ user: User; profile: Profile } | null> {
  try {
    // Use Next.js API route for cookie handling
    return await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, role }),
    });
  } catch (error) {
    console.error("[Auth] Registration error:", error);
    return null;
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<boolean> {
  try {
    await authApi.logout();
    return true;
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return false;
  }
}

/**
 * Get the current authenticated user
 * Calls same-origin Next.js API route so the cookie is sent; route forwards to backend.
 */
export async function getCurrentUser(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get user");
    return data;
  } catch (error) {
    console.error("[Auth] Get current user error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// ============================================
// Profile API
// ============================================

export const profileApi = {
  update: (data: { fullName?: string; bio?: string }) =>
    apiFetch("/profile/update", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  toggleAvailability: () =>
    apiFetch("/profile/availability", { method: "PATCH" }),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(buildApiUrl("/profile/upload-avatar"), {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  },
};

// ============================================
// Dreams API
// ============================================

export const dreamsApi = {
  getAll: (params?: { status?: string; limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any)}` : "";
    return apiFetch(`/dreams${query}`);
  },

  getById: (id: string) => apiFetch(`/dreams/${id}`),

  create: (data: {
    title: string;
    content: string;
    dreamDate?: string;
    mood?: string;
  }) =>
    apiFetch("/dreams", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      status: string;
      interpretation: string;
    }>
  ) =>
    apiFetch(`/dreams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiFetch(`/dreams/${id}`, { method: "DELETE" }),

  getStats: () => apiFetch("/dreams/stats"),
};

// ============================================
// Messages API
// ============================================

export const messagesApi = {
  getByDream: (dreamId: string) => apiFetch(`/messages?dream_id=${dreamId}`),

  send: (data: {
    dreamId: string;
    content: string;
    messageType?: "text" | "interpretation" | "inquiry";
  }) =>
    apiFetch("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiFetch(`/messages/${id}`, { method: "DELETE" }),
};

// ============================================
// Comments API
// ============================================

export const commentsApi = {
  getByDream: (dreamId: string) => apiFetch(`/api/comments?dream_id=${dreamId}`),

  create: (data: { dreamId: string; content: string }) =>
    apiFetch("/api/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================
// Requests API
// ============================================

export const requestsApi = {
  getAll: (params?: { status?: string }) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return apiFetch(`/requests${query}`);
  },

  getById: (id: string) => apiFetch(`/requests/${id}`),

  create: (data: {
    dreamId: string;
    title: string;
    description?: string;
    budget?: number;
  }) =>
    apiFetch("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      status?: string;
      interpreterId?: string;
    }
  ) =>
    apiFetch(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ============================================
// Chat API
// ============================================

export const chatApi = {
  getMessages: (requestId: string) => apiFetch(`/chat?request_id=${requestId}`),

  sendMessage: (data: {
    requestId: string;
    content: string;
    messageType?: "text" | "interpretation" | "inquiry" | "file";
  }) =>
    apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================
// Notifications API
// ============================================

export const notificationsApi = {
  getAll: () => apiFetch("/notifications"),
};

// ============================================
// Plans API
// ============================================

export const plansApi = {
  getAll: () => apiFetch("/plans"),

  subscribe: (planId: string) =>
    apiFetch("/plans/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),
};

// ============================================
// Admin API
// ============================================

export const adminApi = {
  getStats: () => apiFetch("/admin/stats"),

  getAllUsers: () => apiFetch("/admin/users"),

  createUser: (data: {
    email: string;
    password: string;
    fullName?: string;
    role: "dreamer" | "interpreter" | "admin" | "super_admin";
    isAvailable?: boolean;
  }) =>
    apiFetch("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (userId: string, data: {
    fullName?: string | null;
    role?: string;
    isAvailable?: boolean;
    totalInterpretations?: number;
    rating?: number;
  }) =>
    apiFetch(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    apiFetch(`/admin/users/${userId}`, {
      method: "DELETE",
    }),

  makeSuperAdmin: (userId: string) =>
    apiFetch("/admin/make-super-admin", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

// Export all APIs as a single object for convenience
export const api = {
  auth: authApi,
  profile: profileApi,
  dreams: dreamsApi,
  messages: messagesApi,
  comments: commentsApi,
  requests: requestsApi,
  chat: chatApi,
  notifications: notificationsApi,
  plans: plansApi,
  admin: adminApi,
};

export default api;
