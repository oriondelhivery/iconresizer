// ===== ICON RESIZER SCRIPT (v13.2 with Custom Size Fix) =====

// === Custom Size Logic ===
const newSizeInput = document.getElementById("new-size");
const addSizeBtn = document.getElementById("add-size-btn");
let customSizes = [];

addSizeBtn.addEventListener("click", () => {
  const val = parseInt(newSizeInput.value);
  if (!isNaN(val) && val > 0 && !customSizes.includes(val)) {
    customSizes.push(val);
    alert(`Added custom size: ${val}x${val}`);
  }
});
// === End Custom Size Logic ===

// === Dropzone, Preview, and Core Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");
  const generateBtn = document.getElementById("generate-btn");
  const squarePreview = document.getElementById("square-preview");
  const circlePreview = document.getElementById("circle-preview");
  const themeSwitch = document.getElementById("theme-switch");
  const mainLogo = document.getElementById("main-logo");

  // Embedded mask (squircle)
  const IOS_MASK =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."; // replace with your existing base64 mask

  // Default dark theme
  function setTheme(isLight) {
    if (isLight) document.body.classList.add("light");
    else document.body.classList.remove("light");
  }
  setTheme(false);
  themeSwitch.addEventListener("change", (e) => setTheme(e.target.checked));

  let originalImage = null;

  dropArea.addEventListener("click", () => fileInput.click());
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });
  dropArea.addEventListener("dragleave", () => dropArea.classList.remove("dragover"));
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });
  fileInput.addEventListener("change", (e) =>
    handleFile(e.target.files && e.target.files[0])
  );

  function handleFile(file) {
    if (!file) return;
    dropText.textContent = `Uploaded: ${file.name}`;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        drawPreview(img);
      };
      img.onerror = () => {
        originalImage = null;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawPreview(img) {
    if (!squarePreview || !circlePreview) return;
    const sCtx = squarePreview.getContext("2d");
    sCtx.clearRect(0, 0, squarePreview.width, squarePreview.height);
    sCtx.drawImage(img, 0, 0, squarePreview.width, squarePreview.height);

    const cCtx = circlePreview.getContext("2d");
    cCtx.clearRect(0, 0, circlePreview.width, circlePreview.height);
    cCtx.save();
    cCtx.beginPath();
    cCtx.arc(
      circlePreview.width / 2,
      circlePreview.height / 2,
      circlePreview.width / 2,
      0,
      Math.PI * 2
    );
    cCtx.closePath();
    cCtx.clip();
    cCtx.drawImage(img, 0, 0, circlePreview.width, circlePreview.height);
    cCtx.restore();
  }

  async function decodeImage(img) {
    if (img.decode) return img.decode();
    return new Promise((res) => {
      img.onload = res;
    });
  }

  async function resizeImage(img, w, h) {
    await decodeImage(img);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/png");
  }

  async function applyMaskComposite(baseDataUrl, maskDataUrl, w, h) {
    const base = new Image();
    base.src = baseDataUrl;
    const mask = new Image();
    mask.src = maskDataUrl;
    await Promise.all([decodeImage(base), decodeImage(mask)]);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(base, 0, 0, w, h);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    return c.toDataURL("image/png");
  }

  // === ZIP GENERATION ===
  generateBtn.addEventListener("click", async () => {
    if (!originalImage) return;

    const zip = new JSZip();

    // Default sizes
    const allSizes = [
      16, 24, 32, 36, 57, 64, 96, 114, 128, 144, 192, 256, 512, 1024, 2048,
    ];

    // Merge user-added sizes
    const combinedSizes = [...new Set([...allSizes, ...customSizes])].sort(
      (a, b) => a - b
    );

    const squareFolder = zip.folder("square");
    const circularFolder = zip.folder("circular");
    const iosFolder = zip.folder("iOS");
    const androidFolder = zip.folder("Android");
    const unmaskedFolder = zip.folder("Unmasked");
    const resizedFolder = zip.folder("Resized");

    const maskDataUrl = IOS_MASK || null;

    for (const size of combinedSizes) {
      const resizedData = await resizeImage(originalImage, size, size);

      // Square + mask
      if (maskDataUrl) {
        const masked = await applyMaskComposite(resizedData, maskDataUrl, size, size);
        squareFolder.file(
          `icon-square-${size}x${size}.png`,
          masked.split(",")[1],
          { base64: true }
        );
      } else {
        squareFolder.file(
          `icon-square-${size}x${size}.png`,
          resizedData.split(",")[1],
          { base64: true }
        );
      }

      // Circular
      const circC = document.createElement("canvas");
      circC.width = size;
      circC.height = size;
      const cctx = circC.getContext("2d");
      cctx.beginPath();
      cctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      cctx.closePath();
      cctx.clip();
      const tmp = new Image();
      tmp.src = resizedData;
      await decodeImage(tmp);
      cctx.drawImage(tmp, 0, 0, size, size);
      circularFolder.file(
        `icon-circular-${size}x${size}.png`,
        circC.toDataURL("image/png").split(",")[1],
        { base64: true }
      );

      // Unmasked
      unmaskedFolder.file(
        `icon-unmasked-${size}x${size}.png`,
        resizedData.split(",")[1],
        { base64: true }
      );

      // Resized
      resizedFolder.file(
        `icon-resized-${size}x${size}.png`,
        resizedData.split(",")[1],
        { base64: true }
      );
    }

    // iOS-only set
    const iosSizes = [60, 120, 180, 76, 167, 1024];
    for (const size of iosSizes) {
      const resizedData = await resizeImage(originalImage, size, size);
      if (maskDataUrl) {
        const masked = await applyMaskComposite(resizedData, maskDataUrl, size, size);
        iosFolder.file(
          `icon-ios-${size}x${size}.png`,
          masked.split(",")[1],
          { base64: true }
        );
      } else {
        iosFolder.file(
          `icon-ios-${size}x${size}.png`,
          resizedData.split(",")[1],
          { base64: true }
        );
      }
    }

    // Android-only set
    const androidSizes = [48, 72, 96, 144, 192, 512];
    for (const size of androidSizes) {
      const resizedData = await resizeImage(originalImage, size, size);
      androidFolder.file(
        `icon-android-${size}x${size}.png`,
        resizedData.split(",")[1],
        { base64: true }
      );
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "icons.zip");
  });
});
