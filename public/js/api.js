/* =====================================================================
 * api.js – the ONLY file that talks to the backend (fetch).
 * The rest of the website calls Api.*, never fetch directly.
 * ===================================================================== */
import { CONFIG } from './config.js';

async function call(method, action, payload = {}) {
  const url = new URL(CONFIG.API_URL);
  const init = { method };

  if (method === 'GET') {
    url.searchParams.set('action', action);
    Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, value));
  } else {
    init.headers = { 'Content-Type': 'text/plain;charset=utf-8' };   // text/plain = no CORS preflight
    init.body = JSON.stringify({ action, ...payload });
  }

  let json;
  try {
    const response = await fetch(url, init);
    json = await response.json();
  } catch (networkError) {
    throw new Error('Could not reach the server. Please check your internet connection and try again.');
  }

  if (!json.ok) {
    throw Object.assign(new Error(json.error), { status: json.status, details: json.details });
  }
  return json.data;
}

export const Api = Object.freeze({
  getInvitation: (eventId, guestCode = '') =>
    call('GET', 'invitation', guestCode ? { id: eventId, g: guestCode } : { id: eventId }),
  getPreview:    templateId => call('GET', 'preview', { template: templateId }),
  listTemplates: () => call('GET', 'templates'),
  submitRsvp:    (eventId, answers, guestCode = '') => call('POST', 'rsvp', { eventId, answers, guestCode })
});
