// ── MBC · home.js ───────────────────────────────────────────────────

// ① Footer
document.getElementById('footer-year').textContent = new Date().getFullYear();
document.getElementById('last-modified').textContent = new Date(document.lastModified).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

// ② Hamburger menu
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// ③ Weather — Maputo, Mozambique (lat: -25.97, lon: 32.59)
const WEATHER_API_KEY = '05be8c44514e78b99e7621485d180c36';
const LAT = -25.97;
const LON = 32.59;

async function loadWeather() {
  try {
    // Current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;
    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) throw new Error('Weather fetch failed');
    const current = await currentRes.json();

    const iconCode = current.weather[0].icon;
    document.getElementById('weather-current').innerHTML = `
      <div class="weather-icon">
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${current.weather[0].description}">
      </div>
      <div>
        <div class="weather-temp">${Math.round(current.main.temp)}°C</div>
        <div class="weather-desc">${current.weather[0].description}</div>
      </div>
    `;

    // 3-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error('Forecast fetch failed');
    const forecastData = await forecastRes.json();

    // Get one entry per day (noon reading) for next 3 days
    const today = new Date().toISOString().split('T')[0];
    const days = [];
    const seen = new Set();

    for (const item of forecastData.list) {
      const date = item.dt_txt.split(' ')[0];
      if (date === today) continue;
      if (seen.has(date)) continue;
      seen.add(date);
      days.push(item);
      if (days.length === 3) break;
    }

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    document.getElementById('weather-forecast').innerHTML = days.map(day => {
      const d = new Date(day.dt_txt);
      const label = dayNames[d.getDay()];
      const icon  = day.weather[0].icon;
      const temp  = Math.round(day.main.temp);
      return `
        <div class="forecast-day">
          <div class="f-label">${label}</div>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${day.weather[0].description}">
          <div class="f-temp">${temp}°C</div>
        </div>
      `;
    }).join('');

  } catch (err) {
    document.getElementById('weather-current').innerHTML =
      `<p class="weather-loading">Weather data unavailable.</p>`;
    console.error('Weather error:', err);
  }
}

// ④ Spotlights — random 3 gold/silver members
async function loadSpotlights() {
  try {
    const res = await fetch('data/members.json');
    if (!res.ok) throw new Error('Members fetch failed');
    const members = await res.json();

    // Filter gold (3) and silver (2) only
    const eligible = members.filter(m => m.membership >= 2);

    // Shuffle and pick 3
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);

    function getMembership(level) {
      if (level === 3) return { label: 'Gold',   cls: 'badge-gold'   };
      if (level === 2) return { label: 'Silver', cls: 'badge-silver' };
      return              { label: 'Member', cls: 'badge-member' };
    }

    function getInitials(name) {
      return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    document.getElementById('spotlights-container').innerHTML = picks.map(m => {
      const { label, cls } = getMembership(m.membership);
      const initials = getInitials(m.name);
      return `
        <article class="spotlight-card">
          <div class="spotlight-logo">
            <img
              src="images/${m.image}"
              alt="${m.name} logo"
              loading="lazy"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="spotlight-initials" style="display:none">${initials}</div>
          </div>
          <div class="spotlight-body">
            <div class="spotlight-name">${m.name}</div>
            <div class="spotlight-detail">
              <img src="images/geo-alt.svg" alt=""> ${m.address}
            </div>
            <div class="spotlight-detail">
              <img src="images/telephone.svg" alt=""> ${m.phone}
            </div>
            <a class="spotlight-link" href="${m.website}" target="_blank" rel="noopener noreferrer">
              🌐 Visit website
            </a>
            <span class="spotlight-badge ${cls}">${label}</span>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    document.getElementById('spotlights-container').innerHTML =
      `<p class="weather-loading">Spotlights unavailable.</p>`;
    console.error('Spotlights error:', err);
  }
}

// ⑤ Init
loadWeather();
loadSpotlights();