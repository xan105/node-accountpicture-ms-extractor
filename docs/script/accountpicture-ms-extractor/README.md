About
=====

Extracts image files embedded within an `.accountpicture-ms` file.

NB: I made a _"web converter"_ just for fun as well: https://xan105.github.io/node-accountpicture-ms-extractor/

### .accountpicture-ms file

Located in 
- `%appdata%/Microsoft/Windows/AccountPictures` _(Windows 8, 10)_
- `%appdata%/Microsoft/Windows/Account Pictures` _(Windows 11)_

There are either 2 PNG or JPEG image files:

- Lowres: 96x96 
- Highres: usually 448x448 _(upscaled if necessary)_.  

From my experience: Microsoft seems to be changing the format, resolution _(only for highres)_, compression ratio _(If JPEG)_, etc... used for the embedded images over time.

As of this writing they are using JPEG: 96x96 and 448x448.
But not that long ago they were using PNG and before that JPEG highres was the original resolution of the file you used for your account's picture.

NB: 
  - For JPEG both files have a JPEG and JFIF header.
  - There can be more than one `.accountpicture-ms` file in the mentionned folders.
  - The extension `.accountpicture-ms` is hidden by the explorer even when set to display file extension.
  - The current used `{SourceId}.accountpicture-ms` can be determined via the registry key `HKCU/Software/Microsoft/Windows/CurrentVersion/AccountPicture/SourceId`

Example
=======

```js
import extract from "accountpicture-ms-extractor";
import { join } from "node:path";

const sourceID = "37a1276dd7295e1a";
const dirPath = join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");
const filePath = join(dirPath,`${sourceID}.accountpicture-ms`);

const { highres, lowres } = await extract(filePath);

//save to file
import { writeFile } from "node:fs/promises";
await writeFile(`./${sourceID}.${highres.format}`, highres.buffer);

//data url  
const base64 = highres.base64();
console.log(base64);
// "data:image/jpeg;charset=utf-8;base64,....."
```

I'm actually using this in [`xan105/Achievement Watcher`](https://github.com/xan105/Achievement-Watcher) to display user's profile picture in the app (_Electron_).<br />
Using the `.base64()` method you can read and display the picture without any prior extraction to disk.

<p align="center">
  <img src="https://github.com/xan105/node-accountpicture-ms-extractor/raw/master/screenshot/electron.png"><br />
  <em>accountpicture-ms as avatar</em>
</p>

Install
=======

`npm install accountpicture-ms-extractor`

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

## Default export

#### `(filePath: string): Promise<obj>`

Extracts image files embedded within an `.accountpicture-ms` file.

Promise returns the following object:
```ts
{
  lowres : {
    buffer: Buffer, //file as a Buffer
    format: string, //file format "png" or "jpeg"
    base64(): string, //return file as a base64 encoded string
    blob(): Blob //return file as a Blob
  },
  highres: {
    buffer: Buffer,
    format: string,
    base64(): string,
    blob(): Blob
  }
}
```
