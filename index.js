'use strict';

const fs = require('fs');

module.exports = (filePath) => { 

  const marker = {
    jpeg : Buffer.from('FFD8','hex'),
    jfif : Buffer.from('FFE0','hex'),
    trailer: Buffer.from('FFD9','hex')
  };

  return new Promise((resolve, reject) => {
    fs.readFile(filePath,function(err,data){
      if (err) {
        return reject(err);
      } else {
      
        try {
          /*Data as a hex string.
            split string with jpeg and jfif marker */
          let header = Buffer.concat([marker.jpeg,marker.jfif]);
          let content = data.toString('hex').split(header.toString('hex'));

          //Look for the last occurence of the jpeg trailer mark in the string
          let trailerPos = {
            small: content[1].lastIndexOf(marker.trailer.toString('hex')),
            big: content[2].lastIndexOf(marker.trailer.toString('hex'))
          };
         
          // Generating valid jpeg file with marker
          let extracted = {
            small : Buffer.concat([header,Buffer.from(content[1].slice(0, trailerPos.small ),'hex'),marker.trailer]),
            big : Buffer.concat([header,Buffer.from(content[2].slice(0, trailerPos.big),'hex'),marker.trailer])
          }
          
          return resolve(extracted);
          
        }catch(err) {
          return reject(err);
        }
      }
    });
  });
}