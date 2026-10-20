/* =====================================================================
 * Invites – personal WhatsApp invitations from the Guests tab.
 *
 *   Automatic: type event_id + name + mobile in a Guests row → its link is created
 *   📲 Prepare WhatsApp invites → (re)builds every row (use after changing SITE_URL or a message)
 *   🔄 Refresh RSVP status      → only the status column
 *
 * You type:      event_id, name, mobile
 * System fills:  guest_code, invite_link, whatsapp (📲 Send), status
 *
 * Message used for each guest (most specific wins):
 *   Events.invite_message  →  Templates.invite_message  →  DEFAULT_INVITE_MESSAGE
 * Placeholders: {NAME} {HOSTS} {TITLE} {DATE} {TIME} {VENUE} {LINK}
 * ===================================================================== */

// ⚠️ Stage 6: change this to your real Netlify address (no / at the end), then run "Prepare WhatsApp invites".
const SITE_URL = 'https://invitenest.netlify.app';

const SEND_LABEL = '📲 Send';
const GUEST_CODE_PATTERN = /^[a-f0-9]{8}$/;                 // only system codes are kept (hard to guess)
const DEFAULT_INVITE_MESSAGE = [
  'Dear {NAME},',
  '',
  '{HOSTS} would be delighted to have you at *{TITLE}*.',
  '',
  '📅 {DATE} · {TIME}',
  '📍 {VENUE}',
  '',
  'Open your personal invitation here:',
  '{LINK}'
].join('\n');

/* ---------- entry points ---------- */
function prepareWhatsAppInvites() { updateGuests_({ buildLinks: true }); }
function refreshRsvpStatus()      { updateGuests_({ buildLinks: false }); }

/** Runs by itself on every edit: rebuilds the edited Guests rows. */
function onEdit(e) {
  const range = e && e.range;
  if (!range || range.getSheet().getName() !== TABS.GUESTS || range.getLastRow() < 2) return;
  updateGuests_({ buildLinks: true, firstRow: Math.max(2, range.getRow()), lastRow: range.getLastRow(), quiet: true });
}

/** Runs by itself when you click a cell: on an EMPTY Guests tab it shows how to start (at most once per 2 minutes). */
function onSelectionChange(e) {
  const sheet = e && e.range && e.range.getSheet();
  if (!sheet || sheet.getName() !== TABS.GUESTS || hasGuests_(sheet)) return;
  const cache = CacheService.getDocumentCache();
  if (cache.get('guest-hint')) return;
  cache.put('guest-hint', 'shown', 120);
  sheet.getParent().toast(GUEST_HINT, 'Add your first guest', 10);
}

const GUEST_HINT = 'Type only event_id, name and mobile. guest_code, invite_link, 📲 Send and status fill in automatically.';

function hasGuests_(sheet) {
  const last = sheet.getLastRow();
  return last >= 2 && sheet.getRange(2, 1, last - 1, 1).getValues().some(isRecord_);
}

