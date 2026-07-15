import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import renderDefault from "../templates/default.js";
import scrollStatus from "../templates/scrollStatus.js";
import getImageTemplate from "../templates/image.js";
const __dirname = path.resolve();
import { isFolder, sendPage, seriesParser } from "../utils.js";

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

// Reads every video folder and returns one entry per valid folder, tagged
// with the liked/watched flags so callers can filter without re-reading disk.
const buildEntries = async () => {
  const files = await readdir(`${__dirname}/videos`);
  const entries = [];

  for await (const item of files) {
    if (!isFolder(item)) continue;

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
    let watched = false;
    let btnWatched = "";

    // Remote link and nfo.json
    if (json.length > 0 && video.length === 0) {
      const fileData = JSON.parse(
        await readFile(`${__dirname}/videos/${item}/nfo.json`)
      );
      // Skip invalid remote urls
      if (fileData.url === "https://mega.nz/embed/link!1m") continue;
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
        createdAt: new Date().getTime(),
      };
      await writeFile(
        `${__dirname}/videos/${item}/nfo.json`,
        JSON.stringify(createJSON, null, 2)
      );
    }

    entries.push({
      liked,
      watched,
      createdAt,
      html: getImageTemplate({
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
      }),
    });
  }

  return entries;
};

// filterFn decides which entries are shown. Defaults to hiding already-watched
// local videos, matching the app's original home-page behavior.
export const loadData = async (filterFn = (entry) => !entry.watched) => {
  const entries = (await buildEntries())
    .filter(filterFn)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (entries.length === 0) {
    return "<strong>No content found</strong>";
  }

  return `
      <section class="d-sm-flex flex-sm-wrap videos-list">
        ${entries.map((entry) => entry.html).join("")}
      </section>
        ${scrollStatus}
    `;
};

export const rootHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  sendPage(req, res, await loadData(), renderDefault);
};
