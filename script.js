// Icon Resizer Script — v12.4 with Unmasked Folder Support

async function resizeImage(img, width, height) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL("image/png"));
  });
}

async function generateIcons(originalImage, allSizes, zip) {
  const squareFolder = zip.folder("square");
  const circularFolder = zip.folder("circular");
  const iosFolder = zip.folder("iOS");
  const androidFolder = zip.folder("Android");

  // --- Existing generation logic ---
  for (const size of allSizes) {
    const resized = await resizeImage(originalImage, size, size);
    squareFolder.file(`icon-square-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  for (const size of allSizes) {
    const resized = await resizeImage(originalImage, size, size);
    circularFolder.file(`icon-circular-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // iOS icons
  const iosSizes = [60, 120, 180, 76, 167, 1024];
  for (const size of iosSizes) {
    const resized = await resizeImage(originalImage, size, size);
    iosFolder.file(`icon-ios-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // Android icons
  const androidSizes = [48, 72, 96, 144, 192, 512];
  for (const size of androidSizes) {
    const resized = await resizeImage(originalImage, size, size);
    androidFolder.file(`icon-android-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  // ✅ New Unmasked Folder Logic — added safely before zip generation
  const unmaskedFolder = zip.folder("Unmasked");
  for (const size of allSizes) {
    const resized = await resizeImage(originalImage, size, size);
    unmaskedFolder.file(`icon-unmasked-${size}x${size}.png`, resized.split(',')[1], { base64: true });
  }

  return zip;
}

// Example main handler (you already have this part wired to the UI)
async function handleGenerate(originalImage) {
  const zip = new JSZip();
  const allSizes = [16, 24, 32, 36, 57, 64, 96, 114, 128, 144, 192, 256, 512, 1024, 2048];
  await generateIcons(originalImage, allSizes, zip);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "icons.zip");
}
