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

  // Country name → ISO 3166-1 alpha-2 code
  const COUNTRY_MAP = {
    'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD',
    'angola': 'AO', 'argentina': 'AR', 'armenia': 'AM', 'australia': 'AU',
    'austria': 'AT', 'azerbaijan': 'AZ', 'bahrain': 'BH', 'bangladesh': 'BD',
    'belarus': 'BY', 'belgium': 'BE', 'belize': 'BZ', 'benin': 'BJ',
    'bolivia': 'BO', 'bosnia': 'BA', 'botswana': 'BW', 'brazil': 'BR',
    'brunei': 'BN', 'bulgaria': 'BG', 'burkina faso': 'BF', 'burundi': 'BI',
    'cambodia': 'KH', 'cameroon': 'CM', 'canada': 'CA', 'chile': 'CL',
    'china': 'CN', 'colombia': 'CO', 'congo': 'CG', 'croatia': 'HR',
    'cuba': 'CU', 'cyprus': 'CY', 'czechia': 'CZ', 'czech republic': 'CZ',
    'denmark': 'DK', 'ecuador': 'EC', 'egypt': 'EG', 'estonia': 'EE',
    'ethiopia': 'ET', 'finland': 'FI', 'france': 'FR', 'georgia': 'GE',
    'germany': 'DE', 'ghana': 'GH', 'greece': 'GR', 'guatemala': 'GT',
    'haiti': 'HT', 'honduras': 'HN', 'hungary': 'HU', 'iceland': 'IS',
    'india': 'IN', 'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ',
    'ireland': 'IE', 'israel': 'IL', 'italy': 'IT', 'jamaica': 'JM',
    'japan': 'JP', 'jordan': 'JO', 'kazakhstan': 'KZ', 'kenya': 'KE',
    'kosovo': 'XK', 'kuwait': 'KW', 'kyrgyzstan': 'KG', 'laos': 'LA',
    'latvia': 'LV', 'lebanon': 'LB', 'libya': 'LY', 'liechtenstein': 'LI',
    'lithuania': 'LT', 'luxembourg': 'LU', 'madagascar': 'MG', 'malawi': 'MW',
    'malaysia': 'MY', 'mali': 'ML', 'malta': 'MT', 'mexico': 'MX',
    'moldova': 'MD', 'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME',
    'morocco': 'MA', 'mozambique': 'MZ', 'myanmar': 'MM', 'namibia': 'NA',
    'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ', 'nicaragua': 'NI',
    'niger': 'NE', 'nigeria': 'NG', 'north korea': 'KP', 'north macedonia': 'MK',
    'norway': 'NO', 'oman': 'OM', 'pakistan': 'PK', 'panama': 'PA',
    'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH', 'poland': 'PL',
    'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO', 'russia': 'RU',
    'rwanda': 'RW', 'saudi arabia': 'SA', 'senegal': 'SN', 'serbia': 'RS',
    'singapore': 'SG', 'slovakia': 'SK', 'slovenia': 'SI', 'somalia': 'SO',
    'south africa': 'ZA', 'south korea': 'KR', 'spain': 'ES', 'sri lanka': 'LK',
    'sudan': 'SD', 'sweden': 'SE', 'switzerland': 'CH', 'syria': 'SY',
    'taiwan': 'TW', 'tajikistan': 'TJ', 'tanzania': 'TZ', 'thailand': 'TH',
    'togo': 'TG', 'tunisia': 'TN', 'turkey': 'TR', 'turkmenistan': 'TM',
    'uganda': 'UG', 'ukraine': 'UA', 'united arab emirates': 'AE',
    'united kingdom': 'GB', 'uk': 'GB', 'usa': 'US',
    'united states': 'US', 'united states of america': 'US',
    'uruguay': 'UY', 'uzbekistan': 'UZ', 'venezuela': 'VE', 'vietnam': 'VN',
    'yemen': 'YE', 'zambia': 'ZM', 'zimbabwe': 'ZW',
  };

  // Known genres/tags (longer phrases first for greedy matching)
  const KNOWN_GENRES = [
    'drum and bass', 'drum and base', 'hip hop', 'r&b', 'rnb', 'rhythm and blues',
    'classic rock', 'classic hits', 'new age', 'new wave', 'easy listening',
    'deep house', 'tech house', 'hard rock', 'soft rock', 'indie pop', 'indie rock',
    'talk radio', 'world music', 'latin jazz', 'smooth jazz',
    'pop', 'rock', 'jazz', 'blues', 'classical', 'electronic', 'techno', 'trance',
    'house', 'ambient', 'metal', 'punk', 'reggae', 'country', 'folk', 'soul', 'funk',
    'gospel', 'disco', 'dancehall', 'ska', 'grunge', 'alternative', 'indie',
    'edm', 'dubstep', 'trap', 'lounge', 'chillout', 'chill', 'news', 'talk', 'sports',
    'comedy', 'children', 'oldies', '60s', '70s', '80s', '90s', '2000s',
  ];

  /**
   * Parses a free-text query into { name, countrycode, tag } components.
   */
  function _parseQuery(query) {
    const lower = query.toLowerCase().trim();
    let remaining = lower;
    let countrycode = null;
    let tag = null;

    // 1. Detect country name (longer names checked first to avoid partial matches)
    const sortedCountries = Object.keys(COUNTRY_MAP).sort((a, b) => b.length - a.length);
    for (const c of sortedCountries) {
      const pattern = new RegExp(`(^|\\s)${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
      if (pattern.test(remaining)) {
        countrycode = COUNTRY_MAP[c];
        remaining = remaining.replace(pattern, ' ').trim();
        break;
      }
    }

    // 2. Detect genre/tag (longer phrases checked first)
    for (const g of KNOWN_GENRES) {
      const pattern = new RegExp(`(^|\\s)${g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
      if (pattern.test(remaining)) {
        tag = g;
        remaining = remaining.replace(pattern, ' ').trim();
        break;
      }
    }

    // 3. Whatever's left is the station name
    const name = remaining.trim() || null;

    return { name, countrycode, tag };
  }

  async function _performSearch(query) {
    if (!query || query.trim() === '') {
      Toast.show('Please enter a search query', true);
      _renderEmptyState('Enter a query above to find stations.');
      return;
    }

    resultsList.innerHTML = `<div class="search-results__empty">Searching for "${IcyMeta.esc(query)}"...</div>`;

    try {
      const { name, countrycode, tag } = _parseQuery(query);

      const params = new URLSearchParams({
        limit: '30',
        order: 'clickcount',
        reverse: 'true',
      });

      if (name) params.set('name', name);
      if (countrycode) params.set('countrycode', countrycode);
      if (tag) params.set('tag', tag);

      // Fallback: if nothing was parsed, treat the whole query as a name search
      if (!name && !countrycode && !tag) {
        params.set('name', query.trim());
      }

      const response = await fetch(`${API_BASE_URL}?${params}`);
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
      ? station.tags.split(',').filter(Boolean).slice(0, 3)
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
