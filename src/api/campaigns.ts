import api from '@/lib/api';

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

export const uploadCampaignImage = async (file: File, folder = 'campaigns'): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, GIF, WebP).');
  }
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image must be 5MB or smaller.');
  }

  const dataUrl = await readFileAsDataUrl(file);
  const res = await api.post<{ success: boolean; url: string }>('/api/admin/campaigns/upload-image', {
    dataUrl,
    fileName: file.name,
    folder,
  });
  return res.data.url;
};

export interface CampaignTemplateFields {
  title: string;
  subtitle: string;
  body: string;
  buttonText: string;
  buttonUrl?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  previewImage?: string;
  content?: string;
  fields?: CampaignTemplateFields | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastEdited?: string;
}

export interface UnsubscribedUser {
  id: string;
  name: string;
  email: string;
  date: string;
  sourceCampaign: string;
  campaignId?: string | null;
}

export interface CampaignUserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AudiencePreviewRecipient {
  id?: string | null;
  name: string;
  email: string;
}

export interface AudiencePreviewResponse {
  success: boolean;
  count: number;
  sample?: AudiencePreviewRecipient[];
  recipients?: AudiencePreviewRecipient[];
}

export const getCampaigns = (filters?: Record<string, string | undefined>) =>
  api.get('/api/admin/campaigns', {
    params: filters,
  });

export const getCampaign = (id: string) =>
  api.get(`/api/admin/campaigns/${id}`);

export const createCampaign = (data: Record<string, unknown>) =>
  api.post('/api/admin/campaigns', data);

export const updateCampaign = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/admin/campaigns/${id}`, data);

export const deleteCampaign = (id: string) =>
  api.delete(`/api/admin/campaigns/${id}`);

export const sendCampaign = (id: string) =>
  api.post(`/api/admin/campaigns/${id}/send`);

export const sendTestEmail = (id: string, email: string) =>
  api.post(`/api/admin/campaigns/${id}/test`, { email });

export const getAudiencePreview = (filters: Record<string, unknown>) =>
  api.post<AudiencePreviewResponse>('/api/admin/campaigns/audience-preview', filters);

export const searchCampaignUsers = (q?: string, role?: string) =>
  api.get<{ success: boolean; users: CampaignUserOption[]; total: number }>('/api/admin/campaigns/users/search', {
    params: {
      q: q || undefined,
      role: role && role !== 'all' ? role : undefined,
    },
  });

// Templates API
export const getTemplates = () =>
  api.get<{ success: boolean; templates: CampaignTemplate[] }>('/api/admin/campaigns/templates');

export const createTemplate = (data: Partial<CampaignTemplate>) =>
  api.post<{ success: boolean; template: CampaignTemplate }>('/api/admin/campaigns/templates', data);

export const updateTemplate = (id: string, data: Partial<CampaignTemplate>) =>
  api.put<{ success: boolean; template: CampaignTemplate }>(`/api/admin/campaigns/templates/${id}`, data);

export const deleteTemplate = (id: string) =>
  api.delete<{ success: boolean; id: string; deleted: boolean }>(`/api/admin/campaigns/templates/${id}`);

// Unsubscribes API
export const getUnsubscribes = () =>
  api.get<{ success: boolean; unsubscribes: UnsubscribedUser[] }>('/api/admin/campaigns/unsubscribes');

export const resubscribeUser = (id: string) =>
  api.delete<{ success: boolean; id: string; resubscribed: boolean }>(`/api/admin/campaigns/unsubscribes/${id}`);

export const processUnsubscribeToken = (token: string) =>
  api.post<{ success: boolean; email: string }>('/api/campaigns/unsubscribe', { token });
