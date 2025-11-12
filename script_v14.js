
// script_v14.js - full-featured stable version
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");
  const generateBtn = document.getElementById("generate-btn");
  const squarePreview = document.getElementById("square-preview");
  const circlePreview = document.getElementById("circle-preview");
  const themeSwitch = document.getElementById("theme-switch");
  const mainLogo = document.getElementById("main-logo");
  const newSizeInput = document.getElementById("new-size");
  const addSizeBtn = document.getElementById("add-size-btn");
  const customSizesList = document.getElementById("custom-sizes-list");

  // Embedded asset data variables (populated in HTML)
  const DARK_LOGO = window.DARK_LOGO_DATA || "";
  const LIGHT_LOGO = window.LIGHT_LOGO_DATA || "";
  const IOS_MASK = window.IOS_MASK_DATA || "";

  // default: dark mode
  function applyTheme(isLight) {
    if (isLight) document.body.classList.add("light");
    else document.body.classList.remove("light");
    if (mainLogo) mainLogo.src = isLight && LIGHT_LOGO ? LIGHT_LOGO : DARK_LOGO;
  }
  applyTheme(false);
  if (themeSwitch) themeSwitch.addEventListener("change", e => applyTheme(e.target.checked));

  // custom sizes (session)
  let customSizes = [];
  function renderCustomSizes() {
    if (!customSizes.length) { customSizesList.textContent = ""; return; }
    customSizesList.textContent = "Custom sizes: " + customSizes.join(", ");
  }
  addSizeBtn.addEventListener("click", () => {
    const v = parseInt(newSizeInput.value);
    if (!v || v <= 0) { alert("Enter a valid size"); return; }
    if (!customSizes.includes(v)) customSizes.push(v);
    renderCustomSizes();
    newSizeInput.value = "";
  });

  // Upload handling (click + drag-drop)
  dropArea.addEventListener("click", () => fileInput.click());
  dropArea.addEventListener("dragover", e => { e.preventDefault(); dropArea.classList.add("dragover"); });
  dropArea.addEventListener("dragleave", () => dropArea.classList.remove("dragover"));
  dropArea.addEventListener("drop", e => {
    e.preventDefault(); dropArea.classList.remove("dragover");
    const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handleFile(f);
  });
  fileInput.addEventListener("change", e => { const f = e.target.files && e.target.files[0]; if (f) handleFile(f); });

  // show filename and preview
  let originalImage = null;
  function handleFile(file) {
    if (!file) return;
    dropText.textContent = `Uploaded: ${file.name}`;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => { originalImage = img; drawPreviews(img); };
      img.onerror = () => { originalImage = null; alert("Could not load image"); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawPreviews(img) {
    // square preview
    const sw = squarePreview.width, sh = squarePreview.height;
    const sctx = squarePreview.getContext("2d"); sctx.clearRect(0,0,sw,sh); sctx.drawImage(img,0,0,sw,sh);
    // circular preview
    const cw = circlePreview.width, ch = circlePreview.height;
    const cctx = circlePreview.getContext("2d"); cctx.clearRect(0,0,cw,ch);
    cctx.save(); cctx.beginPath(); cctx.arc(cw/2,ch/2,cw/2,0,Math.PI*2); cctx.closePath(); cctx.clip();
    cctx.drawImage(img,0,0,cw,ch); cctx.restore();
  }

  // helper decode
  async function decodeImage(img) { if (img.decode) return img.decode(); return new Promise(res => { img.onload = res; }); }

  async function resizeToDataUrl(img, w, h) {
    await decodeImage(img);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d"); ctx.clearRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
    return c.toDataURL("image/png");
  }

  async function applyMask(destDataUrl, maskDataUrl, w, h) {
    const base = new Image(); base.src = destDataUrl;
    const mask = new Image(); mask.src = maskDataUrl;
    await Promise.all([decodeImage(base), decodeImage(mask)]);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d"); ctx.clearRect(0,0,w,h);
    ctx.drawImage(base,0,0,w,h);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask,0,0,w,h);
    ctx.globalCompositeOperation = "source-over";
    return c.toDataURL("image/png");
  }

  // Generate ZIP
  generateBtn.addEventListener("click", async () => {
    if (!originalImage) { alert("Please upload an image first"); return; }
    const zip = new JSZip();
    const defaultSizes = [16,24,32,36,57,64,96,114,128,144,192,256,512,1024,2048];
    const combined = [...new Set([...defaultSizes, ...customSizes])].sort((a,b)=>a-b);

    // Create folders
    const squareFolder = zip.folder("square");
    const circularFolder = zip.folder("circular");
    const iosFolder = zip.folder("iOS");
    const androidFolder = zip.folder("Android");
    const unmaskedFolder = zip.folder("Unmasked");
    const resizedFolder = zip.folder("Resized");

    // Prepare mask data url (if available)
    const maskDataUrl = IOS_MASK || null;

    // generate per combined sizes
    for (const size of combined) {
      const resized = await resizeToDataUrl(originalImage, size, size);
      // square: apply mask if available
      if (maskDataUrl) {
        const masked = await applyMask(resized, maskDataUrl, size, size);
        squareFolder.file(`icon-square-${size}x${size}.png`, masked.split(",")[1], {base64:true});
      } else {
        squareFolder.file(`icon-square-${size}x${size}.png`, resized.split(",")[1], {base64:true});
      }
      // circular
      const circCanvas = document.createElement("canvas"); circCanvas.width = size; circCanvas.height = size;
      const cctx = circCanvas.getContext("2d"); cctx.beginPath(); cctx.arc(size/2,size/2,size/2,0,Math.PI*2); cctx.closePath(); cctx.clip();
      const timg = new Image(); timg.src = resized; await decodeImage(timg); cctx.drawImage(timg,0,0,size,size);
      circularFolder.file(`icon-circular-${size}x${size}.png`, circCanvas.toDataURL("image/png").split(",")[1], {base64:true});
      // unmasked and resized
      unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(",")[1], {base64:true});
      resizedFolder.file(`icon-resized-${size}x${size}.png`, resized.split(",")[1], {base64:true});
    }

    // iOS fixed set (masked)
    const iosSet = [60,120,180,76,167,1024];
    for (const size of iosSet) {
      const resized = await resizeToDataUrl(originalImage, size, size);
      if (maskDataUrl) {
        const masked = await applyMask(resized, maskDataUrl, size, size);
        iosFolder.file(`icon-ios-${size}x${size}.png`, masked.split(",")[1], {base64:true});
      } else {
        iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(",")[1], {base64:true});
      }
    }

    // Android set (no mask)
    const androidSet = [48,72,96,144,192,512];
    for (const size of androidSet) {
      const resized = await resizeToDataUrl(originalImage, size, size);
      androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(",")[1], {base64:true});
    }

    const blob = await zip.generateAsync({type:"blob"});
    saveAs(blob, "icons.zip");
  });

}); // DOMContentLoaded end
