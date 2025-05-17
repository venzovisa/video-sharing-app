import express from "express";
import cors from "cors";
const app = express();
const port = 80;
//const randomPort = Math.floor(Math.random() * 10000);
import { rootHandler } from "./routeHandlers/root.js";
import { searchHandler } from "./routeHandlers/search.js";
import { likeHandler } from "./routeHandlers/like.js";
import { galleryHandler } from "./routeHandlers/gallery.js";
import { playHandler } from "./routeHandlers/play.js";

app.use(cors());
app.use(express.static("public"));
app.use(express.static("videos"));

// Root
try {
  app.get("/", rootHandler);
} catch (err) {
  console.error(`Error in GET/`, err);
}

// Search route
try {
  app.get("/search/:query", searchHandler);
} catch (err) {
  console.error(`Error in GET /search/:query`, err);
}

// Liked video route
try {
  app.get("/:folder/:status", likeHandler);
} catch (err) {
  console.log("Error in GET /:folder/:status", err);
}

// Gallery
try {
  app.get("/:folder/", galleryHandler);
} catch (err) {
  console.error(`Error in GET/:folder`, err);
}

// Play video
try {
  app.get("/:folder/:file", playHandler);
} catch (err) {
  console.error(`Error in GET /:folder/:file`, err);
}

app.listen(port /*randomPort*/, () => {
  console.warn(`Server listening at http://localhost:${port}`);
  //console.log(`Random port: ${randomPort}`);
});
