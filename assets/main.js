/* 于斌 · Bin Yu — homepage interactions
   - scroll reveal
   - reading progress
   - active nav highlight
   - publication filters
   - back to top
*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(
          el.parentNode.querySelectorAll(':scope > .reveal')
        );
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 2. reading progress ---------- */
  var progress = document.getElementById('progress');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    if (progress) progress.style.width = (pct * 100).toFixed(2) + '%';
    if (toTop) toTop.classList.toggle('is-visible', h.scrollTop > 600);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  /* ---------- 3. active nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 4. publication filters ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.chip-filter'));
  var pubs = Array.prototype.slice.call(document.querySelectorAll('.pub'));

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

      pubs.forEach(function (pub) {
        var cats = (pub.getAttribute('data-cat') || '').split(/\s+/);
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        pub.classList.toggle('is-hidden', !show);
        if (show) pub.classList.add('is-in');
      });
    });
  });

  /* ---------- 5. smooth anchor fallback for older browsers ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 76);
      });
    });
  }
})();
