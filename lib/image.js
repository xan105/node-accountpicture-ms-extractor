/*
MIT License

Copyright (c) 2019-2021 Anthony Beaumont

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

import { extract } from "./buffer.js";
import { PNG, JPEG } from "./constant.js";
import { Failure } from "./error.js";

const format = ["png","jpeg"];

function base64(buffer, ext){
  if (!Buffer.isBuffer(buffer)) throw new Failure("Not a buffer !","ERR_INVALID_PARAM");
  if (!format.includes(ext)) throw new Failure(`Only ${format.toString()} allowed`,"ERR_INVALID_PARAM");
  
  return `data:image/${ext};charset=utf-8;base64,${buffer.toString('base64')}`;
}

function extractPNG(buffer){ //New format : PNG embedded in .accountpicture-ms
  if (!Buffer.isBuffer(buffer)) throw new Failure("Not a buffer !","ERR_INVALID_PARAM");
    
  const { lowres, highres } = extract(buffer,...Object.values(PNG));
  
  const result = {
    lowres: {
      buffer: lowres,
      format: format[0],
      base64: function(){ return base64(this.buffer,this.format) }
    },
    highres:{
      buffer: highres,
      format: format[0],
      base64: function(){ return base64(this.buffer,this.format) }
    }
  };
  
  return result;
}

function extractJPEG(buffer){ //Old format : JPEG embedded in .accountpicture-ms
  if (!Buffer.isBuffer(buffer)) throw new Failure("Not a buffer !","ERR_INVALID_PARAM");

  const header = Buffer.concat([JPEG.header,JPEG.jfif]);  
    
  const { lowres, highres } = extract(buffer,header,JPEG.trailer);
  
  const result = {
    lowres: {
      buffer: lowres,
      format: format[1],
      base64: function(){ return base64(this.buffer,this.format) }
    },
    highres:{
      buffer: highres,
      format: format[1],
      base64: function(){ return base64(this.buffer,this.format) }
    }
  };
  
  return result;
}

function extractAuto(buffer){
  if (!Buffer.isBuffer(buffer)) throw new Failure("Not a buffer !","ERR_INVALID_PARAM");
  
  try {
    const result = extractPNG(buffer); //New format : PNG embedded in .accountpicture-ms
    if (!result) throw new Failure("Unexpected empty extraction","ERR_UNEXPECTED_FAIL");
    return result;
  } catch {
    const result = extractJPEG(buffer); //Old format : JPEG embedded in .accountpicture-ms
    if (!result) throw new Failure("Unexpected empty extraction","ERR_UNEXPECTED_FAIL");
    return result;
  }
}

export { extractAuto as extract, extractPNG, extractJPEG }