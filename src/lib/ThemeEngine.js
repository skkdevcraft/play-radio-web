// ThemeEngine.js

/* =========================================================
   THEME ENGINE (CSS FILE BASED)
   Loads built-in themes as external CSS files.
   No JSON skins. No upload/download. No custom injection.
========================================================= */

export const ThemeEngine = (() => {

  const STORAGE_KEY = 'radio_active_theme_id';
  const LINK_ID     = 'theme-stylesheet';

  /* -------------------------------------------------------
     BUILT-IN THEMES
     Each theme corresponds to:
       /themes/{id}.css
  ------------------------------------------------------- */
  const THEMES = [
    { id: 'dark-matrix', name: 'Dark Matrix', label: 'Default' },
    { id: 'amber-glow',  name: 'Amber Glow',  label: 'Retro CRT' },
    { id: 'arctic-frost', name: 'Arctic Frost', label: 'Light & Clean' },
    { id: 'neon-dusk', name: 'Neon Dusk', label: 'Synthwave' },
    { id: 'valentine', name: 'Valentine', label: 'Valentine' },
    { id: 'christmas', name: 'Christmas', label: 'Christmas' },
    { id: 'dance-matrix', name: 'Dance Matrix', label: 'Default' },
  ];

  let _activeId = null;

  /* -------------------------------------------------------
     Load CSS file dynamically
  ------------------------------------------------------- */
  function _loadCSS(themeId) {
    const existing = document.getElementById(LINK_ID);
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id  = LINK_ID;
    link.rel = 'stylesheet';
    link.href = `themes/${themeId}.css`;

    document.head.appendChild(link);
  }

  /* -------------------------------------------------------
     Public: Apply Theme
  ------------------------------------------------------- */
  function apply(themeId) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

    _activeId = theme.id;

    try {
      const u = new URL(window.location.href);
      if (_activeId) u.searchParams.set('theme', _activeId);
      else u.searchParams.delete('theme');
      window.history.replaceState({}, '', u.toString());
    } catch (_) {}

    _loadCSS(_activeId);

    return theme;
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  function init() {
    const params = new URLSearchParams(window.location.search);

    const initialTheme = params.get('theme');

    const startId = THEMES.find(t => t.id === initialTheme)
      ? initialTheme
      : THEMES[0].id;

    apply(startId);
  }

  function getAll() {
    return THEMES;
  }

  function getActive() {
    return _activeId;
  }

  return { init, apply, getAll, getActive };
})();