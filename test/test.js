'use strict';

const fs = require('fs');
const path = require('path');
const glob = require("glob");
const accountms = require(require.resolve('../index.js'));

const dirPath = path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");

glob("*.accountpicture-ms", {cwd:dirPath, nodir: true, absolute: true}, function (err, files) {
  if (err) throw err;

  for (let file of files) {
  
    accountms(file)
      .then((extracted) => {

        const filename = path.parse(file).name;

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
      
      
      })
      .catch((err) => {
          console.error(err);
      });

  }
});