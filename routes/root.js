import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import renderDefault from "../templates/default.js";
import renderPagination from "../templates/pagination.js";
import getImageTemplate from "../templates/image.js";
const __dirname = path.resolve();
import { dateParser, isFolder, nameParser, seriesParser } from "../utils.js";

const extractAndTransformDate = (str) => {
  // Match a date pattern like 25.01.19 anywhere in the string
  const match = str.match(/\b(\d{2})\.(\d{2})\.(\d{2})\b/);
  
  if (!match) {
    return str;
  }

  const [_, yy, mm, dd] = match;
  const fullYear = `20${yy}`;
  return new Date(`${fullYear}-${mm}-${dd}`).getTime();
}

const loadData = async () => {
  const files = await readdir(`${__dirname}/videos`);
  if (files.length === 0) {
    return "<strong>No content found</strong>";
  }

  let response = `
      <section class="d-sm-flex flex-sm-wrap videos-list">
    `;

  // Render videos
  for await (const item of files) {
    if (isFolder(item)) {
      const files = await readdir(`${__dirname}/videos/${item}`);
      const video = files.filter((item) => item.endsWith(".mp4"));
      const images = files.filter(
        (item) => item.endsWith(".jpg") || item.endsWith(".png")
      );
      const json = files.filter((item) => item.endsWith(".json"));

      // Skip invalid entries
      if (images.length === 0) continue;

      let date;
      let createdAt;
      let name;
      let series;
      let btnPlayURL;
      let linkImage = "";
      let btnLiked = "";
      let liked = false;
      let url = "";
      let watched = false;
      let btnWatched = "";

      // Remote link and nfo.json
      if (json.length > 0 && video.length === 0) {
        const fileData = JSON.parse(
          await readFile(`${__dirname}/videos/${item}/nfo.json`)
        );
        // Skip invalid remote urls
        if (fileData.url === 'https://mega.nz/embed/link!1m') continue;
        url = fileData.url;
        date = fileData.date;
        createdAt = fileData.createdAt;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `${fileData.url}`;
        linkImage =
          btnPlayURL && btnPlayURL !== "https://mega.nz/embed/link!1m!1a"
            ? "link-image"
            : "";
        liked = fileData.liked;
        watched = fileData.watched || false;
        btnLiked = `<span title="Add to favorite" class="btn-liked${
          liked ? " active" : ""
        }"></span>`;
        btnWatched = `<span title="Add to watched" class="btn-watched${
          watched ? " active" : ""
        }"></span>`;
        // Local file and nfo.json
      } else if (json.length > 0 && video.length > 0) {
        const fileData = JSON.parse(
          await readFile(`${__dirname}/videos/${item}/nfo.json`)
        );
        // Skip watched
        if (fileData.watched) continue;
        date = fileData.date;
        createdAt = fileData.createdAt;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `/${item}/${video[0]}`;
        liked = fileData.liked;
        watched = fileData.watched || false;
        btnLiked = `<span title="Add to favorite" class="btn-liked${
          liked ? " active" : ""
        }"></span>`;
        btnWatched = `<span title="Add to watched" class="btn-watched${
          watched ? " active" : ""
        }"></span>`;
        // Local file
      } else {
        date = extractAndTransformDate(item);
        //name = nameParser(item);
        series = seriesParser(item);
        btnPlayURL = `/${item}/${video[0]}`;
        const createJSON = {
          filename: item,
          date,
          url: "https://mega.nz/embed/link!1m",
          series,
          name: video[0],
          title: "",
          liked: false,
          watched: false,
          createdAt: (new Date).getTime(),
        };
        await writeFile(
          `${__dirname}/videos/${item}/nfo.json`,
          JSON.stringify(createJSON, null, 2)
        );
      }

      // Single image
      response += getImageTemplate({
        btnLiked,
        btnPlayURL,
        date,
        createdAt,
        item,
        images,
        linkImage,
        series,
        name,
        liked,
        watched,
        btnWatched,
      });
    } // File type check
  }
  response += `
    </section>
        ${renderPagination}
    `;
  return response;
};

export const rootHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.send(renderDefault(await loadData()));
  res.end();
};
