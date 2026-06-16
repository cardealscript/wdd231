// =============================================
// CAPITALFLOW — dashboard.js
// ES Module — dashboard.html
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
// STATE — localStorage
// =============================================

const STORAGE_KEY      = 'cf_transactions';
const CATEGORIES_KEY   = 'cf_categories';
const CURRENCY_KEY     = 'cf_currency';

const DEFAULT_CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Investment', 'Other Income'],
  expense: ['Rent', 'Food', 'Transport', 'Water', 'Electricity', 'Internet', 'Health', 'Education', 'Entertainment', 'Other']
};

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveTransactions(txs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || { ...DEFAULT_CATEGORIES };
  } catch { return { ...DEFAULT_CATEGORIES }; }
}

function saveCategories(cats) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

function loadCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'USD';
}

function saveCurrency(c) {
  localStorage.setItem(CURRENCY_KEY, c);
}

let transactions = loadTransactions();
let categories   = loadCategories();
let currency     = loadCurrency();

// =============================================
// CURRENCY SYMBOLS
// =============================================
const SYMBOLS = { USD: '$', EUR: '€', MZN: 'MT', ZAR: 'R', GBP: '£', BRL: 'R$' };
function sym() { return SYMBOLS[currency] || currency + ' '; }
function fmt(n) { return `${sym()}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

// =============================================
// SUMMARY
// =============================================
function updateSummary() {
  const income   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;

  document.getElementById('totalIncome').textContent   = fmt(income);
  document.getElementById('totalExpenses').textContent = fmt(expenses);

  const balEl = document.getElementById('netBalance');
  balEl.textContent = fmt(balance);
  balEl.className   = `summary-value${balance < 0 ? ' negative' : ''}`;
}

// =============================================
// CATEGORY SELECT — build options
// =============================================
function buildCategorySelect() {
  const sel  = document.getElementById('txCategory');
  const type = document.getElementById('txType').value;
  const cats = categories[type] || [];

  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

document.getElementById('txType')?.addEventListener('change', buildCategorySelect);

// =============================================
// FILTER SELECT — category options
// =============================================
function buildFilterCategory() {
  const sel  = document.getElementById('filterCategory');
  const all  = [...new Set(transactions.map(t => t.category))].sort();
  sel.innerHTML = `<option value="all">All Categories</option>` +
    all.map(c => `<option value="${c}">${c}</option>`).join('');
}

// =============================================
// TRANSACTIONS TABLE
// =============================================
function renderTransactions() {
  const tbody    = document.getElementById('txBody');
  const emptyMsg = document.getElementById('txEmpty');
  const typeF    = document.getElementById('filterType').value;
  const catF     = document.getElementById('filterCategory').value;

  const filtered = transactions
    .filter(t => typeF === 'all' || t.type === typeF)
    .filter(t => catF  === 'all' || t.category === catF)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.add('visible');
    document.getElementById('txTable').style.display = 'none';
    return;
  }

  emptyMsg.classList.remove('visible');
  document.getElementById('txTable').style.display = '';

  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td>${new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>${t.description || '—'}</td>
      <td><span class="cf-badge cf-badge-${t.type === 'income' ? 'income' : 'expense'}">${t.category}</span></td>
      <td><span class="cf-badge cf-badge-${t.type === 'income' ? 'income' : 'expense'}">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span></td>
      <td class="tx-amount-${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</td>
      <td>
        <button class="btn-delete" data-id="${t.id}" aria-label="Delete transaction">
          <img src="images/icons/trash3.svg" alt="" width="14" height="14" aria-hidden="true">
        </button>
      </td>
    </tr>
  `).join('');

  // Delete buttons
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
  });
}

// =============================================
// CHART — Canvas API
// =============================================
function getMonthOptions() {
  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();
  return months;
}

function populateMonthSelect() {
  const sel    = document.getElementById('chartMonth');
  const months = getMonthOptions();

  if (months.length === 0) {
    sel.innerHTML = `<option>No data</option>`;
    return;
  }

  sel.innerHTML = months.map(m => {
    const [y, mo] = m.split('-');
    const label   = new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `<option value="${m}">${label}</option>`;
  }).join('');
}

