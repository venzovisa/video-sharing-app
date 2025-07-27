import { readFile, writeFile } from "fs/promises";
import path from "path";
const __dirname = path.resolve();

export const likeHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const { folder, status } = req.params;
  const fileData = JSON.parse(
    await readFile(`${__dirname}/videos/${folder}/nfo.json`)
  );

  const updateFile = async (fileData) => {
    await writeFile(
      `${__dirname}/videos/${folder}/nfo.json`,
      JSON.stringify(fileData, null, 2)
    );
  };

  if (status === "liked") {
    fileData.liked = true;
    await updateFile(fileData);
    res.sendStatus(200);
  } else if (status === "unliked") {
    fileData.liked = false;
    await updateFile(fileData);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
  res.end();
};
