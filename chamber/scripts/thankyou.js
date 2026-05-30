// ── MBC · thankyou.js ───────────────────────────────────────────────

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

// ③ Read URL params and display
const params = new URLSearchParams(window.location.search);

document.getElementById('td-fname').textContent     = params.get('fname')    || '—';
document.getElementById('td-lname').textContent     = params.get('lname')    || '—';
document.getElementById('td-email').textContent     = params.get('email')    || '—';
document.getElementById('td-phone').textContent     = params.get('phone')    || '—';
document.getElementById('td-org-name').textContent  = params.get('org-name') || '—';
document.getElementById('td-timestamp').textContent = params.get('timestamp')|| '—';