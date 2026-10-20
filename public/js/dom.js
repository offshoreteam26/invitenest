/* =====================================================================
 * dom.js – one tiny helper to build HTML elements, used everywhere.
 * Text is always added as plain text, so data from the Sheet can never
 * inject HTML or scripts (no innerHTML anywhere in the project).
 * ===================================================================== */

/**
 * el('button', { class: 'btn', onClick: fn }, 'Send')
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

/** "2026-11-01" → "Sunday, 1 November 2026" */
export function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
