/*
MIT License

Copyright (c) 2019-2020 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const fs = require('fs');
const path = require('path');

const marker = {
    jpeg : {
      header : Buffer.from('FFD8','hex'),
      jfif : Buffer.from('FFE0','hex'),
      trailer: Buffer.from('FFD9','hex')
    },
    png : {
      header: Buffer.from('89504E470D0A1A0A','hex'),
      trailer: Buffer.from('49454E44','hex'),
      trailerOffset: 8 //four byte CRC
    }
};

module.exports = (filePath) => { 
  return new Promise((resolve, reject) => {
  
    try { 
      if (path.parse(filePath).ext !== ".accountpicture-ms") {
        return reject("Not an .accountpicture-ms file !");
      }
    }catch(err) {
      return reject(err);
    }
  
    fs.readFile(filePath,function(err,data){
      if (err) {
        return reject(err);
      } else {
        try
          {
              let result;
              try {
                result = extract(data,marker.png.header,marker.png.trailer,marker.png.trailerOffset); //New format : PNG embedded in .accountpicture-ms
                result.type = "png";
              }catch(err){ //If failed; Fallback to old format
                result = extract(data,Buffer.concat([marker.jpeg.header,marker.jpeg.jfif]),marker.jpeg.trailer); //Old format : JPEG embedded in .accountpicture-ms
                result.type = "jpeg";
              }
              
              if(result) {
                return resolve(result);
              } else {
                return reject("Unexpected empty extraction");
              }

        }catch(err){
          return reject(err);
        }
      } 
    });
    
  });
}

function extract(data, header, trailer, offset = 0) {
  
  const content = data.toString('hex').split(header.toString('hex'));
  if (content.length !== 3) throw "Unexpected file content !";

  //Look for the last occurence of the trailer mark in the string
  const eoi = trailer.toString('hex');
  let eoiPos = {
    lowres: content[1].lastIndexOf(eoi),
    highres: content[2].lastIndexOf(eoi) 
  };
  if (eoiPos.lowres === -1 || eoiPos.highres === -1) throw "Unexpected file content !";
  eoiPos.lowres += eoi.length + offset,
  eoiPos.highres += eoi.length + offset 
          
  //Generating valid img with header and marker     
  const img = {
    lowres : Buffer.concat([header,Buffer.from(content[1].slice(0, eoiPos.lowres),'hex')]),
    highres : Buffer.concat([header,Buffer.from(content[2].slice(0, eoiPos.highres),'hex')])
  }
    
  return img;

}