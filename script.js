// script.js - Upload-fix + Unmasked support (v12.4 patch)
/*
Requirements: JSZip and FileSaver (saveAs) must be included in the page already.
This script expects the following HTML elements to exist (as in your project):
 - #drop-area (div)
 - #drop-text (p) - text shown inside drop area
 - #file-input (input type="file", hidden)
 - #theme-switch (checkbox) optional
 - #main-logo (img) optional
 - preview elements may exist but are not required
*/

// Utility: resize an image element to a square canvas and return dataURL (png)
function resizeImage(img, width, height) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, width, height);

    // Calculate scaling to preserve aspect ratio and center the image
    const sw = img.width;
    const sh = img.height;
    const targetRatio = width / height;
    const srcRatio = sw / sh;
    let dw = width, dh = height, dx = 0, dy = 0;

    if (srcRatio > targetRatio) {
      // source is wider, fit by height
      dh = height;
      dw = Math.round(sh * targetRatio);
      // But we maintain full height and scale width accordingly
      const scale = height / sh;
      dw = Math.round(sw * scale);
      dh = height;
      dx = Math.round((width - dw) / 2);
      dy = 0;
    } else {
      // source is taller, fit by width
      dw = width;
      dh = Math.round(sh * (width / sw));
      dx = 0;
      dy = Math.round((height - dh) / 2);
    }

    ctx.drawImage(img, dx, dy, dw, dh);
    resolve(canvas.toDataURL('image/png'));
  });
}

// Generate all folders and files inside the provided JSZip instance
async function generateIcons(originalImage, allSizes, zip) {
  // Create folders
  const squareFolder = zip.folder('square');
  const circularFolder = zip.folder('circular');
  const iosFolder = zip.folder('iOS');
  const androidFolder = zip.folder('Android');

  // Square icons (same as unmasked but masked variant is handled elsewhere in your project)
  for (const size of allSizes) {
    const resized = await resizeImage(originalImage, size, size);
    squareFolder.file(`Icon-square-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // Circular icons - here we simply produce circular-shaped images by drawing onto a circular clipping path
  for (const size of allSizes) {
    // create a temporary canvas to apply circular mask
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // draw image resized to fill square (centered)
    const tempImg = await resizeImage(originalImage, size, size);
    const imgEl = document.createElement('img');
    await new Promise((res) => { imgEl.onload = res; imgEl.src = tempImg; });

    // circular clipping
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(imgEl, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/png');
    circularFolder.file(`icon-circular-${size}x${size}.png`, dataUrl.split(',')[1], { base64: true });
  }

  // iOS App Icon Set (standard sizes)
  const iosSizes = [60, 120, 180, 76, 167, 1024];
  for (const size of iosSizes) {
    const resized = await resizeImage(originalImage, size, size);
    iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // Android densities
  const androidSizes = [48, 72, 96, 144, 192, 512];
  for (const size of androidSizes) {
    const resized = await resizeImage(originalImage, size, size);
    androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // Unmasked folder: exactly the same allSizes list but no masking or clipping
  const unmaskedFolder = zip.folder('Unmasked');
  for (const size of allSizes) {
    const resized = await resizeImage(originalImage, size, size);
    unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  return zip;
}

// Helper to read file into an Image element
function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Main handler invoked when a user selects/drops a file
async function handleFile(file) {
  if (!file) return;
  try {
    // Update UI with filename
    const dropText = document.getElementById('drop-text');
    if (dropText) {
      dropText.textContent = `Uploaded: ${file.name}`;
    }

    // Create image element
    const img = await fileToImage(file);

    // sizes list - same as existing builds
    const allSizes = [16,24,32,36,57,64,96,114,128,144,192,256,512,1024,2048];

    // Create zip and generate icons
    const zip = new JSZip();
    await generateIcons(img, allSizes, zip);

    // Smart zip filename based on uploaded file base name
    const baseName = (file.name || 'icons').toString().split('.').slice(0, -1).join('.') || 'icons';
    const zipName = `${baseName}-icons.zip`;

    // Generate blob and trigger download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipName);
  } catch (err) {
    console.error('Error processing file:', err);
    alert('There was an error processing the image. Check console for details.');
  }
}

// Setup drag & drop and click-to-upload wiring
function setupUploadHandlers() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const dropText = document.getElementById('drop-text');

  if (!dropArea || !fileInput) {
    console.warn('Upload elements not found: #drop-area or #file-input');
    return;
  }

  // Click on drop area triggers file input
  dropArea.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  });

  // Prevent defaults for drag events
  ['dragenter','dragover','dragleave','drop'].forEach((evt) => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  dropArea.addEventListener('dragover', () => {
    dropArea.classList.add('drag-over');
  });
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-over');
  });

  // Drop event: get file and handle
  dropArea.addEventListener('drop', (e) => {
    dropArea.classList.remove('drag-over');
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      const f = dt.files[0];
      handleFile(f);
    }
  });
}

// Theme & logo handling (preserve existing behavior if elements exist)
function setupThemeAndLogo() {
  const themeSwitch = document.getElementById('theme-switch');
  const logoImg = document.getElementById('main-logo');

  if (!themeSwitch) return;

  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('theme', 'dark');
  }

  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeSwitch.checked = true;
    if (logoImg) logoImg.src = 'resizer-logo-black-v3.png';
  } else {
    document.body.classList.remove('light');
    themeSwitch.checked = false;
    if (logoImg) logoImg.src = 'app-icon-resizer-logo-v3.png';
  }

  themeSwitch.addEventListener('change', () => {
    const isLight = themeSwitch.checked;
    document.body.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    if (logoImg) logoImg.src = isLight ? 'resizer-logo-black-v3.png' : 'app-icon-resizer-logo-v3.png';
  });
}

// Initialize everything on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupUploadHandlers();
  setupThemeAndLogo();
});
