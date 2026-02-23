import { IcyMeta } from './IcyMeta.js';
import { Toast } from './Toast.js';
import { Player } from './Player.js'

/* =========================================================
   FAVORITES UI
========================================================= */
export const FavoritesUI = (() => {
  const listEl  = document.getElementById('station-list');
  const countEl = document.getElementById('fav-count');
  const inputEl = document.getElementById('fav-input');
  const addBtn  = document.getElementById('fav-add-btn');
  const header  = document.getElementById('fav-header');
  const body    = document.getElementById('fav-body');
  const toggle  = document.getElementById('fav-toggle');

  let activeUrl = null;

  if (header) {
    const open = () => {
      if (body)   body.classList.toggle('is-open');
      if (toggle) toggle.classList.toggle('is-open');
    };
    header.addEventListener('click', open);
    header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  }

  function _urlToLabel(url) {
    try { const u = new URL(url); return u.hostname + (u.pathname !== '/' ? u.pathname : ''); }
    catch { return url; }
  }

  function _renderItem(fav) {
    const li = document.createElement('div');
    li.className = 'station-list__item' + (fav.url === activeUrl ? ' is-active' : '');
    li.dataset.url = fav.url;
    li.setAttribute('role', 'listitem');

    const meta = fav.meta;
    const displayName = meta?.name || _urlToLabel(fav.url);
    const genreTags = meta?.genre
      ? meta.genre.split(/[\s/]+/).filter(Boolean).slice(0,3)
          .map(g => `<span class="station-list__tag">${IcyMeta.esc(g)}</span>`).join('')
      : '';
    const techTags = meta?.bitrate
      ? `<span class="station-list__tag station-list__tag--hl">${IcyMeta.esc(meta.bitrate)} kbps</span>` : '';
    const tagsHtml = (genreTags || techTags) ? `<div class="station-list__tags">${genreTags}${techTags}</div>` : '';

    let logoHtml;
    if (meta === null) {
      logoHtml = `<div class="station-list__logo-wrap"><div class="station-list__logo-loading"></div></div>`;
    } else if (meta?.logo) {
      logoHtml = `<div class="station-list__logo-wrap"><img class="station-list__logo" src="${IcyMeta.esc(meta.logo)}" alt="" onerror="this.outerHTML='<span class=station-list__logo-placeholder>📻</span>'"></div>`;
    } else {
      logoHtml = `<div class="station-list__logo-wrap"><span class="station-list__logo-placeholder">📻</span></div>`;
    }

    li.innerHTML = `
      ${logoHtml}
      <div class="station-list__info">
        <div class="station-list__name">${IcyMeta.esc(displayName)}</div>
        <div class="station-list__url">${IcyMeta.esc(fav.url)}</div>
        ${tagsHtml}
      </div>
      <div class="station-list__actions">
        <button class="station-list__btn station-list__btn--play" title="Play this station">▶</button>
        <button class="station-list__btn station-list__btn--remove" title="Remove from favorites">✕</button>
      </div>`;

    const playStation = () => Player.play(fav.url);
    li.querySelector('.station-list__info').addEventListener('click', playStation);
    li.querySelector('.station-list__btn--play').addEventListener('click', playStation);
    li.querySelector('.station-list__btn--remove').addEventListener('click', e => {
      e.stopPropagation();
      FavoritesStore.remove(fav.url);
      render();
      Toast.show('Station removed');
    });

    return li;
  }

  function render() {
    const favs = FavoritesStore.getAll();
    if (countEl) countEl.textContent = favs.length;
    if (!listEl) return;
    if (!favs.length) {
      listEl.innerHTML = `<div class="station-list__empty">No favorites yet.<br>Paste a stream URL above and press <code>+ Add</code>.</div>`;
      return;
    }
    listEl.innerHTML = '';
    favs.forEach(fav => listEl.appendChild(_renderItem(fav)));
  }

  function setActive(url) {
    activeUrl = url;
    if (!listEl) return;
    listEl.querySelectorAll('.station-list__item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.url === url);
    });
  }

  async function _addStation(url) {
    url = (url || '').trim();
    if (!url) { Toast.show('Enter a stream URL', true); return; }
    try { new URL(url); } catch { Toast.show('Invalid URL', true); return; }
    if (!FavoritesStore.add(url)) { Toast.show('Already in favorites', true); return; }
    render();
    Toast.show('Station added — fetching metadata…');
    if (inputEl) inputEl.value = '';
    const meta = await IcyMeta.fetchMeta(url);
    FavoritesStore.updateMeta(url, meta || undefined);
    render();
  }

  if (addBtn) addBtn.addEventListener('click', () => _addStation(inputEl ? inputEl.value : ''));
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') _addStation(inputEl.value); });

  async function hydrateAll() {
    for (const fav of FavoritesStore.getAll()) {
      if (fav.meta === null) {
        const meta = await IcyMeta.fetchMeta(fav.url);
        FavoritesStore.updateMeta(fav.url, meta || undefined);
        render();
      }
    }
  }

  async function addStation(url) {
    await _addStation(url);
  }

  return { render, setActive, hydrateAll, addStation };
})();

/* =========================================================
   FAVORITES STORE
========================================================= */
const FavoritesStore = (() => {
  const KEY = 'radio_favorites_v1';
  const DEFAULTS = [
    'https://dancewave.online/dance.ogg',
    'https://n08.radiojar.com/083wqknmsuhvv?rj-ttl=5&rj-tok=AAABnIWtQmMAztJzDQnM9GXL5A',
    'https://play.global.audio/nrj128',
    'https://play.global.audio/vanillahi.aac',
    'https://play.global.audio/energy-90s.aac',
  ];
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) return JSON.parse(raw) || [];
      const defaults = DEFAULTS.map(url => ({ url, meta: null, addedAt: Date.now() }));
      localStorage.setItem(KEY, JSON.stringify(defaults));
      return defaults;
    } catch { return []; }
  }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} }
  function getAll() { return load(); }
  function add(url) {
    const list = load();
    if (list.find(f => f.url === url)) return false;
    list.push({ url, meta: null, addedAt: Date.now() });
    save(list); return true;
  }
  function remove(url) { save(load().filter(f => f.url !== url)); }
  function updateMeta(url, meta) {
    const list = load();
    const item = list.find(f => f.url === url);
    if (item) { item.meta = meta; save(list); }
  }
  return { getAll, add, remove, updateMeta };
})();
