// =============================================
// CAPITALFLOW — contact.js
// ES Module — contact.html + form-confirmation.html
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
// CONTACT FORM
// =============================================
const form = document.getElementById('contactForm');

if (form) {

  // Character counter for textarea
  const textarea  = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / 1000`;
    charCount.style.color = len > 900 ? 'var(--warning)' : 'var(--text-subtle)';
  });

  // Form validation on submit
  form.addEventListener('submit', e => {
    let valid = true;

    // Required fields
    ['firstName', 'lastName', 'email', 'subject', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const empty = !el.value.trim();
      el.classList.toggle('error', empty);
      if (empty) valid = false;
    });

    // Email format
    const emailEl = document.getElementById('email');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl?.value);
    if (!emailOk) {
      emailEl?.classList.add('error');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      // Scroll to first error
      const firstError = form.querySelector('.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus();
    }
  });

  // Remove error on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
    el.addEventListener('change', () => el.classList.remove('error'));
  });
}

// =============================================
// FORM CONFIRMATION — display URL params
// =============================================
const confirmData = document.getElementById('confirmData');

if (confirmData) {
  const params = new URLSearchParams(window.location.search);

  const fields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName',  label: 'Last Name' },
    { key: 'email',     label: 'Email' },
    { key: 'subject',   label: 'Subject' },
    { key: 'message',   label: 'Message' },
    { key: 'newsletter',label: 'Newsletter' }
  ];

  const rows = fields
    .filter(f => params.has(f.key) && params.get(f.key))
    .map(f => {
      let val = params.get(f.key);
      if (f.key === 'newsletter') val = val === 'yes' ? 'Subscribed ✓' : 'Not subscribed';
      // Truncate long messages for display
      if (f.key === 'message' && val.length > 200) val = val.slice(0, 200) + '…';
      return `
        <div class="confirm-row">
          <span class="confirm-key">${f.label}</span>
          <span class="confirm-val">${val}</span>
        </div>
      `;
    }).join('');

  confirmData.innerHTML = rows || '<p style="color:var(--text-subtle);font-size:.875rem;">No form data found.</p>';
}