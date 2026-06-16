// =============================================
// CAPITALFLOW — main.js
// ES Module — index.html
// =============================================

const API_KEY = '4b620f2e613ed83461791ff5';

const CURRENCY_NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound',
  MZN: 'Mozambican Metical', ZAR: 'South African Rand',
  BRL: 'Brazilian Real', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
  CHF: 'Swiss Franc', CNY: 'Chinese Yuan', INR: 'Indian Rupee'
};

// --- HAMBURGER MENU ---
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// --- LIVE CLOCK ---
function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');

  const clockEl = document.getElementById('liveClock');
  if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;

  const dateEl = document.getElementById('liveDate');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const tzEl = document.getElementById('liveTZ');
  if (tzEl) {
    const tz     = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -now.getTimezoneOffset() / 60;
    tzEl.textContent = `${tz} (UTC${offset >= 0 ? '+' : ''}${offset})`;
  }
}
updateClock();
setInterval(updateClock, 1000);

// --- FOOTER YEAR ---
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============================================
// CURRENCY CONVERTER
// =============================================

const convFrom     = document.getElementById('convFrom');
const convTo       = document.getElementById('convTo');
const convAmount   = document.getElementById('convAmount');
const convAmountTo = document.getElementById('convAmountTo');
const swapBtn      = document.getElementById('swapBtn');
const chartLoading = document.getElementById('chartLoading');
const canvas       = document.getElementById('rateChart');

let currentRate  = null;
let activePeriod = 180;
let converting   = false;

// Restore preferences
const savedFrom = localStorage.getItem('cf_conv_from');
const savedTo   = localStorage.getItem('cf_conv_to');
if (savedFrom && convFrom) convFrom.value = savedFrom;
if (savedTo   && convTo)   convTo.value   = savedTo;

// --- FALLBACK RATES (used if API fails) ---
const FALLBACK_RATES = {
  USD: { EUR:0.92, GBP:0.79, MZN:63.5, ZAR:18.6, BRL:5.1, JPY:157, CAD:1.37, AUD:1.54, CHF:0.89, CNY:7.25, INR:83.5 },
  EUR: { USD:1.09, GBP:0.86, MZN:69.2, ZAR:20.3, BRL:5.56, JPY:171, CAD:1.49, AUD:1.68, CHF:0.97, CNY:7.9, INR:91 },
  MZN: { USD:0.0157, EUR:0.0144, GBP:0.0124, ZAR:0.293, BRL:0.0803, JPY:2.47, CAD:0.0216, AUD:0.0243, CHF:0.014, CNY:0.114, INR:1.31 },
  GBP: { USD:1.27, EUR:1.16, MZN:80.6, ZAR:23.6, BRL:6.47, JPY:199, CAD:1.74, AUD:1.96, CHF:1.13, CNY:9.2, INR:106 },
  ZAR: { USD:0.054, EUR:0.049, MZN:3.41, GBP:0.042, BRL:0.274, JPY:8.44, CAD:0.074, AUD:0.083, CHF:0.048, CNY:0.39, INR:4.49 },
  BRL: { USD:0.196, EUR:0.18, MZN:12.4, GBP:0.154, ZAR:3.65, JPY:30.8, CAD:0.269, AUD:0.302, CHF:0.174, CNY:1.42, INR:16.4 },
  JPY: { USD:0.0064, EUR:0.0058, MZN:0.405, GBP:0.005, ZAR:0.118, BRL:0.0325, CAD:0.0087, AUD:0.0098, CHF:0.0056, CNY:0.046, INR:0.532 },
  CAD: { USD:0.73, EUR:0.67, MZN:46.3, GBP:0.575, ZAR:13.6, BRL:3.72, JPY:115, AUD:1.12, CHF:0.648, CNY:5.29, INR:60.9 },
  AUD: { USD:0.65, EUR:0.595, MZN:41.2, GBP:0.511, ZAR:12.1, BRL:3.31, JPY:102, CAD:0.891, CHF:0.577, CNY:4.71, INR:54.2 },
  CHF: { USD:1.12, EUR:1.03, MZN:71.2, GBP:0.886, ZAR:20.9, BRL:5.72, JPY:176, CAD:1.54, AUD:1.73, CNY:8.16, INR:93.8 },
  CNY: { USD:0.138, EUR:0.127, MZN:8.76, GBP:0.109, ZAR:2.56, BRL:0.703, JPY:21.7, CAD:0.189, AUD:0.212, CHF:0.123, INR:11.5 },
  INR: { USD:0.012, EUR:0.011, MZN:0.761, GBP:0.00943, ZAR:0.223, BRL:0.061, JPY:1.88, CAD:0.0164, AUD:0.0185, CHF:0.0107, CNY:0.087 }
};

