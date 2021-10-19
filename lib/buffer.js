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

import { Failure } from "./error.js";

function bufferSplit(buffer,separator){
   
  if ( !Buffer.isBuffer(buffer) || !Buffer.isBuffer(separator) ) throw new Failure("Not a buffer !","ERR_INVALID_ARGS");

  return buffer.toString('hex').split(separator.toString('hex')).map( string => Buffer.from(string,'hex') );
}

function lastPosOf(buffer,value,offset = 0){
  
  if ( !Buffer.isBuffer(buffer) || !Buffer.isBuffer(value) ) throw new Failure("Not a buffer !","ERR_INVALID_ARGS");
  if ( !(Number.isInteger(offset) && offset >= 0) ) throw new Failure("Invalid offset !","ERR_INVALID_ARGS");


  const pos = buffer.lastIndexOf(value);
  if (pos === -1) throw new Failure("Unexpected file content !","ERR_UNEXPECTED_FAIL");
  
  const result = pos + value.length + offset;
  return result;
}

function extract(buffer, header, trailer, offset) {
  
  //Split lowres and highres images
  const content = bufferSplit(buffer,header);
  if (content.length !== 3) throw new Failure("Unexpected file content !","ERR_UNEXPECTED_FAIL");

  //Look for the last occurence of the trailer mark (delimit image length)
  const endOf = {
    lowres: lastPosOf(content[1],trailer,offset),
    highres: lastPosOf(content[2],trailer,offset) 
  };
          
  //Generating valid img with header and marker     
  const img = {
    lowres : Buffer.concat([header,content[1].slice(0, endOf.lowres)]),
    highres : Buffer.concat([header,content[2].slice(0, endOf.highres)])
  }
    
  return img;

}

export { extract };