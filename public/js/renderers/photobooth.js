/* Photobooth – a photo strip slides down out of the booth, then the RSVP opens. */
import { el } from '../dom.js';
import { eventDetails, greetingLine, openButton } from './shared.js';

const PHOTO_COUNT = 3;

export const photobooth = {
  greeting: 'Dear {NAME}',

  render(root, event, { onOpen, greeting }) {
    const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => event.photos[i]
      ? el('img', { class: 'pb-photo', src: event.photos[i], alt: '' })
      : el('div', { class: 'pb-photo pb-photo-empty' }));

    const strip = el('div', { class: 'pb-strip' }, photos, el('p', { class: 'pb-caption' }, event.hosts));

    root.append(
      el('section', { class: 'invite' },
        greetingLine(greeting),
        el('p', { class: 'eyebrow' }, event.title),
        el('div', { class: 'pb-booth' }, el('div', { class: 'pb-slot' }), el('div', { class: 'pb-window' }, strip)),
        el('h1', { class: 'display' }, event.hosts),
        eventDetails(event),
        openButton('Tap to develop the photos', {
          animate: () => strip.classList.add('is-open'),
          onOpen,
          delayMs: 1600
        }))
    );
  }
};
