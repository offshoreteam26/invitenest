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
import { el } from './dom.js';

const root = document.getElementById('app');
const DEFAULT_GREETING = 'Dear {NAME}';

function showMessage(title, text) {
  root.replaceChildren(
    el('section', { class: 'message' },
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
          isPreview ? 'This is a design preview, nothing was saved.' : 'Your reply has been saved. We look forward to seeing you!');
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
