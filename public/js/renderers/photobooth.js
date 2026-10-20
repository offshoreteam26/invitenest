/* Photobooth – a photo strip slides down out of the booth, then the reply form opens. */
import { el } from '../dom.js';
import { invitationPage, openButton } from './shared.js';

const PHOTO_COUNT = 3;

export const photobooth = {
  greeting: 'Dear {NAME}',

  render(root, event, { onOpen, greeting }) {
    const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => event.photos[i]
      ? el('img', { class: 'pb-photo', src: event.photos[i], alt: '' })
      : el('div', { class: 'pb-photo pb-photo-empty' }));

    const strip = el('div', { class: 'pb-strip' }, photos, el('p', { class: 'pb-caption' }, event.hosts));
    const booth = el('div', { class: 'pb-booth', 'aria-hidden': 'true' },
      el('div', { class: 'pb-slot' }),
      el('div', { class: 'pb-window' }, strip),
      el('div', { class: 'pb-label' }, 'PHOTO BOOTH'));

    root.append(invitationPage({
      greeting,
      eyebrow: event.title,
      art: booth,
      title: event.hosts,
      event,
      button: openButton({ animate: () => strip.classList.add('is-open'), onOpen, delayMs: 1600 })
    }));
  }
};
