/* =====================================================================
 * SampleData – test data. Run loadSampleData from the editor.
 * Adds missing rows, and fills EMPTY cells of rows that already exist
 * (it never overwrites something you typed).
 * ===================================================================== */

const SAMPLE_DATA = Object.freeze({
  Templates: [
    {
      template_id: 'bathukamma-bloom', name: 'Bathukamma Bloom', renderer: 'bathukamma', active: 'TRUE',
      theme_json: '{"bg":"#4A1336","ink":"#FFF6E5","accent":"#F4C430","font_display":"Cormorant Garamond"}',
      invite_message: [
        'Namaskaram {NAME} garu 🌸',
        '',
        'With great joy, {HOSTS} warmly invites you and your family to celebrate *{TITLE}* with us.',
        '',
        '📅 {DATE} · {TIME}',
        '📍 {VENUE}',
        '',
        'Your personal invitation is ready. Tap below to open it and let us know if you can join:',
        '{LINK}',
        '',
        'బతుకమ్మ శుభాకాంక్షలు!'
      ].join('\n')
    },
    {
      template_id: 'photobooth-navy', name: 'Photobooth Navy', renderer: 'photobooth', active: 'TRUE',
      theme_json: '{"bg":"#1E2A44","ink":"#F6F1E7","accent":"#E3C88A","font_display":"Cormorant Garamond"}',
      invite_message: [
        'Dear {NAME},',
        '',
        'Save the date! {HOSTS} would be delighted to have you celebrate with them.',
        '',
        '📅 {DATE} · {TIME}',
        '📍 {VENUE}',
        '',
        'Your invitation is waiting for you. Open it and RSVP here:',
        '{LINK}',
        '',
        'With love,',
        '{HOSTS}'
      ].join('\n')
    }
  ],
  Events: [
    { event_id: 'bathukamma-2026', template_id: 'bathukamma-bloom', status: 'Live', title: 'Bathukamma 2026',
      hosts: 'Telugu Association Dubai', date: '2026-11-01', time: '5:00 PM', venue: '[Venue], Dubai',
      rsvp_deadline: '2026-10-31' }
  ],
  Fields: [
    { event_id: 'bathukamma-2026', field_key: 'name', label: 'Full name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'adults', label: 'Number of adults (including you)', type: 'counter', required: 'TRUE', min: 1, max: 30, order: 3, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'children', label: 'Number of children', type: 'counter', required: 'FALSE', min: 0, max: 30, order: 4, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'member', label: 'Are you a registered member?', type: 'choice', required: 'TRUE', options: 'Yes,No,Not sure', order: 5, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'code', label: "Today's venue code", type: 'code', required: 'TRUE', options: '1910', order: 6, secret: 'TRUE' }
  ]
});

// how each tab recognises a row that is already there
const SAMPLE_KEYS = Object.freeze({
  Templates: r => r.template_id,
  Events:    r => r.event_id,
  Fields:    r => r.event_id + '|' + r.field_key
});

function loadSampleData() {
  const report = Object.entries(SAMPLE_DATA).map(([tab, rows]) => {
    const repo = new SheetRepository(tab);
    const keyOf = SAMPLE_KEYS[tab];
    const existing = new Map(repo.findAll().map(r => [String(keyOf(r)), r]));
    let added = 0, filled = 0;
    rows.forEach(sample => {
      const key = String(keyOf(sample));
      const current = existing.get(key);
      if (!current) { repo.append(sample); added++; return; }
      const missing = Object.fromEntries(Object.entries(sample).filter(([col]) => current[col] === ''));
      if (Object.keys(missing).length) filled += repo.update(r => String(keyOf(r)) === key, missing);
    });
    return `${tab}: ${added} added, ${filled} updated`;
  });
  console.log(report.join('\n'));
}
