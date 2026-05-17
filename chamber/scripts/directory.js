// ── MBC · directory.js ──────────────────────────────────────────────

// ① Footer: year and last modified
document.getElementById('footer-year').textContent = new Date().getFullYear();
document.getElementById('last-modified').textContent = new Date(document.lastModified).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// ② Helper: get initials from company name
function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

// ③ Helper: membership level → label and CSS class
function getMembership(level) {
  if (level === 3) return { label: 'Gold',   cls: 'badge-gold'   };
  if (level === 2) return { label: 'Silver', cls: 'badge-silver' };
  return              { label: 'Member', cls: 'badge-member' };
}

// ④ Build a GRID card
function buildCard(member) {
  const { label, cls } = getMembership(member.membership);
  const initials = getInitials(member.name);

  const card = document.createElement('article');
  card.className = 'member-card';

  card.innerHTML = `
    <div class="card-logo">
      <img
        src="images/${member.image}"
        alt="${member.name} logo"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      >
      <div class="card-initials" aria-hidden="true" style="display:none">${initials}</div>
    </div>
    <div class="card-body">
      <h2 class="card-name">${member.name}</h2>
      <p class="card-addr">
        <img src="images/geo-alt.svg" alt=""> ${member.address}
      </p>
      <p class="card-phone">
        <img src="images/telephone.svg" alt=""> ${member.phone}
      </p>
      <a class="card-link" href="${member.website}" target="_blank" rel="noopener noreferrer">
        <img src="images/globe2.svg" alt=""> Visit website
      </a>
      <span class="card-badge ${cls}">${label}</span>
    </div>
  `;

  return card;
}

// ⑤ Build a LIST row
function buildRow(member) {
  const { label, cls } = getMembership(member.membership);

  const row = document.createElement('article');
  row.className = 'member-row';

  row.innerHTML = `
    <span class="row-dot ${cls.replace('badge-', 'dot-')}"></span>
    <span class="row-name">${member.name}</span>
    <span class="row-addr">${member.address}</span>
    <span class="row-phone">${member.phone}</span>
    <span class="row-badge ${cls}">${label}</span>
  `;

  return row;
}

// ⑥ Render members into the container
function renderMembers(members, view) {
  const container = document.getElementById('members-container');
  container.innerHTML = '';

  // Sort: Gold (3) → Silver (2) → Member (1)
  const sorted = [...members].sort((a, b) => b.membership - a.membership);

  // Set container class based on view
  container.className = view === 'grid' ? 'members-grid' : 'members-list';

  sorted.forEach(member => {
    const el = view === 'grid' ? buildCard(member) : buildRow(member);
    container.appendChild(el);
  });

  // Update counter
  document.getElementById('member-count').textContent = members.length;
}

// ⑦ Toggle logic
let currentView = localStorage.getItem('mbc-view') || 'grid';

const btnGrid = document.getElementById('btn-grid');
const btnList = document.getElementById('btn-list');

function setView(view) {
  currentView = view;
  localStorage.setItem('mbc-view', view);

  btnGrid.classList.toggle('active', view === 'grid');
  btnList.classList.toggle('active', view === 'list');
  btnGrid.setAttribute('aria-pressed', view === 'grid');
  btnList.setAttribute('aria-pressed', view === 'list');

  if (window.__members) renderMembers(window.__members, view);
}

btnGrid.addEventListener('click', () => setView('grid'));
btnList.addEventListener('click', () => setView('list'));

// ⑧ Hamburger menu
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// ⑨ Fetch members.json with async/await
async function loadMembers() {
  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const members = await response.json();
    window.__members = members;
    renderMembers(members, currentView);
    setView(currentView); // restore toggle state visually

  } catch (error) {
    document.getElementById('members-container').innerHTML =
      `<p class="error-msg">Could not load members. Please try again later.</p>`;
    console.error('Failed to load members.json:', error);
  }
}

loadMembers();