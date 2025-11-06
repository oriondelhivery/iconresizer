# App Icon Resizer — Upgraded

This is a static client-side web app that generates square and circular transparent PNG icons
from any uploaded PNG or JPG. It creates multiple predefined resolutions and zips them for download.

## How to use
1. Upload (drag & drop or click) a PNG or JPG file (logo).
2. Click **Generate ZIP**.
3. A zip file will download containing two folders:
   - `square/` with `Icon-square-WxH.png`
   - `circular/` with `Icon-circular-WxH.png`

## Deploy to GitHub Pages
1. Create a new repository.
2. Upload `index.html` and `logo.png` (optional).
3. Go to **Settings → Pages** and enable Pages from `main` branch (root).
4. Visit the published URL.

## Notes
- All processing happens in the browser (no uploads to server).
- Supports PNG (transparent or not) and JPG/JPEG.
