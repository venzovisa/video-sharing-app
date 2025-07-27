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
