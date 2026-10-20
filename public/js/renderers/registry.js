/* =====================================================================
 * Renderer registry – the "renderer" column in the Templates tab picks
 * one of these. Adding a new design = new file + one line here.
 *
 * Renderer contract (every renderer follows it, so any one can replace another):
 *   render(root, event, { onOpen })
 *     - draws the invitation into root
 *     - calls onOpen() once the guest has opened it (the app then shows the RSVP form)
 * ===================================================================== */
import { photobooth } from './photobooth.js';
import { bathukamma } from './bathukamma.js';

const RENDERERS = Object.freeze({ photobooth, bathukamma });

export function getRenderer(key) {
  const renderer = RENDERERS[key];
  if (!renderer) throw new Error(`This invitation uses a design ("${key}") that this website does not have yet.`);
  return renderer;
}
