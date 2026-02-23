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
      localStorage.setItem(STORAGE_KEY, _activeId);
    } catch (_) {}

    _loadCSS(_activeId);

    return theme;
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  function init() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    const startId = THEMES.find(t => t.id === saved)
      ? saved
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