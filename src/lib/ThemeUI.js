// ThemeUI.js
import { ThemeEngine } from "./ThemeEngine.js";

/* =========================================================
   THEME SWITCHER UI (CSS file based)
========================================================= */

export const ThemeUI = (() => {

  const header = document.getElementById('theme-header');
  const body   = document.getElementById('theme-body');
  const toggle = document.getElementById('theme-toggle');
  const grid   = document.getElementById('theme-grid');

  function render() {
    if (!grid) return;

    const themes   = ThemeEngine.getAll();
    const activeId = ThemeEngine.getActive();

    grid.innerHTML = '';

    themes.forEach(t => {

      const card = document.createElement('div');
      card.className =
        'theme-card' + (t.id === activeId ? ' is-active' : '');

      card.setAttribute('role', 'option');
      card.setAttribute('aria-selected',
        t.id === activeId ? 'true' : 'false');
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="theme-card__name">${t.name}</div>
        ${t.label ? `<div class="theme-card__label">${t.label}</div>` : ''}
      `;

      const activate = () => {
        ThemeEngine.apply(t.id);
        render();
        if (window.Toast) {
          Toast.show(`Theme: ${t.name}`);
        }
      };

      card.addEventListener('click', activate);

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });

      grid.appendChild(card);
    });
  }

  /* Expand / Collapse panel */
  if (header) {
    const toggleOpen = () => {
      if (body)   body.classList.toggle('is-open');
      if (toggle) toggle.classList.toggle('is-open');
    };

    header.addEventListener('click', toggleOpen);

    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOpen();
      }
    });
  }

  return { render };
})();