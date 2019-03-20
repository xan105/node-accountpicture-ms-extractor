'use strict';

const fs = require('fs');
const path = require('path');
const accountms = require(require.resolve('../index.js'));

const example_jpg = "./sample/a75b9283298d0b69.accountpicture-ms"; //old format
const example_png = "./sample/8d2cbe59176c6627.accountpicture-ms"; //new format

accountms(example_jpg).then((extracted) => {
  dump(extracted,"jpeg");
}).catch((err) => {
  console.error(err);
});

accountms(example_png).then((extracted) => {
  dump(extracted,"png");
}).catch((err) => {
  console.error(err);
});
           
function dump(extracted,ext) {

        const filename = (ext === "jpeg") ? path.parse(example_jpg).name : path.parse(example_png).name;

        console.log(`Extracted ${filename}`);

        //as data64
        
        let html = `
          <img src="data:image/${extracted.type};charset=utf-8;base64,${extracted.small.toString('base64')}" alt="Lowres 96*96" />
          <img src="data:image/${extracted.type};charset=utf-8;base64,${extracted.big.toString('base64')}" alt="Highres" />
        `;
        
        fs.writeFile(path.resolve(__dirname,`dump/${filename}-data64.html`),html,'utf8',(err) => {
          if (err) throw err;  
        });
        
        
        //write to file
        
        fs.writeFile(path.resolve(__dirname,`dump/${filename}-small.${extracted.type}`),extracted.small,(err) => {
          if (err) throw err;  
        });
        
        fs.writeFile(path.resolve(__dirname,`dump/${filename}-big.${extracted.type}`),extracted.big,(err) => {
          if (err) throw err;  
        });
}