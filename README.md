Extracts image files from an *.accountpicture-ms* file.<br/>

Promise will return an object containing a buffer for each file.<br/>
You can then save the buffer to a file or convert it to base64."<br/>

.accountpicture-ms file
-----------------------
Located in `%appdata%/Microsoft/Windows/AccountPictures` (Windows 8, 8.1, 10).

There are 2 JPEG files embedded within this file:

- a 'small' one with a resolution of 96*96 
- and a 'big' one with a squarred aspect-ratio of the original resolution of the file you used for your account picture.  

Both files have a JPEG and JFIF header.

NB: There can be more than one *.accountpicture-ms* file within the folder.

Installing
---------
NPM: <br/>
`$ npm i accountpicture-ms-extractor`

Usage
-----
Extracts image files (small and big) from specified *.accountpicture-ms* file.<br/>
Promise returns an object
{
  small : Buffer,
  big : Buffer
}

```js
const accountms = require('accountpicture-ms-extractor');
accountms(filePath)
  .then((extracted) => {
     /*
     extracted = {small: Buffer, big: Buffer};
     
     Do something with extracted files : extracted.small & extracted.big
     
     */
  })
  .catch((err) => {
     console.error(err);
  });
```

Example
-------

```j
const fs = require('fs');
const accountms = require('accountpicture-ms-extractor');

accountms(file)
      .then((extracted) => {
      
        //write to file
        fs.writeFile("small.jpeg"),extracted.small,(err) => {
          if (err) throw err;  
        });
        fs.writeFile("big.jpeg"),extracted.big,(err) => {
          if (err) throw err;  
        });
        
        //as data64
        let html = `
          <img src="data:image/jpeg;charset=utf-8;base64,${extracted.small.toString('base64')}" alt="small 96*96" />
          <img src="data:image/jpeg;charset=utf-8;base64,${extracted.big.toString('base64')}" alt="big original-file-resolution-fit-to-square" />`;
        
        fs.writeFile("data64.html"),html,'utf8',(err) => {
          if (err) throw err;  
        });
        
      })
      .catch((err) => {
        console.error(err);
      });
```
