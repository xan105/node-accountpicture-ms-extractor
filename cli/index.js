"use strict";

const fs = require("@xan105/fs");
const path = require("path");
const glob = require("fast-glob");
const args = require("minimist")(process.argv);
const accountms = require("accountpicture-ms-extractor");

const msdir = path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");

const app = {
    usage: function(){
      console.log(`Usage: accountpicture-ms-extractor.exe --file "path/to/.accountpicture-ms" --dir "extract/to/dir"`);
    },
    extract: function(file, dir = path.join(path.dirname(process.execPath))){
       accountms(file).then((img) => {
                      
           fs.writeFile(path.join(dir,`${path.parse(file).name}-lowres.${img.type}`),img.lowres)
                .then( file => console.log(`Written ${path.parse(file).base}`) )
                .catch( err => console.error(err) );
           fs.writeFile(path.join(dir,`${path.parse(file).name}-highres.${img.type}`),img.highres)
                .then( file => console.log(`Written ${path.parse(file).base}`) )
                .catch( err => console.error(err) );
                
       }).catch((err)=>{
          console.error(err);
       });    
    },
    main: function(){

          if(!args.file && !args.dir) {
          
              console.log("No args provided !");
              this.usage();
              console.log(`Extracting in ["${path.join(path.dirname(process.execPath))}"] from all files located in ["${msdir}"]`);
              
              glob("*.accountpicture-ms",{cwd: msdir, onlyFiles: true, absolute: true}).then((files)=>{
                for (let file of files) { this.extract(file) }
              }).catch((err)=>{
                console.error(err);
              });
          
          } else if (!args.file || !args.dir) { 
            return this.usage(); 
          } 
          else { 
            this.extract(path.resolve(args.file),path.resolve(args.dir)); 
          }

    }
};

try
{
  app.main();
}
catch(err)
{
  console.error(err);
}