import { ThemeEngine } from './lib/ThemeEngine.js';
import { ThemeUI } from './lib/ThemeUI.js';
import { FavoritesUI } from './lib/FavoritesUI.js'
import { Player } from './lib/Player.js';

/* =========================================================
   BOOTSTRAP
========================================================= */
(function init() {
  ThemeEngine.init();
  ThemeUI.render();
  FavoritesUI.render();
  FavoritesUI.hydrateAll();

  const initialUrl = Player.getInitialUrl();
  const urlDisplay = document.getElementById('stream-url-display');
  if (urlDisplay) urlDisplay.innerHTML = `<span class="stream-url__label">SRC</span> ${initialUrl}`;
  Player.play(initialUrl);
})();
