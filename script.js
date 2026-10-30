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
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });

  // Active nav link while scrolling
  const links = Array.from(menu.querySelectorAll('a:not(.btn)'));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Lightbox with prev/next, keyboard and focus return
  const lb = $('lightbox');
  const lbImg = $('lbImg');
  const lbCount = $('lbCount');
  const items = Array.from(document.querySelectorAll('.g-item'));
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const btn = items[index];
    lbImg.src = btn.dataset.src;
    lbImg.alt = btn.querySelector('img').alt;
    lbCount.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
  };
  const openLb = (i, from) => {
    opener = from;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('lbClose').focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  };
  items.forEach((btn, i) => btn.addEventListener('click', () => openLb(i, btn)));
  $('lbClose').addEventListener('click', closeLb);
  $('lbPrev').addEventListener('click', () => show(index - 1));
  $('lbNext').addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = Array.from(lb.querySelectorAll('button'));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Contact form: validates, then opens the visitor's email client (no backend)
  const form = $('contactForm');
  const status = $('formStatus');
  const MESSAGES = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    message: 'Please tell us about the property.'
  };
  const setFieldError = (field, bad) => {
    field.classList.toggle('invalid', bad);
    field.setAttribute('aria-invalid', String(bad));
    $('err-' + field.name).textContent = bad ? MESSAGES[field.name] : '';
  };
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('invalid') && e.target.value.trim()) setFieldError(e.target, false);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = Array.from(form.querySelectorAll('input, textarea'));
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    let firstBad = null;
    fields.forEach((f) => {
      const v = f.value.trim();
      const bad = !v || (f.name === 'email' && !emailOk(v));
      setFieldError(f, bad);
      if (bad && !firstBad) firstBad = f;
    });

    if (firstBad) {
      status.className = 'form-status error';
      status.textContent = 'Please fix the highlighted fields.';
      firstBad.focus();
      return;
    }

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const subject = encodeURIComponent('Photography request from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + email + '>');
    status.className = 'form-status ok';
    status.textContent = 'Opening your email app. If nothing happens, email ' + CONTACT_EMAIL + ' directly.';
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  });

  $('year').textContent = new Date().getFullYear();
})();
