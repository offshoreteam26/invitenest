/* gallery.js – lists every active design; tapping one opens its preview. */
import { el } from './dom.js';

/** A designed colour card for templates without a preview photo. */
function swatchStyle({ bg = '#333', accent = '#999', accent2 = accent }) {
  return `border-color:${accent};background:` +
    `radial-gradient(circle at 50% 42%, ${accent} 0 18%, transparent 19%),` +
    `radial-gradient(circle at 68% 62%, ${accent2} 0 9%, transparent 10%), ${bg}`;
}

function thumbnail(t) {
  return t.previewImage
    ? el('img', { class: 'gallery-image', src: t.previewImage, alt: '', loading: 'lazy' })
    : el('span', { class: 'swatch', style: swatchStyle(t.theme) });
}

export function renderGallery(root, templates) {
  root.append(
    el('section', { class: 'gallery-page' },
      el('p', { class: 'eyebrow' }, 'InviteNest'),
      el('h1', { class: 'display' }, 'Choose a design'),
      el('p', { class: 'meta' }, 'Tap a design to see it with sample details.'),
      el('div', { class: 'gallery' },
        templates.map(t =>
          el('a', { class: 'gallery-card', href: `/?preview=${encodeURIComponent(t.id)}` },
            thumbnail(t),
            el('span', { class: 'gallery-name' }, t.name))))
    )
  );
}
