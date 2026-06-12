// =============================================
// CAPITALFLOW — tips.js
// ES Module — tips.html
// =============================================

// --- HAMBURGER ---
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');
menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

// --- FOOTER YEAR ---
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============================================
// STATE
// =============================================
let allTips       = [];
let activeCategory = 'all';
let activeLevel    = 'all';
let searchQuery    = '';

// =============================================
// FETCH TIPS — Fetch API + try/catch
// =============================================
async function fetchTips() {
  const loading = document.getElementById('tipsLoading');
  const grid    = document.getElementById('tipsGrid');

  try {
    const response = await fetch('./data/tips.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    allTips = data;

    loading.classList.add('hidden');
    renderTips();

  } catch (error) {
    loading.innerHTML = `<p style="color:var(--danger)">Failed to load tips: ${error.message}</p>`;
    console.error('Tips fetch error:', error);
  }
}

// =============================================
// RENDER TIPS
// =============================================
function renderTips() {
  const grid      = document.getElementById('tipsGrid');
  const emptyEl   = document.getElementById('tipsEmpty');
  const countEl   = document.getElementById('tipsCount');

  // Filter using array methods
  const filtered = allTips
    .filter(tip => activeCategory === 'all' || tip.category === activeCategory)
    .filter(tip => activeLevel    === 'all' || tip.level    === activeLevel)
    .filter(tip => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tip.title.toLowerCase().includes(q)    ||
        tip.summary.toLowerCase().includes(q)  ||
        tip.category.toLowerCase().includes(q) ||
        tip.tag.toLowerCase().includes(q)
      );
    });

  // Update count
  countEl.textContent = `${filtered.length} tip${filtered.length !== 1 ? 's' : ''}`;

  // Empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  // Render cards using map + template literals
  grid.innerHTML = filtered.map((tip, index) => `
    <article
      class="tip-card fade-up"
      data-id="${tip.id}"
      style="animation-delay:${index * 0.04}s"
      tabindex="0"
      role="button"
      aria-label="Read more about ${tip.title}"
    >
      <div class="tip-card-top">
        <span class="tip-icon" aria-hidden="true">${tip.icon}</span>
        <div class="tip-badges">
          <span class="badge badge-${tip.category.toLowerCase()}">${tip.category}</span>
        </div>
      </div>

      <h3>${tip.title}</h3>
      <p>${tip.summary}</p>

      <div class="tip-card-footer">
        <span class="tip-card-level ${tip.level.toLowerCase()}">${tip.level}</span>
        <button class="btn-tip-detail" data-id="${tip.id}" aria-label="Read full tip: ${tip.title}">
          Read more
          <img src="images/icons/arrow-right-circle.svg" alt="" width="14" height="14" aria-hidden="true">
        </button>
      </div>
    </article>
  `).join('');

  // Event listeners on cards
  grid.querySelectorAll('.tip-card').forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openModal(parseInt(card.dataset.id));
    });
  });

  // Read more buttons (stop propagation to avoid double open)
  grid.querySelectorAll('.btn-tip-detail').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(parseInt(btn.dataset.id));
    });
  });
}

// =============================================
// MODAL
// =============================================
function openModal(id) {
  const tip = allTips.find(t => t.id === id);
  if (!tip) return;

  document.getElementById('tipModalIcon').textContent     = tip.icon;
  document.getElementById('tipModalTitle').textContent    = tip.title;
  document.getElementById('tipModalSummary').textContent  = tip.summary;
  document.getElementById('tipModalDetail').textContent   = tip.detail;

  const catEl  = document.getElementById('tipModalCategory');
  catEl.textContent = tip.category;
  catEl.className   = `badge badge-${tip.category.toLowerCase()}`;

  const lvlEl  = document.getElementById('tipModalLevel');
  lvlEl.textContent = tip.level;
  lvlEl.className   = 'badge badge-level';

  const tagEl  = document.getElementById('tipModalTag');
  tagEl.textContent = tip.tag;
  tagEl.className   = 'badge badge-tag';

  document.getElementById('tipModal').classList.add('open');

  // Save last viewed tip to localStorage
  localStorage.setItem('cf_last_tip', id);
}

function closeModal() {
  document.getElementById('tipModal').classList.remove('open');
}

document.getElementById('tipModalClose')?.addEventListener('click', closeModal);
document.getElementById('tipModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('tipModal')) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// =============================================
// FILTERS
// =============================================

// Category chips
document.getElementById('filterChips')?.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeCategory = chip.dataset.category;
    renderTips();
  });
});

// Level filter
document.getElementById('levelFilter')?.addEventListener('change', e => {
  activeLevel = e.target.value;
  renderTips();
});

// Search
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  renderTips();
});

// Clear filters
document.getElementById('clearSearch')?.addEventListener('click', () => {
  searchQuery    = '';
  activeCategory = 'all';
  activeLevel    = 'all';
  document.getElementById('searchInput').value = '';
  document.getElementById('levelFilter').value = 'all';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip[data-category="all"]').classList.add('active');
  renderTips();
});

// =============================================
// INIT
// =============================================
fetchTips();