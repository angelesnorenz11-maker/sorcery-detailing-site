// js/main.js
(function () {
  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  const backdrop = document.querySelector('.nav-backdrop');

  if (toggle && nav) {
    const open = () => {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      if (backdrop) { backdrop.classList.add('show'); backdrop.removeAttribute('hidden'); }
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (backdrop) { backdrop.classList.remove('show'); backdrop.setAttribute('hidden',''); }
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', () =>
      nav.classList.contains('open') ? close() : open()
    );
    if (backdrop) backdrop.addEventListener('click', close);
    window.addEventListener('resize', () => { if (window.innerWidth > 760) close(); });
  }

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
