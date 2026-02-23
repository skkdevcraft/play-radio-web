export const BUILT_IN = [

    {
      id: 'dark-matrix', name: 'Dark Matrix', label: 'Default',
      fonts: {
        mono:    { family: 'Share Tech Mono', fallback: 'monospace', googleName: 'Share+Tech+Mono' },
        display: { family: 'Bebas Neue',       fallback: 'sans-serif', googleName: 'Bebas+Neue' }
      },
      vars: {
        'color-bg':'#0a0a0a','color-panel':'#111111','color-panel-alt':'#0d0d0d',
        'color-well':'#000000','color-border':'#2a2a2a','color-border-subtle':'#161616',
        'color-accent':'#e8ff00','color-accent-shadow':'rgba(232,255,0,0.3)',
        'color-accent2':'#ff3c00','color-accent2-shadow':'rgba(255,60,0,0.4)',
        'color-status-playing':'#1aff6a','color-status-buffering':'#e8ff00','color-status-error':'#ff3c00',
        'color-vu-low':'#1aff6a','color-vu-mid':'#e8ff00','color-vu-high':'#ff3c00','color-vu-idle':'#555555',
        'color-text':'#e0e0e0','color-text-dim':'#555555','color-text-muted':'#333333',
        'color-record':'#c0392b','color-record-shadow':'rgba(192,57,43,0.5)',
        'header-title-color':'#e8ff00',
        'header-title-shadow':'0 0 20px rgba(232,255,0,0.3), 3px 3px 0 #ff3c00',
        'header-subtitle-color':'#555555',
        'panel-bg':'#111111','panel-border':'#2a2a2a','panel-border-top':'3px solid #e8ff00',
        'panel-border-right':'1px solid #2a2a2a','panel-border-bottom':'1px solid #2a2a2a',
        'panel-border-left':'1px solid #2a2a2a','panel-padding':'2rem',
        'btn-play-border':'#e8ff00','btn-play-color':'#e8ff00','btn-play-hover-bg':'#e8ff00',
        'btn-play-hover-color':'#000000','btn-play-hover-shadow':'0 0 20px rgba(232,255,0,0.4)',
        'btn-stop-border':'#ff3c00','btn-stop-color':'#ff3c00','btn-stop-hover-bg':'#ff3c00',
        'btn-stop-hover-color':'#ffffff','btn-stop-hover-shadow':'0 0 20px rgba(255,60,0,0.4)',
        'btn-font-size':'1.4rem','btn-padding':'0.8rem 1rem','btn-border-width':'1px',
        'btn-border-style':'solid','btn-border-radius':'0px',
        'slider-thumb-color':'#e8ff00','slider-thumb-shadow':'0 0 6px rgba(232,255,0,0.4)','slider-track-bg':'#2a2a2a',
        'vu-height':'60px','vu-gap':'3px','meta-logo-size':'80px',
        'meta-name-color':'#e8ff00','meta-tag-color':'#555555','meta-tag-border':'#2a2a2a',
        'meta-tag-hl-color':'#e8ff00','meta-tag-hl-border':'rgba(232,255,0,0.3)',
        'fav-panel-border-top':'3px solid #333333','fav-item-active-bg':'#0d1400',
        'fav-item-active-accent':'#e8ff00','fav-item-hover-bg':'#111111',
        'fav-name-color':'#e0e0e0','fav-name-active-color':'#e8ff00',
        'fav-btn-play-color':'#e8ff00','fav-btn-rem-color':'#ff3c00',
        'toast-bg':'#1a1a1a','toast-border':'#2a2a2a',
        'toast-accent-border':'#e8ff00','toast-error-border':'#ff3c00','toast-color':'#e0e0e0',
        'bg-grid-color':'#1a1a1a','bg-grid-size':'40px'
      },
      customCSS: ''
    },

    {
      id: 'amber-glow', name: 'Amber Glow', label: 'Retro CRT',
      fonts: {
        mono:    { family: 'VT323', fallback: 'monospace', googleName: 'VT323' },
        display: { family: 'VT323', fallback: 'monospace', googleName: 'VT323' }
      },
      vars: {
        'color-bg':'#0c0800','color-panel':'#120e00','color-panel-alt':'#0e0a00',
        'color-well':'#080500','color-border':'#3a2800','color-border-subtle':'#1c1400',
        'color-accent':'#ffb300','color-accent-shadow':'rgba(255,179,0,0.35)',
        'color-accent2':'#ff6600','color-accent2-shadow':'rgba(255,102,0,0.4)',
        'color-status-playing':'#ffb300','color-status-buffering':'#ff8800','color-status-error':'#ff2200',
        'color-vu-low':'#ffb300','color-vu-mid':'#ff8800','color-vu-high':'#ff4400','color-vu-idle':'#3a2800',
        'color-text':'#e6a000','color-text-dim':'#6b4a00','color-text-muted':'#3d2a00',
        'color-record':'#cc3300','color-record-shadow':'rgba(204,51,0,0.5)',
        'header-title-color':'#ffb300',
        'header-title-shadow':'0 0 30px rgba(255,179,0,0.5), 0 0 60px rgba(255,100,0,0.2)',
        'header-subtitle-color':'#6b4a00',
        'panel-bg':'#120e00','panel-border':'#3a2800','panel-border-top':'3px solid #ffb300',
        'panel-border-right':'1px solid #3a2800','panel-border-bottom':'1px solid #3a2800',
        'panel-border-left':'1px solid #3a2800','panel-padding':'2rem',
        'btn-play-border':'#ffb300','btn-play-color':'#ffb300','btn-play-hover-bg':'#ffb300',
        'btn-play-hover-color':'#000000','btn-play-hover-shadow':'0 0 20px rgba(255,179,0,0.5)',
        'btn-stop-border':'#ff6600','btn-stop-color':'#ff6600','btn-stop-hover-bg':'#ff6600',
        'btn-stop-hover-color':'#000000','btn-stop-hover-shadow':'0 0 20px rgba(255,102,0,0.5)',
        'btn-font-size':'1.6rem','btn-padding':'0.7rem 1rem','btn-border-width':'1px',
        'btn-border-style':'solid','btn-border-radius':'0px',
        'slider-thumb-color':'#ffb300','slider-thumb-shadow':'0 0 8px rgba(255,179,0,0.5)','slider-track-bg':'#3a2800',
        'vu-height':'60px','vu-gap':'3px','meta-logo-size':'80px',
        'meta-name-color':'#ffb300','meta-tag-color':'#6b4a00','meta-tag-border':'#3a2800',
        'meta-tag-hl-color':'#ffb300','meta-tag-hl-border':'rgba(255,179,0,0.3)',
        'fav-panel-border-top':'3px solid #3a2800','fav-item-active-bg':'#1a1000',
        'fav-item-active-accent':'#ffb300','fav-item-hover-bg':'#140e00',
        'fav-name-color':'#e6a000','fav-name-active-color':'#ffb300',
        'fav-btn-play-color':'#ffb300','fav-btn-rem-color':'#ff6600',
        'toast-bg':'#1a1000','toast-border':'#3a2800',
        'toast-accent-border':'#ffb300','toast-error-border':'#ff6600','toast-color':'#e6a000',
        'bg-grid-color':'#160f00','bg-grid-size':'40px'
      },
      /* Scanline overlay via customCSS — demonstrates pseudo-element injection */
      customCSS: `
        body::after {
          content: '';
          display: block;
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.18) 2px,
            rgba(0,0,0,0.18) 4px
          );
        }
        .player { box-shadow: 0 0 40px rgba(255,179,0,0.08) inset; }
      `
    },

    {
      id: 'arctic-frost', name: 'Arctic Frost', label: 'Light & Clean',
      fonts: {
        mono:    { family: 'DM Mono', fallback: 'monospace',  googleName: 'DM+Mono' },
        display: { family: 'Exo 2',   fallback: 'sans-serif', googleName: 'Exo+2:wght@700' }
      },
      vars: {
        'color-bg':'#f0f4f8','color-panel':'#ffffff','color-panel-alt':'#f7fafd',
        'color-well':'#edf1f7','color-border':'#d0dae8','color-border-subtle':'#e4eaf4',
        'color-accent':'#0077ff','color-accent-shadow':'rgba(0,119,255,0.25)',
        'color-accent2':'#e6003a','color-accent2-shadow':'rgba(230,0,58,0.25)',
        'color-status-playing':'#00b05c','color-status-buffering':'#0077ff','color-status-error':'#e6003a',
        'color-vu-low':'#00b05c','color-vu-mid':'#0077ff','color-vu-high':'#e6003a','color-vu-idle':'#c8d4e4',
        'color-text':'#1a2233','color-text-dim':'#7a8fa8','color-text-muted':'#a8baca',
        'color-record':'#b00030','color-record-shadow':'rgba(176,0,48,0.3)',
        'header-title-color':'#0055cc','header-title-shadow':'0 2px 0 rgba(0,119,255,0.15)',
        'header-subtitle-color':'#7a8fa8',
        'panel-bg':'#ffffff','panel-border':'#d0dae8','panel-border-top':'3px solid #0077ff',
        'panel-border-right':'2px solid #d0dae8','panel-border-bottom':'2px solid #d0dae8',
        'panel-border-left':'2px solid #d0dae8','panel-border-radius':'6px','panel-padding':'2rem',
        'btn-play-border':'#0077ff','btn-play-color':'#0077ff','btn-play-hover-bg':'#0077ff',
        'btn-play-hover-color':'#ffffff','btn-play-hover-shadow':'0 4px 16px rgba(0,119,255,0.3)',
        'btn-stop-border':'#e6003a','btn-stop-color':'#e6003a','btn-stop-hover-bg':'#e6003a',
        'btn-stop-hover-color':'#ffffff','btn-stop-hover-shadow':'0 4px 16px rgba(230,0,58,0.3)',
        'btn-font-size':'1.2rem','btn-padding':'0.9rem 1rem','btn-border-width':'2px',
        'btn-border-style':'solid','btn-border-radius':'6px',
        'slider-thumb-color':'#0077ff','slider-thumb-shadow':'0 0 6px rgba(0,119,255,0.4)','slider-track-bg':'#d0dae8',
        'vu-height':'60px','vu-gap':'3px','vu-bar-radius':'3px','meta-logo-size':'80px',
        'meta-name-color':'#0055cc','meta-tag-color':'#7a8fa8','meta-tag-border':'#d0dae8',
        'meta-tag-hl-color':'#0077ff','meta-tag-hl-border':'rgba(0,119,255,0.3)',
        'fav-panel-border-top':'3px solid #d0dae8','fav-item-active-bg':'#eef6ff',
        'fav-item-active-accent':'#0077ff','fav-item-hover-bg':'#f7fafd',
        'fav-name-color':'#1a2233','fav-name-active-color':'#0055cc',
        'fav-btn-play-color':'#0077ff','fav-btn-rem-color':'#e6003a',
        'toast-bg':'#ffffff','toast-border':'#d0dae8',
        'toast-accent-border':'#0077ff','toast-error-border':'#e6003a','toast-color':'#1a2233',
        'bg-grid-color':'#dce6f0','bg-grid-size':'40px',
        'bg-color':'#f0f4f8',
        'layout-max-width':'520px'
      },
      customCSS: `
        /* Arctic: soften grid opacity on light bg */
        body::before { opacity: 0.5; }
        .station-list__btn--play:hover { background: rgba(0,119,255,0.07) !important; }
        .station-list__btn--remove:hover { background: rgba(230,0,58,0.07) !important; }
      `
    },

    {
      id: 'neon-dusk', name: 'Neon Dusk', label: 'Synthwave',
      fonts: {
        mono:    { family: 'Courier Prime', fallback: 'monospace',  googleName: 'Courier+Prime' },
        display: { family: 'Orbitron',      fallback: 'sans-serif', googleName: 'Orbitron:wght@700' }
      },
      vars: {
        'color-bg':'#0d0015','color-panel':'#150020','color-panel-alt':'#110018',
        'color-well':'#08000f','color-border':'#3d1060','color-border-subtle':'#1e0830',
        'color-accent':'#ff00e4','color-accent-shadow':'rgba(255,0,228,0.35)',
        'color-accent2':'#00e5ff','color-accent2-shadow':'rgba(0,229,255,0.35)',
        'color-status-playing':'#00ff99','color-status-buffering':'#ff00e4','color-status-error':'#ff2244',
        'color-vu-low':'#00ff99','color-vu-mid':'#ff00e4','color-vu-high':'#00e5ff','color-vu-idle':'#3d1060',
        'color-text':'#d4a8ff','color-text-dim':'#6b3d90','color-text-muted':'#3d1060',
        'color-record':'#ff2244','color-record-shadow':'rgba(255,34,68,0.5)',
        'header-title-color':'#ff00e4',
        'header-title-shadow':'0 0 20px rgba(255,0,228,0.6), 3px 3px 0 #00e5ff',
        'header-subtitle-color':'#6b3d90',
        'panel-bg':'#150020','panel-border':'#3d1060','panel-border-top':'3px solid #ff00e4',
        'panel-border-right':'1px solid #3d1060','panel-border-bottom':'1px solid #3d1060',
        'panel-border-left':'1px solid #3d1060','panel-padding':'2rem',
        'btn-play-border':'#ff00e4','btn-play-color':'#ff00e4','btn-play-hover-bg':'#ff00e4',
        'btn-play-hover-color':'#000000','btn-play-hover-shadow':'0 0 24px rgba(255,0,228,0.6)',
        'btn-stop-border':'#00e5ff','btn-stop-color':'#00e5ff','btn-stop-hover-bg':'#00e5ff',
        'btn-stop-hover-color':'#000000','btn-stop-hover-shadow':'0 0 24px rgba(0,229,255,0.6)',
        'btn-font-size':'1.3rem','btn-padding':'0.8rem 1rem','btn-border-width':'1px',
        'btn-border-style':'solid','btn-border-radius':'4px',
        'slider-thumb-color':'#ff00e4','slider-thumb-shadow':'0 0 8px rgba(255,0,228,0.5)','slider-track-bg':'#3d1060',
        'vu-height':'60px','vu-gap':'3px','meta-logo-size':'80px',
        'meta-name-color':'#ff00e4','meta-tag-color':'#6b3d90','meta-tag-border':'#3d1060',
        'meta-tag-hl-color':'#ff00e4','meta-tag-hl-border':'rgba(255,0,228,0.3)',
        'fav-panel-border-top':'3px solid #3d1060','fav-item-active-bg':'#1e0030',
        'fav-item-active-accent':'#ff00e4','fav-item-hover-bg':'#150020',
        'fav-name-color':'#d4a8ff','fav-name-active-color':'#ff00e4',
        'fav-btn-play-color':'#ff00e4','fav-btn-rem-color':'#00e5ff',
        'toast-bg':'#1e0030','toast-border':'#3d1060',
        'toast-accent-border':'#ff00e4','toast-error-border':'#ff2244','toast-color':'#d4a8ff',
        'bg-grid-color':'#1a0030','bg-grid-size':'40px'
      },
      customCSS: `
        /* Neon Dusk: horizon gradient behind grid */
        body {
          background-image:
            radial-gradient(ellipse 120% 60% at 50% 110%, rgba(255,0,228,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 50% 110%, rgba(0,229,255,0.12) 0%, transparent 60%);
        }

        body {
          transform-origin: center center;
          will-change: transform;
          animation: none; /* ensure no conflicting theme animation */
          
          /* Composite sinusoidal motion using time variable */
          transform:
            perspective(1400px)
            rotateX(
              calc(
                sin(calc(var(--t) * 0.04)) * (2deg + var(--amp-low) * 2deg)
              )
            )
            rotateY(
              calc(
                cos(calc(var(--t) * 0.032)) * (1.5deg + var(--amp-mid) * 1.5deg)
              )
            )
            translateY(
              calc(
                sin(calc(var(--t) * 0.05)) * (8px + var(--amp-low-pct) * 0.08px)
              )
            )
            translateX(
              calc(
                cos(calc(var(--t) * 0.027)) * (6px + var(--amp-mid-pct) * 0.06px)
              )
            );
        }

        /* Panel glow scales with overall loudness */
        .player {
          box-shadow:
            0 0 0 1px #3d1060,
            0 0 calc(20px + var(--amp-pct) * 2px) rgba(255,0,228,0.15) inset,
            0 8px 60px rgba(0,0,0,0.6);
        }

        /* Title flickers (time-based) AND scales with bass */
        .site-header__title {
          animation: neon-flicker 6s ease-in-out infinite;
          display: inline-block;
          transform: scale(calc(1 + var(--amp-low) * 0.52));
          transition: transform 0.05s;
        }
        @keyframes neon-flicker {
          0%,95%,100% { opacity: 1; }
          96% { opacity: 0.85; }
          97% { opacity: 1; }
          98% { opacity: 0.7; }
          99% { opacity: 1; }
        }

        /* Station logo spins slowly with --t, speeds up on treble peaks */
        .station-meta__logo-placeholder {
          display: flex; align-items: center; justify-content: center;
          transform: rotate(calc(var(--t) * calc(20 + var(--amp-high-pct) * 4) * 0.05deg));
          transition: transform 0.02s linear;
        }

        /* VU meter hue-shifts with time */
        .vu-meter {
          filter: hue-rotate(calc(var(--t) * 15deg));
        }

        /* Border accent width reacts to mid frequencies */
        .favorites-panel {
          border-top-width: calc(3px + var(--amp-mid) * 6px);
          transition: border-top-width 0.05s;
        }
      `
    }
  ];