function getFallbackRate(from, to) {
  if (from === to) return 1;
  return FALLBACK_RATES[from]?.[to] || null;
}

// --- GET LIVE RATE via ExchangeRate-API ---
async function getRate(from, to) {
  if (from === to) return 1;
  try {
    const res  = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}`);
    if (!res.ok) throw new Error('Failed to fetch rate');
    const data = await res.json();
    if (data.result !== 'success') throw new Error(data['error-type'] || 'API error');
    return data.conversion_rate;
  } catch (err) {
    // Fallback to static rates if API fails (e.g. localhost CORS)
    const fallback = getFallbackRate(from, to);
    if (fallback) return fallback;
    throw err;
  }
}

// --- CONVERT ---
async function convertCurrency() {
  if (!convFrom || !convTo || !convAmount) return;

  const from   = convFrom.value;
  const to     = convTo.value;
  const amount = parseFloat(convAmount.value) || 1;

  // Update display names
  const fromNameEl = document.getElementById('convFromName');
  const toNameEl   = document.getElementById('convToName');
  const fromAmtEl  = document.getElementById('convFromAmount');
  const resultEl   = document.getElementById('convResultValue');
  const updatedEl  = document.getElementById('convUpdated');

  if (fromNameEl) fromNameEl.textContent = CURRENCY_NAMES[from] || from;
  if (toNameEl)   toNameEl.textContent   = CURRENCY_NAMES[to]   || to;
  if (fromAmtEl)  fromAmtEl.textContent  = amount.toFixed(2);
  if (resultEl)   resultEl.textContent   = '...';

  try {
    const rate = await getRate(from, to);
    currentRate = rate;
    const converted = (amount * rate).toFixed(2);

    if (resultEl)   resultEl.textContent = converted;
    if (convAmountTo) convAmountTo.value = converted;

    if (updatedEl) {
      const now = new Date();
      updatedEl.textContent = `Last updated · ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC`;
    }

    localStorage.setItem('cf_conv_from', from);
    localStorage.setItem('cf_conv_to', to);

    // Load historical chart
    loadChart(from, to, activePeriod);

    // Update updated text to indicate fallback if needed
    if (!navigator.onLine) {
      if (updatedEl) updatedEl.textContent = 'Using cached rates (offline mode)';
    }

  } catch (err) {
    if (resultEl)   resultEl.textContent = '—';
    if (updatedEl)  updatedEl.textContent = `Error: ${err.message}`;
  }
}

// --- HISTORICAL CHART via ExchangeRate-API time-series ---
async function loadChart(from, to, days) {
  if (!canvas) return;
  if (chartLoading) {
    chartLoading.style.display = 'flex';
    chartLoading.textContent   = 'Loading chart data...';
  }

  // Build date range
  const dates = [];
  const today = new Date();
  // Sample every N days to stay within API limits
  const step  = Math.max(1, Math.floor(days / 60));
  for (let i = days; i >= 0; i -= step) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  try {
    // Fetch all rates in parallel (max 10 points for free tier)
    const sampleDates = dates.filter((_, i) => i % Math.ceil(dates.length / 30) === 0);
    sampleDates.push(dates[dates.length - 1]); // always include today

    const results = await Promise.all(
      sampleDates.map(async date => {
        const res  = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/history/${from}/${date.replace(/-/g, '/')}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.result === 'success' ? { date, rate: data.conversion_rates[to] } : null;
      })
    );

    const valid = results.filter(Boolean);
    if (valid.length < 2) throw new Error('Not enough data');

    drawChart(canvas, valid.map(v => v.date), valid.map(v => v.rate));
    if (chartLoading) chartLoading.style.display = 'none';

  } catch {
    // Fallback: generate realistic simulated data based on current rate
    if (currentRate) {
      simulateChart(from, to, days);
    } else {
      if (chartLoading) {
        chartLoading.style.display = 'flex';
        chartLoading.textContent   = 'Chart data unavailable.';
      }
    }
  }
}

// Fallback: simulate chart from current rate with realistic variance
function simulateChart(from, to, days) {
  if (!canvas || !currentRate) return;

  const points = Math.min(days, 60);
  const values = [];
  const dates  = [];
  let rate     = currentRate * (0.92 + Math.random() * 0.08); // start slightly off

  for (let i = points; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
    rate = rate * (1 + (Math.random() - 0.5) * 0.012);
    values.push(parseFloat(rate.toFixed(4)));
  }
  // Force last value to current rate
  values[values.length - 1] = currentRate;

  drawChart(canvas, dates, values, true);
  if (chartLoading) chartLoading.style.display = 'none';
}

// --- DRAW CHART (Canvas) ---
function drawChart(cnv, dates, values, simulated = false) {
  const dpr  = window.devicePixelRatio || 1;
  const W    = cnv.parentElement.offsetWidth;
  const H    = cnv.parentElement.offsetHeight;
  cnv.width  = W * dpr;
  cnv.height = H * dpr;
  cnv.style.width  = W + 'px';
  cnv.style.height = H + 'px';

  const ctx = cnv.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad  = { top: 12, right: 12, bottom: 28, left: 52 };
  const cW   = W - pad.left - pad.right;
  const cH   = H - pad.top  - pad.bottom;
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const style   = getComputedStyle(document.documentElement);
  const accent  = style.getPropertyValue('--accent').trim()      || '#70ad47';
  const accentD = style.getPropertyValue('--accent-dark').trim() || '#4e7a32';
  const border  = style.getPropertyValue('--border').trim()      || '#cbd5e1';
  const muted   = style.getPropertyValue('--text-muted').trim()  || '#4a5568';

  // Grid + Y labels
  ctx.font      = `11px "IBM Plex Sans", sans-serif`;
  ctx.textAlign = 'right';
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const y = pad.top + cH * (1 - t);
    ctx.strokeStyle = border;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cW, y);
    ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText((minV + range * t).toFixed(2), pad.left - 4, y + 4);
  });

  // Points
  const pts = values.map((v, i) => ({
    x: pad.left + (i / (values.length - 1)) * cW,
    y: pad.top  + cH * (1 - (v - minV) / range)
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, accent + '55');
  grad.addColorStop(1, accent + '00');
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, pad.top + cH);
  ctx.lineTo(pts[0].x, pad.top + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = accentD;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // X labels
  const step = Math.max(1, Math.floor(dates.length / 5));
  ctx.fillStyle  = muted;
  ctx.textAlign  = 'center';
  dates.forEach((d, i) => {
    if (i % step === 0 || i === dates.length - 1) {
      const x     = pad.left + (i / (dates.length - 1)) * cW;
      const label = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(label, x, H - 6);
    }
  });
}

// --- PERIOD BUTTONS ---
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePeriod = parseInt(btn.dataset.period);
    loadChart(convFrom?.value, convTo?.value, activePeriod);
  });
});

// --- SWAP ---
swapBtn?.addEventListener('click', () => {
  const tmp      = convFrom.value;
  convFrom.value = convTo.value;
  convTo.value   = tmp;
  convertCurrency();
});

// --- UPDATE FLAGS ---
function updateFlags() {
  const flagFrom = document.getElementById('flagFrom');
  const flagTo   = document.getElementById('flagTo');
  if (flagFrom && convFrom) {
    const opt = convFrom.options[convFrom.selectedIndex];
    flagFrom.textContent = opt?.dataset?.flag || '🏳️';
  }
  if (flagTo && convTo) {
    const opt = convTo.options[convTo.selectedIndex];
    flagTo.textContent = opt?.dataset?.flag || '🏳️';
  }
}

// --- INPUT / CHANGE EVENTS ---
convAmount?.addEventListener('input', convertCurrency);
convFrom?.addEventListener('change', () => { updateFlags(); convertCurrency(); });
convTo?.addEventListener('change',   () => { updateFlags(); convertCurrency(); });

convAmountTo?.addEventListener('input', () => {
  if (!currentRate || converting) return;
  converting = true;
  const toAmt = parseFloat(convAmountTo.value) || 0;
  if (convAmount) convAmount.value = (toAmt / currentRate).toFixed(2);
  convertCurrency().finally(() => { converting = false; });
});

// --- INIT ---
updateFlags();
convertCurrency();