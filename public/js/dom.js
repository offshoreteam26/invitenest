/* =====================================================================
 * dom.js – tiny helpers to build HTML, used everywhere.
 * Text is always added as plain text, so data from the Sheet can never
 * inject HTML or scripts (no innerHTML anywhere in the project).
 * ===================================================================== */

/**
 * el('button', { class: 'btn', onClick: fn }, 'Submit')
 * - attributes starting with "on" become event listeners
 * - false / null / undefined attributes and children are skipped
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') node.className = value;
    else node.setAttribute(key, value === true ? '' : value);
  });
  node.append(...children.flat(Infinity).filter(c => c !== null && c !== undefined && c !== false));
  return node;
}

/* ---------- line icons (drawn with SVG paths, coloured by CSS) ---------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = Object.freeze({
  calendar: ['M7 3v3M17 3v3M4 9h16', 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
  clock:    ['M12 7v5l3 2', 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z'],
  pin:      ['M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z', 'M12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z'],
  plus:     ['M12 5v14M5 12h14'],
  route:    ['M6 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4a2 2 0 0 0 0 4z', 'M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7'],
  check:    ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z', 'M8 12.5l2.8 2.8L16.5 9.5'],
  sparkle:  ['M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6']
});

export function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'icon');
  (ICONS[name] || []).forEach(d => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  });
  return svg;
}

/* ---------- dates ---------- */
const toLocalDate = iso => new Date(iso + 'T00:00:00');

/** "2026-11-01" → "Sunday, 1 November 2026" */
export function formatDate(iso) {
  if (!iso) return '';
  const date = toLocalDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** "2026-11-01" → { day: '01', month: 'NOV', weekday: 'SUN' } */
export function dateParts(iso) {
  const date = toLocalDate(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  };
}

/** Whole days from today until the date (negative = past), or null. */
export function daysUntil(iso) {
  const date = toLocalDate(iso);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
}
