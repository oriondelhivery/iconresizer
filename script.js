const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
let file = null;
let sizes = [16,24,32,36,57,64,96,114,128,144,192,256,512,1024,2048];

dropArea.onclick = () => fileElem.click();
fileElem.onchange = e => file = e.target.files[0];

dropArea.ondragover = e => { e.preventDefault(); dropArea.style.borderColor="#888"; }
dropArea.ondragleave = e => { dropArea.style.borderColor="#555"; }
dropArea.ondrop = e => {
    e.preventDefault();
    dropArea.style.borderColor="#555";
    file = e.dataTransfer.files[0];
};

document.getElementById("addSizeBtn").onclick = () => {
    const v = parseInt(document.getElementById("customSizeInput").value);
    if(v>0) sizes.push(v);
};

document.getElementById("generateBtn").onclick = async () => {
    if(!file){ alert("Upload an image first."); return; }

    const dataURL = await fileToDataURL(file);
    const img = await loadImage(dataURL);

    const squareMask = await loadImage("masks/square-mask.png");
    const circleMask = await loadImage("masks/circle-mask.png");

    const zip = new JSZip();
    const sqFolder = zip.folder("square");
    const cirFolder = zip.folder("circular");

    for(const s of sizes){
        const sq = maskResize(img, squareMask, s);
        sqFolder.file(`Icon-square-${s}.png`, sq.split(",")[1], {base64:true});

        const ci = maskResize(img, circleMask, s);
        cirFolder.file(`Icon-circular-${s}.png`, ci.split(",")[1], {base64:true});
    }

    const blob = await zip.generateAsync({type:"blob"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "icons.zip";
    a.click();
};

function fileToDataURL(file){
    return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file);});
}
function loadImage(src){
    return new Promise(res=>{ const i=new Image(); i.onload=()=>res(i); i.src=src;});
}
function maskResize(img, mask, size){
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d");
    ctx.drawImage(img,0,0,size,size);
    ctx.globalCompositeOperation="destination-in";
    ctx.drawImage(mask,0,0,size,size);
    return c.toDataURL("image/png");
}
