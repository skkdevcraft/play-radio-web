This is a pure client-side application. All data fetching, UI interaction, audio playback, and state persistence run entirely in the browser. There is no server — the app is just static files that can be hosted anywhere (Netlify, GitHub Pages, Cloudflare Pages, etc.).

The app lets users:
- Play internet radio streams directly in the browser
- Search the [radio-browser.info](https://radio-browser.info) public API by name, genre, or country
- Save favorite stations to browser `localStorage`
- Customize the UI via CSS theme files
- Record live audio from the stream (download as WAV)
- Share listening sessions via URL-encoded state

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 (semantic, ARIA attributes) |
| **Styling** | CSS3 (custom properties / CSS variables) |
| **Logic** | Vanilla JavaScript (ES modules, no framework) |
| **Audio** | `<audio>` element + Web Audio API (AudioContext, AnalyserNode) |
| **Storage** | `localStorage` (favorites, metadata cache, theme preference) |
| **API** | [radio-browser.info](https://radio-browser.info) JSON API |
| **Build** | None — raw static files |

---

## Directory Structure

```
play-radio-web/
└── src/                       <-- Application source code
    ├── index.html             <-- Single HTML page
    ├── style.css              <-- Base styles + CSS variable defaults
    ├── main.js                <-- Entry point (bootstrap / init)
    ├── favicon.ico
    ├── lib/
    │   ├── defaults.js        <-- Default favorite stations
    │   ├── Player.js          <-- Playback controller, recorder, visualizer, audio reactor
    │   ├── FavoritesUI.js     <-- Favorites panel UI + localStorage store
    │   ├── SearchUI.js        <-- Search panel + radio-browser.info API integration
    │   ├── ThemeEngine.js     <-- CSS theme loader + built-in theme registry
    │   ├── ThemeUI.js         <-- Theme selector UI component
    │   ├── IcyMeta.js         <-- ICY metadata fetcher + station info display
    │   └── Toast.js           <-- Toast notification system
    └── themes/                <-- Built-in CSS theme files
        ├── dark-matrix.css
        ├── amber-glow.css
        ├── arctic-frost.css
        ├── neon-dusk.css
        ├── valentine.css
        ├── christmas.css
        ├── dance-matrix.css
        └── hacker-news.css
```

---

## Architecture — Module Breakdown

### Entry Point (`src/main.js`)

Initializes all modules in order:
1. `ThemeEngine.init()` — load the saved/URL-specified theme
2. `ThemeUI.render()` — build the theme selector grid
3. `FavoritesUI.render()` + `FavoritesUI.hydrateAll()` — render favorites + fetch missing metadata
4. `SearchUI.init()` — wire search input/button
5. `Player.play(initialUrl)` — start playback with the URL from `?play=` query param or default
6. Subscribe to `Player` events to keep FavoritesUI and SearchUI active-state in sync

### Player (`src/lib/Player.js`)

The largest module — acts as the central playback controller. Contains several internal subsystems:

**`Player` (public API)**
- `play(url)` — begins playback, updates browser URL, manages button states, emits events
- `stop()` — stops everything, resets UI state
- `on(event, cb)` — event emitter (`'play'`, `'stop'`)
- `getInitialUrl()` — returns `?play=` query param value or default URL

**`StatusBar`** — Updates the status dot + text display (`idle` / `playing` / `buffering` / `error`)

**`StreamPlayer`** — Manages the `<audio>` element and Web Audio API graph:
- Creates `AudioContext` + `AnalyserNode` (FFT size 64) + `MediaElementSourceNode` if supported
- Attempts CORS-enabled play first, falls back to non-CORS on failure
- Exposes `getAnalyser()`, `getAudioContext()`, `getSourceNode()`

**`AudioReactor`** — The single source of truth for audio-driven CSS custom properties:
- Runs its own `requestAnimationFrame` loop (starts on page load for time vars)
- Writes to `:root` on every frame:
  - Time: `--t` (seconds since load), `--dt` (delta time)
  - Amplitude bands: `--amp`, `--amp-low`, `--amp-mid`, `--amp-high`, `--amp-peak`
  - Scaled variants (×100): `--amp-pct`, `--amp-low-pct`, etc.
  - Per-bar (16 bars): `--bar-0` through `--bar-15`
- Two modes: `'live'` (reads real AnalyserNode data) and `'fallback'` (generates synthetic waves when CORS blocks the analyser)
- Applies exponential moving average smoothing to amplitude values

**`Visualizer`** — Reads CSS vars written by AudioReactor and renders the VU meter:
- Builds 16 bar `<div>` elements
- On each frame reads `--bar-N` values and sets scoped inline vars `--_bar-h` and `--_bar-color` on each bar element
- Color zones: low (`--color-vu-low`), mid (`--color-vu-mid`), high (`--color-vu-high`)
- Supports fullscreen mode via `Visualizer.fullScreen(true/false)`

**`Recorder`** — Records stream audio via `ScriptProcessorNode`:
- Interleaves L/R channels into a single Float32Array
- On stop: encodes to 16-bit PCM WAV and triggers download
- Filename format: `{station_name}_{timestamp}.wav`

**`FullscreenVU`** — Idle timer for fullscreen visualizer:
- After 60 seconds of inactivity while playing, activates fullscreen VU mode
- Any user interaction (mousemove, keydown, touchstart, etc.) exits fullscreen and resets the timer

### FavoritesUI (`src/lib/FavoritesUI.js`)

**`FavoritesStore`** (private) — localStorage persistence:
- Key: `radio_favorites_v1`
- Each entry: `{ url, meta: {...}, addedAt }`
- Supports `getAll()`, `add(url)`, `remove(url)`, `updateMeta(url, meta)`
- On first load (empty localStorage), seeds from `DEFAULTS` in `defaults.js`

**`FavoritesUI`** (public) — UI rendering and interaction:
- Renders the favorites station list with logo, name, URL, genre/bitrate tags, play + remove buttons
- Collapsible panel with header toggle
- `addStation(url)` — adds a URL, triggers background metadata fetch via `IcyMeta.fetchMeta()`
- `hydrateAll()` — background-fetches metadata for entries with `meta === null`
- `setActive(url)` — highlights the currently playing station

### SearchUI (`src/lib/SearchUI.js`)

- Connects to `https://de1.api.radio-browser.info/json/stations/search`
- Smart query parser (`_parseQuery`):
  - Detects country names (mapped to ISO 3166-1 alpha-2 codes, e.g. `"greece"` → `"GR"`)
  - Detects known genres/tags (longer phrases matched first for greedy matching)
  - Remaining text treated as station name keyword
- API params: `name`, `countrycode`, `tag`, `limit=30`, `order=clickcount`, `reverse=true`
- Renders search results as station list items with play & add-to-favorites buttons
- Supports keyboard (Enter triggers search)

### ThemeEngine (`src/lib/ThemeEngine.js`)

- Registry of 8 built-in themes mapped to CSS files at `themes/{id}.css`
- Dynamically loads theme CSS via `<link>` element injection
- Persists theme choice via `?theme=` URL parameter
- Public API: `init()`, `apply(themeId)`, `getAll()`, `getActive()`

### ThemeUI (`src/lib/ThemeUI.js`)

- Renders the theme selection grid from `ThemeEngine.getAll()`
- Each theme card shows name + label
- Click/keyboard to activate — calls `ThemeEngine.apply()` and re-renders

### IcyMeta (`src/lib/IcyMeta.js`)

- Fetches ICY stream metadata by making a HEAD-style HTTP request (aborts after 6s)
- Caches results in localStorage (`icymeta_cache`)
- Updates page title and station meta panel with name, logo, genre tags, bitrate
- `esc(str)` — HTML entity escape utility used across multiple modules
- `setMeta(url, data)` — manually set metadata (used by SearchUI when radio-browser returns station data)

### Toast (`src/lib/Toast.js`)

- Simple notification system — shows a fixed-position message for 2.5 seconds
- Supports error styling via `isError` flag

---

## Data Flow

```
User Action
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  SearchUI / FavoritesUI / ThemeUI                        │
│  (user interaction handlers)                             │
└─────────┬────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│  Player.play(url)                                        │
│    ├── Updates browser URL (?play=...)                   │
│    ├── StreamPlayer.play(url)  ──►  <audio> element      │
│    ├── IcyMeta.load(url)      ──►  ICY HTTP request      │
│    ├── AudioReactor.startLive(analyser)                   │
│    │     └── rAF loop writes CSS vars to :root            │
│    └── Visualizer.start()                                │
│          └── rAF loop reads CSS vars, renders VU bars     │
└──────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│  CSS Custom Properties on :root                           │
│  (--amp, --amp-low, --bar-0...--bar-15, --t, --dt)       │
│                                                           │
│  ── Themes can reference these in custom CSS rules       │
│  ── Visualizer reads them for the VU meter               │
└──────────────────────────────────────────────────────────┘
```

---

## Theming System

Themes are standalone `.css` files that override CSS custom properties defined in `:root` in `style.css`. See `THEME_GUIDE.md` for full details.

**To add a new theme:**
1. Create `src/themes/my-theme.css` with variable overrides
2. Add an entry to `THEMES` array in `src/lib/ThemeEngine.js`
3. (Optional) Add a demo GIF to `theme-demo/`

**Audio-reactive CSS vars** (written every animation frame):
- Time: `--t` (seconds), `--dt` (delta)
- Amplitude: `--amp`, `--amp-low`, `--amp-mid`, `--amp-high`, `--amp-peak`
- Scaled: `--amp-pct`, `--amp-low-pct`, `--amp-mid-pct`, `--amp-high-pct` (0-100)
- Per-bar: `--bar-0` to `--bar-15` (0-1)

These can drive transforms, colors, shadows, filters — anything CSS accepts a numeric value for.

**Layout customization via CSS vars:**
- Single-column by default, switches to 2-column at ≥720px via media query
- Grid areas controllable via `--layout-columns`, `--layout-areas`, `--ELEMENT-grid-area`
- Element visibility via `--player-display`, `--theme-switcher-display`, `--favorites-display`, etc.

---

## State Management

All state is derived from the browser URL or localStorage — no runtime state store.

| State | Source | Persistence |
|-------|--------|-------------|
| Active stream URL | `?play=` query param | URL (shareable) |
| Active theme ID | `?theme=` query param | URL (shareable) |
| Favorite stations | `localStorage` key `radio_favorites_v1` | Persistent across sessions |
| ICY metadata cache | `localStorage` key `icymeta_cache` | Persistent across sessions |
| Currently playing URL | `Player.currentUrl` (in-memory) | Lost on page reload (restored from URL) |

---

## Key Architectural Decisions

1. **No framework** — vanilla JS ES modules keep dependencies at zero. The code is small enough that a framework would add overhead without benefit.

2. **CSS variables as the reactivity layer** — AudioReactor writes to `:root` custom properties, and both the theme system and Visualizer read from them. This creates a clean unidirectional data flow from audio analysis → CSS → visual output, without any DOM manipulation for the visualizer (beyond setting scoped inline vars on bars).

3. **URL as application state** — The `?play=` and `?theme=` parameters make every listening session shareable. No backend or account needed.

4. **CORS degradation** — When a stream server doesn't send CORS headers, the app degrades gracefully: it retries without `crossOrigin`, generates synthetic audio visualization, and shows a notice to the user.

5. **Module pattern (IIFE with public API export)** — Each module uses an IIFE returning a public API object, which is then exported. This keeps internals truly private while providing a clean interface for cross-module communication.

6. **Event emitter pattern** — `Player` has a minimal event system (`on`/`emit`) to notify other modules (FavoritesUI, SearchUI, FullscreenVU) of state changes without tight coupling.
