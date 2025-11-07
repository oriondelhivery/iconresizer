# 🧩 Icon Resizer — One-Click App Icon Generator

A lightweight, browser-based web app to instantly generate **app icons** for iOS, Android, and universal platforms.  
Created with a focus on simplicity, accuracy, and speed.

![App Logo](app-icon-resizer-logo.png)

---

## ✨ Features

- ⚙️ **One-click solution** — drag & drop or click to upload your image  
- 🖼️ **Automatic masking** for:
  - Square icons
  - Circular icons
  - iOS squircle (rounded) icons
- 📱 **Platform-specific outputs**:
  - iOS icon sizes — 60×60, 120×120, 180×180, 76×76, 167×167, 1024×1024  
  - Android densities — mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi, Play Store  
- 🎨 **Beautiful dark UI** with Inter font and custom branding  
- 🧩 **All-in-one ZIP output** — ready to use in your projects  
- 💻 Works 100% in the browser (no backend, no uploads)

---

## 🖥️ Preview

Here’s a screenshot of the **live web app interface** 👇

![App Screenshot](screenshot.png)

> *A clean, dark-themed interface with your logo, drag-and-drop upload area, platform selection, and live icon previews.*

---

## 🚀 How to Use

1. **Open the app** in your browser (deployed via GitHub Pages or locally).  
2. **Drag & Drop** or **Click** anywhere in the upload box to upload your PNG/JPG image.  
3. The app automatically generates:
   - 🟥 Square icons  
   - ⚪ Circular icons  
   - 🍏 iOS icons  
   - 🤖 Android icons  
4. Choose your platform:
   - **All** — iOS, Android, and universal icons  
   - **iOS only** — iOS squircle icons in official Apple sizes  
   - **Android only** — square and circular adaptive icons  
5. Click **Generate Zip** to download all icons instantly.

---

## 🧱 Output Structure

```
📦 icons-platforms.zip
 ┣ 📂 square/
 ┣ 📂 circular/
 ┣ 📂 iOS/
 ┗ 📂 Android/
```

Each folder contains PNG icons in predefined resolutions and naming formats.

---

## ⚙️ Technical Details

- **Frontend:** HTML, CSS, Vanilla JavaScript  
- **Libraries:** [JSZip](https://stuk.github.io/jszip/) for ZIP generation  
- **Masks:** Base64-embedded square, circular, and iOS squircle PNG masks  
- **Hosting:** GitHub Pages-ready (no CORS issues)

---

## 🧑‍💻 Developer Notes

- All image processing happens **locally** in the browser.  
- Supports **transparent PNGs**, **non-transparent PNGs**, **JPEGs**, and more.  
- Works offline after first load.  
- No external dependencies beyond JSZip.

---

## 👤 Credits

**Made by [Orion Jose](https://www.orioncjose.com)**  
Design & development © 2025 — All rights reserved.

---

## 🪄 Deployment (GitHub Pages)

1. Upload these 4 files to your repository root:
   ```
   index.html
   style.css
   script.js
   app-icon-resizer-logo.png
   ```
2. Go to **Settings → Pages**  
   - Source: `Deploy from a branch`  
   - Branch: `main` → `/ (root)`  
3. Wait 30–60 seconds for GitHub to build your page.  
4. Open:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```
5. Done ✅

---

## 📄 License

This project is released for **personal and commercial use** under the MIT License.  
Attribution is appreciated but not required.
