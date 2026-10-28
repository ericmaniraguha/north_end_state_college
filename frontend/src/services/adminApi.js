import { request } from './api.js';

const TOKEN_HEADER = 'X-Admin-Token';

export const verifyToken = (token) => request('/api/admin/summary', { headers: { [TOKEN_HEADER]: token } });

// Admin endpoints for a signed-in session. onUnauthorized runs when the token stops working.
export function createAdminApi(token, onUnauthorized) {
  const call = async (path, options = {}) => {
    try {
      return await request(`/api/admin${path}`, { ...options, headers: { [TOKEN_HEADER]: token } });
    } catch (err) {
      if (err.status === 401) onUnauthorized();
      throw err;
    }
  };

  return {
    summary: () => call('/summary'),

    applications: () => call('/applications'),
    createApplication: (data) => call('/applications', { method: 'POST', body: data }),
    setApplicationStatus: (ids, status) => call('/applications', { method: 'PATCH', body: { ids, status } }),
    saveApplicationNotes: (id, notes) => call(`/applications/${id}`, { method: 'PATCH', body: { notes } }),

    messages: () => call('/messages'),
    setMessageRead: (id, read) => call(`/messages/${id}`, { method: 'PATCH', body: { read } }),
    deleteMessage: (id) => call(`/messages/${id}`, { method: 'DELETE' }),

    // Sending by email, WhatsApp or SMS: data is { channel, subject?, body }
    messaging: () => call('/messaging'),
    applicationOutbox: (id) => call(`/applications/${id}/outbox`),
    sendToApplicant: (id, data) => call(`/applications/${id}/send`, { method: 'POST', body: data }),
    replyToMessage: (id, data) => call(`/messages/${id}/reply`, { method: 'POST', body: data }),

    subscribers: () => call('/subscribers'),
    deleteSubscriber: (id) => call(`/subscribers/${id}`, { method: 'DELETE' }),

    content: (resource) => call(`/content/${resource}`),
    createContent: (resource, data) => call(`/content/${resource}`, { method: 'POST', body: data }),
    deleteContent: (resource, id) => call(`/content/${resource}/${id}`, { method: 'DELETE' }),
  };
}