function drawDashChart() {
  const canvas   = document.getElementById('dashChart');
  const emptyMsg = document.getElementById('chartEmpty');
  const sel      = document.getElementById('chartMonth');
  const month    = sel.value;

  if (!month || month === 'No data' || transactions.length === 0) {
    emptyMsg.classList.remove('hidden');
    if (canvas) canvas.style.display = 'none';
    document.getElementById('categoryBreakdown').innerHTML = '';
    return;
  }

  const monthTx = transactions.filter(t => t.date.startsWith(month));
  if (monthTx.length === 0) {
    emptyMsg.classList.remove('hidden');
    if (canvas) canvas.style.display = 'none';
    return;
  }

  emptyMsg.classList.add('hidden');
  canvas.style.display = '';

  // Aggregate by day
  const income   = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;

  // Group expenses by category for breakdown
  const expCats = {};
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    expCats[t.category] = (expCats[t.category] || 0) + t.amount;
  });

  // Draw bar chart
  const dpr  = window.devicePixelRatio || 1;
  const W    = canvas.parentElement.offsetWidth;
  const H    = canvas.parentElement.offsetHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx  = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const style   = getComputedStyle(document.documentElement);
  const accent  = style.getPropertyValue('--accent').trim();
  const danger  = style.getPropertyValue('--danger').trim();
  const info    = style.getPropertyValue('--info').trim();
  const border  = style.getPropertyValue('--border').trim();
  const muted   = style.getPropertyValue('--text-muted').trim();
  const bgCard  = style.getPropertyValue('--bg-card').trim();

  const pad   = { top: 30, right: 20, bottom: 44, left: 68 };
  const cW    = W - pad.left - pad.right;
  const cH    = H - pad.top  - pad.bottom;
  const maxV  = Math.max(income, expenses, 1);
  const bars  = [
    { label: 'Income',   value: income,   color: accent },
    { label: 'Expenses', value: expenses, color: danger },
    { label: 'Balance',  value: Math.abs(balance), color: balance >= 0 ? accent : danger }
  ];

  const barW  = Math.min(cW / (bars.length * 2), 70);
  const gap   = (cW - bars.length * barW) / (bars.length + 1);

  // Grid lines + Y labels
  ctx.font      = `10px "IBM Plex Sans", sans-serif`;
  ctx.textAlign = 'right';
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const y   = pad.top + cH * (1 - t);
    const val = maxV * t;
    // Shorten label for large numbers
    let label;
    if (val >= 1000000) label = sym() + (val/1000000).toFixed(1) + 'M';
    else if (val >= 1000) label = sym() + (val/1000).toFixed(1) + 'k';
    else label = fmt(val);
    ctx.strokeStyle = border;
    ctx.lineWidth   = 0.5;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText(label, pad.left - 4, y + 3);
  });

  // Bars
  bars.forEach((bar, i) => {
    const x  = pad.left + gap + i * (barW + gap);
    const bH = (bar.value / maxV) * cH;
    const y  = pad.top + cH - bH;

    // Bar
    ctx.fillStyle = bar.color;
    ctx.beginPath();
    ctx.roundRect?.(x, y, barW, bH, [4, 4, 0, 0]) || ctx.rect(x, y, barW, bH);
    ctx.fill();

    // Value label — only if bar is tall enough to avoid overlap
    ctx.fillStyle = muted;
    ctx.textAlign = 'center';
    ctx.font      = `10px "IBM Plex Sans", sans-serif`;
    const label   = fmt(bar.value);
    // Measure text width — skip if would overlap
    const tw = ctx.measureText(label).width;
    if (tw < barW + 4) {
      ctx.fillText(label, x + barW / 2, Math.max(y - 5, pad.top + 10));
    }

    // X label below bar
    ctx.font      = `10px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = muted;
    ctx.fillText(bar.label, x + barW / 2, pad.top + cH + 16);
  });

  // Balance label — top center, smaller
  const balLabel = balance >= 0 ? `Saved: ${fmt(balance)}` : `Deficit: ${fmt(balance)}`;
  ctx.fillStyle = balance >= 0 ? accent : danger;
  ctx.textAlign = 'center';
  ctx.font      = `10px "IBM Plex Sans", sans-serif`;
  ctx.fillText(balLabel, pad.left + cW / 2, pad.top - 6);

  // Category breakdown
  renderCategoryBreakdown(expCats, expenses);
}

function renderCategoryBreakdown(expCats, total) {
  const wrap = document.getElementById('categoryBreakdown');
  if (!wrap) return;

  const sorted = Object.entries(expCats).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `
    <p style="font-size:.72rem;font-weight:600;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;">Expenses by Category</p>
    ${sorted.map(([cat, amount]) => `
      <div class="cat-row">
        <span class="cat-row-label">${cat}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar expense" style="width:${Math.round((amount / total) * 100)}%"></div>
        </div>
        <span class="cat-row-amount">${fmt(amount)}</span>
      </div>
    `).join('')}
  `;
}

// =============================================
// ADD TRANSACTION
// =============================================
document.getElementById('transactionForm')?.addEventListener('submit', e => {
  e.preventDefault();

  const type        = document.getElementById('txType').value;
  const amount      = parseFloat(document.getElementById('txAmount').value);
  const category    = document.getElementById('txCategory').value;
  const date        = document.getElementById('txDate').value;
  const description = document.getElementById('txDescription').value.trim();

  // Validation
  let valid = true;
  ['txAmount', 'txCategory', 'txDate'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.toggle('error', !el.value);
    if (!el.value) valid = false;
  });
  if (!amount || amount <= 0) {
    document.getElementById('txAmount').classList.add('error');
    valid = false;
  }
  if (!valid) return;

  const tx = {
    id:          Date.now().toString(),
    type,
    amount,
    category,
    date,
    description
  };

  transactions.push(tx);
  saveTransactions(transactions);

  // Reset form
  e.target.reset();
  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
  buildCategorySelect();

  refreshAll();
});

// =============================================
// DELETE TRANSACTION
// =============================================
let pendingDeleteId = null;

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById('deleteModal').classList.add('open');
}

document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  transactions = transactions.filter(t => t.id !== pendingDeleteId);
  saveTransactions(transactions);
  pendingDeleteId = null;
  document.getElementById('deleteModal').classList.remove('open');
  refreshAll();
});

['deleteModalClose', 'cancelDeleteBtn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('open');
    pendingDeleteId = null;
  });
});

// =============================================
// CLEAR ALL
// =============================================
document.getElementById('clearAllBtn')?.addEventListener('click', () => {
  if (!confirm('Delete ALL transactions? This cannot be undone.')) return;
  transactions = [];
  saveTransactions(transactions);
  refreshAll();
});

// =============================================
// ADD CATEGORY MODAL
// =============================================
document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
  document.getElementById('categoryModal').classList.add('open');
});

['modalClose', 'cancelModalBtn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', () => {
    document.getElementById('categoryModal').classList.remove('open');
    document.getElementById('newCategoryName').value = '';
  });
});

document.getElementById('saveCategoryBtn')?.addEventListener('click', () => {
  const name = document.getElementById('newCategoryName').value.trim();
  const type = document.getElementById('newCategoryType').value;

  if (!name) return;
  if (!categories[type].includes(name)) {
    categories[type].push(name);
    saveCategories(categories);
  }

  document.getElementById('txType').value = type;
  buildCategorySelect();
  document.getElementById('txCategory').value = name;
  document.getElementById('categoryModal').classList.remove('open');
  document.getElementById('newCategoryName').value = '';
});

// Close modals on overlay click
document.querySelectorAll('.cf-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// =============================================
// CURRENCY CHANGE
// =============================================
document.getElementById('currencySelect')?.addEventListener('change', e => {
  currency = e.target.value;
  saveCurrency(currency);
  refreshAll();
});

// =============================================
// FILTERS
// =============================================
document.getElementById('filterType')?.addEventListener('change', renderTransactions);
document.getElementById('filterCategory')?.addEventListener('change', renderTransactions);
document.getElementById('chartMonth')?.addEventListener('change', drawDashChart);

// =============================================
// REFRESH ALL
// =============================================
function refreshAll() {
  updateSummary();
  populateMonthSelect();
  buildCategorySelect();
  buildFilterCategory();
  renderTransactions();
  drawDashChart();
}

// =============================================
// INIT
// =============================================
document.getElementById('currencySelect').value = currency;
document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
refreshAll();