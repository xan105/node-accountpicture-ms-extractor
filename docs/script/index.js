import { DOMReady, select, selectAll } from "./vanilla-query/vq.min.js";
import { extract } from "./accountpicture-ms-extractor/index.min.js";

const { Buffer } = window.buffer;

DOMReady(()=>{

  const drop = select("#drop-zone");
  const filePick = select("#file-select");

  drop.addEventListener('dragleave', function(e){
    e.stopPropagation();
    e.preventDefault();
    this._removeClass("hover");
  }, false);

  drop.addEventListener('dragover', function(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    this._addClass("hover");
  }, false);

  drop.addEventListener('drop', function(e){ 
    this._removeClass("hover");
    return readFile(e);
  }, false);
  
  filePick.addEventListener('change', readFile, false);

});

function readFile(e){
  e.stopPropagation();
  e.preventDefault();

  const file = e.target.files?.[0] || e.dataTransfer.files[0];
  if (file.type){
    if (file.type !== "application/windows-accountpicture"){
      e.target.value = ''
      return;
    }
  } else {
    if (file.name.split('.').pop().toLowerCase() !== "accountpicture-ms"){
      e.target.value = ''
      return;
    }
  }
      
  const fileReader = new FileReader();
  fileReader.onloadend = ()=>{ e.target.value = ''};
  fileReader.onload = ()=>{ convert(file.name, fileReader.result) }
  fileReader.readAsArrayBuffer(file);
}

function convert(name, file){
  
  const buffer = Buffer.from(file);
  extract(buffer)
  .then((image)=>{
  
    const { lowres, highres } = image;
    const dialog = select("#dialog");
    const avatarLow = dialog._select(".avatar.low");
    const avatarHigh = dialog._select(".avatar.high");
    
    avatarLow._css("background",`url(${lowres.base64()})`);
    avatarHigh._css("background",`url(${highres.base64()})`); 
    dialog._show();
    
    const zip = new JSZip();
    zip.file(`lowres.${lowres.format}`, lowres.buffer);
    zip.file(`highres.${highres.format}`, highres.buffer);
    zip.generateAsync({type:"blob"})
    .then(function(blob) {
      
      const url = window.URL.createObjectURL(blob);
      const downloadBtn = select("#download");
      downloadBtn.href = url;
      downloadBtn.download = name.replace("accountpicture-ms","zip");
      downloadBtn._addClass("active");
      
      dialog._select(".backdrop").addEventListener("click", function(){ 
        window.URL.revokeObjectURL(url);
        dialog._hide();
        avatarLow._css("background",`url("")`);
        avatarHigh._css("background",`url("")`);
        downloadBtn.href = "#";
        downloadBtn.download = "";
        downloadBtn._removeClass("active");
      }, {once: true});
    
    }).catch(()=>{/*Do Nothing*/});
  }).catch(()=>{/*Do Nothing*/});
}