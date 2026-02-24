import { FavoritesUI } from './FavoritesUI.js'
import { IcyMeta } from './IcyMeta.js'

/* =========================================================
   PLAYBACK CONTROLLER
========================================================= */
export const Player = (() => {
  const audio      = document.getElementById('audio');
  const btnPlay    = document.getElementById('btn-play');
  const btnStop    = document.getElementById('btn-stop');
  const btnRecord  = document.getElementById('btn-record');
  const urlDisplay = document.getElementById('stream-url-display');
  const corsNotice = document.getElementById('cors-notice');

  let currentUrl   = null;
  let corsCheckTimer = null;

  const params     = new URLSearchParams(window.location.search);
  const initialUrl = params.get('play') || 'https://dancewave.online/dance.ogg';

  /* ---------------------------------------------------------
     EVENT EMITTER
  --------------------------------------------------------- */
  const _listeners = {};

  function on(event, cb) {
    (_listeners[event] ??= []).push(cb);
  }

  function _emit(event, ...args) {
    (_listeners[event] ?? []).forEach(cb => cb(...args));
  }

  /* --------------------------------------------------------- */

  function _updateBrowserUrl(url) {
    const u = new URL(window.location.href);
    if (url) u.searchParams.set('play', url);
    else u.searchParams.delete('play');
    window.history.replaceState({}, '', u.toString());
  }

  function _scheduleCorsCheck() {
    clearTimeout(corsCheckTimer);
    corsCheckTimer = setTimeout(() => {
      if (AudioReactor.isLiveSilent()) {
        AudioReactor.startFallback();
        /* Visualizer.start() already running from 'playing' event */
        if (corsNotice) corsNotice.style.display = 'block';
      }
    }, 2500);
  }

  function play(url) {
    url = url || currentUrl || initialUrl;
    currentUrl = url;
    _updateBrowserUrl(url);
    FavoritesUI.setActive(url);

    if (urlDisplay) {
      urlDisplay.innerHTML = `<span class="stream-url__label">SRC</span> ${url}`;
      urlDisplay.title = url;
    }

    if (btnPlay)   btnPlay.disabled   = true;
    if (btnStop)   btnStop.disabled   = false;
    if (corsNotice) corsNotice.style.display = 'none';
    StatusBar.set('buffering');
    IcyMeta.clear();
    IcyMeta.load(url);

    StreamPlayer.play(url, () => {
      /* CORS blocked — switch both systems to synthetic fallback mode */
      AudioReactor.startFallback();
      Visualizer.start();
      if (corsNotice) corsNotice.style.display = 'block';
    }).catch(() => {
      StatusBar.set('error');
      AudioReactor.stop();
      Visualizer.stop();
      if (btnPlay) btnPlay.disabled = false;
      if (btnStop) btnStop.disabled = true;
    });

    _emit('play', url);
  }

  function stop() {
    clearTimeout(corsCheckTimer);
    if (Recorder.isRecording()) Recorder.stop();
    StreamPlayer.stop();
    AudioReactor.stop();
    Visualizer.stop();
    IcyMeta.clear();
    if (btnPlay)   btnPlay.disabled   = false;
    if (btnStop)   btnStop.disabled   = true;
    if (btnRecord) btnRecord.disabled = true;
    StatusBar.set('idle');
    FavoritesUI.setActive(null);

    _emit('stop');
  }

  if (btnPlay)   btnPlay.addEventListener('click',  () => play());
  if (btnStop)   btnStop.addEventListener('click',  stop);
  if (btnRecord) btnRecord.addEventListener('click', () => {
    if (Recorder.isRecording()) Recorder.stop();
    else {
      const ctx = StreamPlayer.getAudioContext();
      const tap = StreamPlayer.getSourceNode();
      if (ctx && tap) Recorder.start(ctx, tap);
    }
  });

  if (audio) {
    audio.addEventListener('playing', () => {
      StatusBar.set('playing');
      const analyser = StreamPlayer.getAnalyser();
      if (analyser) {
        /* Full audio graph available — use live analyser data */
        AudioReactor.startLive(analyser);
      } else {
        /* No AudioContext — fall back to synthetic animation */
        AudioReactor.startFallback();
      }
      Visualizer.start();
      if (analyser) _scheduleCorsCheck();
      if (btnRecord) btnRecord.disabled = !StreamPlayer.getAudioContext();
    });
    audio.addEventListener('waiting', () => StatusBar.set('buffering'));
    audio.addEventListener('stalled', () => StatusBar.set('buffering'));
    audio.addEventListener('ended',   stop);
    audio.addEventListener('error',   () => {
      StatusBar.set('error');
      AudioReactor.stop();
      Visualizer.stop();
      if (Recorder.isRecording()) Recorder.stop();
      if (btnPlay)   btnPlay.disabled   = false;
      if (btnStop)   btnStop.disabled   = true;
      if (btnRecord) btnRecord.disabled = true;
    });
  }

  /* Volume */
  const volSlider = document.getElementById('vol-slider');
  const volValue  = document.getElementById('vol-value');
  const volIcon   = document.getElementById('vol-icon');

  function _updateVolUI(val) {
    const pct = Math.round(val * 100);
    if (volValue) volValue.textContent = `${pct}%`;
    if (volSlider) volSlider.style.background =
      `linear-gradient(to right, var(--slider-thumb-color) ${pct}%, var(--slider-track-bg) ${pct}%)`;
    if (!volIcon) return;
    if (val === 0)       volIcon.textContent = '🔇';
    else if (val < 0.4)  volIcon.textContent = '🔈';
    else if (val < 0.75) volIcon.textContent = '🔉';
    else                 volIcon.textContent = '🔊';
  }

  if (volSlider && audio) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
      _updateVolUI(audio.volume);
    });
  }

  let lastVolume = 1;
  if (volIcon && audio) {
    volIcon.addEventListener('click', () => {
      if (audio.volume > 0) { lastVolume = audio.volume; audio.volume = 0; if (volSlider) volSlider.value = 0; }
      else { audio.volume = lastVolume; if (volSlider) volSlider.value = Math.round(lastVolume * 100); }
      _updateVolUI(audio.volume);
    });
    volIcon.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); volIcon.click(); }
    });
  }

  _updateVolUI(1);

  return { play, stop, on, getInitialUrl: () => initialUrl };
})();


