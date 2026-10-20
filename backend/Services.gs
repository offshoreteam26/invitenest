/* =====================================================================
 * Services – business rules. They never touch the Sheet directly;
 * all reads and writes go through Repos (Repository.gs).
 * ===================================================================== */

const PUBLIC_EVENT_KEYS = ['event_id', 'title', 'hosts', 'venue', 'map_url', 'music_url'];
const RSVP_LIMIT_PER_MINUTE = 60;

const SAMPLE_EVENT = Object.freeze({
  event_id: 'preview', title: 'Save the date', hosts: 'Ananya & Rohan', date: '2026-12-12',
  time: '7:00 PM', venue: '[Venue], Hyderabad', map_url: '', music_url: '', photos: [], rsvpDeadline: ''
});

/* ---------- Row → clean object (written once, used everywhere) ---------- */
const toTemplate_ = r => ({
  id: r.template_id,
  name: r.name,
  renderer: r.renderer,
  theme: parseJson_(r.theme_json, {}),
  previewImage: String(r.preview_image || '').trim(),
  music: String(r.music || '').trim()
});

const toField_ = r => ({
  key: r.field_key,
  label: r.label,
  type: r.type,
  required: isTrue_(r.required),
  options: splitList_(r.options),
  min: r.min === '' ? null : Number(r.min),
  max: r.max === '' ? null : Number(r.max),
  order: Number(r.order) || 0,
  secret: isTrue_(r.secret)
});

const toPublicEvent_ = r => ({
  ...pick_(r, PUBLIC_EVENT_KEYS),
  date: toIsoDate_(r.date),
  time: toTimeText_(r.time),
  rsvpDeadline: toIsoDate_(r.rsvp_deadline),
  photos: splitList_(r.photos)
});

/* ---------- Templates ---------- */
const TemplateService = {
  get(templateId) {
    const cache = CacheService.getScriptCache();
    const key = 'tpl:' + templateId;
    const hit = cache.get(key);
    if (hit) return JSON.parse(hit);
    const row = Repos.templates().findOne('template_id', templateId);
    if (!row || !isTrue_(row.active)) throw new AppError(404, 'Template not found');
    const tpl = toTemplate_(row);
    cache.put(key, JSON.stringify(tpl), 300);            // remembered 5 minutes = faster pages
    return tpl;
  },

  listActive() {
    return Repos.templates().findAll().filter(r => isTrue_(r.active)).map(toTemplate_);
  }
};

/* ---------- Form questions ---------- */
const FieldService = {
  /** The event's own questions; if it has none, the default (*) questions. */
  forEvent(eventId) {
    const all = Repos.fields().findAll();
    const own = all.filter(f => String(f.event_id) === String(eventId));
    return (own.length ? own : all.filter(f => f.event_id === '*'))
      .map(toField_)
      .sort((a, b) => a.order - b.order);
  },

  /** What the browser may see: secret answers (the venue code) are removed. */
  publicView({ secret, ...field }) {
    return secret ? { ...field, options: [] } : field;
  }
};

