import './css/styles.css';
import _ from 'lodash';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('.searchQuery');
const searchButton = document.querySelector('.submit-btn');
let pagesLoaded = 0;
let imagesLoaded = 0;
let hits = 1;

searchButton.addEventListener('click', handleSubmit);

async function getImages(input, page = 1, outcomes = 40) {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: '33185043-dc389dc3b605958bff2737f65',
      orientation: 'horizontal',
      q: input,
      image_type: 'photo',
      safesearch: 'true',
      page: page,
      per_page: outcomes,
    },
  });
  hits = response.data.totalHits;
  imagesLoaded += 40;
  return response.data;
}

function handleSubmit(event) {
  event.preventDefault();
  imagesLoaded = 0;
  getImages(searchInput.value).then(results => {
    if (results.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (imagesLoaded >= hits) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      renderCards(results.hits);
      Notiflix.Notify.success(`Hooray! We found ${results.totalHits} images.`);
    }
  });
  window.addEventListener('scroll', _.throttle(handleScroll, 1000));
}

pagesLoaded = 1;
function renderCards(hits, clear = true) {
  if (clear) {
    gallery.innerHTML = '';
  }

  hits.forEach(elem => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const lightBoxLink = document.createElement('a');
    lightBoxLink.setAttribute('href', elem['largeImageURL']);

    const image = document.createElement('img');
    image.src = elem['webformatURL'];
    image.alt = elem['tags'];
    image.setAttribute('loading', 'lazy');

    const info = document.createElement('div');
    info.classList.add('info');
    info.insertAdjacentHTML(
      'beforeend',
      `<p class="info-item">
      <b>Likes</b> </br>
      ${elem['likes']}
    </p>
    <p class="info-item">
      <b>Views</b></br>
      ${elem['views']}
    </p>
    <p class="info-item">
      <b>Comments</b></br>
      ${elem['comments']}
    </p>
    <p class="info-item">
      <b>Downloads</b></br>
      ${elem['downloads']}
    </p>`
    );

    lightBoxLink.insertAdjacentElement('beforeend', image);
    card.insertAdjacentElement('beforeend', lightBoxLink);
    card.insertAdjacentElement('beforeend', info);
    gallery.insertAdjacentElement('beforeend', card);
  });

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  smoothScrolling();

  function smoothScrolling() {
    console.log('Smooth scrolling');
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
  lightbox.refresh();
}

function handleScroll() {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
  if (endOfPage) {
    if (imagesLoaded >= hits) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    pagesLoaded += 1;
    getImages(searchInput.value, pagesLoaded).then(results => {
      renderCards(results.hits, false);
    });
  }
}
