import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import renderDefault from "../templates/default.js";
import renderPagination from "../templates/pagination.js";
import getImageTemplate from "../templates/image.js";
const __dirname = path.resolve();
import { dateParser, nameParser, seriesParser } from "../utils.js";

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

      // Skip invalid entries
      if (images.length === 0) continue;

      let date;
      let name;
      let series;
      let btnPlayURL;
      let linkImage = "";
      let btnLiked = "";
      let liked = false;
      let url = "";

      // Remote link and nfo.json
      if (json.length > 0 && video.length === 0) {
        const fileData = JSON.parse(
          await readFile(`${__dirname}/videos/${item}/nfo.json`)
        );
        date = fileData.date;
        name = fileData.name;
        series = fileData.series;
        btnPlayURL = `${fileData.url}!1a`;
        linkImage =
          btnPlayURL && btnPlayURL !== "https://mega.nz/embed/link!1m!1a"
            ? "link-image"
            : "";
        liked = fileData.liked;
        btnLiked = `<span title="Add to favorite" class="btn-liked${
          liked ? " active" : ""
        }"></span>`;
        url = fileData.url;
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
        // Local file
      } else {
        date = dateParser(item);
        name = nameParser(item);
        series = seriesParser(item);
        btnPlayURL = `/${item}/${video[0]}`;
        const createJSON = {
          filename: item,
          date,
          url: "https://mega.nz/embed/link!1m",
          series,
          name,
          title: "",
          liked: false,
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
        item,
        images,
        linkImage,
        series,
        name,
        liked,
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