/* =========================================================
   RECORDER
========================================================= */
const Recorder = (() => {
  const btnRecord = document.getElementById('btn-record');
  let processor = null, recording = false, buffers = [], sampleRate = 44100;
  let timerInterval = null, startTime = 0;

  const label = btnRecord && btnRecord.querySelector('.btn--record__label');
  const timer = btnRecord && btnRecord.querySelector('.btn--record__timer');

  function _updateTimer() {
    if (!timer) return;
    const e = Math.floor((Date.now() - startTime) / 1000);
    timer.textContent = `${String(Math.floor(e/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`;
  }

  function start(ctx, srcNode) {
    if (recording || !ctx || !srcNode) return;
    recording = true; buffers = []; sampleRate = ctx.sampleRate;
    processor = ctx.createScriptProcessor(4096, 2, 2);
    processor.onaudioprocess = e => {
      if (!recording) return;
      const L = e.inputBuffer.getChannelData(0), R = e.inputBuffer.getChannelData(1);
      const il = new Float32Array(L.length * 2);
      for (let i = 0; i < L.length; i++) { il[i*2] = L[i]; il[i*2+1] = R[i]; }
      buffers.push(il);
    };
    srcNode.connect(processor);
    processor.connect(ctx.destination);
    if (btnRecord) btnRecord.classList.add('is-recording');
    if (label) label.textContent = 'Stop Rec';
    startTime = Date.now(); _updateTimer();
    timerInterval = setInterval(_updateTimer, 1000);
  }

  function stop() {
    if (!recording) return;
    recording = false;
    clearInterval(timerInterval);
    if (timer) timer.textContent = '';
    if (btnRecord) btnRecord.classList.remove('is-recording');
    if (label) label.textContent = 'Record';
    if (processor) { try { processor.disconnect(); } catch (_) {} processor.onaudioprocess = null; processor = null; }
    if (!buffers.length) return;
    const totalLen = buffers.reduce((s, b) => s + b.length, 0);
    const merged = new Float32Array(totalLen);
    let off = 0;
    buffers.forEach(c => { merged.set(c, off); off += c.length; });
    buffers = [];
    _downloadWav(merged, 2, sampleRate);
  }

  function _downloadWav(samples, ch, rate) {
    const bps = 2, ba = ch*bps, br = rate*ba, dl = samples.length*bps;
    const buf = new ArrayBuffer(44+dl), view = new DataView(buf);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o+i, s.charCodeAt(i)); };
    ws(0,'RIFF'); view.setUint32(4,36+dl,true); ws(8,'WAVE'); ws(12,'fmt ');
    view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,ch,true);
    view.setUint32(24,rate,true); view.setUint32(28,br,true); view.setUint16(32,ba,true);
    view.setUint16(34,16,true); ws(36,'data'); view.setUint32(40,dl,true);
    let p = 44;
    for (let i = 0; i < samples.length; i++, p+=2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(p, s < 0 ? s*0x8000 : s*0x7FFF, true);
    }
    const nameEl = document.querySelector('.station-meta__name');
    const base = nameEl ? nameEl.textContent.trim().replace(/[^a-z0-9]/gi,'_').toLowerCase() : 'recording';
    const ts   = new Date().toISOString().slice(0,19).replace(/[T:]/g,'-');
    const blob = new Blob([buf], { type: 'audio/wav' });
    const url  = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${base}_${ts}.wav` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function isRecording() { return recording; }
  return { start, stop, isRecording };
})();


/* =========================================================
   STATUS
========================================================= */
const StatusBar = (() => {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const LABELS = { idle: 'Idle', playing: 'On Air', buffering: 'Buffering…', error: 'Error' };
  function set(state, extra) {
    if (dot)  dot.className = 'status-bar__dot' + (state !== 'idle' ? ` status-bar__dot--${state}` : '');
    if (text) text.textContent = extra || LABELS[state] || state;
  }
  return { set };
})();

/* =========================================================
   STREAM PLAYER
========================================================= */
const StreamPlayer = (() => {
  const audio = document.getElementById('audio');
  let audioCtx = null, analyser = null, sourceNode = null;

  /* ── Check for AudioContext support once at module init ── */
  const AudioContextClass = window.AudioContext || window.webkitAudioContext || null;
  if (!AudioContextClass) {
    console.warn(
      '[StreamPlayer] Web Audio API (AudioContext) is not supported in this browser. ' +
      'Visualizer, audio analysis, and recording will be disabled. Playback continues normally.'
    );
  }

  function ensureAudioGraph() {
    /* Skip silently if already built, no audio element, or API unavailable */
    if (audioCtx || !audio || !AudioContextClass) return;

    try {
      audioCtx   = new AudioContextClass();
      analyser   = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (err) {
      console.warn('[StreamPlayer] Failed to initialise AudioContext:', err);
      /* Null everything out so callers get clean nulls rather than broken objects */
      audioCtx   = null;
      analyser   = null;
      sourceNode = null;
    }
  }

  function _load(url, withCors) {
    if (!audio) return Promise.reject(new Error('No audio element'));
    ensureAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (withCors) audio.crossOrigin = 'anonymous';
    else audio.removeAttribute('crossOrigin');
    audio.src = url;
    audio.load();
    return audio.play();
  }

  function stop() {
    if (!audio) return;
    audio.pause();
    audio.src = '';
    audio.removeAttribute('crossOrigin');
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
  }

  function play(url, onCorsFailure) {
    return _load(url, true).catch(err => {
      console.warn('CORS play failed:', err);
      if (typeof onCorsFailure === 'function') onCorsFailure();
      return _load(url, false);
    });
  }

  function getAnalyser()     { return analyser; }
  function getAudioContext() { return audioCtx; }
  function getSourceNode()   { return sourceNode; }

  return { play, stop, getAnalyser, getAudioContext, getSourceNode };
})();

/* =========================================================
   AUDIO REACTOR
   Single source of truth for all audio-driven CSS vars.
   Runs its own rAF loop and writes to :root on every frame.

   Variables written each frame (all on :root / documentElement):

     TIME
       --t          Seconds since page load (continuous float)
       --dt         Delta time of last frame in seconds

     AMPLITUDE  (0–1 floats, exponentially smoothed)
       --amp        Overall RMS-ish loudness
       --amp-low    Bass band  (bins 0 – 20%  of FFT)
       --amp-mid    Mid  band  (bins 20– 60%  of FFT)
       --amp-high   High band  (bins 60–100%  of FFT)
       --amp-peak   Instantaneous peak bin value, no smoothing

     SCALED ×100 (same signals, 0–100 range)
       --amp-pct  --amp-low-pct  --amp-mid-pct  --amp-high-pct

     PER-BAR  (0–1, 16 bars indexed 0–15)
       --bar-0 … --bar-15

   In fallback mode (no analyser / CORS blocked) all amplitude
   vars animate synthetically so customCSS effects keep running.
========================================================= */
const AudioReactor = (() => {
  const root = document.documentElement;
  const BAR_COUNT = 16;

  let rafId    = null;
  let analyser = null;
  let dataArray = null;
  let mode     = 'idle';   /* 'idle' | 'live' | 'fallback' */

  /* smoothed values – exponential moving average */
  let sAmp = 0, sLow = 0, sMid = 0, sHigh = 0;
  const SMOOTH = 0.18;   /* 0=instant, 1=frozen; lower = snappier */

  let tStart = performance.now();
  let tPrev  = tStart;

  /* ── helpers ────────────────────────────────────────── */
  function _css(prop, val) {
    root.style.setProperty(prop, val);
  }
  function _lerp(a, b, t) { return a + (b - a) * t; }

  /* Read colour from CSS var (used by Visualizer for bar colours) */
  function _colorFromCSS(prop) {
    return getComputedStyle(root).getPropertyValue(prop).trim();
  }

  /* ── frame writers ──────────────────────────────────── */
  function _writeLive(ts) {
    analyser.getByteFrequencyData(dataArray);
    const len = dataArray.length;

    /* band boundaries (bin indices) */
    const lowEnd  = Math.floor(len * 0.20);
    const midEnd  = Math.floor(len * 0.60);

    let sumAll = 0, sumLow = 0, sumMid = 0, sumHigh = 0;
    let peak = 0;
    for (let i = 0; i < len; i++) {
      const v = dataArray[i] / 255;
      sumAll += v;
      if (i < lowEnd)       sumLow  += v;
      else if (i < midEnd)  sumMid  += v;
      else                  sumHigh += v;
      if (v > peak) peak = v;
    }

    const ampRaw  = sumAll  / len;
    const lowRaw  = sumLow  / Math.max(1, lowEnd);
    const midRaw  = sumMid  / Math.max(1, midEnd - lowEnd);
    const highRaw = sumHigh / Math.max(1, len - midEnd);

    sAmp  = _lerp(sAmp,  ampRaw,  SMOOTH);
    sLow  = _lerp(sLow,  lowRaw,  SMOOTH);
    sMid  = _lerp(sMid,  midRaw,  SMOOTH);
    sHigh = _lerp(sHigh, highRaw, SMOOTH);

    /* per-bar values mapped to :root --bar-N */
    for (let i = 0; i < BAR_COUNT; i++) {
      const idx = Math.floor((i / BAR_COUNT) * len);
      const barVal = (dataArray[idx] / 255).toFixed(4);
      _css(`--bar-${i}`, barVal);
    }

    return { amp: sAmp, low: sLow, mid: sMid, high: sHigh, peak };
  }

  function _writeFallback(t) {
    /* Synthetic waves so customCSS effects still animate when CORS blocks analyser */
    const amp  = 0.15 + 0.10 * Math.sin(t * 1.3);
    const low  = 0.20 + 0.15 * Math.sin(t * 0.9);
    const mid  = 0.10 + 0.08 * Math.sin(t * 2.1 + 1.0);
    const high = 0.05 + 0.05 * Math.sin(t * 3.7 + 2.0);

    for (let i = 0; i < BAR_COUNT; i++) {
      const phase = (i / BAR_COUNT) * Math.PI * 2;
      const v = (0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * (0.6 + (i % 5) * 0.07) + phase))).toFixed(4);
      _css(`--bar-${i}`, v);
    }

    return { amp, low, mid, high, peak: amp };
  }

  /* ── main loop ──────────────────────────────────────── */
  function _loop(ts) {
    rafId = requestAnimationFrame(_loop);

    const tNow = ts / 1000;
    const tAbs = (ts - tStart) / 1000;
    const dt   = Math.min(tNow - tPrev, 0.1);   /* cap dt to 100 ms */
    tPrev = tNow;

    /* Always write time vars regardless of audio state */
    _css('--t',  tAbs.toFixed(4));
    _css('--dt', dt.toFixed(4));

    if (mode === 'idle') return;

    const bands = (mode === 'live') ? _writeLive(ts) : _writeFallback(tAbs);

    const { amp, low, mid, high, peak } = bands;

    _css('--amp',          amp.toFixed(4));
    _css('--amp-low',      low.toFixed(4));
    _css('--amp-mid',      mid.toFixed(4));
    _css('--amp-high',     high.toFixed(4));
    _css('--amp-peak',     peak.toFixed(4));
    _css('--amp-pct',      (amp  * 100).toFixed(2));
    _css('--amp-low-pct',  (low  * 100).toFixed(2));
    _css('--amp-mid-pct',  (mid  * 100).toFixed(2));
    _css('--amp-high-pct', (high * 100).toFixed(2));
  }

  /* ── public API ─────────────────────────────────────── */
  function startLive(analyserNode) {
    analyser  = analyserNode;
    dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    mode = 'live';
    if (!rafId) { tStart = performance.now(); rafId = requestAnimationFrame(_loop); }
  }

  function startFallback() {
    mode = 'fallback';
    if (!rafId) { tStart = performance.now(); rafId = requestAnimationFrame(_loop); }
  }

  function stop() {
    mode = 'idle';
    /* Zero out amplitude vars — time keeps running */
    ['--amp','--amp-low','--amp-mid','--amp-high','--amp-peak',
     '--amp-pct','--amp-low-pct','--amp-mid-pct','--amp-high-pct'].forEach(p => _css(p, '0'));
    for (let i = 0; i < BAR_COUNT; i++) _css(`--bar-${i}`, '0');
  }

  function isLiveSilent() {
    if (!analyser || !dataArray) return true;
    analyser.getByteFrequencyData(dataArray);
    return dataArray.every(v => v === 0);
  }

  /* Always start the time loop immediately so --t is live from page load */
  (function _startTimeClock() {
    tStart = performance.now();
    rafId = requestAnimationFrame(_loop);
  })();

  return {
    startLive, startFallback, stop, isLiveSilent,
    getBarCount: () => BAR_COUNT,
    colorFromCSS: _colorFromCSS
  };
})();

/* =========================================================
   VISUALIZER
   Reads the CSS vars written by AudioReactor each frame
   and renders the VU bar display. Bars are styled via
   scoped inline CSS vars (--_bar-h, --_bar-color) so that
   modders can override bar appearance entirely in customCSS
   using the global --bar-N and --amp-* vars.
========================================================= */
const Visualizer = (() => {
  const vuEl = document.getElementById('vu-meter');
  const BAR_COUNT = AudioReactor.getBarCount();
  const bars = [];
  let rafId = null;
  let mode  = 'idle';   /* 'idle' | 'active' */

  /* Build bar elements */
  if (vuEl) {
    for (let i = 0; i < BAR_COUNT; i++) {
      const b = document.createElement('div');
      b.className = 'vu-meter__bar';
      vuEl.appendChild(b);
      bars.push(b);
    }
  }

  function _barColor(norm) {
    if (norm < 0.6)  return AudioReactor.colorFromCSS('--color-vu-low')  || '#1aff6a';
    if (norm < 0.85) return AudioReactor.colorFromCSS('--color-vu-mid')  || '#e8ff00';
    return               AudioReactor.colorFromCSS('--color-vu-high') || '#ff3c00';
  }

  function _render() {
    if (!vuEl) return;
    const innerH = vuEl.clientHeight - 16;
    const root = document.documentElement;
    const style = getComputedStyle(root);

    bars.forEach((b, i) => {
      /* Read the global --bar-N var that AudioReactor just wrote */
      const norm = parseFloat(style.getPropertyValue(`--bar-${i}`)) || 0;
      const h    = Math.max(2, Math.round(norm * innerH));
      const col  = _barColor(norm);
      /* Write scoped vars on the element itself so CSS can react */
      b.style.setProperty('--_bar-h',     h + 'px');
      b.style.setProperty('--_bar-color', col);
    });
  }

  function _loop() {
    rafId = requestAnimationFrame(_loop);
    if (mode === 'active') _render();
  }

  function start() {
    mode = 'active';
    if (!rafId) rafId = requestAnimationFrame(_loop);
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    mode = 'idle';
    const idleColor = AudioReactor.colorFromCSS('--color-vu-idle') || '#555';
    bars.forEach(b => {
      b.style.setProperty('--_bar-h',     '2px');
      b.style.setProperty('--_bar-color', idleColor);
    });
  }

  /* Expose for CORS check — delegate to AudioReactor */
  function isAnalyserSilent() { return AudioReactor.isLiveSilent(); }
  function switchToFallback()  { AudioReactor.startFallback(); }

  function fullScreen(on) {
    const body = document.getElementsByTagName('body')[0];
    if (!body) return;
    if (on) {
      body.classList.add("fullscreen");
    } else {
      body.classList.remove("fullscreen");
    }
  }

  return { start, stop, switchToFallback, isAnalyserSilent, fullScreen };
})();

/* =========================================================
   FULLSCREEN VISUALIZER — idle timer
   Activates after IDLE_MS of inactivity while playing.
   Deactivates on any user interaction or when playback stops.
========================================================= */
export const FullscreenVU = (() => {
  const IDLE_MS = 10_000; // 10 seconds — adjust to taste
  let timer = null;
  let isPlaying = false;
  let isFullscreen = false;

  function _activate() {
    if (isFullscreen || !isPlaying) return;
    isFullscreen = true;
    Visualizer.fullScreen(true);
  }

  function _deactivate() {
    if (!isFullscreen) return;
    isFullscreen = false;
    Visualizer.fullScreen(false);
  }

  function _resetTimer() {
    clearTimeout(timer);
    _deactivate();
    if (isPlaying) {
      timer = setTimeout(_activate, IDLE_MS);
    }
  }

  function _onInteraction() {
    _resetTimer();
  }

  // Watch Player state
  Player.on('play', () => {
    isPlaying = true;
    _resetTimer();
  });

  Player.on('stop', () => {
    isPlaying = false;
    clearTimeout(timer);
    _deactivate();
  });

  // Any user activity resets the idle clock and exits fullscreen
  const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
  EVENTS.forEach(evt =>
    window.addEventListener(evt, _onInteraction, { passive: true })
  );
})();