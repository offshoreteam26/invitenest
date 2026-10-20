const PHONE_CONFIG = Object.freeze({
  COUNTRIES: [
    { name: 'UAE',   code: '971', localDigits: 9,  startsWith: '5' },
    { name: 'India', code: '91',  localDigits: 10, startsWith: '6789' }
  ],
  DEFAULT_COUNTRY_CODE: '971'
});

function normalizeMobile_(value) {
  const raw = String(value === null || value === undefined ? '' : value).trim();
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (/^\+/.test(raw)) return d;                       // typed with + : already international
  if (/^00/.test(d)) return d.replace(/^00/, '');      // typed with 00
  const core = d.replace(/^0+/, '');                   // drop leading 0
  for (const c of PHONE_CONFIG.COUNTRIES) {            // local format of a known country
    if (core.length === c.localDigits && c.startsWith.includes(core.charAt(0))) return c.code + core;
  }
  for (const c of PHONE_CONFIG.COUNTRIES) {            // already has the country code
    if (core.startsWith(c.code) && core.length === c.code.length + c.localDigits &&
        c.startsWith.includes(core.charAt(c.code.length))) return core;
  }
  return core.length <= 10 ? PHONE_CONFIG.DEFAULT_COUNTRY_CODE + core : core;
}
