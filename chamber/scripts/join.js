// ── MBC · join.js ───────────────────────────────────────────────────

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

// ③ Timestamp hidden field
document.getElementById('timestamp').value = new Date().toLocaleString('en-US');

// ④ Modals
const modals = {
  'modal-np':     document.getElementById('modal-np'),
  'modal-bronze': document.getElementById('modal-bronze'),
  'modal-silver': document.getElementById('modal-silver'),
  'modal-gold':   document.getElementById('modal-gold'),
};

// Open modal on "Learn More" click
document.querySelectorAll('.mem-info-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const modalId = btn.getAttribute('data-modal');
    modals[modalId].showModal();
  });
});

// Close buttons
document.getElementById('close-np').addEventListener('click', () => modals['modal-np'].close());
document.getElementById('close-bronze').addEventListener('click', () => modals['modal-bronze'].close());
document.getElementById('close-silver').addEventListener('click', () => modals['modal-silver'].close());
document.getElementById('close-gold').addEventListener('click', () => modals['modal-gold'].close());

// Close when clicking outside the modal
Object.values(modals).forEach(modal => {
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom;
    if (clickedOutside) modal.close();
  });
});