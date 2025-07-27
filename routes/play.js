export const playHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.set({
    "Content-Type": "video/mp4",
  });

  res.download(
    `${req.params.folder}/${req.params.file}`,
    req.params.file,
    (err) => {
      console.error(err);
      res.sendStatus(400);
    }
  );

  res.end();
};
