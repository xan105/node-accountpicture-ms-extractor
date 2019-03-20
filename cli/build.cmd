@echo off
cd "%~dp0"
call npm prune --production
call "%~dp0rcedit.cmd"
call pkg --targets node10-win-x64 --output "%~dp0output/accountpicture-ms-extractor.exe" "%~dp0/index.js"
PAUSE