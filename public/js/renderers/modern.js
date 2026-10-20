/* Modern – bold date block with playful shapes that pop in (birthdays, corporate, parties). */
import { el, dateParts } from '../dom.js';
import { invitationPage, openButton } from './shared.js';

const SHAPES = ['md-circle', 'md-square', 'md-ring', 'md-dot', 'md-pill'];

export const modern = {
  greeting: 'Hi {NAME}',

  render(root, event, { onOpen, greeting }) {
    const parts = dateParts(event.date);
    const hero = el('div', { class: 'md-hero', 'aria-hidden': 'true' },
      SHAPES.map((shape, i) => el('span', { class: `md-shape ${shape}`, style: `transition-delay:${i * 0.12}s` })),
      parts ? el('div', { class: 'md-date' },
        el('span', { class: 'md-weekday' }, parts.weekday),
        el('span', { class: 'md-day' }, parts.day),
        el('span', { class: 'md-month' }, parts.month)) : null);

    root.append(invitationPage({
      greeting,
      eyebrow: event.hosts,
      art: hero,
      title: event.title,
      event,
      className: 'invite-modern',
      button: openButton({ animate: () => hero.classList.add('is-open'), onOpen, delayMs: 900 })
    }));
  }
};
