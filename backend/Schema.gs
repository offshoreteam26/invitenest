/* =====================================================================
 * InviteNest – Sheet schema, setup and data check
 * Safe to run "Run setup" any number of times (data is kept).
 * A row is a record only when its FIRST column (the id) is filled in.
 * New columns are always added at the END of a tab, so existing data never moves.
 * ===================================================================== */

/* ---------- SCHEMA: tabs and columns (single source of truth) ---------- */
const SCHEMA = Object.freeze({
  Templates: ['template_id', 'name', 'renderer', 'theme_json', 'preview_image', 'active', 'invite_message'],
  Events:    ['event_id', 'template_id', 'status', 'title', 'hosts', 'date', 'time', 'venue',
              'map_url', 'photos', 'music_url', 'rsvp_deadline', 'theme_override_json', 'invite_message'],
  Fields:    ['event_id', 'field_key', 'label', 'type', 'required', 'options', 'min', 'max', 'order', 'secret'],
  Guests:    ['event_id', 'guest_code', 'name', 'mobile', 'invite_link', 'whatsapp', 'status', 'attending', 'party_size'],
  Responses: ['submitted_at', 'event_id', 'response_id', 'name', 'mobile', 'answers_json', 'guest_code']
});
const TABS = Object.freeze(Object.fromEntries(Object.keys(SCHEMA).map(k => [k.toUpperCase(), k])));
const FIELD_TYPES = ['text', 'tel', 'email', 'number', 'counter', 'choice', 'checkbox', 'textarea', 'code'];
const STATUSES = ['Draft', 'Live', 'Closed'];
const GUEST_STATUS = Object.freeze({ PENDING: '— Pending', REPLIED: '✅ Replied' });
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MENU_NAME = '🌸 InviteNest';

/** The one rule for "is this row a real record?" – used by setup, check and repository. */
const isRecord_ = row => row[0] !== '' && row[0] !== null;

/* ---------- STYLE: one look for every tab ---------- */
const STYLE = Object.freeze({
  font: 'Arial', fontSize: 10,
  headerBg: '#37474F', headerText: '#FFFFFF', headerHeight: 32,
  rowBg: '#FFFFFF', stripeBg: '#F5F7F8'
});

// column: [width px, help note shown when hovering the header]
const COLUMN_INFO = Object.freeze({
  template_id:   [170, 'Short unique id, no spaces. Example: photobooth-navy'],
  name:          [190, 'Templates: design name. Guests / Responses: guest name'],
  renderer:      [130, 'Drawing code to use: photobooth or bathukamma'],
  theme_json:    [380, 'Colours and fonts as JSON. Example: {"bg":"#1E2A44","accent":"#E3C88A"}'],
  preview_image: [200, 'Optional image link shown in the template gallery'],
  active:        [80,  'TRUE = usable, FALSE = hidden'],
  invite_message:[320, 'WhatsApp message. Placeholders: {NAME} {HOSTS} {TITLE} {DATE} {TIME} {VENUE} {LINK}. In Events: optional, overrides the template message'],
  event_id:      [170, 'Short unique id, no spaces. Becomes the link /e/<event_id>. In Fields, * = all events'],
  status:        [110, 'Events: Draft, Live or Closed. Guests: filled automatically (Pending / Replied)'],
  title:         [180, 'Small line at the top of the invitation'],
  hosts:         [210, 'Big name on the invitation (couple, family or organisation)'],
  date:          [120, 'Event date, e.g. 2026-11-01'],
  time:          [100, 'Event time as text, e.g. 7:00 PM'],
  venue:         [230, 'Venue name and city'],
  map_url:       [200, 'Optional Google Maps link'],
  photos:        [230, 'Optional image links separated by commas'],
  music_url:     [180, 'Optional background music link'],
  rsvp_deadline: [130, 'Last date guests can reply'],
  theme_override_json: [250, 'Optional colour changes for this event only. Example: {"accent":"#D4537E"}'],
  field_key:     [130, 'Internal name, no spaces. Example: name, mobile, adults'],
  label:         [260, 'The question the guest sees'],
  type:          [110, 'text, tel, email, number, counter, choice, checkbox, textarea or code'],
  required:      [90,  'TRUE = the guest must answer'],
  options:       [200, 'choice: Yes,No   |   code: the secret venue code'],
  min:           [70,  'Smallest number allowed'],
  max:           [70,  'Largest number allowed'],
  order:         [70,  'Position on the form (1 = first)'],
  secret:        [80,  'TRUE = never sent to the browser (use for the venue code)'],
  guest_code:    [110, 'Private code in the guest\'s personal link (filled automatically)'],
  mobile:        [150, 'Mobile number. Any format works: 0501234567, +91 96187 78056 …'],
  invite_link:   [330, 'Personal invitation link (filled automatically)'],
  whatsapp:      [110, 'Click 📲 Send to open WhatsApp with the message ready (filled automatically)'],
  attending:     [100, 'Yes / No from the guest\'s reply (filled automatically)'],
  party_size:    [100, 'How many people are coming, from the guest\'s reply (filled automatically)'],
  submitted_at:  [170, 'When the guest replied (filled automatically)'],
  response_id:   [280, 'Unique id of the reply (filled automatically)'],
  answers_json:  [420, 'All answers of this guest (filled automatically)']
});

