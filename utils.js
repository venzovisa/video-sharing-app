export const dateParser = (string, regex = /[0-9]{2}.[0-9]{2}.[0-9]{2}/) => {
  if (string.match(regex) !== null) {
    return string.match(regex)[0];
  }

  return "01.01.01";
};

export const seriesParser = (
  string,
  regex = /^([0-9]+[a-zA-Z-]+)|^[a-zA-Z-4K]+/
) => {
  if (string.match(regex) !== null) {
    return string.match(regex)[0];
  }

  return "N/A";
};

export const nameParser = (
  string,
  regex = /(?:[0-9]{2}.[0-9]{2}.[0-9]{2}[.])([a-zA-Z]+).([a-zA-Z]+)/
) => {
  if (string.match(regex) !== null) {
    return `${string.match(regex)[1]} ${string.match(regex)[2]}`;
  }

  return "N/A";
};

export const isFolder = (item) =>
  !item.endsWith(".mp4") &&
  !item.endsWith(".ico") &&
  !item.endsWith(".png") &&
  !item.endsWith(".css") &&
  !item.endsWith(".js") &&
  !item.includes("@");

// Requests made by the client's own fetch() calls set this header so the
// server can return just the swappable fragment instead of a full page.
export const isFragmentRequest = (req) =>
  req.get("X-Requested-With") === "fetch";

export const sendPage = (req, res, contentHtml, renderDefault) => {
  res.set({ "Content-Type": "text/html" });
  res.send(isFragmentRequest(req) ? contentHtml : renderDefault(contentHtml));
  res.end();
};
