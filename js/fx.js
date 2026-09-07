/* fx.js — новые анимации дневника: reveal, параллакс, tilt, прогресс, наверх.
   Не конфликтует с nav.js: появление через свойство `translate`, tilt сохраняет translateY(0). */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  // --- вход hero после загрузки ---
  window.addEventListener('load', function () {
    document.body.classList.add('loaded');
  });
  setTimeout(function () { document.body.classList.add('loaded'); }, 2000);

  // --- появление при скролле ---
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var d = e.target.getAttribute('data-delay');
      if (d) e.target.style.transitionDelay = d + 'ms';
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { revealIO.observe(el); });

  // --- прогресс чтения + кнопка наверх (rAF, без дёрганий) ---
  var bar = document.getElementById('read-progress');
  var toTop = document.getElementById('toTop');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > 700);
    ticking = false;
    if (!reduceMotion) parallax(y);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // --- параллакс: ограниченный, только пока элемент в кадре ---
  var plx = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function parallax(y) {
    var vh = window.innerHeight;
    plx.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var shift = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = 'translateY(' + shift.toFixed(1) + 'px) scale(1.12)';
    });
  }

  // --- tilt + спот для карточек (только точный указатель) ---
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      var raf = null;
      card.classList.add('spot');
      card.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          card.style.transform =
            'perspective(900px) rotateX(' + ((0.5 - y) * 5).toFixed(2) + 'deg)' +
            'rotateY(' + ((x - 0.5) * 6).toFixed(2) + 'deg) translateY(0)';
          raf = null;
        });
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }
})();
