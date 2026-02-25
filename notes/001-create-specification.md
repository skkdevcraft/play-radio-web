---
title: Create Specification
---
--- message ---
role: user
---
Create a specification

--- message ---
role: assistant
---
# Radio Stream Player — Build Specification

Instructions for an LLM to build this app from scratch, in the exact order the requirements were developed.

---

## Overview

A single-file (`index.html`) web radio stream player. No frameworks, no build tools — vanilla HTML, CSS, and JavaScript only. The page reads an audio stream URL from the query string and plays it, with a visualizer, station metadata display, recording capability, and volume control.

---

## Step 1 — Basic Page & Stream Playback

### Goal
Create `index.html` that reads a stream URL from the `?play=` query parameter and plays it.

### URL format
```
index.html?play=https://dancewave.online/dance.ogg
```

### Requirements
- Parse `window.location.search` with `URLSearchParams` to get the `play` parameter
- If no `?play=` parameter is present, show a friendly notice explaining the URL format with a `<code>` example — do not render controls
- If a URL is present, auto-play the stream on page load
- Use a native `<audio>` element (`preload="none"`, hidden from view)
- Show **Play** and **Stop** buttons
  - Play: sets `audio.src`, calls `audio.load()` then `audio.play()`
  - Stop: calls `audio.pause()`, clears `audio.src`
  - Play button disabled while playing; Stop button disabled while stopped
- Listen to `audio` events: `playing`, `waiting`, `stalled`, `error`, `ended`

### Status indicator
Show a small coloured dot + text label reflecting current state:

| State | Dot colour | Label |
|---|---|---|
| idle | grey | Idle |
| buffering | yellow (blinking fast) | Buffering… |
| playing | green (blinking slow) | On Air |
| error | red (solid) | Error |

### Stream URL display
Show the raw stream URL in a monospace label beneath the status bar, truncated with `text-overflow: ellipsis` if too long.

### Design aesthetic
- Dark industrial/brutalist theme
- Background: near-black (`#0a0a0a`) with a subtle grid-paper texture using two `repeating-linear-gradient` overlays at 40px intervals
- Player panel: dark grey (`#111`), 1px border, 3px top accent border in yellow-green
- Accent colour: `#e8ff00` (yellow-green neon)
- Secondary accent: `#ff3c00` (red-orange)
- Fonts: `Bebas Neue` (display/buttons) + `Share Tech Mono` (mono/labels) from Google Fonts
- Max width: 480px, centred on page
- Use semantic HTML: `<main>`, `<header>`, `<article>`, `<footer>`

---

## Step 2 — VU Meter Visualizer using Web Audio API

### Goal
Replace any CSS-animation placeholder bars with a real frequency visualizer driven by the Web Audio API.

### Architecture — keep stream and visualizer as separate modules

#### `StreamPlayer` module (IIFE)
Owns all audio concerns. Public API:
- `play(url, onCorsFailure)` — loads and plays the stream
- `stop()` — pauses and clears the stream
- `getAnalyser()` — returns the `AnalyserNode`
- `getAudioContext()` — returns the `AudioContext`

Implementation details:
- Create `AudioContext` lazily on first `play()` call (satisfies browser user-gesture requirement)
- If context is `suspended`, call `audioCtx.resume()`
- Graph: `createMediaElementSource(audio)` → `analyser` → `destination`
- `analyser.fftSize = 64` (gives 32 frequency bins)
- `analyser.smoothingTimeConstant = 0.8`

#### `Visualizer` module (IIFE)
Owns all rendering. Public API:
- `start(analyserNode)` — begins the RAF render loop in `'analyser'` mode
- `stop()` — cancels RAF, resets bars to idle state
- `switchToFallback()` — switches render mode to `'fallback'`
- `isAnalyserSilent()` — returns `true` if all frequency bins are zero

Two render modes:
- **`'analyser'`**: calls `analyser.getByteFrequencyData(dataArray)` each frame. Maps 32 frequency bins across 32 bars. Bar height = `(binValue / 255) * innerHeight`. Colour ramp: green (`#1aff6a`) below 60%, yellow (`#e8ff00`) below 85%, red (`#ff3c00`) above.
- **`'fallback'`**: sine-wave ripple animation driven by `requestAnimationFrame` timestamp. Bars stay dim green (`#1aff6a44`) at low amplitude. Used when CORS blocks the analyser.

VU meter DOM: a `<div class="vu-meter">` containing 32 `<div class="vu-bar">` children injected by JS. Bars use `flex: 1`, `align-items: flex-end`, height driven by JS style assignment each frame.

