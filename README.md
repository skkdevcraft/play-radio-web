A **single‑page radio stream player** — entirely client‑side, zero backend — built for discovering, browsing, and listening to online radio stations.

Live at: https://play.radiocombinator.com

![Demo](./theme-demo/dance-matrix.gif)

---

## Features

- Play streams directly in the browser
- Bring your own stream URL or **search radio streams** using the public API from [radio‑browser.info](https://radio-browser.info)
- **Smart Search** — recognizes country names and genres automatically (see [Smart Search](#smart-search))
- **Favorites list** — save your favorite stations in browser localStorage
- **Shareable links** — current theme and stream are encoded in the URL, so you can share exactly what you're listening to
- **Theme support**
  - Customizable UI via CSS themes
  - Includes multiple built‑in themes
  - Supports animations and dynamic UI changes using CSS variables
- Themes are modular — you are welcome to contribute!

---

## How It Works

This is a **pure client‑side app** built with standard web technologies:

- HTML
- CSS (themes, variables, animations)
- JavaScript

No server logic — all data fetching, UI interaction, and state persistence runs in the browser.

---

## Usage

1. Open https://play.radiocombinator.com in any modern browser.
2. Use the search bar to find radio stations by name, genre, country, or tag.
3. Click a station to play it.
4. Add stations to your **Favorites** list — stored locally in your browser.
5. Switch themes via the theme selector to instantly change the app's look & feel.
6. **Share** what you're listening to — copy the URL and send it to anyone.

---

## Smart Search

The search bar understands natural language queries combining station names, genres, and countries.

When you type a query, the app automatically recognizes:

- **Country names** — filters results to stations broadcasting from that country
- **Genre/tag keywords** — filters by music genre or station tag
- **Everything else** — used to match station names

This means you can mix and match freely:

| Query | What it does |
|---|---|
| `rainbow greece` | Searches for stations named "rainbow" in Greece |
| `drum and bass germany` | Searches for "drum and bass" genre stations in Germany |
| `jazz france` | Searches for jazz stations in France |
| `rock` | Searches all stations with "rock" in the name or tag |
| `smooth jazz united states` | Searches for smooth jazz stations in the US |

Unrecognized words are treated as station name keywords. You don't need to use any special syntax — just type naturally.

---

## Shareable Links

The app encodes the **current theme** and **currently playing stream URL** as query parameters in the page URL. This means:

- Every listening session has a unique, shareable link
- Sending the link to someone opens the app with the same station and theme active
- No account or login needed — just copy and share the URL

Example URL:
```
https://play.radiocombinator.com?theme=hacker-news&play=https%3A%2F%2Fdancewave.online%2Fdance.ogg
```

---

## Theming

Themes power the UI customization experience. Each theme is:

- A **single CSS file**
- Uses CSS variables for colors, fonts, animations, and transitions
- Automatically loaded at runtime

### Built‑in Themes

<table>
  <tr>
    <td><img src="./theme-demo/valentine.gif" alt="Valentine" width="320"/></td>
    <td><img src="./theme-demo/christmas.gif" alt="Christmas" width="320"/></td>
  </tr>
  <tr>
    <td><img src="./theme-demo/amber-glow.gif" alt="Amber Glow" width="320"/></td>
    <td><img src="./theme-demo/arctic-frost.gif" alt="Arctic Frost" width="320"/></td>
  </tr>
</table>

### Contribute Your Own Theme

Want your theme included?

1. Create a `.css` file defining your variables and styles.
2. Follow the theme structure described in [THEME_GUIDE.md](./THEME_GUIDE.md)
3. Submit a pull request!

Your theme can change:
- Colors
- Fonts
- Layout tweaks
- Animated effects
- And more

---

## Development

**Requirements**

No backend required — just a static host or local development server.

**Getting Started**
```bash
git clone https://github.com/skkdevcraft/play-radio-web.git
cd play-radio-web/src
open index.html
```

Use your preferred local server (e.g., `live-server`, `http-server`) for hot reload and testing.

---

## Radio Browser Integration

The app uses the **radio‑browser.info** API to search and retrieve stream metadata.

Useful endpoints:

* Search by name, tag, country
* Stream URLs
* Station metadata (favicon, bitrate, tags)

---

## Favorites

Favorites are persisted using **localStorage**.

Stored data:

* Station ID
* Name
* Stream URL
* Favicon
* Any custom metadata

---

## FAQ

**Can I host this myself?**
Yes! It's just static files — you can host on Netlify, GitHub Pages, Vercel, or any static host.

**How do themes load?**
Themes are CSS files loaded via JavaScript and applied using CSS variables.

**Can I share what I'm listening to?**
Yes! The current station and theme are encoded in the URL — just copy and share it.

---

## Contributions

All contributions are welcome!
Whether it's:

* Bug fixes
* New themes
* UX improvements
* Feature proposals

---

## License

Distributed under the MIT License.
