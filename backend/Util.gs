/* =====================================================================
 * Util – small pure helpers shared by every file (DRY)
 * ===================================================================== */

/** Text → object; returns fallback when the text is empty or not valid JSON. */
const parseJson_ = (text, fallback) => {
  try { return text ? JSON.parse(text) : fallback; } catch (e) { return fallback; }
};

/** "Yes, No ,Not sure" → ['Yes', 'No', 'Not sure'] */
const splitList_ = text => String(text || '').split(',').map(s => s.trim()).filter(Boolean);

/** true for TRUE, "TRUE", "true" */
const isTrue_ = v => v === true || String(v).toUpperCase() === 'TRUE';

/** Copies only the listed keys from an object. */
const pick_ = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]));

/** Any date from the Sheet → "2026-11-01" */
const toIsoDate_ = v => v instanceof Date
  ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd')
  : String(v || '').trim();

/** Any date from the Sheet → "Sunday, 1 November 2026" (for messages) */
const toLongDate_ = v => {
  const iso = toIsoDate_(v);
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime()) ? iso : Utilities.formatDate(d, Session.getScriptTimeZone(), 'EEEE, d MMMM yyyy');
};

/** Any time from the Sheet → "5:00 PM" (real time cells, typed "17:00" or "5:00 PM"). */
const toTimeText_ = v => {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'h:mm a');
  const m = String(v || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return String(v || '').trim();
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Last moment of a date, so a deadline of 31 Oct still allows replies on 31 Oct. */
const endOfDay_ = v => {
  const d = new Date(v);
  d.setHours(23, 59, 59, 999);
  return d;
};
