import express, { response } from 'express';
import cors from 'cors';
import path from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';
import renderDefault from './templates/default.js';
import renderGallery from './templates/gallery.js';
const app = express();
const port = 80;
//const randomPort = Math.floor(Math.random() * 10000);
const __dirname = path.resolve();

app.use(cors());
app.use(express.static('public'));
app.use(express.static('videos'));

const dateParser = (string, regex) => {
  if (string.match(regex) !== null) {
    return string.match(regex)[0]
  }

  return '01.01.01';
}

const seriesParser = (string, regex) => {
  if (string.match(regex) !== null) {
    return string.match(regex)[0]
  }

  return 'N/A';
}

const nameParser = (string, regex) => {
  if (string.match(regex) !== null) {
    return `${string.match(regex)[1]} ${string.match(regex)[2]}`
  }

  return 'N/A';
}

// Root route data load
const loadData = async () => {
  const files = await readdir(`${__dirname}/videos`);
  let response = `
      <section class="d-sm-flex flex-sm-wrap videos-list">
    `;

  // Render videos
  for await (const item of files) {
    if (!item.endsWith('.mp4') &&             
        !item.endsWith('.ico') && 
        !item.endsWith('.png') && 
        !item.endsWith('.css') && 
        !item.endsWith('.js') &&
        !item.includes('@')
      ) {
      const files = await readdir(`${__dirname}/videos/${item}`);
      const video = files.filter((item) => item.endsWith('.mp4'));
      const images = files.filter((item) => item.endsWith('.jpg') || item.endsWith('.png'));
      const json = files.filter((item) => item.endsWith('.json'));

      // Skip invalid entries
      if (images.length === 0) continue;

      let date;
      let name;
      let series;
      let btnPlayURL;
      let linkImage = '';
      let btnLiked = '';
      let liked = false;
      let url = '';

      // Remote link and nfo.json
      if (json.length > 0 && video.length === 0) {
        const fileData = JSON.parse(await readFile(`${__dirname}/videos/${item}/nfo.json`));
        date = fileData.date;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `${fileData.url}!1a`;
        linkImage = btnPlayURL && btnPlayURL !== "https://mega.nz/embed/link!1m!1a" ? 'link-image' : '';
        liked = fileData.liked;
        btnLiked = `<span title="Add to favorite" class="btn-liked${liked ? ' active' : ''}"></span>`;
        url = fileData.url;
      // Local file and nfo.json
      } else if (json.length > 0 && video.length > 0) {
        const fileData = JSON.parse(await readFile(`${__dirname}/videos/${item}/nfo.json`));
        date = fileData.date;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `/${item}/${video[0]}`;
        liked = fileData.liked;
        btnLiked = `<span title="Add to favorite" class="btn-liked${liked ? ' active' : ''}"></span>`;
      // Local file  
      } else {
        date = dateParser(item, /[0-9]{2}.[0-9]{2}.[0-9]{2}/);
        name = nameParser(item, /(?:[0-9]{2}.[0-9]{2}.[0-9]{2}[.])([a-zA-Z]+).([a-zA-Z]+)/);
        series = seriesParser(item, /^([0-9]+[a-zA-Z-]+)|^[a-zA-Z-4K]+/);
        btnPlayURL = `/${item}/${video[0]}`;
        const createJSON = {
          filename: item,
          date,
          url: "https://mega.nz/embed/link!1m",
          series,
          name,
          title: "",
          liked: false
        };
        await writeFile(`${__dirname}/videos/${item}/nfo.json`, JSON.stringify(createJSON, null, 2));
      }
      
      const randomImage = Math.floor(Math.random() * 10 + Math.random() * 10);
      
      // Single image
      const imagesTemplate = `
          <a href="/${item}" title="${images[0]}" target="_blank" class="d-block mb-3 ${linkImage}">
            <img src="https://via.placeholder.com/320x180" data-src="/${item}/${images[randomImage < images.length ? randomImage : 0]}" alt="${images[0]}" class="rounded-2" />
          </a>
        `;

      // const videoTemplate = `
      //   <iframe 
      //     frameborder="0" 
      //     src="${url}" 
      //     allowfullscreen >
      //   </iframe>
      // `;

      const btnPlayTemplate = btnPlayURL && btnPlayURL !== "https://mega.nz/embed/link!1m!1a" ? `<a href="${btnPlayURL}" title="${item}" target="_blank" class="btn btn-play">Play</a>` : "";

      response += `
      <article class="col-xs-12 col-sm-12 col-md-6 col-xl-4 col-xxl-3 p-2 videos-item" data-date="${date}" data-series="${series}" data-title="${item}" data-status="${liked}">
        <div class="pb-2 px-1 box">
          ${btnLiked}
          <div class="d-flex py-2">
            <p class="mb-0 col-4 date">${date}</p>
            <p class="mb-0 col-8 series">
              <a href="/" data-series="${series}" title="${series}" class="d-inline-block px-1 bg-dark link-series text-white">${series}</a>
            </p>
          </div>  
          ${imagesTemplate}
          <p class="name">
            <a href="/" data-name="${name}" title="${name}" class="link-name">${name}</a>
          </p>
          <a href="/${item}" title="${item}" target="_blank" class="btn btn-gallery">Gallery</a>
          ${btnPlayTemplate}
        </div>  
      </article> 
      `;
    }; // File type check
  };
  response += `
    </section>
        <section class="pagination">
          <div class="pagination-container"></div>
          <div class="page-counter"></div>
          <div class="d-flex align-items-center my-3 btn-wrapper">
            <div class="btn-prev-box">
              <button class="btn btn-prev">Previous</button>
            </div>
            <div class="btn-next-box">
              <button class="btn btn-next">Next</button>
            </div>
          </div>
        </section>
    `;
  return response;
}

