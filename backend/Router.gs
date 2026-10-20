/* =====================================================================
 * Router – the front door. doGet / doPost are called by Google when
 * someone opens the API link; ROUTES decides which service answers.
 * ===================================================================== */

const ROUTES = Object.freeze({
  GET: {
    invitation: p => EventService.getPublicInvitation(p.id, p.g),
    preview:    p => EventService.getPreview(p.template),
    templates:  () => TemplateService.listActive()
  },
  POST: {
    rsvp: body => ResponseService.submit(body)
  }
});

function doGet(e) {
  return handle_('GET', e.parameter.action, e.parameter);
}

function doPost(e) {
  const body = parseJson_(e.postData && e.postData.contents, {});
  return handle_('POST', body.action, body);
}

function handle_(method, action, input) {
  try {
    const route = ROUTES[method][action];
    if (!route) throw new AppError(404, 'Unknown action: ' + action);
    return json_({ ok: true, data: route(input) });
  } catch (err) {
    const known = err instanceof AppError;
    if (!known) console.error(err);                      // real bugs are logged for you, hidden from guests
    return json_({
      ok: false,
      status: known ? err.status : 500,
      error: known ? err.message : 'Something went wrong',
      details: known ? err.details : undefined
    });
  }
}
