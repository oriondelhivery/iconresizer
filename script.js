
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const dropText = document.getElementById('drop-text');
const generateBtn = document.getElementById('generate-btn');

let uploadedFile = null;
let sizes = [16,24,32,36,57,64,96,114,128,144,192,256,512,1024,2048];

document.getElementById('add-size-btn').onclick = () => {
    const val = parseInt(document.getElementById('custom-size-input').value);
    if (!isNaN(val) && !sizes.includes(val)) sizes.push(val);
};

dropArea.onclick = () => fileInput.click();
fileInput.onchange = e => handleFile(e.target.files[0]);

dropArea.addEventListener("dragover", e => { e.preventDefault(); });
dropArea.addEventListener("drop", e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
});

function handleFile(file){
    uploadedFile = file;
    dropText.textContent = file.name;
}

async function loadImage(file){
    return new Promise(res=>{
        const img = new Image();
        img.onload = ()=>res(img);
        img.src = URL.createObjectURL(file);
    });
}

async function loadMask(url){
    return new Promise(res=>{
        const img = new Image();
        img.onload = ()=>res(img);
        img.src = url;
    });
}

async function maskAndResize(img, mask, size){
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    ctx.drawImage(img, 0,0,size,size);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0,0,size,size);

    return new Promise(res => c.toBlob(res));
}

generateBtn.onclick = async () => {
    if(!uploadedFile) return alert("Upload an image first!");

    const img = await loadImage(uploadedFile);
    const squareMask = await loadMask("square-mask.png");
    const circleMask = await loadMask("circle-mask.png");

    const zip = new JSZip();

    for (let s of sizes){
        const sq = await maskAndResize(img, squareMask, s);
        const cir = await maskAndResize(img, circleMask, s);

        zip.file(`Icon-square-${s}x${s}.png`, sq);
        zip.file(`Icon-circular-${s}x${s}.png`, cir);
    }

    const blob = await zip.generateAsync({type:"blob"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "icons.zip";
    a.click();
};