//const initialState = loadData();

// Root
  try {
    app.get('/', async (req, res) => {
      res.send(renderDefault(await loadData()));
      res.end();
    });
  } catch (err) {
    console.error(err);
    console.error(`Error in GET/`);
  }

  // Search route
try {
  app.get('/search/:query', async (req, res) => {
    const input = await readdir(`${__dirname}/videos`);
    const query = req.params.query.split(' ');
    const files = input.filter(entry => query.some(item => entry.toLowerCase().includes(item.toLowerCase())));
    let response = `
        <section class="d-sm-flex flex-sm-wrap videos-list">
      `;

    // Render videos
    for await (const item of files) {
      if (!item.endsWith('.mp4') &&             
          !item.endsWith('.ico') && 
          !item.endsWith('.png') && 
          !item.endsWith('.css') && 
          !item.endsWith('.js') &&
          !item.includes('@')
        ) {
        const files = await readdir(`${__dirname}/videos/${item}`);
        const video = files.filter((item) => item.endsWith('.mp4'));
        const images = files.filter((item) => item.endsWith('.jpg') || item.endsWith('.png'));
        const json = files.filter((item) => item.endsWith('.json'));
        let date;
        let name;
        let series;
        let btnPlayURL;
        let linkImage = '';
        let btnLiked = '';
        let liked = false;

        // Remote link
        if (json.length > 0 && video.length === 0) {
          const fileData = JSON.parse(await readFile(`${__dirname}/videos/${item}/nfo.json`));
          date = fileData.date;
          name = fileData.name;
          series = fileData.series;
          btnPlayURL = `${fileData.url}!1a`;
          linkImage = 'link-image';
          liked = fileData.liked;
          btnLiked = `<span title="Add to favorite" class="btn-liked${liked ? ' active' : ''}"></span>`;
        // Local file and nfo.json
        } else if (json.length > 0 && video.length > 0) {
          const fileData = JSON.parse(await readFile(`${__dirname}/videos/${item}/nfo.json`));
          date = fileData.date;
          name = fileData.name;
          series = fileData.series;
          btnPlayURL = `/${item}/${video[0]}`;
          liked = fileData.liked;
          btnLiked = `<span title="Add to favorite" class="btn-liked${liked ? ' active' : ''}"></span>`;
        // Local file  
        } else {
          date = dateParser(item, /[0-9]{2}.[0-9]{2}.[0-9]{2}/);
          name = nameParser(item, /(?:[0-9]{2}.[0-9]{2}.[0-9]{2}[.])([a-zA-Z]+).([a-zA-Z]+)/);
          series = seriesParser(item, /^([0-9]+[a-zA-Z-]+)|^[a-zA-Z-4K]+/);
          btnPlayURL = `/${item}/${video[0]}`;
        }
        
        const randomImage = Math.floor(Math.random() * 10 + Math.random() * 10);
        // Skip invalid entries
        if ((video.length === 0 || images.length === 0) && json.length === 0) continue;
        
        // Single image
        const imagesTemplate = `
            <a href="/${item}" title="${images[0]}" target="_blank" class="d-block mb-3 ${linkImage}">
              <img src="https://via.placeholder.com/320x180" data-src="/${item}/${images[randomImage < images.length ? randomImage : 0]}" alt="${images[0]}" />
            </a>
          `;

        response += `      
        <article class="col-xs-12 col-sm-12 col-md-6 col-xl-4 col-xxl-3 p-2 videos-item" data-date="${date}" data-series="${series}" data-title="${item}" data-status="${liked}">
          <div class="pb-2 px-1 box" >
            ${btnLiked}
            <div class="d-flex py-2">
              <p class="mb-0 col-4 date">${date}</p>
              <p class="mb-0 col-8 series">
                <a href="/" data-series="${series}" title="${series}" class="d-inline-block px-1 bg-dark link-series text-white">${series}</a>
              </p>
            </div>  
            ${imagesTemplate}                         
            <p class="name">
              <a href="/" data-name="${name}" title="${name}" class="link-name">${name}</a>
            </p>
            <a href="/${item}" title="${item}" target="_blank" class="btn btn-gallery">Gallery</a>
            <a href="${btnPlayURL}" title="${item}" target="_blank" class="btn btn-play">Play</a>     
          </div>
        </article>        
        `;
      }; // File type check
    };
    response += `
      </section>
          <section class="pagination">
            <div class="pagination-container"></div>
            <div class="page-counter"></div>
            <div class="d-flex align-items-center my-3 btn-wrapper">
              <div class="btn-prev-box">
                <button class="btn btn-prev">Previous</button>
              </div>
              <div class="btn-next-box">
                <button class="btn btn-next">Next</button>
              </div>
            </div>
          </section>
      `;
    res.send(response);
    res.end();
  });
} catch (err) {
  console.error(err);
  console.error(`Error in GET/`);
}

  // Liked video route
