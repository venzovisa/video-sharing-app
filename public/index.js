const state = {
  pages: [],
  itemsPerPage: 12,
  revealed: 0,
};

const footerPusher = () => {
  const header = document.querySelector(".header").clientHeight;
  const footer = document.querySelector(".footer").clientHeight;
  document.querySelector(".main").style.minHeight = String(
    window.innerHeight - (header + footer)
  ).concat("px");
};

const lazyLoad = () => {
  const isPrivateModeEnabled = JSON.parse(
    window.localStorage.getItem("videoSharingApp")
  )?.isPrivateModeEnabled;

  if (isPrivateModeEnabled) {
    Array.from(document.querySelectorAll("img")).map((img) => {
      img.src = "https://placehold.co/320x180";
    });
  } else {
    Array.from(document.querySelectorAll("img")).map((img) => {
      img.src = img.dataset.src;
    });
  }
};

const toggleRouteHandler = (btnClass, activeURL, inactiveURL) => {
  const btnDOM = document.querySelectorAll(btnClass);
  for (const btn of btnDOM) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        const video = btn.parentElement.parentElement.dataset.title;
        if (btn.classList.contains("active")) {
          btn.classList.remove("active");
          (async () => {
            await fetch(`/${video}/${activeURL}`);
          })();
        } else {
          btn.classList.add("active");
          (async () => {
            await fetch(`/${video}/${inactiveURL}`);
          })();
        }
      } catch (err) {
        console.log("Unable to toggle active state on server", err);
      }
    });
  }
};

const handleBtnLiked = () => {
  toggleRouteHandler(".btn-liked", "like/unliked", "like/liked");
};

const handleBtnWatched = () => {
  toggleRouteHandler(".btn-watched", "watch/unwatched", "watch/watched");
};

const updateScrollStatus = () => {
  const counter = document.querySelector(".page-counter");
  if (!counter) return;

  counter.innerHTML = `Showing ${state.revealed} of ${state.pages.length}`;

  const message = document.querySelector(".scroll-message");
  if (message) {
    message.textContent =
      state.revealed < state.pages.length ? "Loading more…" : "That's everything";
  }
};

const revealNextBatch = () => {
  const container = document.querySelector(".videos-list");
  if (!container) return;

  const end = Math.min(state.revealed + state.itemsPerPage, state.pages.length);
  for (let i = state.revealed; i < end; i++) {
    container.appendChild(state.pages[i]);
  }
  state.revealed = end;

  lazyLoad();
  updateScrollStatus();
};

let scrollObserver = null;

// Entries already arrive sorted and fully loaded from the server; this just
// controls how many of them are attached to the DOM at once, revealing more
// as the sentinel element scrolls into view.
const wireInfiniteScroll = () => {
  const sentinel = document.querySelector(".scroll-sentinel");
  if (!sentinel) return;

  const container = document.querySelector(".videos-list");
  if (!container) return;

  state.pages = Array.from(document.querySelectorAll(".videos-item"));
  state.revealed = 0;
  container.innerHTML = "";

  if (scrollObserver) {
    scrollObserver.disconnect();
  }

  revealNextBatch();

  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && state.revealed < state.pages.length) {
      revealNextBatch();
    }
  });
  scrollObserver.observe(sentinel);
};

const updateBrowseCounter = () => {
  const counter = document.querySelector(".browse-counter");
  if (!counter) return;
  counter.innerHTML = `<strong>Browse ${
    document.querySelectorAll(".videos-item").length
  } files</strong>`;
};

// Rebinds the per-card series/name links after a content swap replaces them.
const bindLinks = (scope) => {
  const links = scope.querySelectorAll(".link-name, .link-series");
  for (const link of links) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  }
};

// Fetches a route as a fragment, swaps it into .content, and syncs the URL
// bar via the History API so the view is bookmarkable/shareable/back-able.
// Falls back to a real navigation on pages without a .content region (e.g.
// a single-folder gallery page), since there's nothing to swap into there.
const navigateTo = async (url, { push = true } = {}) => {
  const content = document.querySelector(".content");
  if (!content) {
    window.location.href = url;
    return;
  }

  const result = await fetch(url, { headers: { "X-Requested-With": "fetch" } });
  const html = (await result.text()).trim();
  content.innerHTML = html;

  if (push) {
    window.history.pushState({}, "", url);
  }

  updateBrowseCounter();
  lazyLoad();
  handleBtnLiked();
  handleBtnWatched();
  bindLinks(content);
  wireInfiniteScroll();
};

const bindCategoryLinks = () => {
  const links = document.querySelectorAll(
    ".link-liked, .link-watched, .link-new"
  );
  for (const link of links) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  }
};

window.addEventListener("popstate", () => {
  navigateTo(window.location.pathname, { push: false });
});

window.addEventListener("DOMContentLoaded", () => {
  handleBtnLiked();
  handleBtnWatched();
  bindLinks(document);
  bindCategoryLinks();

  // Search form
  document.querySelector(".form-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.querySelector(".input-search").value.trim();
    if (query) {
      navigateTo(`/search/${encodeURIComponent(query)}`);
    }
  });

  updateBrowseCounter();
  wireInfiniteScroll();

  footerPusher();

  document.querySelector("#private-mode").addEventListener("click", (e) => {
    const isPrivateModeEnabled = JSON.parse(
      window.localStorage.getItem("videoSharingApp")
    )?.isPrivateModeEnabled;

    if (isPrivateModeEnabled) {
      window.localStorage.setItem(
        "videoSharingApp",
        JSON.stringify({ isPrivateModeEnabled: !isPrivateModeEnabled })
      );
    } else {
      window.localStorage.setItem(
        "videoSharingApp",
        JSON.stringify({ isPrivateModeEnabled: true })
      );
    }

    lazyLoad();
  });
});

// Scroll to top button
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
