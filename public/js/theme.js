/* =====================================================================
 * theme.js – a template's look is DATA from the Sheet (theme_json).
 * Each key becomes a CSS variable:  bg → --bg,  font_display → --font-display
 * ===================================================================== */

export function applyTheme(theme = {}) {
  const style = document.documentElement.style;
  Object.entries(theme).forEach(([key, value]) => {
    style.setProperty('--' + key.replace(/_/g, '-'), String(value));
  });
  if (theme.bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
  [theme.font_display, theme.font_body].filter(Boolean).forEach(loadGoogleFont);
}

function loadGoogleFont(family) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600&display=swap`;
  document.head.append(link);
}
