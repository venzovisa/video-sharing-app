import header from './header.js';
import head from './head.js';
import footer from './footer.js';

export default (main) => {
    return `
    <!doctype html>
    <html lang="en">
    ${head}
    <body>
    ${header}
    <main class="container main">
      <section class="d-flex">
        <div class="mb-3 col-5 browse-counter"></div>
        <div class="mb-3 col-7 btn-items-box">
          <button class="btn-items" value="12">12</button>
          <button class="btn-items" value="24">24</button>
          <button class="btn-items" value="48">48</button>
        </div>
      </section>
        ${main}
    </main>
    ${footer}
    <script src="../bootstrap.bundle.min.js" defer ></script>
    <script src="../index.js" defer ></script>
    <button onclick="topFunction()" id="myBtn" title="Go to top"></button>
    </body>
  </html>
    `
} 