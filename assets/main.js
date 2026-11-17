/* 于斌 · Bin Yu — homepage interactions
   - scroll reveal
   - reading progress
   - active nav highlight
   - mobile navigation
   - publication filters and search
   - email copy with an honest fallback
   - back to top
*/
(function () {
  'use strict';

  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionPreference.matches;
  var revealObserver;

  /* ---------- 1. scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target.hidden) return;
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

  function onMotionChange(event) {
    reduceMotion = event.matches;
    if (!reduceMotion) return;
    if (revealObserver) revealObserver.disconnect();
    reveals.forEach(function (el) {
      el.style.transitionDelay = '0ms';
      el.classList.add('is-in');
    });
  }
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', onMotionChange);
  } else if (motionPreference.addListener) {
    motionPreference.addListener(onMotionChange);
  }

  /* ---------- 2. reading progress ---------- */
  var progress = document.getElementById('progress');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var scrollTop = window.pageYOffset || h.scrollTop || document.body.scrollTop || 0;
    var pct = max > 0 ? Math.max(0, Math.min(1, scrollTop / max)) : 0;
    if (progress) progress.style.width = (pct * 100).toFixed(2) + '%';
    if (toTop) toTop.classList.toggle('is-visible', scrollTop > 600);
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
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', onScroll);

  /* ---------- 3. active nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          var current = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-current', current);
          if (current) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 4. mobile navigation ---------- */
  var header = document.querySelector('header.site-header');
  var menuToggle = document.querySelector('button.menu-toggle');
  var siteNav = document.getElementById('site-nav');

  function setMenuOpen(open, restoreFocus) {
    if (!header || !menuToggle) return;
    header.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    if (restoreFocus) menuToggle.focus();
  }

  if (header && menuToggle && siteNav) {
    setMenuOpen(false);
    menuToggle.addEventListener('click', function () {
      setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false, true);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenuOpen(false);
    }, { passive: true });
  }

  /* ---------- 5. publication filters and search ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.chip-filter[data-filter]'));
  var pubs = Array.prototype.slice.call(document.querySelectorAll('.pub'));
  var search = document.getElementById('pub-search');
  var count = document.getElementById('pub-count');
  var empty = document.getElementById('pub-empty');
  var activeButton = filterBtns.find(function (btn) { return btn.classList.contains('is-active'); });
  var activeFilter = activeButton ? activeButton.getAttribute('data-filter') : 'all';

  function normalizeText(text) {
    return text.replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  }

  var publicationData = pubs.map(function (pub) {
    return {
      element: pub,
      categories: (pub.getAttribute('data-cat') || '').split(/\s+/),
      text: normalizeText(pub.textContent)
    };
  });

  function updatePublications(revealMatches) {
    var query = search ? normalizeText(search.value) : '';
    var terms = query ? query.split(' ') : [];
    var visible = 0;

    filterBtns.forEach(function (btn) {
      var selected = btn.getAttribute('data-filter') === activeFilter;
      btn.classList.toggle('is-active', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });

    publicationData.forEach(function (item) {
      var categoryMatches = activeFilter === 'all' || item.categories.indexOf(activeFilter) !== -1;
      var textMatches = terms.every(function (term) { return item.text.indexOf(term) !== -1; });
      var show = categoryMatches && textMatches;
      var pub = item.element;
      pub.hidden = !show;
      pub.classList.toggle('is-hidden', !show);
      if (!show) return;
      visible += 1;
      if (revealMatches) {
        pub.style.transitionDelay = '0ms';
        pub.classList.add('is-in');
        if (revealObserver) revealObserver.unobserve(pub);
      }
    });

    if (count) count.textContent = visible + ' / ' + pubs.length + '篇';
    if (empty) empty.hidden = visible !== 0;
    onScroll();
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeFilter = btn.getAttribute('data-filter');
      updatePublications(true);
    });
  });
  if (search) search.addEventListener('input', function () { updatePublications(true); });
  updatePublications(false);

  /* ---------- 6. copy email ---------- */
  var copyButton = document.getElementById('copy-email');
  if (copyButton) {
    var email = (copyButton.getAttribute('data-email') || '').trim();
    var copyLabel = copyButton.textContent.trim() || '复制邮箱';
    var copyTimer;
    var emailFallback;
    copyButton.setAttribute('aria-live', 'polite');

    copyButton.addEventListener('click', async function () {
      window.clearTimeout(copyTimer);
      copyButton.disabled = true;
      try {
        if (!email || !navigator.clipboard || !navigator.clipboard.writeText) {
          throw new Error('Clipboard unavailable');
        }
        await navigator.clipboard.writeText(email);
        copyButton.textContent = '已复制';
        if (emailFallback) {
          emailFallback.remove();
          emailFallback = null;
        }
      } catch (error) {
        copyButton.textContent = '复制失败';
        if (email && !emailFallback) {
          emailFallback = document.createElement('a');
          emailFallback.className = 'copy-email-fallback';
          emailFallback.href = 'mailto:' + email;
          emailFallback.textContent = '发送邮件';
          copyButton.insertAdjacentElement('afterend', emailFallback);
        }
      } finally {
        copyButton.disabled = false;
        copyTimer = window.setTimeout(function () {
          copyButton.textContent = copyLabel;
        }, 3000);
      }
    });
  }

  /* ---------- 7. anchor fallback for older browsers ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 76);
      });
    });
  }
})();
