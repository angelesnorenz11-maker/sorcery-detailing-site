// Smooth-scroll for internal links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  }
});

// Mobile menu toggle
(function(){
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav[data-collapsible]');
  const backdrop = document.querySelector('.nav-backdrop');

  if(!btn || !nav || !backdrop) return;

  function openMenu(){
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    requestAnimationFrame(()=>backdrop.classList.add('show'));
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('show');
    setTimeout(()=>{ backdrop.hidden = true; }, 180);
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });
  nav.addEventListener('click', (e) => { if(e.target.matches('a')) closeMenu(); });
  backdrop.addEventListener('click', closeMenu);
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeMenu(); });
})();
