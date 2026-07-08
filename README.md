# Weather Tracker

A liquid-glass weather dashboard that combines **local forecasts** from [Open-Meteo](https://open-meteo.com/) with **natural event tracking** from [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3).

Live demo: `https://<your-username>.github.io/weather-tracker/`

## Features

- Current weather + 5-day forecast for your location (GPS, IP, or city search)
- Interactive map of NASA natural events (storms, wildfires, volcanoes, earthquakes, and more)
- Filterable glass sidebar with category and open/closed status filters
- Auto-refreshes EONET data every 10 minutes
- Installable as a PWA — add to your phone home screen
- Fully client-side — no API keys required
- Free 24/7 hosting via GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build:local   # local paths
npm run build         # GitHub Pages paths (/weather-tracker/)
npm run preview
```

## Deploy to GitHub Pages

**Quick deploy (recommended):**

```powershell
gh auth login          # one-time: authenticate in browser
.\scripts\deploy.ps1   # creates repo, pushes, enables Pages
```

**Manual steps:**

1. Create a GitHub repository named **`weather-tracker`**
2. Push this project to the `main` branch:

```bash
git add -A
git commit -m "Initial weather tracker with PWA support"
git remote add origin https://github.com/<your-username>/weather-tracker.git
git push -u origin main
```

3. In the repo go to **Settings → Pages → Build and deployment**
4. Set **Source** to **GitHub Actions**
5. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys on every push to `main`

Your site will be live at `https://<your-username>.github.io/weather-tracker/`.

## Install on your phone (PWA)

**iPhone (Safari):**
1. Open your live site URL
2. Tap the Share button
3. Tap **Add to Home Screen**

**Android (Chrome):**
1. Open your live site URL
2. Tap the menu (three dots)
3. Tap **Install app** or **Add to Home Screen**

The app opens full-screen with your weather dashboard and map.

## Data sources

- **NASA EONET** — Earth Observatory Natural Event Tracker ([API docs](https://eonet.gsfc.nasa.gov/docs/v3), [disclaimer](https://eonet.gsfc.nasa.gov/))
- **Open-Meteo** — Free weather API ([open-meteo.com](https://open-meteo.com/))
- **OpenStreetMap** — Map tiles via CARTO dark basemap

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Leaflet + react-leaflet
- vite-plugin-pwa (installable web app)
- GitHub Actions → GitHub Pages

## License

MIT