try {
  app.get('/:folder/:status', async (req, res) => {
    const { folder, status } = req.params;
    const fileData = JSON.parse(await readFile(`${__dirname}/videos/${folder}/nfo.json`));

    if (status === 'liked') {
      fileData.liked = true;
      await writeFile(`${__dirname}/videos/${folder}/nfo.json`, JSON.stringify(fileData, null, 2));
      res.sendStatus(200);
    } else if (status === 'unliked') {
      fileData.liked = false;
      await writeFile(`${__dirname}/videos/${folder}/nfo.json`, JSON.stringify(fileData, null, 2));
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
    res.end();
  })
} catch (err) {
  console.log(err);
}
  
  // Gallery
  try {
    app.get('/:folder/', async (req, res) => {
      const files = await readdir(`${__dirname}/videos/${req.params.folder}`);
      const video = files.filter((item) => item.endsWith('.mp4'));
      const images = files.filter((item) => item.endsWith('.jpg') || item.endsWith('.png'));
      const json = files.filter((item) => item.endsWith('.json'));
      let date;
      let name;
      let series;
      let videoTemplate = `
        <video controls poster="/${req.params.folder}/${images[0]}">
          <source src="/${req.params.folder}/${video[0]}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      // Switch between local file and remote link
      if (json.length > 0 && video.length === 0) {
        let fileData = JSON.parse(await readFile(`${__dirname}/videos/${req.params.folder}/nfo.json`));
        date = fileData.date;
        name = fileData.name;
        series = fileData.series;
        videoTemplate = `
          <iframe 
            frameborder="0" 
            src="${fileData.url}" 
            allowfullscreen >
          </iframe>
        `;
      } else if(json.length > 0 && video.length > 0) {
          let fileData = JSON.parse(await readFile(`${__dirname}/videos/${req.params.folder}/nfo.json`));
          date = fileData.date;
          name = fileData.name;
          series = fileData.series;
      } else {
        date = dateParser(`${req.params.folder}`, /[0-9]{2}.[0-9]{2}.[0-9]{2}/);
        name = nameParser(`${req.params.folder}`, /(?:[0-9]{2}.[0-9]{2}.[0-9]{2}[.])([a-zA-Z]+).([a-zA-Z]+)/);
        series = seriesParser(`${req.params.folder}`, /^([0-9]+[a-zA-Z-]+)|^[a-zA-Z-4K]+/);
      }

      let galleryTemplate = `
        <h2 class="mb-3">${date} - ${series} - ${name}</h2>
        ${videoTemplate}
        <div class="d-sm-flex flex-sm-wrap">
      `;

      for (const image of images) {
        galleryTemplate += `
        <article class="col-xs-12 col-sm-12 col-md-6 col-xl-4 col-xxl-3 p-2">
          <a href="/${req.params.folder}/${image}" title="${image}" target="_blank" >
            <img src="/${req.params.folder}/${image}" alt="${image}" class="rounded-2" />
          </a>
        </article>
        `
      }

      galleryTemplate += '</div>';

      res.set({
        'Content-Type': 'text/html',
      });

      res.send(renderGallery(galleryTemplate));

      res.end();
    });
  } catch (err) {
    console.error(err);
    console.error(`Error in GET/:folder`);
  }

  // Play video
  try {
    app.get('/:folder/:file', async (req, res) => {

      res.set({
        'Content-Type': 'video/mp4',
      });

      res.download(
        `${req.params.folder}/${req.params.file}`, 
        req.params.file,
        (err) => {
          console.log(err);
          res.sendStatus(400);
        }
      );

      res.end();
    });
  } catch (err) {
    console.error(err);
    console.error(`Error in GET/:folder/:file`);
  }

app.listen(port /*randomPort*/, () => {
  console.warn(`Server listening at http://localhost:${port}`);
  //console.log(`Random port: ${randomPort}`);
})