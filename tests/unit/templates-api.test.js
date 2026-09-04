import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getTemplatesApi,
  updateTemplatesApi,
  resetTemplatesApi,
  createTemplateApi,
  deleteTemplateApi,
} from '../../src/lib/api/templates.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('Templates API Client Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getTemplatesApi should call GET /restaurant/templates', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [] });
    const res = await getTemplatesApi();
    expect(apiClient.get).toHaveBeenCalledWith('/restaurant/templates');
    expect(res).toEqual({ data: [] });
  });

  it('updateTemplatesApi should call PATCH /restaurant/templates with payload', async () => {
    const payload = { templates: { WHATSAPP_WELCOME: 'أهلاً بكم في فرعنا الجديد' } };
    apiClient.patch.mockResolvedValueOnce({ data: { message: 'Updated' } });
    const res = await updateTemplatesApi(payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/restaurant/templates', payload);
    expect(res.data.message).toBe('Updated');
  });

  it('createTemplateApi should call POST /restaurant/templates with custom template payload', async () => {
    const payload = {
      title: 'قالب تأخير',
      category: 'INBOX_SUPPORT',
      text: 'نعتذر عن التأخير {{customerName}}',
    };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: { key: 'CUSTOM_DELAY' } } });
    const res = await createTemplateApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/restaurant/templates', payload);
    expect(res.data.data.key).toBe('CUSTOM_DELAY');
  });

  it('deleteTemplateApi should call DELETE /restaurant/templates/:key', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { success: true } });
    const res = await deleteTemplateApi('CUSTOM_DELAY');
    expect(apiClient.delete).toHaveBeenCalledWith('/restaurant/templates/CUSTOM_DELAY');
    expect(res.data.success).toBe(true);
  });

  it('resetTemplatesApi should call POST /restaurant/templates/reset with specific key', async () => {
    const payload = { key: 'WHATSAPP_WELCOME' };
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Reset' } });
    const res = await resetTemplatesApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/restaurant/templates/reset', payload);
    expect(res.data.message).toBe('Reset');
  });

  it('resetTemplatesApi should call POST /restaurant/templates/reset with resetAll', async () => {
    const payload = { resetAll: true };
    apiClient.post.mockResolvedValueOnce({ data: { message: 'All Reset' } });
    const res = await resetTemplatesApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/restaurant/templates/reset', payload);
    expect(res.data.message).toBe('All Reset');
  });
});

