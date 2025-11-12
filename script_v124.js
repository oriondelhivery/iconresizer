// script_v124.js -- final working version with Unmasked folder
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");
  const generateBtn = document.getElementById("generate-btn");
  const squarePreview = document.getElementById("square-preview");
  const circlePreview = document.getElementById("circle-preview");

  let originalImage = null;

  // Upload handling
  dropArea.addEventListener("click", () => fileInput.click());
  dropArea.addEventListener("dragover", (e) => { e.preventDefault(); dropArea.classList.add("dragover"); });
  dropArea.addEventListener("dragleave", () => dropArea.classList.remove("dragover"));
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });
  fileInput.addEventListener("change", (e) => handleFile(e.target.files && e.target.files[0]));

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
      img.onerror = () => { originalImage = null; };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Previews
  function drawPreview(img) {
    const sCtx = squarePreview.getContext("2d");
    sCtx.clearRect(0, 0, squarePreview.width, squarePreview.height);
    sCtx.drawImage(img, 0, 0, squarePreview.width, squarePreview.height);

    const cCtx = circlePreview.getContext("2d");
    cCtx.clearRect(0, 0, circlePreview.width, circlePreview.height);
    cCtx.save();
    cCtx.beginPath();
    cCtx.arc(circlePreview.width / 2, circlePreview.height / 2, circlePreview.width / 2, 0, Math.PI * 2);
    cCtx.closePath();
    cCtx.clip();
    cCtx.drawImage(img, 0, 0, circlePreview.width, circlePreview.height);
    cCtx.restore();
  }

  async function resizeImage(img, w, h) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    });
  }

  // Manual generate ZIP
  generateBtn.addEventListener("click", async () => {
    if (!originalImage) return;

    const zip = new JSZip();
    const allSizes = [16,24,32,36,57,64,96,114,128,144,192,256,512,1024,2048];

    const squareFolder = zip.folder("square");
    const circularFolder = zip.folder("circular");
    const iosFolder = zip.folder("iOS");
    const androidFolder = zip.folder("Android");
    const unmaskedFolder = zip.folder("Unmasked");

    // Square
    for (const size of allSizes) {
      const resized = await resizeImage(originalImage, size, size);
      squareFolder.file(`icon-square-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    // Circular
    for (const size of allSizes) {
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = size;
      tmpCanvas.height = size;
      const tmpCtx = tmpCanvas.getContext("2d");
      tmpCtx.beginPath();
      tmpCtx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      tmpCtx.closePath();
      tmpCtx.clip();
      tmpCtx.drawImage(originalImage, 0, 0, size, size);
      const circ = tmpCanvas.toDataURL("image/png");
      circularFolder.file(`icon-circular-${size}x${size}.png`, circ.split(",")[1], { base64: true });
    }

    // iOS
    const iosSizes = [60,120,180,76,167,1024];
    for (const size of iosSizes) {
      const resized = await resizeImage(originalImage, size, size);
      iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    // Android
    const androidSizes = [48,72,96,144,192,512];
    for (const size of androidSizes) {
      const resized = await resizeImage(originalImage, size, size);
      androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    // Unmasked
    for (const size of allSizes) {
      const resized = await resizeImage(originalImage, size, size);
      unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "icons.zip");
  });
});