### CORS handling (critical)

The Web Audio API's `createMediaElementSource` causes the browser to re-fetch the stream with a CORS check. Without `Access-Control-Allow-Origin: *` from the server, the analyser receives only zeroes — silently.

Three-layer strategy:

1. **Optimistic**: set `audio.crossOrigin = 'anonymous'` before loading. If the server sends CORS headers, the analyser works.
2. **Network error fallback**: if `audio.play()` rejects (server actively refuses CORS), retry without the `crossOrigin` attribute so audio still plays. Call `onCorsFailure()` immediately to switch visualizer to fallback mode.
3. **Silent analyser detection**: after 2500ms of playback, call `Visualizer.isAnalyserSilent()`. If all bins are zero, call `Visualizer.switchToFallback()` and show a small warning: *"⚠ Visualizer limited — stream server does not send CORS headers."*

---

## Step 3 — ICY Stream Metadata

### Goal
Fetch and display Shoutcast/Icecast ICY metadata from the stream's HTTP response headers.

### `IcyMeta` module (IIFE)
Public API:
- `load(url)` — fetches headers and renders the panel (call in parallel with `play()`)
- `clear()` — hides and empties the panel (call on stop)

#### Fetching headers
Use `window.fetch(url, { method: 'GET', headers: { 'Icy-MetaData': '1' } })`. The `Icy-MetaData: 1` request header signals to the server that the client supports ICY metadata. Immediately cancel the response body (we only need headers): `res.body && res.body.cancel()`. Wrap in try/catch — if CORS blocks the fetch, silently return `null`.

Headers to read (try both casing variants with `headers.get()`):

| Header | Field name |
|---|---|
| `icy-name` | Station name |
| `icy-description` | Description subtitle |
| `icy-genre` | Genre string (space-separated) |
| `icy-url` | Station website URL |
| `icy-logo` | Logo image URL |
| `icy-br` | Bitrate (kbps) |
| `icy-sr` | Sample rate (Hz) |

Only render the panel if at least one field is non-null.

#### Station panel HTML structure
```
.station-meta (display:none by default, display:flex when .visible)
  ├── img.station-logo  (80×80px, object-fit:cover) — or —
  │   div.station-logo-placeholder  (📻 emoji, same size)
  └── div.station-info
        ├── div.station-name  (Bebas Neue, accent colour, linked to icy-url if present)
        ├── div.station-desc  (subtitle, truncated)
        └── div.station-tags
              ├── span.station-tag  (one per genre word, split on space/slash)
              └── span.station-tag.hl  (bitrate tag in accent colour, e.g. "160 kbps")
                  span.station-tag     (samplerate, e.g. "44100 Hz")
```

Place the `.station-meta` panel inside `.player`, **above** the VU meter.

Logo load errors: use `onerror` on the `<img>` to replace with the placeholder div.

Always HTML-escape all values before inserting into innerHTML (`&`, `<`, `>`, `"`).

---

## Step 4 — Record Button

### Goal
Add a Record button. First press starts recording; second press stops recording and downloads the audio as a WAV file.

### Button appearance
- Full-width (spans both columns of the controls grid: `grid-column: 1 / -1`)
- Contains three inline children: `.rec-dot` (circle), `.rec-label` (text), `.rec-timer` (elapsed time)
- Idle: dark red border/text (`#c0392b`), label = "Record"
- Recording: bright red border/text (`var(--accent2)`), label = "Stop Rec", pulsing red glow animation (`rec-pulse`), `.rec-dot` blinks, `.rec-timer` shows `MM:SS` elapsed, updated every second with `setInterval`
- Disabled until stream is playing; re-disabled when stream stops

### `Recorder` module (IIFE)
Public API:
- `start(audioCtx, analyserNode)` — begins recording
- `stop()` — ends recording, encodes WAV, triggers download
- `isRecording()` — returns boolean

#### Recording approach
Use a `ScriptProcessorNode` tapped from the analyser output (not `MediaRecorder`, to get raw PCM for WAV encoding):

```
analyserNode → ScriptProcessorNode(4096, 2, 2) → audioCtx.destination
```

- `onaudioprocess`: read `e.inputBuffer.getChannelData(0)` (L) and `getChannelData(1)` (R), interleave into a `Float32Array`, push to a `buffers[]` array
- The processor **must** be connected to `destination` or it won't fire in some browsers

#### WAV encoding (no external library)
On `stop()`:
1. Merge all `Float32Array` chunks into one contiguous array
2. Write a 44-byte RIFF/WAV header using `DataView`:
   - Format: PCM (1), 2 channels, stream's sample rate, 16-bit
