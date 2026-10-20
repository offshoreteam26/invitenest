/* gallery.js – lists every active design; tapping one opens its preview. */
import { el } from './dom.js';

export function renderGallery(root, templates) {
  root.append(
    el('section', { class: 'gallery-page' },
      el('h1', { class: 'display' }, 'Choose a design'),
      el('p', { class: 'meta' }, 'Tap a design to see it with sample details.'),
      el('div', { class: 'gallery' },
        templates.map(t =>
          el('a', { class: 'gallery-card', href: `/?preview=${encodeURIComponent(t.id)}` },
            el('span', { class: 'swatch', style: `background:${t.theme.bg || '#333'};border-color:${t.theme.accent || '#999'}` }),
            el('span', { class: 'gallery-name' }, t.name),
            el('span', { class: 'gallery-id' }, t.id))))
    )
  );
}
