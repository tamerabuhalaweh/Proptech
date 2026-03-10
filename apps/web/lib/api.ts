import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Token storage helpers
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Track refresh state to avoid concurrent refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 + auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/en/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/en/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }) => {
    const { data } = await api.post("/api/auth/register", payload);
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  logout: () => {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/en/login";
    }
  },
  me: async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
  },
};

// Properties API
export const propertiesApi = {
  list: async (params?: {
    search?: string;
    type?: string[];
    status?: string[];
    city?: string[];
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const { data } = await api.get("/api/properties", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/properties/${id}`);
    return data;
  },
  create: async (payload: {
    name: string;
    nameAr?: string;
    description?: string;
    type: string;
    location?: string;
    city?: string;
    coverImageUrl?: string;
  }) => {
    const { data } = await api.post("/api/properties", payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.patch(`/api/properties/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/properties/${id}`);
    return data;
  },
};

// Buildings API
export const buildingsApi = {
  list: async (propertyId: string) => {
    const { data } = await api.get(
      `/api/properties/${propertyId}/buildings`
    );
    return data;
  },
  create: async (
    propertyId: string,
    payload: { name: string; nameAr?: string; floors: number }
  ) => {
    const { data } = await api.post(
      `/api/properties/${propertyId}/buildings`,
      payload
    );
    return data;
  },
};

// Units API
export const unitsApi = {
  listByBuilding: async (
    buildingId: string,
    params?: {
      status?: string[];
      type?: string[];
      page?: number;
      perPage?: number;
    }
  ) => {
    const { data } = await api.get(`/api/buildings/${buildingId}/units`, {
      params,
    });
    return data;
  },
  listAll: async (params?: {
    propertyId?: string;
    buildingId?: string;
    status?: string[];
    type?: string[];
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const { data } = await api.get("/api/units", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/units/${id}`);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.patch(`/api/units/${id}`, payload);
    return data;
  },
  changeStatus: async (id: string, status: string, note?: string) => {
    const { data } = await api.patch(`/api/units/${id}/status`, {
      status,
      note,
    });
    return data;
  },
  create: async (
    buildingId: string,
    payload: {
      number: string;
      floor: number;
      type: string;
      area: number;
      price?: number;
    }
  ) => {
    const { data } = await api.post(`/api/buildings/${buildingId}/units`, payload);
    return data;
  },
};

// Dashboard API
export const dashboardApi = {
  stats: async () => {
    const { data } = await api.get("/api/dashboard/stats");
    return data;
  },
  activity: async () => {
    const { data } = await api.get("/api/dashboard/activity");
    return data;
  },
  topProperties: async () => {
    const { data } = await api.get("/api/dashboard/top-properties");
    return data;
  },
};

// Leads API
export const leadsApi = {
  list: async (params?: {
    stage?: string[];
    score?: string;
    source?: string[];
    agentId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }) => {
    const { data } = await api.get("/api/leads", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/leads/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/leads", payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.patch(`/api/leads/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/api/leads/${id}`);
    return data;
  },
  changeStage: async (id: string, stage: string, note?: string) => {
    const { data } = await api.patch(`/api/leads/${id}/stage`, { stage, note });
    return data;
  },
  assign: async (id: string, agentId: string) => {
    const { data } = await api.post(`/api/leads/${id}/assign`, { agentId });
    return data;
  },
  getActivities: async (id: string) => {
    const { data } = await api.get(`/api/leads/${id}/activities`);
    return data;
  },
  createActivity: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/api/leads/${id}/activities`, payload);
    return data;
  },
  pipelineStats: async () => {
    const { data } = await api.get("/api/leads/pipeline/stats");
    return data;
  },
};

// Settings / Tenant API
export const settingsApi = {
  getTenant: async (id: string) => {
    const { data } = await api.get(`/api/tenants/${id}`);
    return data;
  },
  updateTenant: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/api/tenants/${id}`, payload);
    return data;
  },
  getUsers: async (tenantId: string) => {
    const { data } = await api.get(`/api/tenants/${tenantId}/users`);
    return data;
  },
  inviteUser: async (tenantId: string, payload: { email: string; role: string }) => {
    const { data } = await api.post(`/api/tenants/${tenantId}/users/invite`, payload);
    return data;
  },
  getRoles: async (tenantId: string) => {
    const { data } = await api.get(`/api/tenants/${tenantId}/roles`);
    return data;
  },
  getSessions: async (tenantId: string) => {
    const { data } = await api.get(`/api/tenants/${tenantId}/sessions`);
    return data;
  },
  revokeSession: async (tenantId: string, sessionId: string) => {
    const { data } = await api.delete(`/api/tenants/${tenantId}/sessions/${sessionId}`);
    return data;
  },
};

