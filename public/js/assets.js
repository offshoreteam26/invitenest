/* =====================================================================
 * assets.js – lets the Sheet use short paths for files that live in this website:
 *   images/meera-arjun/1.jpg   → https://invitenest.netlify.app/images/meera-arjun/1.jpg
 *   music/wedding-harp.mp3     → https://invitenest.netlify.app/music/wedding-harp.mp3
 * Full links (https://…) and the word "chimes" are kept exactly as they are.
 * ===================================================================== */

const KEEP_AS_IS = /^(https?:)?\/\/|^data:|^chimes$/i;

export function resolveAsset(path) {
  const value = String(path || '').trim();
  if (!value || KEEP_AS_IS.test(value)) return value;
  return new URL(value.replace(/^\.?\/+/, ''), window.location.origin + '/').href;
}
