/* =====================================================================
 * fields.js – question type → input builder. Same type names as
 * Validators.gs in the backend. New type = one new line in INPUTS.
 * ===================================================================== */
import { el } from '../dom.js';

const base  = f => ({ id: f.key, name: f.key, required: f.required, 'aria-describedby': `${f.key}-error` });
const range = f => ({ min: f.min ?? null, max: f.max ?? null });

function counter(f) {
  const min = f.min ?? 0, max = f.max ?? Infinity;
  const input = el('input', { ...base(f), ...range(f), type: 'number', inputmode: 'numeric', value: min, class: 'counter-input' });
  const step = delta => () => {
    const next = Math.min(max, Math.max(min, (Number(input.value) || 0) + delta));
    input.value = String(next);
  };
  return el('div', { class: 'counter' },
    el('button', { type: 'button', class: 'counter-btn', 'aria-label': `Fewer: ${f.label}`, onClick: step(-1) }, '−'),
    input,
    el('button', { type: 'button', class: 'counter-btn', 'aria-label': `More: ${f.label}`, onClick: step(1) }, '+'));
}

function choice(f) {
  return el('div', { class: 'choices' },
    f.options.map(option =>
      el('label', { class: 'choice' },
        el('input', { type: 'radio', name: f.key, value: option }),
        el('span', {}, option))));
}

const INPUTS = Object.freeze({
  text:     f => el('input', { ...base(f), type: 'text', autocomplete: f.key === 'name' ? 'name' : 'off' }),
  email:    f => el('input', { ...base(f), type: 'email', autocomplete: 'email' }),
  tel:      f => el('input', { ...base(f), type: 'tel', inputmode: 'tel', autocomplete: 'tel' }),
  number:   f => el('input', { ...base(f), ...range(f), type: 'number', inputmode: 'numeric' }),
  counter,
  code:     f => el('input', { ...base(f), type: 'text', inputmode: 'numeric', autocomplete: 'off' }),
  textarea: f => el('textarea', { ...base(f), rows: 3 }),
  checkbox: f => el('label', { class: 'choice' }, el('input', { ...base(f), type: 'checkbox', value: 'yes' }), el('span', {}, 'Yes')),
  choice
});

export function buildInput(field) {
  const make = INPUTS[field.type];
  if (!make) throw new Error(`Unknown question type "${field.type}"`);
  return make(field);
}
