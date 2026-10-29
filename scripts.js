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
      (['services.html', 'dog-grooming.html', 'dog-teeth-cleaning.html'].includes(page) && href === 'services.html')
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

/* ── WHATSAPP: prefilled message + GA4 click tracking ─────── */
(function () {
  const SERVICES = {
    grooming: 'grooming',
    addons:   'grooming with add-ons',
    spa:      'a Dog Spa session',
    teeth:    'non-anaesthetic teeth cleaning'
  };

  function pageName() {
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    return page === '' || page === 'index' ? 'home' : page;
  }

  const SERVICE_PAGES = {
    'dog-grooming':       'dog grooming',
    'dog-teeth-cleaning': 'non-anaesthetic teeth cleaning'
  };

  function serviceFor(page) {
    if (SERVICE_PAGES[page]) return SERVICE_PAGES[page];
    if (page !== 'services') return 'an appointment';
    const active = document.querySelector('.tab-btn.active');
    return (active && SERVICES[active.dataset.tab]) || 'an appointment';
  }

  function placement(link) {
    if (link.classList.contains('nav-book-btn'))    return 'nav_menu';
    if (link.classList.contains('footer-book-btn')) return 'footer';
    return 'header';
  }

  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    const base = link.href.split('?')[0];
    link.addEventListener('click', () => {
      const page = pageName();
      const service = serviceFor(page);
      const text = `Hi Pawsitive Image! I'd like to book ${service} for my pet. (via website - ${page})`;
      link.href = `${base}?text=${encodeURIComponent(text)}`;

      if (typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', {
          page_name: page,
          service: service,
          button_location: placement(link)
        });
      }
    });
  });
})();
