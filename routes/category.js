import renderDefault from "../templates/default.js";
import { sendPage } from "../utils.js";
import { loadData } from "./root.js";

const FILTERS = {
  new: (entry) => !entry.watched,
  liked: (entry) => entry.liked === true,
  watched: (entry) => entry.watched === true,
};

export const categoryHandler = async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const filterFn = FILTERS[req.params.category];

  if (!filterFn) {
    res.sendStatus(404);
    res.end();
    return;
  }

  sendPage(req, res, await loadData(filterFn), renderDefault);
};
