const Validators = Object.freeze({
  text:     () => null,
  textarea: () => null,
  checkbox: () => null,
  email:    (f, v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v)) ? null : 'Enter a valid email',
  tel:      (f, v) => /^\d{9,15}$/.test(normalizeMobile_(v)) ? null : 'Enter a valid mobile number',
  number:   (f, v) => inRange_(v, f) ? null : rangeMessage_(f),
  counter:  (f, v) => inRange_(v, f) ? null : rangeMessage_(f),
  choice:   (f, v) => f.options.includes(String(v)) ? null : 'Pick one of the options',
  code:     (f, v) => f.options.includes(String(v).trim()) ? null : 'That code is not correct'
});

function inRange_(v, f) {
  const n = Number(v);
  return Number.isFinite(n) && (f.min === null || n >= f.min) && (f.max === null || n <= f.max);
}

function rangeMessage_(f) {
  return 'Enter a number' + (f.min !== null ? ' from ' + f.min : '') + (f.max !== null ? ' to ' + f.max : '');
}

/** Returns { fieldKey: 'error message' } for every wrong answer; empty object = all good. */
function validateAnswers_(fields, answers) {
  return fields.reduce((errors, f) => {
    const v = answers[f.key];
    const empty = v === undefined || v === null || v === false || String(v).trim() === '';
    if (empty) {
      if (f.required) errors[f.key] = f.label + ' is required';
      return errors;
    }
    const rule = Validators[f.type];
    if (!rule) throw new AppError(500, 'Unknown field type: ' + f.type);
    const message = rule(f, v);
    if (message) errors[f.key] = message;
    return errors;
  }, {});
}