/* ---------- Attendance (one rule, used by RSVP save and the Guests tab) ---------- */
const ATTENDING_KEY = 'attending';                       // field_key of the "Will you attend?" question
const PARTY_KEYS = ['adults', 'children', 'guests'];     // numbers that add up to the party size
const NOT_ATTENDING = /^(no|sadly|regret|decline|can't|cannot)/i;

/** answers → { attending: 'Yes' | 'No', party_size: number } */
function attendanceFrom_(answers) {
  const coming = !(ATTENDING_KEY in answers) || !NOT_ATTENDING.test(String(answers[ATTENDING_KEY]).trim());
  if (!coming) return { attending: 'No', party_size: 0 };
  const counted = PARTY_KEYS.filter(k => k in answers && answers[k] !== '');
  const size = counted.reduce((sum, k) => sum + (Number(answers[k]) || 0), 0);
  return { attending: 'Yes', party_size: counted.length ? size : 1 };
}

/* ---------- Guests (personal WhatsApp invitations) ---------- */
const GuestService = {
  /** The guest behind a personal link, or null when the code is missing or wrong. */
  find(eventId, guestCode) {
    if (!guestCode) return null;
    return Repos.guests().findAll().find(g =>
      String(g.event_id) === String(eventId) && String(g.guest_code) === String(guestCode)) || null;
  },

  /** Only the first name-level detail leaves the server (links get forwarded – never send the mobile). */
  publicView(guest) {
    return guest ? { name: String(guest.name).trim() } : null;
  },

  markReplied(eventId, guestCode, mobile, attendance) {
    Repos.guests().update(g => String(g.event_id) === String(eventId) && (
      (guestCode && String(g.guest_code) === String(guestCode)) ||
      (mobile && normalizeMobile_(g.mobile) === mobile)
    ), { status: GUEST_STATUS.REPLIED, ...attendance });
  }
};

/* ---------- Events ---------- */
const EventService = {
  getLive(eventId) {
    const row = Repos.events().findOne('event_id', eventId);
    if (!row || String(row.status).trim() !== 'Live') throw new AppError(404, 'Invitation not found');
    return row;
  },

  getPublicInvitation(eventId, guestCode) {
    const row = this.getLive(eventId);
    const template = TemplateService.get(row.template_id);
    template.theme = { ...template.theme, ...parseJson_(row.theme_override_json, {}) };
    return {
      event: toPublicEvent_(row),
      template,
      fields: FieldService.forEvent(eventId).map(FieldService.publicView),
      guest: GuestService.publicView(GuestService.find(eventId, guestCode))
    };
  },

  getPreview(templateId) {
    return {
      event: SAMPLE_EVENT,
      template: TemplateService.get(templateId),
      fields: FieldService.forEvent('*').map(FieldService.publicView),
      guest: null
    };
  }
};

/* ---------- RSVP ---------- */
const ResponseService = {
  submit({ eventId, answers = {}, guestCode = '' }) {
    const event = EventService.getLive(eventId);
    if (event.rsvp_deadline && new Date() > endOfDay_(event.rsvp_deadline)) {
      throw new AppError(410, 'Sorry, RSVP for this event is closed');
    }
    this.checkRateLimit_(eventId);

    const fields = FieldService.forEvent(eventId);
    const errors = validateAnswers_(fields, answers);
    if (Object.keys(errors).length) throw new AppError(422, 'Please fix the highlighted fields', errors);

    // keep only known, non-secret answers (the venue code is checked, never stored)
    const clean = Object.fromEntries(fields.filter(f => !f.secret).map(f => [f.key, answers[f.key] ?? '']));
    const mobile = clean.mobile ? normalizeMobile_(clean.mobile) : '';
    const guest = GuestService.find(eventId, guestCode);
    const code = guest ? String(guest.guest_code) : '';

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);                                // checks + writes happen one guest at a time
    try {
      if (this.hasReplied_(eventId, mobile, code)) {
        throw new AppError(409, 'You have already replied – thank you!');
      }
      Repos.responses().append({
        submitted_at: new Date(),
        event_id: eventId,
        response_id: Utilities.getUuid(),
        name: clean.name || (guest ? guest.name : ''),
        mobile: mobile,
        answers_json: JSON.stringify(clean),
        guest_code: code
      });
      GuestService.markReplied(eventId, code, mobile, attendanceFrom_(clean));
    } finally {
      lock.releaseLock();
    }
    return { saved: true };
  },

  /** One reply per guest link and per mobile number, per event. */
  hasReplied_(eventId, mobile, guestCode) {
    return Repos.responses().findBy('event_id', eventId).some(r =>
      (mobile && normalizeMobile_(r.mobile) === mobile) ||
      (guestCode && String(r.guest_code) === guestCode));
  },

  /** At most RSVP_LIMIT_PER_MINUTE replies per event per minute (stops flooding and code guessing). */
  checkRateLimit_(eventId) {
    const cache = CacheService.getScriptCache();
    const key = 'rl:' + eventId + ':' + Math.floor(Date.now() / 60000);
    const count = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(count), 120);
    if (count > RSVP_LIMIT_PER_MINUTE) {
      throw new AppError(429, 'Too many replies right now, please try again in a minute');
    }
  }
};
