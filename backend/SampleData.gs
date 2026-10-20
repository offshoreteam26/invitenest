/* =====================================================================
 * SampleData – example designs, events and questions for different
 * kinds of events. Run loadSampleData from the editor.
 * Adds missing rows, and fills EMPTY cells of rows that already exist
 * (it never overwrites something you typed).
 * ===================================================================== */

const msg_ = lines => lines.join('\n');                 // multi-line WhatsApp message helper

const SAMPLE_DATA = Object.freeze({
  /* ------------------------------ DESIGNS ------------------------------ */
  Templates: [
    {
      template_id: 'bathukamma-bloom', name: 'Bathukamma Bloom', renderer: 'bathukamma', active: 'TRUE',
      theme_json: '{"bg":"#4A1336","ink":"#FFF6E5","accent":"#F4C430","on_accent":"#4A1336","font_display":"Cormorant Garamond","font_body":"Jost"}',
      invite_message: msg_([
        'Namaskaram {NAME} garu 🌸', '',
        'With great joy, {HOSTS} warmly invites you and your family to celebrate *{TITLE}* with us.', '',
        '📅 {DATE} · {TIME}', '📍 {VENUE}', '',
        'Your personal invitation is ready. Tap below to open it and let us know if you can join:', '{LINK}', '',
        'బతుకమ్మ శుభాకాంక్షలు!'])
    },
    {
      template_id: 'photobooth-navy', name: 'Photobooth Navy', renderer: 'photobooth', active: 'TRUE',
      theme_json: '{"bg":"#1E2A44","ink":"#F6F1E7","accent":"#E3C88A","on_accent":"#1E2A44","font_display":"Cormorant Garamond","font_body":"Jost"}',
      invite_message: msg_([
        'Dear {NAME},', '',
        'Save the date! {HOSTS} would be delighted to have you celebrate with them.', '',
        '📅 {DATE} · {TIME}', '📍 {VENUE}', '',
        'Your invitation is waiting for you. Open it and reply here:', '{LINK}', '',
        'With love,', '{HOSTS}'])
    },
    {
      template_id: 'envelope-blush', name: 'Envelope Blush (wedding)', renderer: 'envelope', active: 'TRUE',
      theme_json: '{"bg":"#F6ECE9","ink":"#3A2A2C","accent":"#B5646F","on_accent":"#FFFFFF","seal":"#7A2E3A","font_display":"Cormorant Garamond","font_body":"Jost"}',
      invite_message: msg_([
        'Dear {NAME},', '',
        'Together with their families, *{HOSTS}* request the pleasure of your company at their wedding celebration.', '',
        '📅 {DATE} · {TIME}', '📍 {VENUE}', '',
        'Please open your invitation and kindly reply:', '{LINK}', '',
        'With love and blessings 💐'])
    },
    {
      template_id: 'modern-birthday', name: 'Modern Pop (birthday)', renderer: 'modern', active: 'TRUE',
      theme_json: '{"bg":"#FFF8F0","ink":"#1F1A2E","accent":"#FF6B4A","accent2":"#3D5AFE","accent3":"#FFC23C","on_accent":"#FFFFFF","font_display":"Space Grotesk","font_body":"Inter"}',
      invite_message: msg_([
        'Hi {NAME}! 🎉', '',
        "You're invited to *{TITLE}*!", '',
        '📅 {DATE} · {TIME}', '📍 {VENUE}', '',
        'Open your invitation and tell us if you can make it:', '{LINK}', '',
        'See you there! 🎈', '{HOSTS}'])
    },
    {
      template_id: 'modern-corporate', name: 'Modern Night (corporate)', renderer: 'modern', active: 'TRUE',
      theme_json: '{"bg":"#0E1726","ink":"#EAF2FF","accent":"#2DD4BF","accent2":"#6366F1","accent3":"#F59E0B","on_accent":"#0E1726","font_display":"Space Grotesk","font_body":"Inter"}',
      invite_message: msg_([
        'Dear {NAME},', '',
        '{HOSTS} invites you to *{TITLE}*.', '',
        '📅 {DATE} · {TIME}', '📍 {VENUE}', '',
        'Please confirm your attendance using your personal link:', '{LINK}', '',
        'Best regards,', '{HOSTS}'])
    }
  ],

  /* ------------------------------ EVENTS ------------------------------- */
  Events: [
    { event_id: 'bathukamma-2026', template_id: 'bathukamma-bloom', status: 'Live', title: 'Bathukamma 2026',
      hosts: 'Telugu Association Dubai', date: '2026-11-01', time: '5:00 PM', venue: '[Venue], Dubai',
      rsvp_deadline: '2026-10-31' },
    { event_id: 'ananya-rohan-wedding', template_id: 'envelope-blush', status: 'Live', title: 'Wedding Celebration',
      hosts: 'Ananya & Rohan', date: '2027-01-24', time: '7:00 PM', venue: '[Venue], Hyderabad',
      rsvp_deadline: '2027-01-10' },
    { event_id: 'ananya-rohan-save-date', template_id: 'photobooth-navy', status: 'Live', title: 'Save the date',
      hosts: 'Ananya & Rohan', date: '2027-01-24', time: '7:00 PM', venue: '[Venue], Hyderabad',
      rsvp_deadline: '2026-12-31' },
    { event_id: 'aarav-turns-5', template_id: 'modern-birthday', status: 'Live', title: 'Aarav turns 5!',
      hosts: 'Priya & Kiran', date: '2026-12-06', time: '4:00 PM', venue: '[Venue], Bengaluru',
      rsvp_deadline: '2026-12-01' },
    { event_id: 'team-meetup-2026', template_id: 'modern-corporate', status: 'Live', title: 'Annual Team Meetup 2026',
      hosts: '[Company name]', date: '2026-12-12', time: '6:30 PM', venue: '[Venue], Dubai',
      rsvp_deadline: '2026-12-05' }
  ],

  /* ----------------------------- QUESTIONS ----------------------------- */
  Fields: [
    // default questions (*) – used by any event without its own, and by design previews
    { event_id: '*', field_key: 'name', label: 'Full name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: '*', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: '*', field_key: 'attending', label: 'Will you attend?', type: 'choice', required: 'TRUE', options: 'Yes,No', order: 3, secret: 'FALSE' },
    { event_id: '*', field_key: 'guests', label: 'Number of guests (including you)', type: 'counter', required: 'FALSE', min: 1, max: 10, order: 4, secret: 'FALSE' },
    { event_id: '*', field_key: 'note', label: 'A message for the hosts', type: 'textarea', required: 'FALSE', order: 5, secret: 'FALSE' },

    // Bathukamma check-in (venue code)
    { event_id: 'bathukamma-2026', field_key: 'name', label: 'Full name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'adults', label: 'Number of adults (including you)', type: 'counter', required: 'TRUE', min: 1, max: 30, order: 3, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'children', label: 'Number of children', type: 'counter', required: 'FALSE', min: 0, max: 30, order: 4, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'member', label: 'Are you a registered member?', type: 'choice', required: 'TRUE', options: 'Yes,No,Not sure', order: 5, secret: 'FALSE' },
    { event_id: 'bathukamma-2026', field_key: 'code', label: "Today's venue code", type: 'code', required: 'TRUE', options: '1910', order: 6, secret: 'TRUE' },

    // Wedding
    { event_id: 'ananya-rohan-wedding', field_key: 'name', label: 'Full name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: 'ananya-rohan-wedding', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: 'ananya-rohan-wedding', field_key: 'attending', label: 'Will you join us?', type: 'choice', required: 'TRUE', options: 'Joyfully accept,Regretfully decline', order: 3, secret: 'FALSE' },
    { event_id: 'ananya-rohan-wedding', field_key: 'guests', label: 'Number of guests (including you)', type: 'counter', required: 'FALSE', min: 1, max: 6, order: 4, secret: 'FALSE' },
    { event_id: 'ananya-rohan-wedding', field_key: 'meal', label: 'Meal preference', type: 'choice', required: 'FALSE', options: 'Vegetarian,Non-vegetarian', order: 5, secret: 'FALSE' },
    { event_id: 'ananya-rohan-wedding', field_key: 'note', label: 'Blessings for the couple', type: 'textarea', required: 'FALSE', order: 6, secret: 'FALSE' },

    // Kid's birthday
    { event_id: 'aarav-turns-5', field_key: 'name', label: 'Parent name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: 'aarav-turns-5', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: 'aarav-turns-5', field_key: 'attending', label: 'Can you come?', type: 'choice', required: 'TRUE', options: 'Yes,No', order: 3, secret: 'FALSE' },
    { event_id: 'aarav-turns-5', field_key: 'adults', label: 'Adults', type: 'counter', required: 'FALSE', min: 0, max: 6, order: 4, secret: 'FALSE' },
    { event_id: 'aarav-turns-5', field_key: 'children', label: 'Kids', type: 'counter', required: 'FALSE', min: 0, max: 6, order: 5, secret: 'FALSE' },
    { event_id: 'aarav-turns-5', field_key: 'allergies', label: 'Any food allergies?', type: 'text', required: 'FALSE', order: 6, secret: 'FALSE' },

    // Corporate meetup
    { event_id: 'team-meetup-2026', field_key: 'name', label: 'Full name', type: 'text', required: 'TRUE', order: 1, secret: 'FALSE' },
    { event_id: 'team-meetup-2026', field_key: 'mobile', label: 'Mobile number (WhatsApp)', type: 'tel', required: 'TRUE', order: 2, secret: 'FALSE' },
    { event_id: 'team-meetup-2026', field_key: 'email', label: 'Work email', type: 'email', required: 'TRUE', order: 3, secret: 'FALSE' },
    { event_id: 'team-meetup-2026', field_key: 'attending', label: 'Will you attend?', type: 'choice', required: 'TRUE', options: 'Yes,No', order: 4, secret: 'FALSE' },
    { event_id: 'team-meetup-2026', field_key: 'diet', label: 'Dietary requirement', type: 'choice', required: 'FALSE', options: 'None,Vegetarian,Vegan,Halal', order: 5, secret: 'FALSE' }
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