3. Convert float32 samples → int16: `s < 0 ? s * 0x8000 : s * 0x7FFF`, clamped to [-1, 1]
4. Create `Blob` with type `'audio/wav'`
5. `URL.createObjectURL(blob)`, create a hidden `<a>` element, set `.download`, `.click()`
6. `setTimeout(() => URL.revokeObjectURL(url), 10000)` to clean up

#### Filename
```
{station_name}_{ISO_timestamp}.wav
```
Get station name from `.station-name` element text content, slugified (`/[^a-z0-9]/gi → '_'`). Fall back to `'recording'` if no metadata.

#### Important note on recording vs volume
The recorder taps the signal **before** the gain/volume node, so recordings are always at full signal level regardless of the volume slider setting.

#### Lifecycle
- `handlePlay()`: does not start recording automatically
- `audio 'playing'` event: enables the Record button
- `handleStop()`: if recording, call `Recorder.stop()` first (downloads the file), then stop the stream
- `audio 'error'` event: stop recording if active, disable Record button

---

## Step 5 — Volume Control Slider

### Goal
Add a volume slider between the controls and the CORS notice.

### HTML structure
```html
<div class="volume-row">
  <span class="volume-icon" id="vol-icon">🔊</span>
  <input class="volume-slider" id="vol-slider" type="range" min="0" max="100" value="100">
  <span class="volume-value" id="vol-value">100%</span>
</div>
```

### Behaviour
- `input` event on slider: set `audio.volume = value / 100`, update label and track fill
- Track fill: set `background` inline style as `linear-gradient(to right, var(--accent) {pct}%, var(--border) {pct}%)` on the slider element itself
- Icon adapts to level:
  - `0` → 🔇
  - `< 0.4` → 🔈
  - `< 0.75` → 🔉
  - `≥ 0.75` → 🔊
- Icon is **clickable** to toggle mute: stores `lastVolume`, sets `audio.volume = 0` / restores it on second click

### Slider CSS
Style `::-webkit-slider-thumb` and `::-moz-range-thumb`:
- 14×14px circle, accent colour, glow shadow
- Scale up + stronger glow on `:hover`
- Remove default appearance with `-webkit-appearance: none`

---

## Module Interaction Diagram

```
URL query param (?play=...)
        │
        ▼
   [ MAIN glue layer ]
        │
        ├──► IcyMeta.load(url)          — fetch ICY headers, render station panel
        │
        ├──► StreamPlayer.play(url)     — loads audio, manages AudioContext graph
        │         │
        │         ├── AudioContext
        │         ├── MediaElementSource
        │         ├── AnalyserNode  ────────────► Visualizer.start(analyser)
        │         └── Destination                        │
        │                                         renderAnalyserFrame() via RAF
        │                                         or renderFallbackFrame() if CORS blocked
        │
        ├──► Recorder.start(ctx, analyser)
        │         │
        │         └── ScriptProcessorNode → buffers[] → WAV → download
        │
        └──► Volume slider → audio.volume (0–1)
```

---

## Controls Grid Layout

```
[ ▶ Play  ] [ ■ Stop  ]   ← 2-column grid
[ ● Record (full width) ]
[ 🔊 ──────────── 100% ]  ← volume row (flex)
```

---

## File Structure

Everything in a single `index.html`:
- All CSS in `<style>` in `<head>`
- All JS in one `<script>` at bottom of `<body>`
- No external JS dependencies (fonts loaded from Google Fonts CDN only)
- Hidden `<audio id="audio" preload="none">` element in the DOM

---

## Key Technical Constraints & Pitfalls

1. **AudioContext must be created after user gesture** — create it lazily inside the `play()` call, not at page load
2. **`createMediaElementSource` can only be called once per audio element** — guard with a flag (`if (audioCtx) return`)
3. **CORS and Web Audio API**: even if audio plays fine, the analyser will output zeroes without `crossOrigin="anonymous"` + server CORS headers — handle this gracefully with the three-layer strategy described in Step 2
4. **`ScriptProcessorNode` must connect to destination** — it won't fire `onaudioprocess` in some browsers unless connected to the audio graph's output
5. **WAV file size**: recording grows ~10MB/minute at 44100Hz stereo 16-bit — no cap is enforced, inform users mentally
6. **`URL.createObjectURL` cleanup** — always revoke after download to avoid memory leaks
7. **HTML escaping** — always escape ICY metadata values before inserting into innerHTML
8. **Logo CORS**: `<img>` loading cross-origin logos may fail silently — always provide an `onerror` fallback