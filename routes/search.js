import { readdir, readFile } from "fs/promises";
import path from "path";
const __dirname = path.resolve();
import { dateParser, nameParser, seriesParser } from "../utils.js";
import getImageTemplate from "../templates/image.js";

export const searchHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const input = await readdir(`${__dirname}/videos`);
  const query = req.params.query.split(" ");
  const files = input.filter((entry) =>
    query.some((item) => entry.toLowerCase().includes(item.toLowerCase()))
  );

  if (files.length === 0) {
    res.send("<strong>No content found</strong>");
    res.end();
    return;
  }

  let response = `
        <section class="d-sm-flex flex-sm-wrap videos-list">
      `;

  // Render videos
  for await (const item of files) {
    if (
      !item.endsWith(".mp4") &&
      !item.endsWith(".ico") &&
      !item.endsWith(".png") &&
      !item.endsWith(".css") &&
      !item.endsWith(".js") &&
      !item.includes("@")
    ) {
      const files = await readdir(`${__dirname}/videos/${item}`);
      const video = files.filter((item) => item.endsWith(".mp4"));
      const images = files.filter(
        (item) => item.endsWith(".jpg") || item.endsWith(".png")
      );
      const json = files.filter((item) => item.endsWith(".json"));
      let date;
      let name;
      let series;
      let btnPlayURL;
      let linkImage = "";
      let btnLiked = "";
      let liked = false;
      let watched = false;
      let btnWatched = "";

      // Remote link
      if (json.length > 0 && video.length === 0) {
        const fileData = JSON.parse(
          await readFile(`${__dirname}/videos/${item}/nfo.json`)
        );
        date = fileData.date;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `${fileData.url}!1a`;
        linkImage = "link-image";
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
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `/${item}/${video[0]}`;
        liked = fileData.liked;
        btnLiked = `<span title="Add to favorite" class="btn-liked${
          liked ? " active" : ""
        }"></span>`;
        btnWatched = `<span title="Add to watched" class="btn-watched${
          watched ? " active" : ""
        }"></span>`;
        // Local file
      } else {
        date = dateParser(item);
        name = nameParser(item);
        series = seriesParser(item);
        btnPlayURL = `/${item}/${video[0]}`;
      }

      // Skip invalid entries
      if ((video.length === 0 || images.length === 0) && json.length === 0)
        continue;

      // Single image
      response +=
        getImageTemplate({
          btnLiked,
          btnPlayURL,
          date,
          item,
          images,
          linkImage,
          series,
          name,
          liked,
          watched,
          btnWatched,
        }) || "";
    } // File type check
  }
  response += `</section>`;
  res.send(response);
  res.end();
};