// number formats only change how values display, not how the tab looks
const COLUMN_FORMATS = [
  [TABS.EVENTS, 'date', 'yyyy-mm-dd'], [TABS.EVENTS, 'rsvp_deadline', 'yyyy-mm-dd'], [TABS.EVENTS, 'time', '@'],
  [TABS.TEMPLATES, 'theme_json', '@'], [TABS.EVENTS, 'theme_override_json', '@'],
  [TABS.TEMPLATES, 'invite_message', '@'], [TABS.EVENTS, 'invite_message', '@'],
  [TABS.FIELDS, 'options', '@'], [TABS.GUESTS, 'mobile', '@'], [TABS.GUESTS, 'guest_code', '@'],
  [TABS.RESPONSES, 'submitted_at', 'yyyy-mm-dd hh:mm'], [TABS.RESPONSES, 'mobile', '@']
];

// columns only the system writes: typing in them shows a warning (the system still writes freely)
const AUTO_COLUMNS = Object.freeze({
  Guests:    ['guest_code', 'invite_link', 'whatsapp', 'status', 'attending', 'party_size'],
  Responses: SCHEMA.Responses
});
const AUTO_PROTECTION_NOTE = 'InviteNest: filled automatically';

/* ---------- MENU ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu(MENU_NAME)
    .addItem('📲 Prepare WhatsApp invites', 'prepareWhatsAppInvites')
    .addItem('🔄 Refresh RSVP status', 'refreshRsvpStatus')
    .addSeparator()
    .addItem('Check data', 'checkData')
    .addItem('Run setup', 'setupSheets')
    .addToUi();
}

/* ---------- SETUP ---------- */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.entries(SCHEMA).forEach(([name, headers], index) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    compactTab_(sh, headers);
    formatTab_(sh, headers);
    ss.setActiveSheet(sh);
    ss.moveActiveSheet(index + 1);
  });
  COLUMN_FORMATS.forEach(([tab, col, fmt]) => columnRange_(ss, tab, col).setNumberFormat(fmt));
  protectAutoColumns_(ss);
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);
  ss.setActiveSheet(ss.getSheetByName(TABS.TEMPLATES));
  SpreadsheetApp.getUi().alert('Setup complete ✅', 'All tabs are ready with the same format. Your data was kept.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Keeps only real records (id filled in), moves them to the top, clears leftovers below. */
function compactTab_(sh, headers) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const width = Math.max(headers.length, sh.getLastColumn());
  const range = sh.getRange(2, 1, last - 1, width);
  const records = range.getValues().filter(isRecord_);
  if (records.length === last - 1) return;                 // nothing to move → keep links/formatting as they are
  range.clearContent();
  if (records.length) sh.getRange(2, 1, records.length, width).setValues(records);
}

function formatTab_(sh, headers) {
  const cols = headers.length;
  sh.showColumns(1, sh.getMaxColumns());
  sh.setFrozenRows(0);
  sh.setFrozenColumns(0);

  // 1) reset: remove dropdowns, checkboxes, colours and notes left by earlier versions
  const whole = sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns());
  sh.getBandings().forEach(b => b.remove());
  whole.clearDataValidations().clearNote().clearFormat();
  sh.clearConditionalFormatRules();
  sh.setTabColor(null);

  // 2) apply the one shared style (long text is clipped, so every row stays one line high)
  const table = sh.getRange(1, 1, sh.getMaxRows(), cols);
  table.setFontFamily(STYLE.font).setFontSize(STYLE.fontSize).setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  table.applyRowBanding()
    .setHeaderRowColor(STYLE.headerBg).setFirstRowColor(STYLE.rowBg).setSecondRowColor(STYLE.stripeBg);
  sh.getRange(1, 1, 1, cols).setFontColor(STYLE.headerText).setFontWeight('bold');
  sh.setRowHeight(1, STYLE.headerHeight);

  // 3) widths + help notes
  headers.forEach((h, i) => {
    const [width, help] = COLUMN_INFO[h] || [140, ''];
    sh.setColumnWidth(i + 1, width);
    sh.getRange(1, i + 1).setNote(help);
  });

  // 4) hide unused columns, freeze header + first column
  if (sh.getMaxColumns() > cols) sh.hideColumns(cols + 1, sh.getMaxColumns() - cols);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(1);
}

/** Warning (not a block) when someone types in a system column. Old protections are replaced, so setup can run again. */
function protectAutoColumns_(ss) {
  ss.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .filter(p => p.getDescription() === AUTO_PROTECTION_NOTE)
    .forEach(p => p.remove());
  Object.entries(AUTO_COLUMNS).forEach(([tab, columns]) => columns.forEach(column =>
    columnRange_(ss, tab, column).protect().setDescription(AUTO_PROTECTION_NOTE).setWarningOnly(true)));
}

