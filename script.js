// Icon Resizer — v12.4 (Manual Generate + Silent + Unmasked)
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");
  const generateBtn = document.getElementById("generate-btn");
  const squarePreview = document.getElementById("square-preview");
  const circlePreview = document.getElementById("circle-preview");

  let uploadedImage = null;

  // --- Upload Handling ---
  dropArea.addEventListener("click", () => fileInput.click());
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

  function handleFile(file) {
    if (!file) return;
    dropText.textContent = `Uploaded: ${file.name}`;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        drawPreview(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Previews ---
  function drawPreview(img) {
    const squareCtx = squarePreview.getContext("2d");
    squareCtx.clearRect(0, 0, squarePreview.width, squarePreview.height);
    squareCtx.drawImage(img, 0, 0, squarePreview.width, squarePreview.height);

    const circleCtx = circlePreview.getContext("2d");
    circleCtx.clearRect(0, 0, circlePreview.width, circlePreview.height);
    circleCtx.save();
    circleCtx.beginPath();
    circleCtx.arc(circlePreview.width / 2, circlePreview.height / 2, circlePreview.width / 2, 0, Math.PI * 2);
    circleCtx.closePath();
    circleCtx.clip();
    circleCtx.drawImage(img, 0, 0, circlePreview.width, circlePreview.height);
    circleCtx.restore();
  }

  // --- Resize Helper ---
  async function resizeImage(img, width, height) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    });
  }

  // --- Generate ZIP ---
  generateBtn.addEventListener("click", async () => {
    if (!uploadedImage) return;

    const zip = new JSZip();
    const allSizes = [16, 24, 32, 36, 57, 64, 96, 114, 128, 144, 192, 256, 512, 1024, 2048];

    const squareFolder = zip.folder("square");
    const circularFolder = zip.folder("circular");
    const iosFolder = zip.folder("iOS");
    const androidFolder = zip.folder("Android");
    const unmaskedFolder = zip.folder("Unmasked");

    for (const size of allSizes) {
      const resized = await resizeImage(uploadedImage, size, size);
      squareFolder.file(`icon-square-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    for (const size of allSizes) {
      const resized = await resizeImage(uploadedImage, size, size);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const tempImg = new Image();
      tempImg.onload = () => ctx.drawImage(tempImg, 0, 0, size, size);
      tempImg.src = resized;
      const circular = canvas.toDataURL("image/png");
      circularFolder.file(`icon-circular-${size}x${size}.png`, circular.split(",")[1], { base64: true });
    }

    const iosSizes = [60, 120, 180, 76, 167, 1024];
    for (const size of iosSizes) {
      const resized = await resizeImage(uploadedImage, size, size);
      iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    const androidSizes = [48, 72, 96, 144, 192, 512];
    for (const size of androidSizes) {
      const resized = await resizeImage(uploadedImage, size, size);
      androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    for (const size of allSizes) {
      const resized = await resizeImage(uploadedImage, size, size);
      unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(",")[1], { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "icons.zip");
  });
});
