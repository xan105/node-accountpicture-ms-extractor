import * as fs from "@xan105/fs";
import path from "node:path";
import glob from "fast-glob";
import extract from "../lib/esm.js";

const dirPath = path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");
//const dirPath = path.join(process.env.APPDATA,"Microsoft/Windows/Account Pictures"); //Win11

const files = await glob("*.accountpicture-ms", {cwd:dirPath, nodir: true, absolute: true});
console.log(`Found ${files.length} in [${dirPath}]`); 
  
for (const file of files) 
{
  const filename = path.parse(file).name;
  console.log(`${filename}`);

  const { highres, lowres } = await extract(filePath);

  //as data64
  const html = `<img src="${highres.base64()}" alt="Highres" />` + 
               `<img src="${lowres.base64()}" alt="Lowres 96*96" />`;

  //write to file   
  await fs.writeFile(`./dump/${filename}/data64.html`,html,'utf8').catch(console.error);
  await fs.writeFile(`./dump/${filename}/highres.${highres.format}`,highres.buffer).catch(console.error);
  await fs.writeFile(`./dump/${filename}/lowres.${lowres.format}`,lowres.buffer).catch(console.error);
}
  
console.log("done");