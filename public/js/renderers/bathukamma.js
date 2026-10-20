/* Bathukamma Bloom – seven flower tiers stack up on a brass plate, then the reply form opens. */
import { el } from '../dom.js';
import { invitationPage, openButton } from './shared.js';

// top → bottom: flower colour + darker edge (tangedu, gunuka, celosia …)
const TIERS = Object.freeze([
  { width: 70,  color: '#F28C28', edge: '#B85E10' },
  { width: 100, color: '#E7518C', edge: '#A1285A' },
  { width: 130, color: '#FFF3E0', edge: '#C9A45C' },
  { width: 160, color: '#7B3FA0', edge: '#4E2368' },
  { width: 190, color: '#F4C430', edge: '#B8880E' },
  { width: 216, color: '#E7518C', edge: '#A1285A' },
  { width: 240, color: '#5E9E4A', edge: '#3B6D2C' }
]);
const STEP_SECONDS = 0.18;

function tier({ width, color, edge }, index) {
  const delay = (TIERS.length - 1 - index) * STEP_SECONDS;          // bottom tier blooms first
  const dots = Array.from({ length: Math.max(3, Math.round(width / 34)) },
    () => el('span', { class: 'bk-dot', style: `background:${edge}` }));
  return el('div', {
    class: 'bk-tier',
    style: `width:${width}px;background:${color};border-color:${edge};transition-delay:${delay}s`
  }, dots);
}

export const bathukamma = {
  greeting: 'Namaskaram {NAME} garu',

  render(root, event, { onOpen, greeting }) {
    const stack = el('div', { class: 'bk-stack', 'aria-hidden': 'true' },
      el('div', { class: 'bk-glow' }),
      el('div', { class: 'bk-gauri' }),
      TIERS.map(tier),
      el('div', { class: 'bk-plate' }));

    root.append(invitationPage({
      greeting,
      eyebrow: 'You are invited',
      art: stack,
      title: event.title,
      subtitle: event.hosts,
      event,
      button: openButton({ animate: () => stack.classList.add('is-open'), onOpen, delayMs: 1900 })
    }));
  }
};
