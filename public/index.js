const SERVER_URL = "http://192.168.0.100";

const state = {
  initialPages: [],
  pages: [],
  foundPages: [],
  itemsPerPage: 12,
  currentPage: 1,
};

const footerPusher = () => {
  const header = document.querySelector(".header").clientHeight;
  const footer = document.querySelector(".footer").clientHeight;
  document.querySelector(".main").style.minHeight = String(
    window.innerHeight - (header + footer)
  ).concat("px");
};

const renderPagination = ({ pages, itemsPerPage, currentPage }) => {
  let buttons = "";
  const length = Math.ceil(pages.length / itemsPerPage);
  const offset = currentPage + 4;
  let end = offset > length ? length : offset;
  if (offset > length) {
    for (let item = 1; item <= length; item++) {
      buttons += `<button class="btn-pagination" value="${item}">${item}</button>`;
    }
  } else {
    for (
      let item = length - currentPage < 4 ? length - 4 : currentPage;
      item <= end;
      item++
    ) {
      buttons += `<button class="btn-pagination" value="${item}">${item}</button>`;
    }
  }

  return buttons;
};

const lazyLoad = () => {
  Array.from(document.querySelectorAll("img")).map((img) => {
    img.src = img.dataset.src;
  });
};

const switchPages = (domClass, pages, itemsPerPage, currentPage) => {
  document.querySelector(domClass).innerHTML = "";

  if (currentPage === 1) {
    const end = pages.length < itemsPerPage ? pages.length : itemsPerPage;
    for (let i = 0; i < end; i++) {
      document.querySelector(domClass).appendChild(pages[i]);
    }
  } else {
    const start = currentPage * itemsPerPage - itemsPerPage;
    let end = currentPage * itemsPerPage;
    if (end > pages.length) end = pages.length;
    for (let i = start; i < end; i++) {
      document.querySelector(domClass).appendChild(pages[i]);
    }
  }

  lazyLoad();
};

const pageCounter = () => {
  if (state.currentPage === 1) {
    document.querySelector(
      ".page-counter"
    ).innerHTML = `${state.currentPage} - ${state.itemsPerPage}`;
  } else if (state.currentPage * state.itemsPerPage > state.pages.length) {
    document.querySelector(".page-counter").innerHTML = `${
      state.currentPage * state.itemsPerPage - state.itemsPerPage
    } - ${state.pages.length}`;
  } else {
    document.querySelector(".page-counter").innerHTML = `${
      state.currentPage * state.itemsPerPage + 1
    } - ${state.currentPage * state.itemsPerPage + state.itemsPerPage}`;
  }
};

// Handle current page active class
const paginationHandler = () => {
  const query = document.querySelectorAll(".btn-pagination");

  for (const item of query) {
    item.addEventListener("click", (e) => {
      for (const item of query) {
        item.classList.remove("active");
      }

      item.classList.add("active");
      state.currentPage = Number(e.target.value);
      switchPages(
        ".videos-list",
        state.pages,
        state.itemsPerPage,
        state.currentPage
      );
    });
  }
  pageCounter();
};

const switchItemsPerPage = () => {
  const buttons = document.querySelectorAll(".btn-items");

  for (const btn of buttons) {
    btn.addEventListener("click", (e) => {
      state.itemsPerPage = Number(e.target.value);
      switchPages(
        ".videos-list",
        state.pages,
        state.itemsPerPage,
        state.currentPage
      );
      document.querySelector(".pagination-container").innerHTML =
        renderPagination(state);
      paginationHandler();
    });
  }
};

// Used in btnPrev and btnNext handlers
const updateActivePage = () => {
  const query = document.querySelectorAll(".btn-pagination");

  for (const item of query) {
    item.classList.remove("active");
  }

  if (state.currentPage < 1 || state.currentPage > query.length) {
    query[0].classList.add("active");
  } else {
    query[state.currentPage - 1].classList.add("active");
  }
};

const renderFooterSeries = () => {
  const ftSeriesContainer = document.querySelector(".ft-series");
  state.initialPages.reduce((state, next) => {
    if (!state.includes(next.dataset.series)) {
      const link = document.createElement("a");
      link.href = "/";
      link.title = `${next.dataset.series}`;
      link.dataset.series = `${next.dataset.series}`;
      link.classList.add(
        "d-inline-block",
        "m-1",
        "px-1",
        "link-series",
        "text-white"
      );
      link.textContent = `${next.dataset.series}`;

      ftSeriesContainer.appendChild(link);
      return [...state, next.dataset.series];
    }

    return state;
  }, []);
};

