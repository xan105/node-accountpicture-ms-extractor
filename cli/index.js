'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const glob = require('fast-glob');
const args = require('minimist')(process.argv);
const accountms = require('accountpicture-ms-extractor');

const msdir = path.join(process.env.APPDATA,"Microsoft/Windows/AccountPictures");

var app = {
    usage: function(){
      console.log(`Usage: accountpicture-ms-extractor.exe --file "path/to/.accountpicture-ms" --dir "extract/to/dir"`);
    },
    writeFile: function(file, data, options) {
      return new Promise((resolve,reject) => {
          mkdirp(path.parse(file).dir, function (err) { 
              if (err) {
                return reject(err);
              } else {
                  fs.writeFile(file, data, options, function (err) {
                      if (err) {
                        return reject(err);
                      } else {
                        return resolve(file);
                      }
                  });    
             }
          });  
      });      
    },
    extract: function(file, dir = path.join(path.dirname(process.execPath))){
       accountms(file).then((extracted) => {
                      
           this.writeFile(path.join(dir,`${path.parse(file).name}-small.${extracted.type}`),extracted.small)
                .then( file => { console.log(`Written ${path.parse(file).base}`) })
                .catch( err => { console.error(err) });
           this.writeFile(path.join(dir,`${path.parse(file).name}-big.${extracted.type}`),extracted.big)
                .then( file => { console.log(`Written ${path.parse(file).base}`) })
                .catch( err => { console.error(err) });
                
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