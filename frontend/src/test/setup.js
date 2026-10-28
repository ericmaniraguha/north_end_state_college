import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

// jsdom does not implement scrolling or modal dialogs
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// Replaces fetch with a router: routes maps "METHOD /path" (or "/path" for GET) to
// a response body, or to a function (url, options) => [status, body].
export function mockApi(routes) {
  const calls = [];
  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET';
    const path = url.split('?')[0];
    calls.push({ method, url, body: options.body ? JSON.parse(options.body) : undefined });
    const handler = routes[`${method} ${path}`] ?? (method === 'GET' ? routes[path] : undefined);
    const [status, body] = typeof handler === 'function' ? handler(url, options) : handler === undefined ? [404, { error: 'Not found' }] : [200, handler];
    return { ok: status < 400, status, statusText: String(status), json: async () => body };
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}
