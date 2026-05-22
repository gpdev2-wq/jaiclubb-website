/* Jai Club — minimal, dependency-free JS */
(() => {
  const runWhenIdle = (fn) => {
    const schedule = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 });
      else setTimeout(fn, 200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  };

  // ---------- Year ----------
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ---------- Login / Register buttons -> external redirect ----------
  const PARTNER_URL = 'https://www.jaiclub25.com/#/register?invitationCode=774714713647';
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.open(PARTNER_URL, '_blank', 'noopener,noreferrer');
    }, true);
  });

  // ---------- Language switcher (deferred — not needed for first paint) ----------
  function injectLangSwitch() {
    const enToHi = {
      '/': '/hi/',
      '/index.html': '/hi/',
      '/review/jai-club-full-review.html': '/hi/review/jai-club-puri-jaankari.html',
      '/blog/is-jai-club-real-or-fake.html': '/hi/blog/jai-club-asli-ya-nakli.html',
      '/guides/red-flags.html': '/hi/guides/khatre-ke-sanket.html',
      '/faq.html': '/hi/faq.html'
    };
    const hiToEn = {};
    Object.keys(enToHi).forEach(k => { hiToEn[enToHi[k]] = k; });

    let path = location.pathname;
    if (path === '') path = '/';
    const isHi = path.indexOf('/hi/') === 0 || path === '/hi';

    let target;
    if (isHi) {
      target = hiToEn[path] || hiToEn[path.replace(/\/$/, '/')] || '/';
    } else {
      target = enToHi[path] || '/hi/';
    }

    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;
    if (navInner.querySelector('.lang-switch')) return;

    const link = document.createElement('a');
    link.className = 'lang-switch';
    link.href = target;
    link.setAttribute('hreflang', isHi ? 'en' : 'hi');
    link.setAttribute('lang', isHi ? 'en' : 'hi');
    link.setAttribute('title', isHi ? 'Switch to English' : 'हिंदी में पढ़ें');
    link.setAttribute('aria-label', isHi ? 'Switch to English' : 'Switch to Hindi');
    link.innerHTML = isHi
      ? '<span aria-hidden="true">🌐</span><span>English</span>'
      : '<span aria-hidden="true">🌐</span><span lang="hi">हिंदी</span>';

    // Insert just before the mobile hamburger (.nav-toggle); on desktop this
    // places it just before the Log in / Register buttons.
    const navToggle = navInner.querySelector('.nav-toggle');
    const navCta = navInner.querySelector('.nav-cta');
    if (navToggle) {
      navInner.insertBefore(link, navToggle);
    } else if (navCta) {
      navInner.insertBefore(link, navCta);
    } else {
      navInner.appendChild(link);
    }
  }

  // ---------- Star rating widget (deferred — API calls after load) ----------
  function ratingWidget() {
    const footerContainer = document.querySelector('.site-footer .container');
    if (!footerContainer) return;
    if (footerContainer.querySelector('.site-rating')) return; // already exists

    const NAMESPACE = 'jaiclubb-app';
    const STORE_KEY = 'jc_user_rating_v1';
    const API_BASE = 'https://api.counterapi.dev/v1';

    const card = document.createElement('div');
    card.className = 'site-rating';
    card.innerHTML = `
      <div class="rating-inner">
        <p class="rating-title">How would you rate this site?</p>
        <div class="rating-stars" role="radiogroup" aria-label="Rate this site">
          ${[1,2,3,4,5].map(n => `<button type="button" class="rating-star" data-rating="${n}" aria-label="${n} star${n>1?'s':''}" role="radio" aria-checked="false">★</button>`).join('')}
        </div>
        <p class="rating-status" aria-live="polite">Loading current rating…</p>
      </div>
    `;

    const footerBottom = footerContainer.querySelector('.footer-bottom');
    if (footerBottom) footerContainer.insertBefore(card, footerBottom);
    else footerContainer.appendChild(card);

    const stars = card.querySelectorAll('.rating-star');
    const status = card.querySelector('.rating-status');

    const renderStars = (filledTo, locked) => {
      requestAnimationFrame(() => {
        stars.forEach((s, i) => {
          s.classList.toggle('filled', i < filledTo);
          s.setAttribute('aria-checked', (i + 1) === filledTo ? 'true' : 'false');
          s.disabled = !!locked;
        });
      });
    };

    const userVote = parseInt(localStorage.getItem(STORE_KEY) || '0', 10);

    stars.forEach((s, i) => {
      s.addEventListener('mouseenter', () => {
        if (parseInt(localStorage.getItem(STORE_KEY) || '0', 10)) return;
        stars.forEach((s2, j) => s2.classList.toggle('hover', j <= i));
      });
      s.addEventListener('mouseleave', () => {
        stars.forEach(s2 => s2.classList.remove('hover'));
      });
      s.addEventListener('click', () => onVote(i + 1));
    });

    const fmtCount = n => n.toLocaleString('en-IN');

    function updateDisplay(avg, total) {
      const myVote = parseInt(localStorage.getItem(STORE_KEY) || '0', 10);
      if (myVote) {
        renderStars(myVote, true);
        status.innerHTML = `Thanks! You rated <strong>${myVote}/5</strong>. Site average: <strong>${avg.toFixed(1)}/5</strong> from <strong>${fmtCount(total)}</strong> vote${total !== 1 ? 's' : ''}.`;
      } else {
        renderStars(0, false);
        status.innerHTML = total > 0
          ? `Currently averaging <strong>${avg.toFixed(1)}/5</strong> from <strong>${fmtCount(total)}</strong> vote${total !== 1 ? 's' : ''}. Click a star to add yours.`
          : 'Rate this guide — click a star above.';
      }
    }

    async function loadAggregate() {
      // Only fetch counters that may exist (after a vote). Empty counters return
      // 400 and clutter the browser console — avoid probing all five on load.
      const myVote = parseInt(localStorage.getItem(STORE_KEY) || '0', 10);
      if (!myVote) {
        updateDisplay(0, 0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/${NAMESPACE}/rating-${myVote}/`);
        const data = res.ok ? await res.json() : null;
        const count = (data && +data.count) || 1;
        updateDisplay(myVote, count);
      } catch (e) {
        renderStars(myVote, true);
        status.innerHTML = `Thanks! You rated <strong>${myVote}/5</strong>.`;
      }
    }

    async function onVote(n) {
      if (parseInt(localStorage.getItem(STORE_KEY) || '0', 10)) return;
      stars.forEach(s => s.disabled = true);
      status.textContent = 'Submitting your rating…';
      try {
        const res = await fetch(`${API_BASE}/${NAMESPACE}/rating-${n}/up`);
        if (!res.ok) throw new Error('http ' + res.status);
        localStorage.setItem(STORE_KEY, String(n));
        await loadAggregate();
      } catch (e) {
        stars.forEach(s => s.disabled = false);
        status.textContent = 'Could not save your vote — please try again.';
      }
    }

    if (userVote) renderStars(userVote, true);
    loadAggregate();
  }

  // ---------- Scroll-to-top (IntersectionObserver — no scrollY / forced reflow) ----------
  function scrollTopBtn() {
    if (document.querySelector('.scroll-top')) return;

    let sentinel = document.querySelector('.scroll-top-sentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.className = 'scroll-top-sentinel';
      sentinel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(sentinel);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scroll-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"></polyline></svg>';
    document.body.appendChild(btn);

    const io = new IntersectionObserver(([entry]) => {
      btn.classList.toggle('visible', !entry.isIntersecting);
    }, { threshold: 0 });
    io.observe(sentinel);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Batch non-critical DOM work in one frame (fewer layout invalidations)
  runWhenIdle(() => {
    requestAnimationFrame(() => {
      injectLangSwitch();
      ratingWidget();
      scrollTopBtn();
    });
  });

  // ---------- Mobile nav ----------
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', () => header.classList.toggle('menu-open'));
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => header.classList.remove('menu-open'));
    });
  }

  // ---------- Smooth-scroll anchor offset for sticky header (click-only layout read) ----------
  const HEADER_OFFSET = 80;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const tgt = document.getElementById(id);
      if (!tgt) return;
      e.preventDefault();
      requestAnimationFrame(() => {
        const top = tgt.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
        history.replaceState(null, '', '#' + id);
      });
    });
  });

  // ---------- Auth modal ----------
  const modal = document.getElementById('authModal');
  if (modal) {
    const tabs = modal.querySelectorAll('.modal-tabs button');
    const forms = modal.querySelectorAll('.auth-form');

    const switchTab = (which) => {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === which));
      forms.forEach(f => f.classList.toggle('hidden', f.dataset.form !== which));
    };
    const openModal = (which = 'login') => {
      modal.classList.add('active');
      switchTab(which);
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn.dataset.openModal);
      });
    });
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Demo auth — localStorage only. Replace with real backend (Firebase / Supabase).
    const STORE = 'jc_users';
    const SESS = 'jc_session';
    const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return 'h'+Math.abs(h).toString(36); };
    const users = () => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } };

    function msg(form, type, text) {
      const m = form.querySelector('.form-msg');
      if (m) { m.textContent = text; m.className = 'form-msg ' + type; }
    }

    const reg = document.getElementById('registerForm');
    if (reg) reg.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(reg);
      const u = (fd.get('username')||'').trim();
      const em = (fd.get('email')||'').trim().toLowerCase();
      const pw = (fd.get('password')||'');
      if (u.length < 3) return msg(reg, 'error', 'Username must be at least 3 characters.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return msg(reg, 'error', 'Enter a valid email.');
      if (pw.length < 6) return msg(reg, 'error', 'Password must be at least 6 characters.');
      const list = users();
      if (list.some(x => x.email === em)) return msg(reg, 'error', 'Email already registered.');
      list.push({ username: u, email: em, pw: hash(pw), ts: Date.now() });
      localStorage.setItem(STORE, JSON.stringify(list));
      localStorage.setItem(SESS, JSON.stringify({ username: u, email: em }));
      msg(reg, 'ok', `Welcome, ${u}! Account created.`);
      setTimeout(() => { closeModal(); refreshAuth(); }, 800);
    });

    const log = document.getElementById('loginForm');
    if (log) log.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(log);
      const em = (fd.get('email')||'').trim().toLowerCase();
      const pw = (fd.get('password')||'');
      const user = users().find(x => x.email === em && x.pw === hash(pw));
      if (!user) return msg(log, 'error', 'Email or password incorrect.');
      localStorage.setItem(SESS, JSON.stringify({ username: user.username, email: user.email }));
      msg(log, 'ok', `Welcome back, ${user.username}!`);
      setTimeout(() => { closeModal(); refreshAuth(); }, 800);
    });

    function refreshAuth() {
      let session = null;
      try { session = JSON.parse(localStorage.getItem(SESS) || 'null'); } catch {}
      const cta = document.querySelector('.nav-cta');
      if (!cta || !session) return;
      cta.innerHTML = `<span class="muted small" style="align-self:center;">Hi, <strong style="color:var(--text)">${session.username}</strong></span>
        <button class="btn btn-ghost" id="logoutBtn">Log out</button>`;
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem(SESS);
        location.reload();
      });
    }
    refreshAuth();
  }

  // ---------- Reveal on scroll (deferred; skip hero/LCP — no inline opacity on first paint) ----------
  runWhenIdle(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll(
      '.section .card, .section .callout, .section figure, .section .faq details'
    ).forEach(el => {
      el.classList.add('reveal-pending');
      io.observe(el);
    });
  });

  // ---------- Reading progress (rAF-throttled — one layout read per frame) ----------
  const bar = document.getElementById('readingBar');
  if (bar) {
    let barTicking = false;
    const updateBar = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      barTicking = false;
    };
    document.addEventListener('scroll', () => {
      if (barTicking) return;
      barTicking = true;
      requestAnimationFrame(updateBar);
    }, { passive: true });
  }

  // ---------- Newsletter dummy ----------
  document.querySelectorAll('form[data-newsletter]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const out = f.querySelector('.form-msg') || f.querySelector('p');
      if (out) { out.textContent = 'Thanks for subscribing! (Connect a real provider like Mailchimp/ConvertKit.)'; out.style.color = 'var(--good)'; }
      f.reset();
    });
  });
})();
