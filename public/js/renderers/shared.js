/* =====================================================================
 * Pieces every design uses the same way (DRY):
 * greeting, details card (date, time, venue, countdown, calendar, directions),
 * and the "Open invitation" button.
 * ===================================================================== */
import { el, icon, formatDate, daysUntil } from '../dom.js';

export const OPEN_LABEL = 'Open invitation';
const EVENT_HOURS = 3;                                   // length used for "Add to calendar"

/** "Namaskaram Ravi garu" for personal links; nothing for public links. */
export function greetingLine(greeting) {
  return greeting ? el('p', { class: 'greeting' }, greeting) : null;
}

function countdownText(iso) {
  const days = daysUntil(iso);
  if (days === null || days < 0) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** "5:00 PM" → [17, 0]; anything else → null */
function parseTime(text) {
  const m = String(text || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const period = (m[3] || '').toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours > 23 || minutes > 59 ? null : [hours, minutes];
}

const pad = n => String(n).padStart(2, '0');
const compactDay = date => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

/** Google Calendar "add event" link (timed when the time is known, otherwise all-day). */
function calendarUrl(event) {
  if (!event.date) return '';
  const start = new Date(event.date + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return '';
  const time = parseTime(event.time);
  let dates;
  if (time) {
    start.setHours(time[0], time[1]);
    const end = new Date(start.getTime() + EVENT_HOURS * 3600000);
    const stamp = d => `${compactDay(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    dates = `${stamp(start)}/${stamp(end)}`;
  } else {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    dates = `${compactDay(start)}/${compactDay(next)}`;
  }
  const text = encodeURIComponent([event.title, event.hosts].filter(Boolean).join(' – '));
  const location = encodeURIComponent(event.venue || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${location}`;
}

const detailRow = (iconName, text) => el('div', { class: 'detail' }, icon(iconName), el('span', {}, text));

export function detailsCard(event) {
  const countdown = countdownText(event.date);
  const calendar = calendarUrl(event);
  return el('div', { class: 'details-card' },
    countdown ? el('span', { class: 'countdown' }, icon('sparkle'), countdown) : null,
    event.date ? detailRow('calendar', formatDate(event.date)) : null,
    event.time ? detailRow('clock', event.time) : null,
    event.venue ? detailRow('pin', event.venue) : null,
    el('div', { class: 'card-actions' },
      calendar ? el('a', { class: 'chip', href: calendar, target: '_blank', rel: 'noopener' }, icon('plus'), 'Add to calendar') : null,
      event.map_url ? el('a', { class: 'chip', href: event.map_url, target: '_blank', rel: 'noopener' }, icon('route'), 'Directions') : null));
}

/** The "Open invitation" button: runs the design's opening animation, then shows the reply form. */
export function openButton({ animate, onOpen, delayMs }) {
  const button = el('button', { class: 'btn btn-solid btn-open', type: 'button' }, OPEN_LABEL);
  button.addEventListener('click', () => {
    animate();
    button.remove();
    setTimeout(onOpen, prefersReducedMotion() ? 0 : delayMs);
  }, { once: true });
  return button;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The common page structure every design fills: art on top, words below, card, button. */
export function invitationPage({ greeting, eyebrow, art, title, subtitle, event, button, className = '' }) {
  return el('section', { class: `invite ${className}`.trim() },
    greetingLine(greeting),
    eyebrow ? el('p', { class: 'eyebrow' }, eyebrow) : null,
    art,
    el('h1', { class: 'display title' }, title),
    subtitle ? el('p', { class: 'subtitle' }, subtitle) : null,
    detailsCard(event),
    button);
}
