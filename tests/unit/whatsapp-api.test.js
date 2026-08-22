import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/lib/api-client.js';
import {
  getConnectionApi,
  connectConnectionApi,
  updateConnectionApi,
  disconnectConnectionApi,
  sendMessageApi,
  getMessagesApi,
  retryWebhooksApi,
} from '../../src/lib/api/whatsapp.api.js';

vi.mock('../../src/lib/api-client.js', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('Module 9 WhatsApp API Layer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getConnectionApi should call GET /whatsapp/connection', async () => {
    apiClient.get.mockResolvedValueOnce({ id: 'c1' });
    await getConnectionApi();
    expect(apiClient.get).toHaveBeenCalledWith('/whatsapp/connection');
  });

  it('connectConnectionApi should call POST /whatsapp/connection', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'c1' });
    await connectConnectionApi({ provider: 'MOCK', providerAccountId: 'waba1', providerPhoneNumberId: '+201' });
    expect(apiClient.post).toHaveBeenCalledWith('/whatsapp/connection', {
      provider: 'MOCK',
      providerAccountId: 'waba1',
      providerPhoneNumberId: '+201',
    });
  });

  it('updateConnectionApi should call PATCH /whatsapp/connection', async () => {
    apiClient.patch.mockResolvedValueOnce({ id: 'c1', displayName: 'X' });
    await updateConnectionApi({ displayName: 'X' });
    expect(apiClient.patch).toHaveBeenCalledWith('/whatsapp/connection', { displayName: 'X' });
  });

  it('disconnectConnectionApi should call DELETE /whatsapp/connection', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'disconnected' });
    await disconnectConnectionApi();
    expect(apiClient.delete).toHaveBeenCalledWith('/whatsapp/connection');
  });

  it('sendMessageApi should call POST /whatsapp/messages', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'm1' });
    await sendMessageApi({ to: '+2010', text: 'Hi' });
    expect(apiClient.post).toHaveBeenCalledWith('/whatsapp/messages', { to: '+2010', text: 'Hi' });
  });

  it('getMessagesApi should call GET /whatsapp/messages with params', async () => {
    apiClient.get.mockResolvedValueOnce({ items: [] });
    await getMessagesApi({ page: 1, limit: 10, direction: 'INBOUND' });
    expect(apiClient.get).toHaveBeenCalledWith('/whatsapp/messages', {
      params: { page: 1, limit: 10, direction: 'INBOUND' },
    });
  });

  it('retryWebhooksApi should call POST /whatsapp/webhooks/retry', async () => {
    apiClient.post.mockResolvedValueOnce({ retriedCount: 1 });
    await retryWebhooksApi();
    expect(apiClient.post).toHaveBeenCalledWith('/whatsapp/webhooks/retry');
  });
});