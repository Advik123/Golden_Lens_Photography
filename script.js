(function () {
  'use strict';

  const CONTACT_EMAIL = 'glxcy16@gmail.com';
  const $ = (id) => document.getElementById(id);

  // Sticky header style
  const header = $('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $('navToggle');
  const menu = $('navMenu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Lightbox
  const lb = $('lightbox');
  const lbImg = $('lbImg');
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
  document.querySelectorAll('.g-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      lbImg.src = btn.dataset.src;
      lbImg.alt = btn.querySelector('img').alt;
      lb.hidden = false;
      $('lbClose').focus();
    });
  });
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // Contact form: validates, then opens the visitor's email client (no backend)
  const form = $('contactForm');
  const status = $('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const message = (data.message || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.querySelectorAll('input, textarea').forEach((f) => {
      const bad = !f.value.trim() || (f.name === 'email' && !emailOk);
      f.classList.toggle('invalid', bad);
    });

    if (!name || !emailOk || !message) {
      status.className = 'form-status error';
      status.textContent = 'Please fill in all fields with a valid email.';
      return;
    }

    const subject = encodeURIComponent('Photography request from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + email + '>');
    status.className = 'form-status ok';
    status.textContent = 'Opening your email app to send the request...';
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  });

  $('year').textContent = new Date().getFullYear();
})();
