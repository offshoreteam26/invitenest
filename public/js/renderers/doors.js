/* Royal Doors – carved palace doors swing open to reveal the couple's photo, then rose petals fall. */
import { el } from '../dom.js';
import { invitationPage, openButton } from './shared.js';

const PETAL_COUNT = 18;

function door(side) {
  return el('div', { class: `dr-door dr-${side}` },
    el('span', { class: 'dr-panel' }),
    el('span', { class: 'dr-panel' }),
    el('span', { class: 'dr-knob' }));
}

/** Petals with their own position, size, speed and delay, so the fall looks natural. */
function petals() {
  return el('div', { class: 'dr-petals', 'aria-hidden': 'true' },
    Array.from({ length: PETAL_COUNT }, (_, i) => {
      const left = (i * 53) % 100;                       // spread across the width without randomness
      const size = 10 + (i % 4) * 3;
      const duration = 6 + (i % 5);
      const delay = (i % 6) * 0.7;
      return el('span', {
        class: `dr-petal ${i % 3 === 0 ? 'dr-petal-gold' : ''}`.trim(),
        style: `left:${left}%;width:${size}px;height:${size * 1.3}px;animation-duration:${duration}s;animation-delay:${delay}s`
      });
    }));
}

export const doors = {
  greeting: 'Dear {NAME}',

  render(root, event, { onOpen, greeting }) {
    const photo = event.photos[0];
    const scene = el('div', { class: 'dr-scene' },
      photo ? el('img', { class: 'dr-photo', src: photo, alt: '' }) : null,
      el('div', { class: 'dr-shade' }),
      el('p', { class: 'dr-names' }, event.hosts));

    const gate = el('div', { class: 'dr-gate', 'aria-hidden': 'true' }, scene, door('left'), door('right'));
    const fall = petals();

    root.append(invitationPage({
      greeting,
      eyebrow: 'You are invited',
      art: gate,
      title: event.title,
      subtitle: event.hosts,
      event,
      button: openButton({
        animate: () => { gate.classList.add('is-open'); document.body.append(fall); },
        onOpen,
        delayMs: 1800
      })
    }));
  }
};
