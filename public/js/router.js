/* =====================================================================
 * router.js – turns the address into what to show.
 *   /e/bathukamma-2026?g=4f718e80  or  /?id=bathukamma-2026&g=4f718e80  → personal invitation
 *   /e/bathukamma-2026             or  /?id=bathukamma-2026             → invitation
 *   /preview/photobooth-navy       or  /?preview=photobooth-navy        → design preview
 *   /gallery  or  /                                                     → list of designs
 * (The ?id= / ?preview= forms also work on your computer with Live Server.)
 * ===================================================================== */

export function resolveRoute({ pathname, search }) {
  const [first, second] = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(search);
  const guestCode = params.get('g') || '';

  if (first === 'e' && second) return { name: 'invitation', id: second, guestCode };
  if (first === 'preview' && second) return { name: 'preview', id: second };
  if (params.get('id')) return { name: 'invitation', id: params.get('id'), guestCode };
  if (params.get('preview')) return { name: 'preview', id: params.get('preview') };
  return { name: 'gallery' };
}
