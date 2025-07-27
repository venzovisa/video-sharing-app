import { readFile, writeFile } from "fs/promises";
import path from "path";
const __dirname = path.resolve();

export const watchHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const { folder, watched } = req.params;
  const fileData = JSON.parse(
    await readFile(`${__dirname}/videos/${folder}/nfo.json`)
  );

  const updateFile = async (fileData) => {
    await writeFile(
      `${__dirname}/videos/${folder}/nfo.json`,
      JSON.stringify(fileData, null, 2)
    );
  };

  if (watched === "watched") {
    fileData.watched = true;
    await updateFile(fileData);
    res.sendStatus(200);
  } else if (watched === "unwatched") {
    fileData.watched = false;
    await updateFile(fileData);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
  res.end();
};
