export default ({
  images,
  linkImage,
  btnPlayURL,
  btnLiked,
  item,
  date,
  series,
  name,
  liked,
  watched,
  btnWatched,
}) => {
  let template;
  const randomImage = Math.floor(Math.random() * 10 + Math.random() * 10);

  // Single image
  const imagesTemplate = `
          <a href="/${item}" title="${
    images[0]
  }" target="_blank" class="d-block mb-3 ${linkImage}">
            <img src="https://placehold.co/320x180" data-src="/${item}/${
    //images[randomImage < images.length ? randomImage : 0]
    images[0]
  }" alt="${item}" class="rounded-2" />
          </a>
        `;

  const btnPlayTemplate =
    btnPlayURL && btnPlayURL !== "https://mega.nz/embed/link!1m!1a"
      ? `<a href="${btnPlayURL}" title="${item}" target="_blank" class="btn btn-play">Play</a>`
      : "";

  template += `
      <article class="d-flex align-self-stretch col-xs-12 col-sm-12 col-md-6 col-xl-4 col-xxl-3 p-2 videos-item" data-date="${date}" data-series="${series}" data-title="${item}" data-status="${liked}" data-watched="${watched}">
        <div class="overflow-hidden pb-2 px-1 box">
          ${btnLiked}
          ${btnWatched}
          <div class="d-flex py-2">
            <p class="mb-0 col-4 date">${date}</p>
            <p class="mb-0 col-8 series text-truncate">
              <a href="/" data-series="${series}" title="${series}" class="d-inline-block px-1 bg-dark link-series text-white">${series}</a>
            </p>
          </div>  
          ${imagesTemplate}
          <p class="overflow-hidden text-truncate">${item}</p>
          <p class="name">
            <a href="/" data-name="${name}" title="${name}" class="link-name">${name}</a>
          </p>
          <a href="/${item}" title="${item}" target="_blank" class="btn btn-gallery">Gallery</a>
          ${btnPlayTemplate}
        </div>
      </article> 
      `;

  return template;
};