const handleBtnLiked = () => {
  const btnLikedDOM = document.querySelectorAll(".btn-liked");
  for (const btn of btnLikedDOM) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        const video = btn.parentElement.parentElement.dataset.title;
        if (btn.classList.contains("active")) {
          btn.classList.remove("active");
          (async () => {
            const response = await fetch(`${SERVER_URL}/${video}/unliked`);
          })();
        } else {
          btn.classList.add("active");
          (async () => {
            const response = await fetch(`${SERVER_URL}/${video}/liked`);
          })();
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
};

window.addEventListener("DOMContentLoaded", () => {
  // Load initial state
  state.initialPages = Array.from(
    document.querySelectorAll(".videos-item")
  ).sort((a, b) => {
    const nameA = a.dataset.date.toUpperCase();
    const nameB = b.dataset.date.toUpperCase();
    if (nameA > nameB) {
      return -1;
    }
    if (nameA < nameB) {
      return 1;
    }
    return 0;
  });

  renderFooterSeries();
  handleBtnLiked();

  state.pages = [...state.initialPages];

  const searchByServer = async (criteria = []) => {
    const result = await fetch(`${SERVER_URL}/search/${criteria}`);
    const html = await result.text();
    document.querySelector(".main").innerHTML = html;
    lazyLoad();
    handleBtnLiked();
    // state.pages = [...state.initialPages];
    // state.pages = state.pages.filter(entry => criteria.some(input => entry.dataset.title.toUpperCase().includes(input)));
    // state.currentPage = 1;
    // document.querySelector('.pagination-container').innerHTML = renderPagination(state);
    // document.querySelector('.btn-pagination').classList.add('active');
    // document.querySelector('.browse-counter').innerHTML = `<strong>Browse ${state.pages.length} files</strong>`;
    // switchPages('.videos-list', state.pages, state.itemsPerPage, state.currentPage);
    // paginationHandler();
  };

  const searchBy = async (criteria = []) => {
    state.pages = [...state.initialPages];
    state.pages = state.pages.filter((entry) =>
      criteria.some((input) =>
        entry.dataset.title.toUpperCase().includes(input)
      )
    );
    state.currentPage = 1;
    document.querySelector(".pagination-container").innerHTML =
      renderPagination(state);
    document.querySelector(".btn-pagination").classList.add("active");
    document.querySelector(
      ".browse-counter"
    ).innerHTML = `<strong>Browse ${state.pages.length} files</strong>`;
    switchPages(
      ".videos-list",
      state.pages,
      state.itemsPerPage,
      state.currentPage
    );
    paginationHandler();
  };

  document.querySelector(".link-liked").addEventListener("click", (e) => {
    e.preventDefault();
    state.pages = [...state.initialPages];
    state.pages = state.pages.filter(
      (entry) => entry.dataset.status === "true"
    );
    state.currentPage = 1;
    document.querySelector(".pagination-container").innerHTML =
      renderPagination(state);
    document.querySelector(".btn-pagination").classList.add("active");
    document.querySelector(
      ".browse-counter"
    ).innerHTML = `<strong>Browse ${state.pages.length} files</strong>`;
    switchPages(
      ".videos-list",
      state.pages,
      state.itemsPerPage,
      state.currentPage
    );
    paginationHandler();
  });

  // Search form
  document.querySelector(".form-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputSearch = document
      .querySelector(".input-search")
      .value.trim()
      .toUpperCase()
      .split(" ");
    searchByServer(inputSearch);
  });

  // Search by property
  const linkNames = document.querySelectorAll(".link-name");
  for (const link of linkNames) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      searchBy(link.dataset.name.trim().toUpperCase().split(" "));
    });
  }

  const linkSeries = document.querySelectorAll(".link-series");
  for (const link of linkSeries) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      searchBy(link.dataset.series.trim().toUpperCase().split(" "));
    });
  }

  if (document.location.pathname === "/") {
    document.querySelector(
      ".browse-counter"
    ).innerHTML = `<strong>Browse ${state.pages.length} files</strong>`;
    document.querySelector(".pagination-container").innerHTML =
      renderPagination(state);
    document.querySelector(".btn-pagination").classList.add("active");
    const btnPrev = document.querySelector(".btn-prev");
    const btnNext = document.querySelector(".btn-next");

    btnPrev.addEventListener("click", (e) => {
      state.currentPage--;

      if (state.currentPage < 1) {
        state.currentPage = 1;
      }

      switchPages(
        ".videos-list",
        state.pages,
        state.itemsPerPage,
        state.currentPage
      );
      document.querySelector(".pagination-container").innerHTML =
        renderPagination(state);
      paginationHandler();
      updateActivePage();
      pageCounter();
    });

    btnNext.addEventListener("click", (e) => {
      const end = Math.ceil(state.pages.length / state.itemsPerPage);
      if (state.currentPage + 4 < end) {
        state.currentPage++;
      }

      if (state.currentPage > end) {
        state.currentPage = end;
      }

      switchPages(
        ".videos-list",
        state.pages,
        state.itemsPerPage,
        state.currentPage
      );
      document.querySelector(".pagination-container").innerHTML =
        renderPagination(state);
      paginationHandler();
      updateActivePage();
      pageCounter();
    });

    paginationHandler();
    switchPages(
      ".videos-list",
      state.pages,
      state.itemsPerPage,
      state.currentPage
    );
    switchItemsPerPage();
    pageCounter();
  }

  footerPusher();
});

// Scroll to top button
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
//window.onscroll = function() {scrollFunction()};

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
