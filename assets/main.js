/* 于斌 · Bin Yu — homepage interactions
   - scroll reveal
   - reading progress
   - active nav highlight
   - publication filters
   - back to top
   - header scroll state
   - metric count-up animation
   - publication collapse/expand
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

  /* ---------- 2. reading progress + header scroll + to-top ---------- */
  var progress = document.getElementById('progress');
  var toTop = document.querySelector('.to-top');
  var header = document.querySelector('.site-header');

  function onScroll() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? scrollTop / max : 0;
    if (progress) progress.style.width = (pct * 100).toFixed(2) + '%';
    if (toTop) toTop.classList.toggle('is-visible', scrollTop > 600);
    if (header) header.classList.toggle('is-scrolled', scrollTop > 20);
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

  function applyCollapse() {
    var visible = pubs.filter(function (p) { return !p.classList.contains('is-hidden'); });
    visible.forEach(function (p, i) {
      p.classList.toggle('is-collapsed', i >= 12);
    });
    var toggle = document.querySelector('.pub-toggle');
    if (toggle) {
      var isOpen = toggle.classList.contains('is-open');
      visible.forEach(function (p, i) {
        if (isOpen || i < 12) {
          p.style.display = '';
        } else {
          p.style.display = 'none';
        }
      });
      toggle.style.display = visible.length <= 12 ? 'none' : '';
    }
  }

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

      applyCollapse();
    });
  });

  /* pub expand toggle */
  var pubToggle = document.querySelector('.pub-toggle');
  if (pubToggle) {
    pubToggle.addEventListener('click', function () {
      var isOpen = pubToggle.classList.toggle('is-open');
      var visible = pubs.filter(function (p) { return !p.classList.contains('is-hidden'); });
      visible.forEach(function (p, i) {
        if (isOpen || i < 12) {
          p.style.display = '';
          if (isOpen && i >= 12) p.classList.add('is-in');
        } else {
          p.style.display = 'none';
        }
      });
      var span = pubToggle.querySelector('span');
      if (span) span.textContent = isOpen ? '收起论文列表' : '展开全部论文';
    });
  }

  /* initial collapse */
  applyCollapse();

  /* ---------- 5. metric count-up ---------- */
  var metricNums = Array.prototype.slice.call(document.querySelectorAll('.metric .num'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var targetText = el.textContent.trim();
        var target = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
        if (isNaN(target)) { countObserver.unobserve(el); return; }
        var suffix = targetText.replace(/[0-9]/g, '');
        var duration = 1200;
        var start = performance.now();
        function tick(now) {
          var elapsed = now - start;
          var t = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - t, 3);
          var current = Math.round(ease * target);
          el.textContent = current + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    metricNums.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- 6. smooth anchor fallback for older browsers ---------- */
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
