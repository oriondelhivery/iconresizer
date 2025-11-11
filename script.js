// Icon Resizer — v12.4 (Final Upload Fix + Unmasked Folder + Safe Async)
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const dropText = document.getElementById("drop-text");

  // Trigger file input on click
  dropArea.addEventListener("click", () => fileInput.click());

  // Handle drag & drop
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

  // Handle file selection
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  // --- File Handling Function ---
  async function handleFile(file) {
    if (!file) return;
    dropText.textContent = `Uploaded: ${file.name}`;
    console.log("File selected:", file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        console.log("Image loaded successfully. Generating icons...");
        await generateIcons(img);
      };
      img.onerror = () => console.error("Error loading image. Make sure it's a valid file.");
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Image Resize Function ---
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

  // --- Generate ZIP with All Icons ---
  async function generateIcons(originalImage) {
    try {
      const zip = new JSZip();
      const allSizes = [16, 24, 32, 36, 57, 64, 96, 114, 128, 144, 192, 256, 512, 1024, 2048];

      const squareFolder = zip.folder("square");
      const circularFolder = zip.folder("circular");
      const iosFolder = zip.folder("iOS");
      const androidFolder = zip.folder("Android");

      // --- Square Icons ---
      for (const size of allSizes) {
        const resized = await resizeImage(originalImage, size, size);
        squareFolder.file(`icon-square-${size}x${size}.png`, resized.split(',')[1], { base64: true });
      }

      // --- Circular Icons ---
      for (const size of allSizes) {
        const resized = await resizeImage(originalImage, size, size);
        circularFolder.file(`icon-circular-${size}x${size}.png`, resized.split(',')[1], { base64: true });
      }

      // --- iOS Icons ---
      const iosSizes = [60, 120, 180, 76, 167, 1024];
      for (const size of iosSizes) {
        const resized = await resizeImage(originalImage, size, size);
        iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(',')[1], { base64: true });
      }

      // --- Android Icons ---
      const androidSizes = [48, 72, 96, 144, 192, 512];
      for (const size of androidSizes) {
        const resized = await resizeImage(originalImage, size, size);
        androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(',')[1], { base64: true });
      }

      // ✅ --- Unmasked Folder ---
      console.log("Generating Unmasked folder...");
      const unmaskedFolder = zip.folder("Unmasked");
      for (const size of allSizes) {
        const resized = await resizeImage(originalImage, size, size);
        unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(',')[1], { base64: true });
      }

      console.log("All folders generated. Creating ZIP...");
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "icons.zip");
      console.log("ZIP file ready and downloaded successfully.");

    } catch (error) {
      console.error("Error generating icons:", error);
    }
  }
});
