/* Tests you can run from the editor (choose the function, then ▶ Run). */

function testInvitation() {
  const data = EventService.getPublicInvitation('bathukamma-2026');
  console.log(JSON.stringify(data, null, 2));
}

/** Uses the first guest of bathukamma-2026 from the Guests tab (run Prepare WhatsApp invites first). */
function testInvitationForGuest() {
  const guest = Repos.guests().findBy('event_id', 'bathukamma-2026').find(g => g.guest_code);
  if (!guest) return console.log('No prepared guest yet – add a guest and run 📲 Prepare WhatsApp invites');
  const data = EventService.getPublicInvitation('bathukamma-2026', guest.guest_code);
  console.log('guest seen by the website:', JSON.stringify(data.guest));
}

/** Prints the exact WhatsApp message the first guest will receive. */
function testInviteMessage() {
  const event = Repos.events().findOne('event_id', 'bathukamma-2026');
  const templates = new Map(Repos.templates().findAll().map(t => [String(t.template_id), t]));
  console.log(fillMessage_(messageFor_(event, templates), event, 'Ravi', SITE_URL + '/e/bathukamma-2026?g=abc12345'));
}

function testWrongRsvp() {
  try {
    ResponseService.submit({ eventId: 'bathukamma-2026', answers: { name: '', mobile: '123', code: '0000' } });
  } catch (err) {
    console.log(err.message, JSON.stringify(err.details, null, 2));
  }
}

function testGoodRsvp() {
  const result = ResponseService.submit({
    eventId: 'bathukamma-2026',
    answers: { name: 'Test Guest', mobile: '0501234567', adults: 2, children: 1, member: 'Yes', code: '1910' }
  });
  console.log(JSON.stringify(result));
}
