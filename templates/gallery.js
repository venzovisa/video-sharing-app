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