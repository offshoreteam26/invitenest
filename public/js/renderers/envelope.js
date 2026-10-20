/* Envelope – a wax-sealed envelope opens and the invitation card rises out (weddings, formal events). */
import { el } from '../dom.js';
import { invitationPage, openButton } from './shared.js';

/** "Ananya & Rohan" → "A&R"; "Telugu Association" → "TA" */
function monogram(hosts) {
  const parts = String(hosts || '').split(/\s*&\s*|\s+and\s+/i).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, 2).map(p => p.trim().charAt(0).toUpperCase()).join('&');
  return String(hosts || '').split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
}

export const envelope = {
  greeting: 'Dear {NAME}',

  render(root, event, { onOpen, greeting }) {
    const card = el('div', { class: 'env-card' },
      el('p', { class: 'env-small' }, 'Together with their families'),
      el('p', { class: 'env-names' }, event.hosts),
      el('span', { class: 'env-rule' }),
      el('p', { class: 'env-small' }, event.title));

    const envelopeArt = el('div', { class: 'env', 'aria-hidden': 'true' },
      el('div', { class: 'env-back' }),
      card,
      el('div', { class: 'env-front' }),
      el('div', { class: 'env-flap' }),
      el('div', { class: 'env-seal' }, monogram(event.hosts)));

    root.append(invitationPage({
      greeting,
      eyebrow: 'You are invited',
      art: envelopeArt,
      title: event.title,
      subtitle: event.hosts,
      event,
      button: openButton({ animate: () => envelopeArt.classList.add('is-open'), onOpen, delayMs: 1500 })
    }));
  }
};
