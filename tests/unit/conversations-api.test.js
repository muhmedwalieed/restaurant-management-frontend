import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getConversationsApi,
  getConversationApi,
  handoffConversationApi,
  closeConversationApi,
} from '../../src/lib/api/whatsapp.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 10 Conversations API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getConversationsApi should call GET /whatsapp/conversations with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getConversationsApi({ page: 1, limit: 10, status: 'ACTIVE' });
    expect(apiClient.get).toHaveBeenCalledWith('/whatsapp/conversations', {
      params: { page: 1, limit: 10, status: 'ACTIVE' },
    });
  });

  it('getConversationApi should call GET /whatsapp/conversations/:id', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'conv1' });
    await getConversationApi('conv1');
    expect(apiClient.get).toHaveBeenCalledWith('/whatsapp/conversations/conv1');
  });

  it('handoffConversationApi should call POST /whatsapp/conversations/:id/handoff', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'conv1', status: 'WAITING_AGENT' });
    await handoffConversationApi('conv1');
    expect(apiClient.post).toHaveBeenCalledWith('/whatsapp/conversations/conv1/handoff');
  });

  it('closeConversationApi should call POST /whatsapp/conversations/:id/close', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'conv1', status: 'CLOSED' });
    await closeConversationApi('conv1');
    expect(apiClient.post).toHaveBeenCalledWith('/whatsapp/conversations/conv1/close');
  });
});
