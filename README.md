# Video Sharing App
This project is showcase of my raw skills of just coding and get the job done. I have made it in preparations for JavaScript course in Telerik Academy in 2021. The idea was to implement something useful for me and to perform a reality check of what I was capable of doing  at that time as a developer without help of a modern UI frameworks. I used server-side rendering approach with ``ExpressJS``.

## Usage
It is suitable for local network only since there are no authorization or optimization techniques applied here. Ideally it could handle only one user that streams his movie collection from the local hard drive. You should have at least one folder with video in project root folder ``videos``. Video folder structure is as follows:
- One video file in format ``.mp4``
- At lease one image in format ``.jpg`` or ``.png``
- ``nfo.json`` file with the following structure:
```  
  {
      "filename": "Series.YY.MM.DD.FirstName.LastName",
      "date": "YY.MM.DD",
      "url": "https://mega.nz/embed/link!1m", 
      "series": "Series", // Name of the TV series
      "name": "FirstName LastName", // Name of the protagonist
      "title": "Episode title"
  }
```
Note that ``url`` supports only [Mega Cloud](https://mega.io/) videos for now.
If you don't provide ``nfo.json`` to the video folder it will be created automatically, but the folder should follow the ``filename`` property format and video and image should exist. Example structure:
```
video-sharing-app/videos/TheWalkingDead.15.12.20.Rick.Grimes/video.mp4
video-sharing-app/videos/TheWalkingDead.15.12.20.Rick.Grimes/image.jpg
```
It then will generate the following ``nfo.json`` file in folder:
```
  {
      "filename": "TheWalkingDead.15.12.20.Rick.Grimes",
      "date": "15.12.20",
      "url": "https://mega.nz/embed/link!1m", 
      "series": "TheWalkingDead",
      "name": "Rick Grimes",
      "title": ""
  }
```
There is a validation check so if required data is not there the video folder will be skipped during loading of the files.

## Startup
1. Install [NodeJS](https://nodejs.org/)
2. Navigate to root folder ``cd video-sharing-app``
3. Install dependencies via ``npm install``
4. Start via ``npm start`` or by clicking on ``start.bat`` in root folder
5. The app is served on ``http://localhost:80``, but the port can be changed from ``app.js``
