/* Eire Finder — vanilla JS. No dependencies required. */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Lenis smooth momentum scrolling (CDN, optional — native scrolling as fallback) */
  var lenis = null;
  if (!prefersReduced && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ duration: 1.15 });
    var rafLoop = function (time) { lenis.raf(time); requestAnimationFrame(rafLoop); };
    requestAnimationFrame(rafLoop);
  }

  /* Anchor navigation (offset for the sticky header) */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var hash = a.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -80 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* Sticky header state */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* Scroll reveals */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealEls, function (el) {
      var d = el.getAttribute('data-reveal-delay');
      if (d) el.style.setProperty('--rd', d + 'ms');
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* FAQ: keep a single item open */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* Mouse spotlight (panel demo + pricing card) */
  Array.prototype.forEach.call(document.querySelectorAll('[data-spotlight]'), function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Hero tilt (fine pointers only) */
  var tilt = document.querySelector('[data-tilt]');
  if (tilt && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var inner = tilt.querySelector('[data-tilt-inner]') || tilt;
    tilt.addEventListener('pointermove', function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = 'rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
    });
    tilt.addEventListener('pointerleave', function () {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  /* Gentle parallax on the browser mockup (desktop only) */
  var parallaxEl = document.querySelector('[data-parallax]');
  if (parallaxEl && !prefersReduced && window.matchMedia('(min-width: 1024px)').matches) {
    var ticking = false;
    var updateParallax = function () {
      var r = parallaxEl.getBoundingClientRect();
      var mid = r.top + r.height / 2 - window.innerHeight / 2;
      parallaxEl.style.transform = 'translateY(' + (-mid * 0.045).toFixed(1) + 'px)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* Demo full report modal */
  var reportModal = document.getElementById('demo-report-modal');
  var reportOpenBtn = document.querySelector('[data-testid="demo-full-report-btn"]');
  var reportCloseBtn = document.querySelector('[data-testid="demo-report-close-btn"]');
  if (reportModal && reportOpenBtn && reportCloseBtn) {
    var openReportModal = function () { reportModal.hidden = false; };
    var closeReportModal = function () { reportModal.hidden = true; };
    reportOpenBtn.addEventListener('click', openReportModal);
    reportCloseBtn.addEventListener('click', closeReportModal);
    reportModal.addEventListener('click', function (e) { if (e.target === reportModal) closeReportModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !reportModal.hidden) closeReportModal(); });
  }

  /* Checkout form */
  var form = document.querySelector('[data-testid="checkout-form"]');
  var input = document.querySelector('[data-testid="checkout-email-input"]');
  var errMsg = document.querySelector('[data-testid="checkout-error"]');
  var submitBtn = document.querySelector('[data-testid="checkout-submit-btn"]');
  var API_BASE_URL = 'https://ppr-server-production.up.railway.app';

  if (form && input && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (input.value || '').trim();
      errMsg.hidden = true;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errMsg.textContent = 'Please enter a valid email address.';
        errMsg.hidden = false;
        input.focus();
        return;
      }

      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Opening checkout…';
      fetch(API_BASE_URL + '/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok) throw new Error(data.message || 'Could not reach the server — please try again shortly.');
            return data;
          });
        })
        .then(function (data) {
          if (!data.url) throw new Error('Checkout is not available right now — please try again shortly.');
          window.location.href = data.url;
        })
        .catch(function (ex) {
          errMsg.textContent = ex && ex.message ? ex.message : 'Could not reach the server — please try again shortly.';
          errMsg.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        });
    });
  }
})();
