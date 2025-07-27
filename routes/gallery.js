import { readFile, readdir } from "fs/promises";
import path from "path";
const __dirname = path.resolve();
import renderGallery from "../templates/gallery.js";
import { dateParser, nameParser, seriesParser } from "../utils.js";

const generateGalleryTemplate = ({
  date,
  series,
  name,
  videoTemplate,
  images,
  folder,
}) => {
  let galleryTemplate = `
        <h2 class="mb-3">${date} - ${series} - ${name}</h2>
        ${videoTemplate}
        <div class="d-sm-flex flex-sm-wrap">
      `;

  for (const image of images) {
    galleryTemplate += `
        <article class="col-xs-12 col-sm-12 col-md-6 col-xl-4 col-xxl-3 p-2">
          <a href="/${folder}/${image}" title="${image}" target="_blank" >
            <img src="/${folder}/${image}" alt="${image}" class="rounded-2" />
          </a>
        </article>
        `;
  }

  galleryTemplate += "</div>";
  return galleryTemplate;
};

export const galleryHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const files = await readdir(`${__dirname}/videos/${req.params.folder}`);
  const video = files.filter((item) => item.endsWith(".mp4"));
  const images = files.filter(
    (item) => item.endsWith(".jpg") || item.endsWith(".png")
  );
  const json = files.filter((item) => item.endsWith(".json"));
  let date;
  let name;
  let series;
  let videoTemplate;
  const fileData = JSON.parse(
    await readFile(`${__dirname}/videos/${req.params.folder}/nfo.json`)
  );
  date = fileData.date;
  name = fileData.name;
  series = fileData.series;

  // Switch between local file and remote link
  if (json.length > 0 && video.length > 0) {
    videoTemplate = `
        <video controls muted poster="/${req.params.folder}/${images[0]}">
          <source src="/${req.params.folder}/${video[0]}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
  } else if (json.length > 0 && video.length === 0) {
    videoTemplate = `
          <iframe 
            frameborder="0" 
            src="${fileData.url}" 
            allowfullscreen >
          </iframe>
        `;
  } else {
    date = dateParser(`${req.params.folder}`, /[0-9]{2}.[0-9]{2}.[0-9]{2}/);
    name = nameParser(
      `${req.params.folder}`,
      /(?:[0-9]{2}.[0-9]{2}.[0-9]{2}[.])([a-zA-Z]+).([a-zA-Z]+)/
    );
    series = seriesParser(
      `${req.params.folder}`,
      /^([0-9]+[a-zA-Z-]+)|^[a-zA-Z-4K]+/
    );
  }

  res.set({
    "Content-Type": "text/html",
  });

  res.send(
    renderGallery(
      generateGalleryTemplate({
        date,
        series,
        name,
        videoTemplate,
        images,
        folder: req.params.folder,
      })
    )
  );

  res.end();
};
