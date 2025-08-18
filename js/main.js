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

// ===== Direct messaging: WhatsApp or SMS =====
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Your business phone (digits only, no + or spaces)
  const PHONE = '16472440621'; // +1 647-244-0621

  const el = (id) => form.querySelector('#' + id);
  const v  = (id) => (el(id)?.value || '').trim();

  function buildMessage() {
    const name    = v('name');
    const email   = v('email');
    const vehicle = v('vehicle');
    const service = v('service');
    const msg     = v('message');

    const lines = [
      'Hi Julian!',
      name ? `I'm ${name}${email ? ` (${email})` : ''}.` : '',
      vehicle ? `Vehicle: ${vehicle}` : '',
      service ? `Service: ${service}` : '',
      msg ? `Message: ${msg}` : ''
    ].filter(Boolean);

    return lines.join('\n');
  }

  // WhatsApp
  form.querySelector('#send-wa')?.addEventListener('click', () => {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(buildMessage())}`;
    window.location.href = url; // opens app on mobile / web.whatsapp on desktop
  });

  // SMS (opens default Messages app with prefilled text)
  form.querySelector('#send-sms')?.addEventListener('click', () => {
    const url = `sms:+${PHONE}?&body=${encodeURIComponent(buildMessage())}`;
    window.location.href = url;
  });
})();

