import { IcyMeta } from './IcyMeta.js';
import { Toast } from './Toast.js';
import { Player } from './Player.js';
import { FavoritesUI } from './FavoritesUI.js';

/* =========================================================
   SEARCH UI
========================================================= */
export const SearchUI = (() => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resultsList = document.getElementById('search-results-list');
  const API_BASE_URL = 'https://de1.api.radio-browser.info/json/stations/search';

  let activeUrl = null;

  async function _performSearch(query) {
    if (!query || query.trim() === '') {
      Toast.show('Please enter a search query', true);
      _renderEmptyState('Enter a query above to find stations.');
      return;
    }

    resultsList.innerHTML = `<div class="search-results__empty">Searching for "${IcyMeta.esc(query)}"...</div>`;

    try {
      // Limit to 20 results for now, order by clickcount
      const response = await fetch(`${API_BASE_URL}?name=${encodeURIComponent(query)}&limit=20&order=clickcount&reverse=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stations = await response.json();
      _renderResults(stations);
    } catch (error) {
      console.error('Search failed:', error);
      Toast.show('Search failed. Please try again later.', true);
      _renderEmptyState('Failed to load search results. Please try again.');
    }
  }

  function _renderItem(station) {
    const li = document.createElement('div');
    li.className = 'station-list__item' + (station.url === activeUrl ? ' is-active' : '');
    li.dataset.url = station.url;
    li.setAttribute('role', 'listitem');

    const displayName = station.name || _urlToLabel(station.url);
    const genreTags = station.tags
      ? station.tags.split(',').filter(Boolean).slice(0,3)
          .map(g => `<span class="station-list__tag">${IcyMeta.esc(g.trim())}</span>`).join('')
      : '';
    const techTags = station.bitrate
      ? `<span class="station-list__tag station-list__tag--hl">${IcyMeta.esc(station.bitrate)} kbps</span>` : '';
    const tagsHtml = (genreTags || techTags) ? `<div class="station-list__tags">${genreTags}${techTags}</div>` : '';

    let logoHtml;
    if (station.favicon) {
      logoHtml = `<div class="station-list__logo-wrap"><img class="station-list__logo" src="${IcyMeta.esc(station.favicon)}" alt="" onerror="this.outerHTML='<span class=station-list__logo-placeholder>📻</span>'"></div>`;
    } else {
      logoHtml = `<div class="station-list__logo-wrap"><span class="station-list__logo-placeholder">📻</span></div>`;
    }

    li.innerHTML = `
      ${logoHtml}
      <div class="station-list__info">
        <div class="station-list__name">${IcyMeta.esc(displayName)}</div>
        <div class="station-list__url">${IcyMeta.esc(station.url)}</div>
        ${tagsHtml}
      </div>
      <div class="station-list__actions">
        <button class="station-list__btn station-list__btn--play" title="Play this station">▶</button>
        <button class="station-list__btn station-list__btn--add-fav" title="Add to Favorites">+</button>
      </div>`;

    const playStation = () => {
      IcyMeta.setMeta(station.url, station);
      Player.play(station.url);
    };
    
    li.querySelector('.station-list__info').addEventListener('click', playStation);
    li.querySelector('.station-list__btn--play').addEventListener('click', playStation);
    
    // Add to favorites button event listener
    const addFavBtn = li.querySelector('.station-list__btn--add-fav');
    if (addFavBtn) {
        addFavBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            IcyMeta.setMeta(station.url, station);
            FavoritesUI.addStation(station.url);
        });
    }

    return li;
  }

  function _renderResults(stations) {
    if (!resultsList) return;

    if (stations.length === 0) {
      _renderEmptyState('No stations found for this query.');
      return;
    }

    resultsList.innerHTML = '';
    stations.forEach(station => resultsList.appendChild(_renderItem(station)));
  }

  function _renderEmptyState(message) {
    if (resultsList) {
      resultsList.innerHTML = `<div class="search-results__empty">${IcyMeta.esc(message)}</div>`;
    }
  }

  function _urlToLabel(url) {
    try { const u = new URL(url); return u.hostname + (u.pathname !== '/' ? u.pathname : ''); }
    catch { return url; }
  }

  function setActive(url) {
    activeUrl = url;
    if (!resultsList) return;
    resultsList.querySelectorAll('.station-list__item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.url === url);
    });
  }

  function init() {
    if (searchBtn) {
      searchBtn.addEventListener('click', () => _performSearch(searchInput ? searchInput.value : ''));
    }
    if (searchInput) {
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') _performSearch(searchInput.value);
      });
    }
  }

  return { init, setActive };
})();
