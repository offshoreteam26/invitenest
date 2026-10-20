/* =====================================================================
 * form-builder.js – builds the RSVP form from the Fields rows of the Sheet
 * and shows the server's error messages next to each question.
 * The rules live once, in the backend (Validators.gs) – no duplicates here.
 * ===================================================================== */
import { el } from '../dom.js';
import { buildInput } from './fields.js';

const SUBMIT_LABEL = 'Submit';
const labelText = f => f.label + (f.required ? ' *' : '');

function fieldRow(f, errorEl) {
  const grouped = f.type === 'choice';                       // radio buttons belong in a fieldset
  return el(grouped ? 'fieldset' : 'div', { class: 'field' },
    grouped ? el('legend', {}, labelText(f)) : el('label', { for: f.key }, labelText(f)),
    buildInput(f),
    errorEl);
}

function readAnswers(form, fields) {
  const data = new FormData(form);
  return Object.fromEntries(fields.map(f =>
    [f.key, f.type === 'checkbox' ? data.has(f.key) : String(data.get(f.key) ?? '').trim()]));
}

/** Fills in answers we already know (e.g. the guest's name from a personal link). */
function prefill(form, initial) {
  Object.entries(initial).forEach(([key, value]) => {
    const input = form.querySelector(`input[name="${CSS.escape(key)}"]:not([type="radio"]):not([type="checkbox"])`);
    if (input && value) input.value = value;
  });
}

export function buildForm(fields, onSubmit, initial = {}) {
  const errorFor = Object.fromEntries(fields.map(f =>
    [f.key, el('p', { class: 'field-error', id: `${f.key}-error`, 'aria-live': 'polite' })]));
  const formError = el('p', { class: 'form-error', role: 'alert' });
  const button = el('button', { class: 'btn btn-solid', type: 'submit' }, SUBMIT_LABEL);

  const form = el('form', { class: 'rsvp', novalidate: true },
    el('h2', { class: 'display' }, 'Kindly reply'),
    el('p', { class: 'meta' }, 'Fields marked * are required'),
    fields.map(f => fieldRow(f, errorFor[f.key])),
    formError,
    button);
  prefill(form, initial);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    Object.values(errorFor).forEach(p => { p.textContent = ''; });
    formError.textContent = '';
    button.disabled = true;
    button.textContent = 'Submitting…';
    try {
      await onSubmit(readAnswers(form, fields));
    } catch (err) {
      const details = err.details || {};
      Object.entries(details).forEach(([key, message]) => { if (errorFor[key]) errorFor[key].textContent = message; });
      formError.textContent = err.message;
      const firstKey = Object.keys(details)[0];
      if (firstKey) form.querySelector(`[name="${CSS.escape(firstKey)}"]`)?.focus();
    } finally {
      button.disabled = false;
      button.textContent = SUBMIT_LABEL;
    }
  });

  return form;
}
