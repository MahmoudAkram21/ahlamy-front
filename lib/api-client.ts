/**
 * Centralized API Client for Mubasharat Frontend
 * Communicates with standalone backend server on port 5000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function buildApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

/**
 * Base fetch wrapper with error handling
 */
export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;

  const response = await fetch(buildApiUrl(path), {
    credentials: authenticated ? "include" : "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...fetchOptions,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
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
    role: 'dreamer' | 'interpreter';
  }) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (credentials: { email: string; password: string }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  getCurrentUser: () => apiFetch('/auth/me'),
};

// ============================================
// Profile API
// ============================================

export const profileApi = {
  update: (data: { fullName?: string; bio?: string }) =>
    apiFetch('/profile/update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  toggleAvailability: () =>
    apiFetch('/profile/availability', { method: 'PATCH' }),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(buildApiUrl('/profile/upload-avatar'), {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
};

// ============================================
// Dreams API
// ============================================

export const dreamsApi = {
  getAll: (params?: { status?: string; limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return apiFetch(`/dreams${query}`);
  },

  getById: (id: string) => apiFetch(`/dreams/${id}`),

  create: (data: {
    title: string;
    content: string;
    dreamDate?: string;
    mood?: string;
  }) => apiFetch('/dreams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: Partial<{
    title: string;
    content: string;
    status: string;
    interpretation: string;
  }>) => apiFetch(`/dreams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch(`/dreams/${id}`, { method: 'DELETE' }),

  getStats: () => apiFetch('/dreams/stats'),
};

// ============================================
// Messages API
// ============================================

export const messagesApi = {
  getByDream: (dreamId: string) => apiFetch(`/messages?dream_id=${dreamId}`),

  send: (data: {
    dreamId: string;
    content: string;
    messageType?: 'text' | 'interpretation' | 'inquiry';
  }) => apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiFetch(`/messages/${id}`, { method: 'DELETE' }),
};

// ============================================
// Comments API
// ============================================

export const commentsApi = {
  getByDream: (dreamId: string) => apiFetch(`/comments?dream_id=${dreamId}`),

  create: (data: { dreamId: string; content: string }) =>
    apiFetch('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Requests API
// ============================================

export const requestsApi = {
  getAll: (params?: { status?: string }) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch(`/requests${query}`);
  },

  getById: (id: string) => apiFetch(`/requests/${id}`),

  create: (data: {
    dreamId: string;
    title: string;
    description?: string;
    budget?: number;
  }) => apiFetch('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: {
    status?: string;
    interpreterId?: string;
  }) => apiFetch(`/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// ============================================
// Chat API
// ============================================

export const chatApi = {
  getMessages: (requestId: string) =>
    apiFetch(`/chat?request_id=${requestId}`),

  sendMessage: (data: {
    requestId: string;
    content: string;
    messageType?: 'text' | 'interpretation' | 'inquiry' | 'file';
  }) => apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ============================================
// Notifications API
// ============================================

export const notificationsApi = {
  getAll: () => apiFetch('/notifications'),
};

// ============================================
// Plans API
// ============================================

export const plansApi = {
  getAll: () => apiFetch('/plans'),

  subscribe: (planId: string) =>
    apiFetch('/plans/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
};

// ============================================
// Admin API
// ============================================

export const adminApi = {
  getStats: () => apiFetch('/admin/stats'),

  getAllUsers: () => apiFetch('/admin/users'),

  makeSuperAdmin: (userId: string) =>
    apiFetch('/admin/make-super-admin', {
      method: 'POST',
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