/* ---------- the one routine that fills the Guests tab ---------- */
function updateGuests_({ buildLinks, firstRow = 2, lastRow = null, quiet = false }) {
  const ss = db_();
  const sh = ss.getSheetByName(TABS.GUESTS);
  const headers = SCHEMA[TABS.GUESTS];
  const col = name => headers.indexOf(name);
  const end = Math.min(lastRow || sh.getLastRow(), sh.getLastRow());
  if (end < firstRow) {
    if (!quiet) notify_(ss, quiet, 'No guests yet', 'Add guests in the Guests tab (event_id, name, mobile).');
    return;
  }

  const range = sh.getRange(firstRow, 1, end - firstRow + 1, headers.length);
  const rows = range.getValues();
  const events = new Map(Repos.events().findAll().map(e => [String(e.event_id), e]));
  const templates = new Map(Repos.templates().findAll().map(t => [String(t.template_id), t]));
  const replied = repliedKeys_();
  const usedCodes = existingCodes_(sh, col('guest_code') + 1);
  const sendUrls = rows.map(() => null);
  const problems = [];
  let ready = 0, repliedCount = 0;

  rows.forEach((row, i) => {
    const rowNumber = firstRow + i;
    const clearAuto = () => ['invite_link', 'whatsapp', 'status'].forEach(k => { row[col(k)] = ''; });
    if (!isRecord_(row)) { if (buildLinks) { clearAuto(); row[col('guest_code')] = ''; } return; }

    const guest = Object.fromEntries(headers.map((h, j) => [h, row[j]]));
    const mobile = normalizeMobile_(guest.mobile);
    const code = GUEST_CODE_PATTERN.test(String(guest.guest_code)) ? String(guest.guest_code) : '';
    const isReplied = hasRepliedKey_(replied, guest.event_id, code, mobile);
    row[col('status')] = isReplied ? GUEST_STATUS.REPLIED : GUEST_STATUS.PENDING;
    if (isReplied) repliedCount++;
    if (!buildLinks) return;

    const event = events.get(String(guest.event_id).trim());
    const name = String(guest.name).trim();
    if (!event)  { clearAuto(); return problems.push(`Row ${rowNumber}: event "${guest.event_id}" is not in Events`); }
    if (!name)   { clearAuto(); return problems.push(`Row ${rowNumber}: name is empty`); }
    if (!/^\d{9,15}$/.test(mobile)) { clearAuto(); return problems.push(`Row ${rowNumber}: mobile is missing or not valid`); }

    const finalCode = code || newGuestCode_(usedCodes);
    const link = `${SITE_URL}/e/${encodeURIComponent(event.event_id)}?g=${finalCode}`;
    const message = fillMessage_(messageFor_(event, templates), event, name, link);
    row[col('guest_code')] = finalCode;
    row[col('mobile')] = mobile;
    row[col('invite_link')] = link;
    row[col('whatsapp')] = SEND_LABEL;
    row[col('status')] = isReplied ? GUEST_STATUS.REPLIED : GUEST_STATUS.PENDING;
    sendUrls[i] = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
    ready++;
  });

  if (buildLinks) {
    range.setValues(rows);
    const linkCells = rows.map((row, i) => {
      const cell = SpreadsheetApp.newRichTextValue().setText(String(row[col('whatsapp')] || ''));
      return [(sendUrls[i] ? cell.setLinkUrl(sendUrls[i]) : cell).build()];
    });
    sh.getRange(firstRow, col('whatsapp') + 1, rows.length, 1).setRichTextValues(linkCells);
  } else {
    sh.getRange(firstRow, col('status') + 1, rows.length, 1).setValues(rows.map(r => [r[col('status')]]));
  }

  if (quiet) {
    // while typing: a small toast only, never a pop-up
    if (ready) ss.toast(`Invitation link ready (${ready})`, MENU_NAME, 3);
    else if (problems.length) ss.toast(problems[0], MENU_NAME, 5);
    return;
  }
  const summary = buildLinks
    ? `${ready} invitation(s) ready. Click ${SEND_LABEL} in the whatsapp column for each guest.\n${repliedCount} guest(s) have already replied.`
    : `${repliedCount} guest(s) have replied.`;
  const issues = problems.length ? `\n\nPlease fix:\n${problems.slice(0, 15).join('\n')}` : '';
  notify_(ss, quiet, buildLinks ? 'WhatsApp invites ✅' : 'RSVP status ✅', summary + issues);
}

/* ---------- helpers ---------- */
function notify_(ss, quiet, title, message) {
  if (quiet) return ss.toast(message, title, 5);
  const ui = SpreadsheetApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}

/** Every valid code already in the Guests tab, so a new one is never a duplicate. */
function existingCodes_(sh, codeColumn) {
  const last = sh.getLastRow();
  if (last < 2) return new Set();
  return new Set(sh.getRange(2, codeColumn, last - 1, 1).getValues()
    .map(r => String(r[0])).filter(c => GUEST_CODE_PATTERN.test(c)));
}

/** Event message → template message → default message. */
function messageFor_(event, templates) {
  const template = templates.get(String(event.template_id));
  return String(event.invite_message || '').trim()
    || String((template && template.invite_message) || '').trim()
    || DEFAULT_INVITE_MESSAGE;
}

/** Replaces {NAME} {HOSTS} {TITLE} {DATE} {TIME} {VENUE} {LINK}; unknown placeholders are left as they are. */
function fillMessage_(text, event, guestName, link) {
  const values = {
    NAME: guestName, HOSTS: event.hosts, TITLE: event.title, DATE: toLongDate_(event.date),
    TIME: toTimeText_(event.time), VENUE: event.venue, LINK: link
  };
  return text.replace(/\{([A-Z]+)\}/g, (match, key) => (key in values ? String(values[key] ?? '') : match)).trim();
}

/** Random 8-character code (e.g. 4f718e80), unique within the Guests tab. */
function newGuestCode_(usedCodes) {
  let code;
  do { code = Utilities.getUuid().replace(/-/g, '').slice(0, 8); } while (usedCodes.has(code));
  usedCodes.add(code);
  return code;
}

/** Every (event + guest code) and (event + mobile) that has replied. */
function repliedKeys_() {
  const keys = new Set();
  Repos.responses().findAll().forEach(r => {
    if (r.guest_code) keys.add(`${r.event_id}|g|${r.guest_code}`);
    const mobile = normalizeMobile_(r.mobile);
    if (mobile) keys.add(`${r.event_id}|m|${mobile}`);
  });
  return keys;
}

const hasRepliedKey_ = (keys, eventId, guestCode, mobile) =>
  Boolean((guestCode && keys.has(`${eventId}|g|${guestCode}`)) || (mobile && keys.has(`${eventId}|m|${mobile}`)));
