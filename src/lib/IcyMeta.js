/* =========================================================
   ICY METADATA
========================================================= */
export const IcyMeta = (() => {
  const panelEl = document.getElementById('station-meta');
  const STORAGE_KEY = 'icymeta_cache';

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  
  function _loadCache() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  function _saveCache(cache) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch { /* storage full or unavailable */ }
  }

  function setMeta(url, data) {
    if (!url || !data) return;
    const cache = _loadCache();
    cache[url] = {
      name:        data.name        || null,
      description: data.description || null,
      genre:       data.tags        || data.genre || null,
      url:         data.homepage    || data.url   || null,
      logo:        data.favicon     || data.logo  || null,
      bitrate:     data.bitrate     ? String(data.bitrate) : null,
      samplerate:  data.samplerate  || null,
      _cached_at:  Date.now(),
    };
    _saveCache(cache);
  }

  async function fetchMeta(url) {
    const cache = _loadCache();
    if (cache[url]) return cache[url];

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
      clearTimeout(tid);
      try { if (res.body) await res.body.cancel(); } catch (_) {}
      const h = res.headers;
      const get = k => h.get(k) || h.get(k.toLowerCase()) || null;
      const meta = {
        name: get('icy-name'), description: get('icy-description'), genre: get('icy-genre'),
        url: get('icy-url'), logo: get('icy-logo'), bitrate: get('icy-br'), samplerate: get('icy-sr'),
        _cached_at: Date.now(),
      };
      const result = Object.values(meta).some((v, i, a) => i < a.length - 1 && v !== null) ? meta : null;
      if (result) {
        cache[url] = result;
        _saveCache(cache);
      }
      return result;
    } catch { return null; }
  }

  function renderPanel(meta) {
    if (!panelEl || !meta) return;
    const nameHtml = meta.url
      ? `<a href="${esc(meta.url)}" target="_blank" rel="noopener">${esc(meta.name || 'Unknown Station')}</a>`
      : esc(meta.name || 'Unknown Station');
    const genreTags = meta.genre
      ? meta.genre.split(/[\s/]+/).filter(Boolean).map(g => `<span class="station-meta__tag">${esc(g)}</span>`).join('')
      : '';
    const techTags = [
      meta.bitrate    ? `<span class="station-meta__tag station-meta__tag--hl">${esc(meta.bitrate)} kbps</span>` : '',
      meta.samplerate ? `<span class="station-meta__tag">${esc(meta.samplerate)} Hz</span>` : '',
    ].join('');
    const logoHtml = meta.logo
      ? `<img class="station-meta__logo" src="${esc(meta.logo)}" alt="" onerror="this.outerHTML='<div class=station-meta__logo-placeholder>📻</div>'">`
      : `<div class="station-meta__logo-placeholder">📻</div>`;
    panelEl.innerHTML = `
      ${logoHtml}
      <div class="station-meta__info">
        <div class="station-meta__name">${nameHtml}</div>
        ${meta.description ? `<div class="station-meta__desc">${esc(meta.description)}</div>` : ''}
        ${(genreTags || techTags) ? `<div class="station-meta__tags">${genreTags}${techTags}</div>` : ''}
      </div>`;
    panelEl.classList.add('is-visible');
  }

  async function load(url) {
    const meta = await fetchMeta(url);
    renderPanel(meta);
    return meta;
  }

  function clear() {
    if (!panelEl) return;
    panelEl.innerHTML = '';
    panelEl.classList.remove('is-visible');
  }

  function clearCache() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { fetchMeta, renderPanel, load, clear, esc, setMeta, clearCache };
})();
