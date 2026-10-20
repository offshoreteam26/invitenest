/* =====================================================================
 * app.js – the starting point. It is the only file that knows every
 * module and wires them together: route → data → theme → design → form.
 * ===================================================================== */
import { Api } from './api.js';
import { applyTheme } from './theme.js';
import { getRenderer } from './renderers/registry.js';
import { buildForm } from './form/form-builder.js';
import { renderGallery } from './gallery.js';
import { resolveRoute } from './router.js';
import { el, icon } from './dom.js';
import { createMusic } from './music.js';

const root = document.getElementById('app');
const DEFAULT_GREETING = 'Dear {NAME}';

function showMessage(title, text, iconName) {
  root.replaceChildren(
    el('section', { class: 'message' },
      iconName ? el('div', { class: 'message-icon' }, icon(iconName)) : null,
      el('h1', { class: 'display' }, title),
      text ? el('p', { class: 'meta' }, text) : null));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** "Namaskaram {NAME} garu" + guest → "Namaskaram Ravi garu"; no guest → no greeting. */
function greetingFor(guest, template, renderer) {
  if (!guest || !guest.name) return '';
  const pattern = template.theme.greeting || renderer.greeting || DEFAULT_GREETING;
  return pattern.replace('{NAME}', guest.name);
}

function showInvitation({ event, template, fields, guest }, { isPreview, guestCode }) {
  applyTheme(template.theme);
  document.title = `${event.title} – ${event.hosts}`;
  root.replaceChildren();

  // music: the event's song, or the design's built-in chimes; starts when "Open invitation" is tapped
  const music = createMusic({ url: event.music_url, mode: template.theme.music });
  if (music) {
    document.body.append(music.button);
    root.addEventListener('click', e => { if (e.target.closest('.btn-open')) music.start(); });
  }

  const renderer = getRenderer(template.renderer);
  renderer.render(root, event, {
    greeting: greetingFor(guest, template, renderer),
    onOpen: () => {
      if (!fields.length) return;
      const initial = guest ? { name: guest.name } : {};
      const form = buildForm(fields, async answers => {
        if (!isPreview) await Api.submitRsvp(event.event_id, answers, guestCode);
        showMessage(
          isPreview ? 'Preview only' : 'Thank you!',
          isPreview ? 'This is a design preview, nothing was saved.' : 'Your reply has been saved. We look forward to seeing you!',
          'check');
      }, initial);
      root.append(form);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

async function main() {
  const route = resolveRoute(window.location);
  showMessage('Opening…');

  if (route.name === 'gallery') {
    const templates = await Api.listTemplates();
    root.replaceChildren();
    renderGallery(root, templates);
    return;
  }

  const isPreview = route.name === 'preview';
  const data = isPreview ? await Api.getPreview(route.id) : await Api.getInvitation(route.id, route.guestCode);
  showInvitation(data, { isPreview, guestCode: route.guestCode || '' });
}

main().catch(err => showMessage('Sorry', err.message));
