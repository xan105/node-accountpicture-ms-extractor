"use strict";

const fs = require("@xan105/fs");
const path = require("path");
const glob = require("fast-glob");
const accountms = require("../lib/index.cjs");

const dirPath = path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");

(async ()=>{

  const files = await glob("*.accountpicture-ms", {cwd:dirPath, nodir: true, absolute: true});

  for (let file of files) 
  {
      const filename = path.parse(file).name;
      console.log(`${filename}`);
      
      const img = await accountms(file);
      
      //as data64
      const html = `
        <img src="data:image/${img.type};charset=utf-8;base64,${img.highres.toString('base64')}" alt="Highres" />
        <img src="data:image/${img.type};charset=utf-8;base64,${img.lowres.toString('base64')}" alt="Lowres 96*96" />
      `;
      
      //write to file 
      await fs.writeFile(path.resolve(__dirname,`dump/${filename}/data64.html`),html,'utf8').catch(console.error);
      await fs.writeFile(path.resolve(__dirname,`dump/${filename}/highres.${img.type}`),img.highres,'utf8').catch(console.error);
      await fs.writeFile(path.resolve(__dirname,`dump/${filename}/lowres.${img.type}`),img.lowres,'utf8').catch(console.error);
  }
  
  console.log("done");

})().catch(console.error);