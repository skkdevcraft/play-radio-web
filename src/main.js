import { ThemeEngine } from './lib/ThemeEngine.js';
import { ThemeUI } from './lib/ThemeUI.js';
import { FavoritesUI } from './lib/FavoritesUI.js';
import { SearchUI } from './lib/SearchUI.js';
import { Player } from './lib/Player.js';

/* =========================================================
   BOOTSTRAP
========================================================= */
(function init() {
  ThemeEngine.init();
  ThemeUI.render();
  FavoritesUI.render();
  FavoritesUI.hydrateAll();
  SearchUI.init();

  const initialUrl = Player.getInitialUrl();
  const urlDisplay = document.getElementById('stream-url-display');
  if (urlDisplay) urlDisplay.innerHTML = `<span class="stream-url__label">SRC</span> ${initialUrl}`;
  Player.play(initialUrl);

  // Update active state in both FavoritesUI and SearchUI when player state changes
  Player.on('play', url => {
    FavoritesUI.setActive(url);
    SearchUI.setActive(url);
  });
  Player.on('stop', () => {
    FavoritesUI.setActive(null);
    SearchUI.setActive(null);
  });
})();
