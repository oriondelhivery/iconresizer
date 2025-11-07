
const fileInput = document.getElementById("file-input");
const dropArea = document.getElementById("drop-area");
const dropText = document.getElementById("drop-text");
const generateBtn = document.getElementById("generate-btn");
const addSizeBtn = document.getElementById("add-size-btn");
const newSizeInput = document.getElementById("new-size");

let uploadedImage = null;
let sizes = [
  16, 24, 32, 36, 57, 64, 96, 114,
  128, 144, 192, 256, 512, 1024, 2048
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

dropArea.addEventListener("click", () => fileInput.click());

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.background = "#222";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.background = "#1A1A1A";
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.style.background = "#1A1A1A";
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file) return;
  dropText.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage = new Image();
    uploadedImage.crossOrigin = "anonymous";
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

addSizeBtn.addEventListener("click", () => {
  const val = parseInt(newSizeInput.value);
  if (!isNaN(val) && val > 0 && !sizes.includes(val)) {
    sizes.push(val);
    alert("Size added: " + val);
  }
  newSizeInput.value = "";
});

generateBtn.addEventListener("click", async () => {
  if (!uploadedImage) {
    alert("Please upload an image first.");
    return;
  }

  try {
    const [squareMaskImg, circularMaskImg] = await Promise.all([
      loadImage("square-mask.png"),
      loadImage("circular-mask.png")
    ]);

    console.log("Masks loaded, processing...");

    const zip = new JSZip();
    const squareFolder = zip.folder("square");
    const circleFolder = zip.folder("circular");

    for (const s of sizes) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = s;
      canvas.height = s;

      // Square mask
      ctx.clearRect(0, 0, s, s);
      ctx.drawImage(uploadedImage, 0, 0, s, s);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(squareMaskImg, 0, 0, s, s);
      const squareData = canvas.toDataURL("image/png").split(",")[1];
      squareFolder.file(`Icon-square-${s}x${s}.png`, squareData, { base64: true });

      // Circle mask
      ctx.clearRect(0, 0, s, s);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(uploadedImage, 0, 0, s, s);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(circularMaskImg, 0, 0, s, s);
      const circularData = canvas.toDataURL("image/png").split(",")[1];
      circleFolder.file(`Icon-circular-${s}x${s}.png`, circularData, { base64: true });

      ctx.globalCompositeOperation = "source-over";
    }

    console.log("All sizes done. Creating ZIP...");

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "icons.zip";
    link.click();

    console.log("ZIP ready for download.");
  } catch (err) {
    console.error("Error generating icons:", err);
    alert("An error occurred. Check the console for details.");
  }
});
