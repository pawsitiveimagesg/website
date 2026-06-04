/* ============================================================
   PAWSITIVE IMAGE — scripts.js
   ============================================================ */

/* ── NAVBAR: highlight active page ────────────────────────── */
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');
    if (
      ((page === '' || page === 'index.html') && href === 'index.html') ||
      (page === 'about.html'    && href === 'about.html') ||
      (page === 'services.html' && href === 'services.html')
    ) {
      link.classList.add('active');
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function activateTab(tabName) {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    const targetTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const targetPanel = document.getElementById(`tab-${tabName}`);

    if (targetTab && targetPanel) {
      targetTab.classList.add('active');
      targetPanel.classList.add('active');
    }
  }

  // 🔥 1. Handle clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      activateTab(tabName);

      // update URL (nice UX)
      window.location.hash = `tab-${tabName}`;
    });
  });

  // 🔥 2. Handle page load with hash
  const hash = window.location.hash; // e.g. #tab-spa
  if (hash) {
    const tabName = hash.replace('#tab-', '');
    activateTab(tabName);
  }
});

// Hamburger toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}