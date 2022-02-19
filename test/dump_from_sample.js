import { writeFile } from "@xan105/fs";
import path from "path";
import extract from "../lib/index.js";
         
async function dump(filePath) {

  const filename = path.parse(filePath).name;
  console.log(filename);
  
  const { highres, lowres } = await extract(filePath);   
      
  //as data64
  const html = `<img src="${highres.base64()}" alt="Highres" />` + 
               `<img src="${lowres.base64()}" alt="Lowres 96*96" />`;
   
  //write to file   
  await writeFile(`./dump/${filename}/data64.html`,html,'utf8').catch(console.error);
  await writeFile(`./dump/${filename}/highres.${highres.format}`,highres.buffer).catch(console.error);
  await writeFile(`./dump/${filename}/lowres.${lowres.format}`,lowres.buffer).catch(console.error);
}

const sample = {
  jpg: "./sample/a75b9283298d0b69.accountpicture-ms",
  png: "./sample/8d2cbe59176c6627.accountpicture-ms"
};

await dump(sample.jpg);
await dump(sample.png);