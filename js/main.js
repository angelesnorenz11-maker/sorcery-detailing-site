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

  // Contact helpers (WhatsApp / SMS)
  const form = document.getElementById('contact-form');
  if (form) {
    const get = id => document.getElementById(id)?.value?.trim() || '';
    const compose = () => {
      const name = get('name');
      const email = get('email');
      const vehicle = get('vehicle');
      const service = get('service');
      const msg = get('message');
      return [
        `Hi Julian!`,
        name && `Name: ${name}`,
        email && `Email: ${email}`,
        vehicle && `Vehicle: ${vehicle}`,
        service && `Service: ${service}`,
        msg && `Message: ${msg}`,
      ].filter(Boolean).join('\n');
    };

    const wa = document.getElementById('send-whatsapp');
    const sms = document.getElementById('send-sms');

    if (wa) wa.addEventListener('click', () => {
      const text = encodeURIComponent(compose());
      window.location.href = `https://wa.me/16472440621?text=${text}`;
    });

    if (sms) sms.addEventListener('click', () => {
      const text = encodeURIComponent(compose());
      window.location.href = `sms:+16472440621?&body=${text}`;
    });
  }
})();
