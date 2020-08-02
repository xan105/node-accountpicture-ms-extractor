Extracts image files from an *.accountpicture-ms* file.<br/>

Promise will return an object containing a buffer for each file (highres and lowres).<br/>
You can then save the buffer to a file or convert it to base64.<br/>

.accountpicture-ms file
=======================
Located in `%appdata%/Microsoft/Windows/AccountPictures` (Windows 8, 8.1, 10).

There are 2 PNG or JPEG _(old format)_ image files embedded within this file:

- Lowres: resolution of 96*96 
- Highres: original file **upscaled** to 448*448 for PNG and squarred aspect-ratio with the original resolution of the file you used for your account picture for JPEG.  

This module tries to extract png files first then fallback to jpg. 

NB: 
  - For JPEG both files have a JPEG and JFIF header.
  - There can be more than one *.accountpicture-ms* file within the folder.

Installing
==========
`npm i accountpicture-ms-extractor`

Usage
=====
Promise returns an object
```js
{
  lowres : Buffer,
  highres : Buffer,
  type: String // "png" or "jpeg"
}
```
Extracts image files (highres and lowres) from specified *.accountpicture-ms* file.
```js
const accountms = require('accountpicture-ms-extractor');
accountms(filePath)
  .then((img) => {
     /*
     img = {lowres: Buffer, highres: Buffer, type: String};
     
     Do something with extracted files : img.lowres & img.highres
     
     */
  })
  .catch((err) => {
     console.error(err);
  });
```

Example
=======

```js
const fs = require('fs');
const accountms = require('accountpicture-ms-extractor');

accountms(file)
  .then((img) => {
      
    //write to file
    fs.writeFile(`lowres.${img.type}`,img.lowres,(err) => { console.error(err) });
    fs.writeFile(`highres.${img.type}`,img.highres,(err) => { console.error(err) });
        
    //as data64
    const html = `
     <img src="data:image/${img.type};charset=utf-8;base64,${extracted.lowres.toString('base64')}" alt="Lowres 96*96" />
     <img src="data:image/${img.type};charset=utf-8;base64,${extracted.highres.toString('base64')}" alt="Highres" />`;
        
    fs.writeFile("data64.html",html,'utf8',(err) => { console.error(err) });
        
  }).catch((err) => {
    console.error(err);
 });
```
