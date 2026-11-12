/* ==========================================================================
   EX2 — AURORA · main.js
   Structure:
     0. Setup & helpers
     1. Rendering (data -> HTML)
     2. Text splitting
     3. Smooth scroll, progress, navigation
     4. Reveals, counters, skill rings
     5. Timeline (glowing line, floating cards)
     6. Interactions (filters, modal, theme, menu, tilt, cursor glow, magnetic…)
     7. Loader, intro & boot
   All content comes from window.portfolio (shared/data.js).
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     0. SETUP & HELPERS
     ------------------------------------------------------------------------ */
  const D = window.portfolio;
  if (!D) { console.error('shared/data.js did not load.'); return; }
  const { person: P, timeline: TIMELINE, projects: PROJECTS, skills: SKILLS, stats: STATS, future: FUTURE, copy: C } = D;

  const $  = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const root = document.documentElement;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const wideMQ = matchMedia('(min-width: 900px)');
  const motionOK = () => hasGSAP && !reduceMQ.matches;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const state = { filter: 'all', lenis: null, items: TIMELINE.slice(), tlCtx: null, modal: { id: null, open: false, closing: false } };
  const categoryLabel = (k) => C.timeline.categories[k] || k;

  /* ------------------------------------------------------------------------
     1. RENDERING
     ------------------------------------------------------------------------ */
  function renderAll() {
    document.title = `${P.name} — ${P.title}`;
    $('meta[name="description"]')?.setAttribute('content', P.bio);
    $('#skipLink').textContent = C.skipLink;
    $('#loaderName').textContent = P.name;
    $('#loaderLabel').textContent = C.loader.label;
    $('#loaderSkip').textContent = C.loader.skip;
    $('#brandText').textContent = P.name;
    $('#menuBtn').textContent = C.menu.open;
    $('#toTopLabel').textContent = C.footer.top;

    $('#navList').innerHTML = C.nav.map((n, i) =>
      `<li><a href="#${n.id}" data-nav="${n.id}" style="--i:${i}">${esc(n.label)}</a></li>`).join('');

    renderHero(); renderAbout(); renderTimelineShell(); renderTimelineItems();
    renderProjects(); renderSkills(); renderFuture(); renderContact(); renderFooter();
    setThemeLabel();
  }

  function renderHero() {
    const [first, ...rest] = P.name.split(' ');
    $('#top').innerHTML = `
      <div class="hero__inner">
        <div class="hero__text">
          <span class="pill" data-hero-in>${esc(C.hero.eyebrow)}</span>
          <h1 class="hero__name" id="heroName">
            <span class="hero__line" data-split="chars">${esc(first)}</span>
            <span class="hero__line hero__line--grad" data-split="chars">${esc(rest.join(' '))}</span>
          </h1>
          <p class="hero__title" data-hero-in>${esc(P.title)}</p>
          <p class="hero__lede" data-hero-in>${esc(P.bio)}</p>
          <div class="hero__cta" data-hero-in>
            <a class="btn btn--primary" href="#timeline" data-magnetic>${esc(C.hero.cta1)} <span class="btn__arrow" aria-hidden="true">↓</span></a>
            <a class="btn" href="#contact" data-magnetic>${esc(C.hero.cta2)}</a>
          </div>
        </div>
        <div class="hero__visual" data-hero-visual>
          <div class="hero__halo" aria-hidden="true"></div>
          <figure class="hero__portrait glass">
            <img src="${esc(P.avatar)}" alt="${esc(P.avatarAlt)}" width="800" height="1000" fetchpriority="high" decoding="async">
          </figure>
          <div class="float float--a glass" aria-hidden="true"><strong>${esc(STATS[0].value)}</strong><span>${esc(STATS[0].label)}</span></div>
          <div class="float float--b glass" aria-hidden="true"><strong>${esc(STATS[3] ? STATS[3].value : STATS[1].value)}</strong><span>${esc(STATS[3] ? STATS[3].label : STATS[1].label)}</span></div>
        </div>
      </div>`;
  }

  function renderAbout() {
    const A = C.about;
    $('#about').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-fade><span class="pill"><b>${A.index}</b> ${esc(A.label)}</span></div>
        <div class="about__grid">
          <div class="about__main glass" data-fade>
            <h2 class="about__statement" data-split="words">${esc(A.statement)}</h2>
            ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
            <dl class="about__facts">
              <div><dt>${esc(A.facts.school)}</dt><dd>${esc(P.university)}</dd></div>
              <div><dt>${esc(A.facts.applying)}</dt><dd>${esc(P.degree)}</dd></div>
              <div><dt>${esc(A.facts.based)}</dt><dd>${esc(P.location)}</dd></div>
            </dl>
          </div>
          <dl class="stats">
            ${STATS.map((s) => `<div class="stat glass" data-fade><dt>${esc(s.label)}</dt><dd class="stat__v" data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
          </dl>
        </div>
      </div>`;
  }

  function renderTimelineShell() {
    const TL = C.timeline;
    const cats = Object.keys(TL.categories).filter((k) => TIMELINE.some((e) => e.category === k));
    const chip = (key, label, n) => `<button class="chip" type="button" data-cat="${key}" aria-pressed="${key === 'all'}">${esc(label)} <span class="chip__n">${n}</span></button>`;
    $('#timeline').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-fade>
          <span class="pill"><b>${TL.index}</b> ${esc(TL.label)}</span>
          <h2 class="sec-title" id="tlTitle" data-split="words">${esc(TL.title)}</h2>
        </div>
        <div class="tl__tools" data-fade>
          <div class="chips" role="group" aria-label="${esc(TL.filtersLabel)}">
            ${chip('all', TL.all, TIMELINE.length)}
            ${cats.map((k) => chip(k, TL.categories[k], TIMELINE.filter((e) => e.category === k).length)).join('')}
          </div>
          <p class="tl__count" id="tlCount" aria-live="polite"></p>
        </div>
        <div class="tl__wrap">
          <div class="tl__rail" aria-hidden="true"><div class="tl__glow" id="tlGlow"></div></div>
          <span class="tl__orb" id="tlOrb" aria-hidden="true"></span>
          <ol class="tl__list" id="tlList" aria-label="${esc(TL.listLabel)}"></ol>
        </div>
      </div>`;
  }

  function renderTimelineItems() {
    const TL = C.timeline;
    state.items = TIMELINE.filter((e) => state.filter === 'all' || e.category === state.filter);
    $('#tlList').innerHTML = state.items.map((e, i) => `
      <li class="tl-item ${i % 2 === 0 ? 'is-left' : 'is-right'}" data-id="${esc(e.id)}">
        <span class="tl-node" aria-hidden="true"></span>
        <div class="tl-side" aria-hidden="true"><span class="tl-side__year">${e.year}</span><span class="tl-side__date">${e.age != null ? `${esc(TL.age)} ${e.age}` : esc(e.date)}</span></div>
        <div class="tl-wrap">
          <button class="tl-card glass" type="button" data-open="${esc(e.id)}" data-tilt aria-haspopup="dialog">
            <span class="tl-media">
              <img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="750" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
              ${e.highlight ? `<span class="tl-flag">${esc(TL.milestone)}</span>` : ''}
            </span>
            <span class="tl-body">
              <span class="tl-meta"><span class="tl-cat">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span></span>
              <span class="tl-title">${esc(e.title)}</span>
              <span class="tl-sub">${esc(e.subtitle)}</span>
              <span class="tl-tags">${e.tags.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</span>
              <span class="tl-more">${esc(TL.open)}</span>
            </span>
          </button>
        </div>
      </li>`).join('');
    $('#tlCount').textContent = TL.count.replace('{n}', state.items.length);
  }

  function renderProjects() {
    const PC = C.projects;
    $('#projects').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-fade>
          <span class="pill"><b>${PC.index}</b> ${esc(PC.label)}</span>
          <h2 class="sec-title" id="projTitle" data-split="words">${esc(PC.title)}</h2>
        </div>
        <ul class="proj-grid">
          ${PROJECTS.map((p) => `
            <li data-fade>
              <article class="proj glass" data-tilt>
                <div class="proj__media"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="1200" height="750" loading="lazy" decoding="async"></div>
                <div class="proj__body">
                  <div class="proj__top">
                    <h3 class="proj__title"><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}<span class="sr-only"> (${esc(PC.visit)})</span></a></h3>
                    <span class="proj__year">${p.year}</span>
                  </div>
                  <p class="proj__desc">${esc(p.description)}</p>
                  <ul class="proj__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                  ${p.repo ? `<a class="proj__repo" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(PC.repo)} ↗<span class="sr-only"> — ${esc(p.title)} (${esc(PC.visit)})</span></a>` : ''}
                </div>
              </article>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  function renderSkills() {
    const SC = C.skills;
    const groups = Object.keys(SC.groups).filter((g) => SKILLS.some((s) => s.group === g));
    $('#skills').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-fade>
          <span class="pill"><b>${SC.index}</b> ${esc(SC.label)}</span>
          <h2 class="sec-title" id="skillsTitle" data-split="words">${esc(SC.title)}</h2>
        </div>
        <div class="skills__grid">
          ${groups.map((g) => `
            <div class="skill-group glass" data-fade>
              <h3 class="skill-group__title">${esc(SC.groups[g])}</h3>
              <ul class="rings">
                ${SKILLS.filter((s) => s.group === g).map((s) => `
                  <li class="skill" data-level="${s.level}">
                    <div class="ring" role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}">
                      <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle class="ring__bg" cx="50" cy="50" r="42" />
                        <circle class="ring__fg" cx="50" cy="50" r="42" pathLength="100" style="stroke-dashoffset:${100 - s.level}" />
                      </svg>
                      <span class="ring__val">${s.level}</span>
                    </div>
                    <span class="skill__name">${esc(s.name)}</span>
                  </li>`).join('')}
              </ul>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderFuture() {
    const FC = C.future;
    $('#future').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-fade>
          <span class="pill"><b>${FC.index}</b> ${esc(FC.label)}</span>
          <h2 class="sec-title" id="futureTitle" data-split="words">${esc(FC.title)}</h2>
        </div>
        <ol class="goals">
          ${FUTURE.map((g, i) => `
            <li data-fade>
              <article class="goal glass" data-tilt>
                <span class="goal__n" aria-hidden="true">${pad(i + 1)}</span>
                <h3 class="goal__t">${esc(g.goal)}</h3>
                <p class="goal__d">${esc(g.description)}</p>
              </article>
            </li>`).join('')}
        </ol>
        <p class="future__closing" data-fade>${esc(FC.closing)}</p>
      </div>`;
  }

  function renderContact() {
    const CC = C.contact, F = CC.form;
    $('#contact').innerHTML = `
      <div class="wrap">
        <div class="contact__panel glass" data-fade>
          <div class="contact__main">
            <span class="pill"><b>${CC.index}</b> ${esc(CC.label)}</span>
            <h2 class="sec-title" id="contactTitle" data-split="words">${esc(CC.title)}</h2>
            <p class="contact__intro">${esc(CC.intro)}</p>
            <span class="contact__label">${esc(CC.emailLabel)}</span>
            <a class="contact__email" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
            <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span class="sr-only"> (${esc(C.projects.visit)})</span></a>`).join('')}</div>
          </div>
          <form class="form" id="contactForm">
            <div class="field"><label for="cf-name">${esc(F.name)}</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
            <div class="field"><label for="cf-email">${esc(F.email)}</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="cf-msg">${esc(F.message)}</label><textarea id="cf-msg" name="message" rows="5" required></textarea></div>
            <button class="btn btn--primary" type="submit" data-magnetic>${esc(F.send)} <span class="btn__arrow" aria-hidden="true">→</span></button>
            <p class="form__status" id="formStatus" role="status"></p>
          </form>
        </div>
      </div>`;
  }

  function renderFooter() {
    const FT = C.footer;
    $('#footer').classList.add('glass');
    $('#footer').innerHTML = `
      <span class="footer__name">${esc(P.name)}</span>
      <span>© ${new Date().getFullYear()} ${esc(P.name)}. ${esc(FT.rights)}</span>
      <span>${esc(FT.note)}</span>`;
  }

  /* ------------------------------------------------------------------------
     2. TEXT SPLITTING — words or characters inside clipping masks.
        *asterisks* in data.js mark gradient-accent words.
     ------------------------------------------------------------------------ */
  function splitText(el, mode = 'words') {
    const raw = el.textContent.trim();
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = raw.replace(/\*/g, '');
    const vis = document.createElement('span');
    vis.className = 'split';
    vis.setAttribute('aria-hidden', 'true');

    const pieces = [];
    raw.split(/(\*[^*]+\*)/).filter(Boolean).forEach((part) => {
      const em = part.length > 2 && part.startsWith('*') && part.endsWith('*');
      (em ? part.slice(1, -1) : part).split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { vis.appendChild(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'w' + (em ? ' is-em' : '');
        if (mode === 'chars') {
          [...tok].forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'c'; c.textContent = ch;
            word.appendChild(c); pieces.push(c);
          });
        } else {
          const inner = document.createElement('span');
          inner.className = 'wi'; inner.textContent = tok;
          word.appendChild(inner); pieces.push(inner);
        }
        vis.appendChild(word);
      });
    });
    el.textContent = '';
    el.append(sr, vis);
    return pieces;
  }

  /** Give every character of the gradient hero line its slice of one continuous gradient. */
  function syncHeroGradient() {
    $$('.hero__line--grad').forEach((line) => {
      const lr = line.getBoundingClientRect();
      line.style.setProperty('--lw', lr.width + 'px');
      $$('.c', line).forEach((c) => c.style.setProperty('--cx', (c.getBoundingClientRect().left - lr.left) + 'px'));
    });
  }

  /* ------------------------------------------------------------------------
     3. SMOOTH SCROLL, PROGRESS, NAVIGATION
     ------------------------------------------------------------------------ */
  function initLenis() {
    if (!motionOK() || typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  /** Top bar + circular progress ring on the back-to-top button. */
  function initProgress() {
    const bar = $('#progressBar'), ring = $('#toTopRing'), top = $('#toTop');
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
      ring.style.strokeDashoffset = String(100 - p * 100);
      top.classList.toggle('is-visible', scrollY > innerHeight * 0.6);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
    top.addEventListener('click', () => scrollToTarget(0));
  }

  /** Active-section highlight + sliding pill in the dock. */
  function initNavSpy() {
    const pill = $('#dockPill');
    const links = $$('[data-nav]');
    const movePill = (a) => {
      if (!a || !wideMQ.matches) return;
      const ul = a.closest('ul');
      pill.style.setProperty('--x', (a.getBoundingClientRect().left - ul.getBoundingClientRect().left) + 'px');
      pill.style.setProperty('--w', a.offsetWidth + 'px');
      pill.classList.add('is-ready');
    };
    const setActive = (id) => {
      let active = null;
      links.forEach((a) => {
        const on = a.dataset.nav === id;
        a.classList.toggle('is-active', on);
        on ? (a.setAttribute('aria-current', 'true'), active = a) : a.removeAttribute('aria-current');
      });
      if (active) movePill(active); else pill.classList.remove('is-ready');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...C.nav.map((n) => n.id)].forEach((id) => { const el = $('#' + id); if (el) io.observe(el); });
    addEventListener('resize', () => movePill($('[data-nav].is-active')));
    document.fonts?.ready.then(() => movePill($('[data-nav].is-active')));
  }

  function scrollToTarget(target, immediate = false) {
    if (state.lenis) state.lenis.scrollTo(target, { duration: immediate ? 0 : 1.6, immediate, force: true });
    else if (typeof target === 'number') scrollTo({ top: target, behavior: reduceMQ.matches || immediate ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(id === '#top' ? 0 : el);
      history.replaceState(null, '', id);
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------------
     4. REVEALS, COUNTERS, SKILL RINGS
     ------------------------------------------------------------------------ */
  let heroPieces = [];

  function initReveals() {
    $$('[data-split]').forEach((el) => {
      const mode = el.dataset.split;
      const pieces = splitText(el, mode);
      if (el.closest('.hero')) {
        gsap.set(pieces, { yPercent: 120 });
        heroPieces.push(...pieces);
        return;
      }
      gsap.set(pieces, { yPercent: 120 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(pieces, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05 })
      });
    });

    $$('[data-fade]').forEach((el) => {
      gsap.from(el, {
        y: 50, opacity: 0, scale: 0.97, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Hero portrait drifts slower than the page
    gsap.to('.hero__visual', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const m = String(el.dataset.count).match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = Number(m[1]), suffix = m[2], o = { v: 0 };
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, { v: target, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } })
      });
    });
  }

  /** Rings sweep around and numbers count up. */
  function initRings() {
    $$('.skill').forEach((li, i) => {
      const level = Number(li.dataset.level);
      const fg = $('.ring__fg', li), val = $('.ring__val', li), o = { v: 0 };
      gsap.set(fg, { strokeDashoffset: 100 });
      val.textContent = '0';
      ScrollTrigger.create({
        trigger: li, start: 'top 94%', once: true,
        onEnter: () => {
          const delay = (i % 5) * 0.09;
          gsap.to(fg, { strokeDashoffset: 100 - level, duration: 1.8, ease: 'expo.out', delay });
          gsap.to(o, { v: level, duration: 1.8, ease: 'expo.out', delay, onUpdate: () => { val.textContent = Math.round(o.v); } });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. TIMELINE — the glowing line draws itself, cards float in from alternating sides
     ------------------------------------------------------------------------ */
  function buildTimeline() {
    state.tlCtx?.revert();
    const items = $$('.tl-item');
    if (!motionOK()) { items.forEach((it) => it.classList.add('is-lit')); return; }

    state.tlCtx = gsap.context(() => {
      const wrap = $('.tl__wrap'), glow = $('#tlGlow'), orb = $('#tlOrb');
      const scrub = { trigger: wrap, start: 'top 60%', end: 'bottom 60%', scrub: 0.5, invalidateOnRefresh: true };

      // The line draws itself, and a glowing orb rides its tip
      gsap.fromTo(glow, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: scrub });
      gsap.fromTo(orb, { y: 0 }, { y: () => wrap.offsetHeight, ease: 'none', scrollTrigger: { ...scrub } });

      const wide = wideMQ.matches;
      items.forEach((it, i) => {
        const dir = it.classList.contains('is-left') ? -1 : 1;
        // Cards float in from alternating sides (from below on mobile)
        gsap.from($('.tl-wrap', it), {
          x: wide ? dir * 110 : 0, y: wide ? 50 : 60, rotate: wide ? dir * 2.5 : 0, opacity: 0,
          duration: 1.4, ease: 'expo.out',
          scrollTrigger: { trigger: it, start: 'top 86%', once: true }
        });
        gsap.from($('.tl-side', it), {
          x: wide ? -dir * 60 : 0, opacity: 0, duration: 1.4, delay: 0.15, ease: 'expo.out',
          scrollTrigger: { trigger: it, start: 'top 86%', once: true }
        });
        // Node lights up once the line reaches it; card becomes "active" while centred
        ScrollTrigger.create({
          trigger: it, start: 'top 60%',
          onEnter: () => it.classList.add('is-lit'),
          onLeaveBack: () => it.classList.remove('is-lit')
        });
        ScrollTrigger.create({
          trigger: it, start: 'top 62%', end: 'bottom 52%',
          toggleClass: { targets: it, className: 'is-active' }
        });
      });
    });
    bindTilt($('#tlList'));
  }

  /* ------------------------------------------------------------------------
     6. INTERACTIONS
     ------------------------------------------------------------------------ */

  /* ---- Category filters ---- */
  function initFilters() {
    $('#timeline').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) setFilter(chip.dataset.cat);
    });
    wideMQ.addEventListener('change', () => { buildTimeline(); if (hasGSAP) ScrollTrigger.refresh(); });
  }

  function setFilter(cat) {
    if (cat === state.filter) return;
    state.filter = cat;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));

    const apply = () => {
      renderTimelineItems();
      buildTimeline();
      if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
    };
    if (motionOK()) {
      gsap.to($$('.tl-item'), {
        opacity: 0, scale: 0.9, y: 30, duration: 0.45, ease: 'power3.in', stagger: 0.03, onComplete: apply
      });
    } else apply();
  }

  /* ---- Detail modal (native <dialog>: focus trap + Esc included) ---- */
  function initModal() {
    const dlg = $('#modal');
    const M = C.modal, TL = C.timeline;

    const fill = (e, index, total) => {
      dlg.innerHTML = `
        <div class="modal__card"><div class="modal__inner" data-lenis-prevent>
          <button class="modal__close" type="button" data-close>${esc(M.close)} <span aria-hidden="true">✕</span></button>
          <div class="modal__media"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="1500"></div>
          <div class="modal__body">
            <p class="modal__meta"><span class="tl-cat">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</p>
            <h2 class="modal__title" id="modalTitle">${esc(e.title)}</h2>
            <p class="modal__sub">${esc(e.subtitle)}</p>
            <p class="modal__desc">${esc(e.description)}</p>
            <ul class="modal__tags" aria-label="${esc(M.tags)}">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            ${e.link ? `<a class="btn btn--primary modal__link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(M.visit)} <span class="btn__arrow" aria-hidden="true">↗</span><span class="sr-only"> (${esc(C.projects.visit)})</span></a>` : ''}
            <nav class="modal__nav" aria-label="Timeline">
              <button class="modal__step" type="button" data-step="-1">← ${esc(M.prev)}</button>
              <span class="modal__count">${pad(index + 1)} ${esc(M.of)} ${pad(total)}</span>
              <button class="modal__step" type="button" data-step="1">${esc(M.next)} →</button>
            </nav>
          </div>
        </div></div>`;
      state.modal.id = e.id;
    };

    const animateContent = (delay = 0) => {
      if (!motionOK()) return;
      gsap.set($('.modal__inner', dlg), { opacity: 1 });
      gsap.from($('.modal__media img', dlg), { scale: 1.15, opacity: 0, duration: 1.1, ease: 'expo.out', delay });
      gsap.from($$('.modal__body > *', dlg), { y: 26, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: delay + 0.1 });
    };

    const open = (id) => {
      const index = state.items.findIndex((e) => e.id === id);
      if (index < 0 || state.modal.open) return;
      fill(state.items[index], index, state.items.length);
      state.modal.open = true;
      dlg.classList.remove('is-closing');
      dlg.showModal();
      root.classList.add('modal-open');
      state.lenis?.stop();
      $('[data-close]', dlg).focus();
      if (motionOK()) {
        gsap.fromTo($('.modal__card', dlg), { opacity: 0, y: 60, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.3)', clearProps: 'transform' });
        animateContent(0.15);
      }
    };

    const requestClose = () => {
      if (!state.modal.open || state.modal.closing) return;
      state.modal.closing = true;
      dlg.classList.add('is-closing');
      if (!motionOK()) { dlg.close(); return; }
      gsap.to($('.modal__card', dlg), {
        opacity: 0, y: 40, scale: 0.95, duration: 0.45, ease: 'power3.in',
        onComplete: () => { dlg.close(); }
      });
    };

    const step = (dir) => {
      const list = state.items;
      let i = list.findIndex((e) => e.id === state.modal.id);
      i = (i + dir + list.length) % list.length;
      const swap = () => {
        fill(list[i], i, list.length);
        $(`[data-step="${dir}"]`, dlg)?.focus();
        animateContent(0);
      };
      if (motionOK()) gsap.to($('.modal__inner', dlg), { opacity: 0, x: dir * -30, duration: 0.25, ease: 'power2.in', onComplete: () => { gsap.set($('.modal__inner', dlg), { x: 0 }); swap(); } });
      else swap();
    };

    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-open]');
      if (card) open(card.dataset.open);
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) return requestClose();               // click on the dimmed backdrop
      if (e.target.closest('[data-close]')) requestClose();
      const s = e.target.closest('[data-step]');
      if (s) step(Number(s.dataset.step));
    });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });   // Esc
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
    dlg.addEventListener('close', () => {
      const id = state.modal.id;
      state.modal.open = false; state.modal.closing = false;
      root.classList.remove('modal-open');
      state.lenis?.start();
      $(`[data-open="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    });
  }

  /* ---- Theme ---- */
  function setThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    $('#themeBtn').setAttribute('aria-label', dark ? C.theme.toLight : C.theme.toDark);
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0920' : '#f2eefc');
  }

  function initTheme() {
    $('#themeBtn').addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const apply = () => {
        root.dataset.theme = next;
        try { localStorage.setItem('ex2-theme', next); } catch (_) { /* storage blocked */ }
        setThemeLabel();
      };
      if (document.startViewTransition && !reduceMQ.matches) document.startViewTransition(apply);
      else apply();
    });
  }

  /* ---- Mobile menu ---- */
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open', 'modal-open');
    const btn = $('#menuBtn');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = C.menu.open;
    if (!state.modal.open) state.lenis?.start();
  }

  function initMenu() {
    const btn = $('#menuBtn');
    btn.addEventListener('click', () => {
      if (root.classList.contains('menu-open')) return closeMenu();
      root.classList.add('menu-open', 'modal-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = C.menu.close;
      state.lenis?.stop();
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 1000px)').addEventListener('change', closeMenu);
  }

  /* ---- Cards tilt toward the cursor ---- */
  function bindTilt(scope = document) {
    if (!finePointer.matches || !motionOK()) return;
    $$('[data-tilt]', scope).forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = '1';
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 12); rx(-(py - 0.5) * 12);
        el.style.setProperty('--mx', px * 100 + '%');
        el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---- Cursor-follow glow ---- */
  function initGlow() {
    if (!finePointer.matches || !motionOK()) return;
    const glow = $('#glow');
    const xTo = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { glow.classList.add('is-on'); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
  }

  /* ---- Magnetic buttons ---- */
  function initMagnetic() {
    if (!finePointer.matches || !motionOK()) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---- Contact form → opens the visitor's email app ---- */
  function initContactForm() {
    const form = $('#contactForm'), F = C.contact.form;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const subject = encodeURIComponent(`${F.subjectPrefix} ${f.get('name')}`);
      const body = encodeURIComponent(`${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`);
      location.href = `mailto:${P.email}?subject=${subject}&body=${body}`;
      $('#formStatus').textContent = F.success;
    });
  }

  /** Pause CSS animations while the tab is hidden. */
  function initVisibility() {
    document.addEventListener('visibilitychange', () => root.classList.toggle('is-hidden', document.hidden));
  }

  /* ------------------------------------------------------------------------
     7. LOADER, INTRO & BOOT
     ------------------------------------------------------------------------ */
  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('#loader');
      if (!motionOK()) { loader.remove(); root.classList.remove('is-loading'); return resolve(); }

      const num = $('#loaderNum'), ring = $('#loaderRing'), o = { v: 0 };
      const tl = gsap.timeline({ onComplete: () => { loader.remove(); root.classList.remove('is-loading'); state.lenis?.start(); } });
      tl.to(o, {
          v: 100, duration: 1.2, ease: 'power2.inOut',
          onUpdate: () => { num.textContent = Math.round(o.v); ring.style.strokeDashoffset = String(100 - o.v); }
        })
        .to('.loader__orb', { scale: 1.12, duration: 0.3, ease: 'back.out(2)' })
        .call(resolve, null, '>')
        .to(loader, { opacity: 0, scale: 1.08, duration: 0.7, ease: 'expo.inOut' }, '<');

      const skip = () => tl.timeScale(8);
      $('#loaderSkip').addEventListener('click', skip);
      loader.addEventListener('click', skip);
      addEventListener('keydown', (e) => { if (['Enter', ' ', 'Escape'].includes(e.key) && $('#loader')) skip(); });
      $('#loaderSkip').focus({ preventScroll: true });
    });
  }

  function playIntro() {
    if (!motionOK()) return;
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to(heroPieces, { yPercent: 0, duration: 1.4, stagger: 0.035 }, 0)
      .from('[data-hero-in]', { y: 26, opacity: 0, duration: 1.1, stagger: 0.1, clearProps: 'transform,opacity' }, 0.1)
      .from('[data-hero-visual] .hero__portrait', { scale: 0.82, opacity: 0, rotate: -5, duration: 1.6, clearProps: 'transform,opacity' }, 0.15)
      .from('.hero__halo', { scale: 0.4, opacity: 0, duration: 1.8 }, 0.1)
      .from('.float', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.8)', stagger: 0.15, clearProps: 'transform,opacity' }, 0.9)
      .from(['.bar', '.dock'], { y: -30, opacity: 0, duration: 1.1, stagger: 0.1, clearProps: 'transform,opacity' }, 0.5);
  }

  function boot() {
    root.classList.add('is-loading');
    renderAll();

    initTheme(); initMenu(); initAnchors(); initProgress(); initNavSpy();
    initFilters(); initModal(); initContactForm(); initVisibility();

    if (motionOK()) {
      state.lenis = initLenis();
      state.lenis?.stop();
      initReveals();
      initCounters();
      initRings();
      bindTilt();
      initGlow();
      initMagnetic();
    }
    buildTimeline();
    syncHeroGradient();

    if (hasGSAP) {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => { syncHeroGradient(); ScrollTrigger.refresh(); });
      addEventListener('load', () => ScrollTrigger.refresh());
    }
    addEventListener('resize', syncHeroGradient);

    runLoader().then(playIntro);
  }

  boot();
})();
