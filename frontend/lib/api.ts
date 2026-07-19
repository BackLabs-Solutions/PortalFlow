import { getToken, clearToken } from './auth';
import type { User, Project, ProjectFile, ChecklistItem, Message, PortalData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portalflow.onrender.com';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && typeof window !== 'undefined' && token) {
    clearToken();
    window.location.href = '/login';
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  sendMagicLink: (email: string) =>
    request<{ message: string }>('/auth/sendMagicLink', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyToken: (token: string) =>
    request<{ user: User; token: string }>('/auth/verifyToken', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getMe: () => request<User>('/auth/me'),

  generateApiKey: () =>
    request<{ apiKey: string }>('/auth/generate-api-key', { method: 'POST' }),

  getProfile: () => request<User>('/users/profile'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'logoUrl' | 'brandColor' | 'customDomain'>>) =>
    request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

  getReferral: () =>
    request<{ referralCode: string; referralCount: number }>('/users/referral'),

  getProjects: (status?: string) =>
    request<Project[]>(`/projects${status ? `?status=${status}` : ''}`),

  getProject: (id: string) => request<Project>(`/projects/${id}`),

  createProject: (data: { name: string; description?: string; clientEmail?: string; clientName?: string }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  updateProject: (id: string, data: Partial<Pick<Project, 'name' | 'description' | 'status'>>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProject: (id: string) => request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  getFiles: (projectId: string) => request<ProjectFile[]>(`/projects/${projectId}/files`),

  addFile: (projectId: string, file: File, uploadedBy = 'freelancer') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);
    return request<ProjectFile>(`/projects/${projectId}/files`, { method: 'POST', body: formData });
  },

  deleteFile: (fileId: string) => request<{ message: string }>(`/files/${fileId}`, { method: 'DELETE' }),

  getChecklist: (projectId: string) => request<ChecklistItem[]>(`/projects/${projectId}/checklist`),

  createChecklistItem: (projectId: string, data: { title: string; description?: string }) =>
    request<ChecklistItem>(`/projects/${projectId}/checklist`, { method: 'POST', body: JSON.stringify(data) }),

  updateChecklistItem: (itemId: string, data: Partial<Pick<ChecklistItem, 'status' | 'approvedBy' | 'title' | 'description'>>) =>
    request<ChecklistItem>(`/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),

  getMessages: (projectId: string) => request<Message[]>(`/projects/${projectId}/messages`),

  createMessage: (projectId: string, data: { content: string; userEmail?: string }) =>
    request<Message>(`/projects/${projectId}/messages`, { method: 'POST', body: JSON.stringify(data) }),

  // Public client-portal endpoints — no auth token attached
  getPortal: (projectId: string) =>
    fetch(`${API_BASE_URL}/portal/${projectId}`).then((r) => {
      if (!r.ok) throw new ApiError(r.status, 'Project not found');
      return r.json() as Promise<PortalData>;
    }),

  approvePortalItem: (projectId: string, itemId: string, data: { status: 'approved' | 'rejected'; approvedBy: string }) =>
    fetch(`${API_BASE_URL}/portal/${projectId}/checklist/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new ApiError(r.status, 'Failed to update item');
      return r.json() as Promise<ChecklistItem>;
    }),

  createPortalMessage: (projectId: string, data: { content: string; userEmail?: string }) =>
    fetch(`${API_BASE_URL}/portal/${projectId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new ApiError(r.status, 'Failed to send message');
      return r.json() as Promise<Message>;
    }),
};
