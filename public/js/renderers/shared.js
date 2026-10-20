/* Pieces every design shows the same way (DRY): greeting, date + time, venue, map link, open button. */
import { el, formatDate } from '../dom.js';

/** "Namaskaram Ravi garu" for personal links; nothing for public links. */
export function greetingLine(greeting) {
  return greeting ? el('p', { class: 'greeting' }, greeting) : null;
}

export function eventDetails(event) {
  const when = [formatDate(event.date), event.time].filter(Boolean).join(' · ');
  return [
    when ? el('p', { class: 'meta accent' }, when) : null,
    event.venue ? el('p', { class: 'meta' }, event.venue) : null,
    event.map_url ? el('a', { class: 'map-link', href: event.map_url, target: '_blank', rel: 'noopener' }, 'Open in Google Maps') : null
  ];
}

/** A button that runs the design's opening animation, then calls onOpen after `delayMs`. */
export function openButton(label, { animate, onOpen, delayMs }) {
  const button = el('button', { class: 'btn btn-outline', type: 'button' }, label);
  button.addEventListener('click', () => {
    animate();
    button.remove();
    setTimeout(onOpen, prefersReducedMotion() ? 0 : delayMs);
  }, { once: true });
  return button;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
