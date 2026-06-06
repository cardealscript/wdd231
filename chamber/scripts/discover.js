// ── MBC · discover.js ───────────────────────────────────────────────
import spots from '../data/spots.mjs';

// ① Footer
document.getElementById('footer-year').textContent = new Date().getFullYear();
document.getElementById('last-modified').textContent = new Date(document.lastModified).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

// ② Hamburger
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');
hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// ③ localStorage visit message
const banner = document.getElementById('visitor-banner');
const lastVisit = localStorage.getItem('discover-last-visit');
const now = Date.now();

if (!lastVisit) {
  banner.textContent = '👋 Welcome! Let us know if you have any questions.';
} else {
  const daysDiff = Math.floor((now - Number(lastVisit)) / (1000 * 60 * 60 * 24));
  if (daysDiff < 1) {
    banner.textContent = '😊 Back so soon! Awesome!';
  } else if (daysDiff === 1) {
    banner.textContent = 'You last visited 1 day ago.';
  } else {
    banner.textContent = `You last visited ${daysDiff} days ago.`;
  }
}
localStorage.setItem('discover-last-visit', now);

// ④ Build cards
const grid = document.getElementById('spots-grid');

spots.forEach((spot, index) => {
  const card = document.createElement('article');
  card.className = 'spot-card';
  card.style.gridArea = `spot${index + 1}`;

  card.innerHTML = `
    <figure>
      <img
        src="${spot.image}"
        alt="${spot.name}"
        loading="lazy"
        width="300"
        height="200"
      >
    </figure>
    <div class="spot-body">
      <h2>${spot.name}</h2>
      <address>${spot.address}</address>
      <p>${spot.description}</p>
      <button type="button">Learn More</button>
    </div>
  `;

  grid.appendChild(card);
});