"use strict";

const fs = require("@xan105/fs");
const path = require("path");
const accountms = require("../lib/index.cjs");

const example = {
  jpg: path.resolve(__dirname, "sample/a75b9283298d0b69.accountpicture-ms"), //old format
  png: path.resolve(__dirname, "sample/8d2cbe59176c6627.accountpicture-ms") //new format
};

accountms(example.jpg).then((img) => {
  return dump(img,"jpeg");
}).catch((err) => {
  console.error(err);
});

accountms(example.png).then((img) => {
  return dump(img,"png");
}).catch((err) => {
  console.error(err);
});
           
async function dump(img,ext) {

  const filename = (ext === "jpeg") ? path.parse(example.jpg).name : path.parse(example.png).name;
  console.log(`${filename}`);
      
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