// Bookings API
export const bookingsApi = {
  list: async (params?: {
    status?: string[];
    search?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const { data } = await api.get("/api/bookings", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/bookings/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/bookings", payload);
    return data;
  },
  confirm: async (id: string) => {
    const { data } = await api.patch(`/api/bookings/${id}/confirm`);
    return data;
  },
  cancel: async (id: string, reason: string) => {
    const { data } = await api.patch(`/api/bookings/${id}/cancel`, { reason });
    return data;
  },
  complete: async (id: string) => {
    const { data } = await api.patch(`/api/bookings/${id}/complete`);
    return data;
  },
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: async () => {
    const { data } = await api.get("/api/subscriptions/current");
    return data;
  },
  getUsage: async () => {
    const { data } = await api.get("/api/subscriptions/usage");
    return data;
  },
  upgrade: async (planKey: string) => {
    const { data } = await api.patch("/api/subscriptions/upgrade", { plan: planKey });
    return data;
  },
  downgrade: async (planKey: string) => {
    const { data } = await api.patch("/api/subscriptions/downgrade", { plan: planKey });
    return data;
  },
};

// Lead Duplicates API
export const leadDuplicatesApi = {
  checkDuplicates: async (payload: { name: string; email?: string; phone: string }) => {
    const { data } = await api.post("/api/leads/check-duplicates", payload);
    return data;
  },
  mergeLeads: async (targetId: string, sourceId: string, fields: Record<string, string>) => {
    const { data } = await api.post(`/api/leads/${targetId}/merge/${sourceId}`, { fields });
    return data;
  },
};

// Campaigns API
export const campaignsApi = {
  list: async (params?: {
    status?: string[];
    search?: string;
    page?: number;
    perPage?: number;
  }) => {
    const { data } = await api.get("/api/campaigns", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/campaigns/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/campaigns", payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.patch(`/api/campaigns/${id}`, payload);
    return data;
  },
};

// Locale API
export const localeApi = {
  getSettings: async () => {
    const { data } = await api.get("/api/locale");
    return data;
  },
  updateSettings: async (payload: Record<string, unknown>) => {
    const { data } = await api.patch("/api/locale", payload);
    return data;
  },
  toHijri: async (date: string) => {
    const { data } = await api.get(`/api/locale/hijri/${date}`);
    return data;
  },
};

// Communications API
export const communicationsApi = {
  list: async (params?: {
    type?: string[];
    direction?: string;
    status?: string[];
    search?: string;
    page?: number;
    perPage?: number;
  }) => {
    const { data } = await api.get("/api/communications", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/communications/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/communications", payload);
    return data;
  },
};

// Email Templates API
export const emailTemplatesApi = {
  list: async (params?: {
    category?: string[];
    search?: string;
    page?: number;
    perPage?: number;
  }) => {
    const { data } = await api.get("/api/email-templates", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/email-templates/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/email-templates", payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.patch(`/api/email-templates/${id}`, payload);
    return data;
  },
  send: async (id: string, payload: { recipientEmail: string; leadId?: string; variables?: Record<string, string> }) => {
    const { data } = await api.post(`/api/email-templates/${id}/send`, payload);
    return data;
  },
};

// Documents API
export const documentsApi = {
  list: async (params?: {
    category?: string[];
    entityType?: string[];
    search?: string;
    isArchived?: boolean;
    page?: number;
    perPage?: number;
  }) => {
    const { data } = await api.get("/api/documents", { params });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/documents/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post("/api/documents", payload);
    return data;
  },
  archive: async (id: string) => {
    const { data } = await api.patch(`/api/documents/${id}/archive`);
    return data;
  },
  unarchive: async (id: string) => {
    const { data } = await api.patch(`/api/documents/${id}/unarchive`);
    return data;
  },
};

// Notifications API
export const notificationsApi = {
  list: async (params?: { page?: number; perPage?: number }) => {
    const { data } = await api.get("/api/notifications", { params });
    return data;
  },
  unreadCount: async () => {
    const { data } = await api.get("/api/notifications/unread-count");
    return data;
  },
  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/api/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await api.patch("/api/notifications/read-all");
    return data;
  },
};

// Milestones API
export const milestonesApi = {
  list: async (bookingId: string) => {
    const { data } = await api.get(`/api/bookings/${bookingId}/milestones`);
    return data;
  },
  create: async (bookingId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/api/bookings/${bookingId}/milestones`, payload);
    return data;
  },
  recordPayment: async (bookingId: string, milestoneId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/api/bookings/${bookingId}/milestones/${milestoneId}/payment`, payload);
    return data;
  },
  generateInstallments: async (bookingId: string, payload: { totalAmount: number; numberOfInstallments: number; startDate: string }) => {
    const { data } = await api.post(`/api/bookings/${bookingId}/milestones/generate`, payload);
    return data;
  },
};

export { setTokens, clearTokens, getAccessToken };