function columnRange_(ss, tab, column) {
  const sh = ss.getSheetByName(tab);
  return sh.getRange(2, SCHEMA[tab].indexOf(column) + 1, sh.getMaxRows() - 1, 1);
}

/* ---------- CHECK DATA (replaces dropdowns) ---------- */
function checkData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = Object.fromEntries(Object.keys(SCHEMA).map(tab => [tab, readTab_(ss, tab)]));
  const problems = [];
  const reporter = tab => (row, msg) => problems.push(`${tab} row ${row}: ${msg}`);
  const templateIds = new Set(data.Templates.map(r => String(r.template_id)));
  const eventIds = new Set(data.Events.map(r => String(r.event_id)));
  const hasLink = text => String(text) === '' || String(text).includes('{LINK}');

  const t = reporter(TABS.TEMPLATES);
  checkIds_(data.Templates, 'template_id', t);
  data.Templates.forEach(r => {
    if (!r.renderer) t(r._row, 'renderer is empty');
    if (!isJson_(r.theme_json)) t(r._row, 'theme_json is not valid JSON');
    if (!isBool_(r.active)) t(r._row, 'active must be TRUE or FALSE');
    if (!hasLink(r.invite_message)) t(r._row, 'invite_message must contain {LINK}');
  });

  const e = reporter(TABS.EVENTS);
  checkIds_(data.Events, 'event_id', e);
  data.Events.forEach(r => {
    if (!templateIds.has(String(r.template_id))) e(r._row, `template_id "${r.template_id}" is not in Templates`);
    if (!STATUSES.includes(String(r.status))) e(r._row, `status must be ${STATUSES.join(', ')}`);
    if (r.theme_override_json !== '' && !isJson_(r.theme_override_json)) e(r._row, 'theme_override_json is not valid JSON');
    if (!hasLink(r.invite_message)) e(r._row, 'invite_message must contain {LINK}');
  });

  const f = reporter(TABS.FIELDS);
  const seen = new Set();
  data.Fields.forEach(r => {
    const owner = String(r.event_id), key = String(r.field_key);
    if (owner !== '*' && !eventIds.has(owner)) f(r._row, `event_id "${owner}" is not in Events (use * for all events)`);
    if (!ID_PATTERN.test(key)) f(r._row, 'field_key must be letters, digits, - or _ (no spaces)');
    if (seen.has(owner + '|' + key)) f(r._row, `field_key "${key}" is repeated for event "${owner}"`);
    seen.add(owner + '|' + key);
    if (!FIELD_TYPES.includes(String(r.type))) f(r._row, `type must be one of: ${FIELD_TYPES.join(', ')}`);
    if (['choice', 'code'].includes(String(r.type)) && r.options === '') f(r._row, `options is required for type ${r.type}`);
    if (!isBool_(r.required)) f(r._row, 'required must be TRUE or FALSE');
    if (!isBool_(r.secret)) f(r._row, 'secret must be TRUE or FALSE');
  });

  const g = reporter(TABS.GUESTS);
  const guestMobiles = new Set();
  data.Guests.forEach(r => {
    const mobile = normalizeMobile_(r.mobile);
    if (!eventIds.has(String(r.event_id))) g(r._row, `event_id "${r.event_id}" is not in Events`);
    if (!String(r.name).trim()) g(r._row, 'name is empty');
    if (!/^\d{9,15}$/.test(mobile)) g(r._row, `mobile "${r.mobile}" is not a valid number`);
    else if (guestMobiles.has(r.event_id + '|' + mobile)) g(r._row, `mobile ${mobile} is listed twice for this event`);
    guestMobiles.add(r.event_id + '|' + mobile);
  });

  const ui = SpreadsheetApp.getUi();
  if (!problems.length) return ui.alert('All good ✅', 'No problems found in Templates, Events, Fields or Guests.', ui.ButtonSet.OK);
  const shown = problems.slice(0, 25).join('\n');
  const more = problems.length > 25 ? `\n…and ${problems.length - 25} more` : '';
  ui.alert(`Found ${problems.length} problem(s)`, shown + more, ui.ButtonSet.OK);
}

function readTab_(ss, tab) {
  const sh = ss.getSheetByName(tab), headers = SCHEMA[tab];
  const last = sh ? sh.getLastRow() : 0;
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, headers.length).getValues()
    .map((values, i) => ({ values, row: i + 2 }))
    .filter(({ values }) => isRecord_(values))
    .map(({ values, row }) => ({ _row: row, ...Object.fromEntries(headers.map((h, j) => [h, values[j]])) }));
}

function checkIds_(rows, key, report) {
  const seen = new Set();
  rows.forEach(r => {
    const id = String(r[key]);
    if (!ID_PATTERN.test(id)) report(r._row, `${key} must be letters, digits, - or _ (no spaces)`);
    else if (seen.has(id)) report(r._row, `${key} "${id}" is repeated`);
    seen.add(id);
  });
}

const isJson_ = v => { try { JSON.parse(String(v)); return true; } catch (err) { return false; } };
const isBool_ = v => v === true || v === false || ['TRUE', 'FALSE'].includes(String(v).toUpperCase());
