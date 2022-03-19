/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { parse } from "node:path";
import { Blob, Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { split } from "@xan105/buffer";
import { Failure } from "@xan105/error";
import { shouldBuffer, shouldStringNotEmpty } from "@xan105/is/assert";

const PNG = {
  ext: "png",
  header: Buffer.from('89504E470D0A1A0A','hex'),
  trailer: Buffer.from('49454E44','hex'),
  trailerOffset: 4 //four byte CRC
};

const JPEG = {
  ext: "jpeg",
  header : Buffer.from('FFD8FFE0','hex'), //includes jfif
  trailer: Buffer.from('FFD9','hex')
};

function base64(buffer, format){
  return `data:image/${format};charset=utf-8;base64,${buffer.toString('base64')}`;
}

function blob(buffer, format){
  return new Blob([buffer], { type: `image/${format}` });
}

async function extract(buffer){
  
  shouldBuffer(buffer);

  try{
    const img = await Promise.any([
      slice(buffer, ...Object.values(PNG)),
      slice(buffer, ...Object.values(JPEG))
    ]);

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
    
  }catch(err){
    throw new Failure("Unexpected file content: no PNG or JPEG to retrieve !", {code: 0, cause: err});
  }
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