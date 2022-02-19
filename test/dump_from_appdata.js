import { writeFile } from "@xan105/fs";
import path from "node:path";
import glob from "fast-glob";
import extract from "../lib/index.js";

const dirPath = [ path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures"),
                  path.join(process.env.APPDATA,"Microsoft/Windows/Account Pictures") ]; //Win11

async function searchAndExtract(dirPath){
  const files = await glob("*.accountpicture-ms", {cwd:dirPath, nodir: true, absolute: true});
  console.log(`Found ${files.length} in [${dirPath}]`); 
    
  for (const file of files) 
  {
    const filename = path.parse(file).name;
    console.log(`> ${filename}`);

    const { highres, lowres } = await extract(file);

    //as data64
    const html = `<img src="${highres.base64()}" alt="Highres" />` + 
                 `<img src="${lowres.base64()}" alt="Lowres 96*96" />`;

    //write to file   
    await writeFile(`./dump/${filename}/data64.html`,html,'utf8').catch(console.error);
    await writeFile(`./dump/${filename}/highres.${highres.format}`,highres.buffer).catch(console.error);
    await writeFile(`./dump/${filename}/lowres.${lowres.format}`,lowres.buffer).catch(console.error);
  }
}

for (const dir of dirPath)
  await searchAndExtract(dir);
  
console.log("done");