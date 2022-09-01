/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { parse } from "node:path";
import { Blob, Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { split } from "@xan105/buffer";
import { Failure, attempt } from "@xan105/error";
import { shouldBuffer, shouldStringNotEmpty } from "@xan105/is/assert";

const format = {
  png: {
    ext: "png",
    header: Buffer.from("89504E470D0A1A0A","hex"),
    trailer: Buffer.from("49454E44","hex"),
    trailerOffset: 4 //four byte CRC
  },
  jpg: {
    ext: "jpeg",
    header: Buffer.from("FFD8FFE0","hex"), //includes jfif
    trailer: Buffer.from("FFD9","hex")
  }
  /*mp4: { //ISO Base Media file (MPEG-4) v1 
    ext: "mp4",
    header: Buffer.from("6674797069736F6D","hex")
  }*/
};

function base64(buffer, format){
  return `data:image/${format};charset=utf-8;base64,${buffer.toString("base64")}`;
}

function blob(buffer, format){
  return new Blob([buffer], { type: `image/${format}` });
}

async function extract(buffer){
  
  shouldBuffer(buffer);

  const [img, err] = await attempt(Promise.any.bind(Promise), [[
    slice(buffer, ...Object.values(format.png)),
    slice(buffer, ...Object.values(format.jpg))
  ]]);
    
  if(err) 
    throw new Failure("Unexpected file content: no image to retrieve !", {code: 0, cause: err});

  const result = {
    lowres: {
      buffer: img.lowres,
      format: img.format,
      base64: function(){ return base64(this.buffer, this.format) },
      blob: function(){ return blob(this.buffer, this.format) }
    },
    highres: {
      buffer: img.highres,
      format: img.format,
      base64: function(){ return base64(this.buffer, this.format) },
      blob: function(){ return blob(this.buffer, this.format) }
    }
  };
    
  return result;
}

function slice(buffer, ext, header, trailer, offset = 0){
  return new Promise((resolve, reject) => {
  
    const content = split(buffer, header, { includeSeparator: true });
    if (content.length !== 3)
      return reject(new Failure("Unexpected file content", 0));
    
    const end = {
      lowres: content[1].lastIndexOf(trailer),
      highres: content[2].lastIndexOf(trailer)
    };
    if (end.lowres === -1 || end.highres === -1)
      return reject(new Failure("Unexpected file content", 0));
    
    const img = {
      format: ext,
      lowres: content[1].subarray(0, end.lowres + trailer.length + offset),
      highres: content[2].subarray(0, end.highres + trailer.length + offset)
    };
    
    return resolve(img);
  });
}

export default async function(filePath){ 
  
    shouldStringNotEmpty(filePath);
    if (parse(filePath).ext !== ".accountpicture-ms") 
      throw new Failure("Not an .accountpicture-ms file !", 1);

    const buffer = await readFile(filePath);
    const image = await extract(buffer);
    return image;
}