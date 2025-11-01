@ECHO OFF
TITLE Video Sharing App
Powershell pm2 start app.js --name "video-sharing-app" --env production