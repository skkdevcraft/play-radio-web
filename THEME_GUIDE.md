## What Is a Theme or a "Skin"

A theme is a single `.css` file that overrides CSS variables and optionally adds custom styles, animations, and effects. Themes are fully self-contained — one file, no dependencies.

---

## Quick Start

The fastest way to get started is to use an AI assistant. Describe the visual mood or concept you have in mind and ask it to generate a CSS theme. See `/notes/003-hacker-news-theme.md` for a real example of this workflow. You can then refine the result by hand.

Alternatively, open any existing theme in `/src/themes/` and use it as a starting point.

---

## File Structure

1. Create your CSS file in `/src/themes/`, for example `/src/themes/my-theme.css`.
2. Register it by adding an entry to the themes array in `/src/lib/ThemeEngine.js`.

That is all that is required for the app to recognize and load your theme.

---

## What You Can Customize

Open `/src/style.css` and look for the comments — they mark which CSS variables are available and what each one controls. The variables cover:

- Colors (backgrounds, text, accents, borders)
- Fonts and typography
- Spacing and layout tweaks
- Transition and animation parameters

You can also add entirely new CSS rules beyond the variables if your theme requires it.

Some `css` variables are updated each frame, here is part of the comment in `style.css`:

```css
  /* ── Audio-reactive vars (written every animation frame) ─
        These are live-updated by AudioReactor and can be used
        freely in customCSS to drive transforms, filters, colors,
        shadows — anything CSS accepts a number or length for.

        TIME
        --t            Seconds since page load (float, unbounded).
                        Use in calc() for continuous motion:
                        transform: rotate(calc(var(--t) * 30deg));
        --dt           Delta-time of last frame in seconds (~0.016).
                        Useful for normalising speed to framerate.

        AMPLITUDE (0 – 1, smoothed)
        --amp          Overall loudness across all frequencies.
        --amp-low      Bass / sub-bass energy  (0 – 250 Hz band).
        --amp-mid      Midrange energy          (250 – 2000 Hz).
        --amp-high     Treble / presence energy (2000+ Hz).
        --amp-peak     Instantaneous peak (no smoothing). Snappy.

        SCALED VARIANTS (0 – 100, same signals × 100)
        --amp-pct      --amp      × 100   (handy for % lengths)
        --amp-low-pct  --amp-low  × 100
        --amp-mid-pct  --amp-mid  × 100
        --amp-high-pct --amp-high × 100

        PER-BAR (16 bars, indexed 0–15)
        --bar-0 … --bar-15   Individual bar amplitude (0 – 1). */
```

---

## Development Tips

### Loading the theme locally

While working on your theme, add it as a `<link>` tag directly in `index.html`, placed below the main stylesheet:

```html
<link href="style.css" rel="stylesheet" />
<link href="themes/my-theme.css" rel="stylesheet" />
```

This way your theme is applied immediately without going through the theme selector, which makes iteration faster.

### Full-screen animations

If your theme uses full-screen background animations, add the class `fullscreen` to the `<body>` element while developing. This lets you see the animation at full size without the UI getting in the way.

### Freezing the animation loop

The app updates certain CSS variables on every animation frame via `requestAnimationFrame` in `/src/lib/Player.js`. This can interfere with Chrome DevTools when you are trying to inspect or tweak variable values, because the values get overwritten continuously.

To freeze them while adjusting styles, comment out this line in `/src/lib/Player.js`:

```js
rafId = requestAnimationFrame(_loop);
```

Remember to restore it before submitting.

---

## Submitting Your Theme

1. Make sure your `.css` file is in `/src/themes/` and registered in `ThemeEngine.js`.
2. Add a short demo — a GIF or screenshot works well.
3. Open a pull request.

If you have questions, look at the existing themes or the notes folder for guidance.

Thank you for contributing!