/* ==========================================================================
   EX1 — EDITORIAL · main.js
   Structure:
     0. Setup & helpers
     1. Rendering (data -> HTML)           renderAll() and render* functions
     2. Text splitting                     splitText()
     3. Smooth scroll, progress, nav       initLenis(), initProgress(), initNavSpy()
     4. Reveal animations                  initReveals(), initCounters(), initSkills()
     5. Timeline (horizontal + stacked)    buildTimeline(), makeCounter()
     6. Interactions                       filters, modal, theme, menu, cursor, magnetic…
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

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const root = document.documentElement;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  /** Full motion only when GSAP loaded AND the visitor has not asked for less. */
  const motionOK = () => hasGSAP && !reduceMQ.matches;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const state = {
    filter: 'all',
    lenis: null,
    items: TIMELINE.slice(),   // currently visible timeline entries
    tl: { mode: 'vertical', mm: null, trigger: null },
    modal: { id: null, open: false, closing: false }
  };

  const categoryLabel = (key) => C.timeline.categories[key] || key;

  /* ------------------------------------------------------------------------
     1. RENDERING — data -> HTML
     ------------------------------------------------------------------------ */
  function renderAll() {
    document.title = `${P.name} — ${P.title}`;
    $('meta[name="description"]')?.setAttribute('content', P.bio);

    $('#skipLink').textContent = C.skipLink;
    $('#loaderName').textContent = P.name;
    $('#loaderLabel').textContent = C.loader.label;
    $('#loaderSkip').textContent = C.loader.skip;
    $('#brand').textContent = P.name;
    $('#menuBtn').textContent = C.menu.open;

    $('#navList').innerHTML = C.nav.map((n, i) =>
      `<li><a href="#${n.id}" data-nav="${n.id}"><span class="nav-i">${pad(i + 1)}</span>${esc(n.label)}</a></li>`).join('');

    renderHero();
    renderMarquee();
    renderAbout();
    renderTimelineShell();
    renderTimelineItems();
    renderProjects();
    renderSkills();
    renderFuture();
    renderContact();
    renderFooter();
    setThemeLabel();
  }

  function renderHero() {
    const [first, ...rest] = P.name.split(' ');
    $('#top').innerHTML = `
      <div class="hero__meta">
        <span>${esc(C.hero.eyebrow)}</span>
        <span>${esc(P.location)}</span>
      </div>
      <h1 class="hero__name" id="heroName">
        <span class="hero__line" data-split="chars">${esc(first)}</span>
        <span class="hero__line hero__line--second" data-split="chars">${esc(rest.join(' '))}</span>
      </h1>
      <figure class="hero__portrait">
        <div class="hero__portrait-frame">
          <img src="${esc(P.avatar)}" alt="${esc(P.avatarAlt)}" width="800" height="1000" fetchpriority="high" decoding="async">
        </div>
        <figcaption class="hero__caption"><span>${esc(C.hero.portraitCaption)}</span><span>${esc(P.location)}</span></figcaption>
      </figure>
      <div class="hero__foot">
        <p class="hero__title">${esc(P.title)}</p>
        <p class="hero__lede">${esc(P.bio)}</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="#timeline" data-magnetic>${esc(C.hero.cta1)} <span class="btn__arrow" aria-hidden="true">↓</span></a>
          <a class="btn" href="#contact" data-magnetic>${esc(C.hero.cta2)}</a>
        </div>
      </div>
      <span class="hero__scroll" aria-hidden="true">${esc(C.hero.scroll)}</span>`;
  }

  function renderMarquee() {
    const words = SKILLS.map((s) => s.name);
    const row = words.map((w) => `<span class="marquee__item">${esc(w)}</span>`).join('');
    $('#marquee').innerHTML = `<div class="marquee__track">${row}${row}</div>`;
  }

  function renderAbout() {
    const A = C.about;
    $('#about').innerHTML = `
      <div class="sec-head" data-fade><span class="sec-index">${A.index}</span><span class="sec-label">${esc(A.label)}</span></div>
      <div class="about__grid">
        <h2 class="about__statement" data-split="words" data-scrub>${esc(A.statement)}</h2>
        <div class="about__cols" data-fade>
          ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
          <dl class="about__facts">
            <div><dt>${esc(A.facts.school)}</dt><dd>${esc(P.university)}</dd></div>
            <div><dt>${esc(A.facts.applying)}</dt><dd>${esc(P.degree)}</dd></div>
            <div><dt>${esc(A.facts.based)}</dt><dd>${esc(P.location)}</dd></div>
          </dl>
        </div>
      </div>
      <dl class="stats">
        ${STATS.map((s) => `<div class="stat" data-fade><dt>${esc(s.label)}</dt><dd class="stat__v" data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
      </dl>`;
  }

  /** Static frame of the timeline section (head, filters, year counter, rail). */
  function renderTimelineShell() {
    const TL = C.timeline;
    const cats = Object.keys(TL.categories).filter((k) => TIMELINE.some((e) => e.category === k));
    const chip = (key, label, n) =>
      `<button class="chip" type="button" data-cat="${key}" aria-pressed="${key === 'all'}">${esc(label)} <span class="chip__n">${n}</span></button>`;
    const digits = [0, 1, 2, 3].map(() =>
      `<span class="yc-d"><span class="yc-strip">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<span>${n}</span>`).join('')}</span></span>`).join('');

    $('#timeline').innerHTML = `
      <div class="tl__head">
        <div>
          <div class="sec-head" data-fade data-trigger="#timeline"><span class="sec-index">${TL.index}</span><span class="sec-label">${esc(TL.label)}</span></div>
          <h2 class="sec-title" id="tlTitle" data-split="words" data-trigger="#timeline">${esc(TL.title)}</h2>
        </div>
        <div class="tl__controls" data-fade data-trigger="#timeline">
          <div class="chips" role="group" aria-label="${esc(TL.filtersLabel)}">
            ${chip('all', TL.all, TIMELINE.length)}
            ${cats.map((k) => chip(k, TL.categories[k], TIMELINE.filter((e) => e.category === k).length)).join('')}
          </div>
          <p class="tl__count" id="tlCount" aria-live="polite"></p>
        </div>
      </div>
      <div class="tl__stage">
        <div class="yc" id="yc" aria-hidden="true">${digits}</div>
        <div class="tl__viewport"><ol class="tl__track" id="tlTrack" aria-label="${esc(TL.listLabel)}"></ol></div>
      </div>
      <div class="tl__rail" aria-hidden="true">
        <span class="tl__hint">${esc(TL.hint)}</span>
        <div class="tl__line"><span class="tl__fill" id="tlFill"></span><div id="tlTicks"></div></div>
        <span class="tl__pos" id="tlPos"></span>
      </div>`;
  }

  /** (Re)build the list of timeline cards for the active filter. */
  function renderTimelineItems() {
    const TL = C.timeline;
    state.items = TIMELINE.filter((e) => state.filter === 'all' || e.category === state.filter);
    $('#tlTrack').innerHTML = state.items.map((e, i) => `
      <li class="tl-item" data-id="${esc(e.id)}" data-year="${e.year}" data-cat="${esc(e.category)}">
        <button class="tl-card" type="button" data-open="${esc(e.id)}" data-cursor="${esc(TL.open.split(' ')[0])}" aria-haspopup="dialog">
          <span class="tl-year-v" aria-hidden="true">${e.year}</span>
          <span class="tl-media" data-clip>
            <img src="${esc(e.image)}" alt="${esc(e.alt)}" width="800" height="1000" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
            ${e.highlight ? `<span class="tl-flag">${esc(TL.milestone)}</span>` : ''}
          </span>
          <span class="tl-body">
            <span class="tl-meta"><span>${pad(i + 1)} — ${esc(e.date)}</span><span class="tl-cat">${esc(categoryLabel(e.category))}</span></span>
            <span class="tl-title">${esc(e.title)}</span>
            <span class="tl-sub">${esc(e.subtitle)}</span>
            <span class="tl-more">${esc(TL.open)}</span>
          </span>
        </button>
      </li>`).join('');
    $('#tlCount').textContent = TL.count.replace('{n}', state.items.length);
  }

  function renderProjects() {
    const PC = C.projects;
    $('#projects').innerHTML = `
      <div class="sec-head" data-fade><span class="sec-index">${PC.index}</span><span class="sec-label">${esc(PC.label)}</span></div>
      <h2 class="sec-title" id="projTitle" data-split="words" style="margin-bottom:clamp(2rem,5vw,4rem)">${esc(PC.title)}</h2>
      <ol class="proj-list">
        ${PROJECTS.map((p, i) => `
          <li class="proj" data-img="${esc(p.image)}" data-fade>
            <span class="proj__i">${pad(i + 1)}</span>
            <div class="proj__main">
              <h3 class="proj__title"><a href="${esc(p.link)}" target="_blank" rel="noopener" data-cursor="Visit">${esc(p.title)}<span class="sr-only"> (${esc(PC.visit)})</span></a></h3>
              <p class="proj__desc">${esc(p.description)}</p>
            </div>
            <ul class="proj__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            <div class="proj__side">
              <span class="proj__year">${p.year}</span>
              ${p.repo ? `<a class="proj__repo" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(PC.repo)}<span class="sr-only"> — ${esc(p.title)} (${esc(PC.visit)})</span></a>` : ''}
            </div>
            <figure class="proj__inline"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="1200" height="900" loading="lazy" decoding="async"></figure>
          </li>`).join('')}
      </ol>`;
  }

  function renderSkills() {
    const SC = C.skills;
    const groups = Object.keys(SC.groups).filter((g) => SKILLS.some((s) => s.group === g));
    $('#skills').innerHTML = `
      <div class="sec-head" data-fade><span class="sec-index">${SC.index}</span><span class="sec-label">${esc(SC.label)}</span></div>
      <h2 class="sec-title" id="skillsTitle" data-split="words" style="margin-bottom:clamp(2.5rem,6vw,5rem)">${esc(SC.title)}</h2>
      <div class="skills__grid">
        ${groups.map((g) => {
          const list = SKILLS.filter((s) => s.group === g);
          return `<div class="skill-group" data-fade>
            <h3 class="skill-group__title">${esc(SC.groups[g])}<small>${pad(list.length)}</small></h3>
            <ul>${list.map((s) => `
              <li class="skill" data-level="${s.level}">
                <div class="skill__top"><span>${esc(s.name)}</span><span class="skill__val">${s.level}</span></div>
                <div class="skill__bar" role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}">
                  <span class="skill__fill" style="--lvl:${s.level / 100}"></span>
                </div>
              </li>`).join('')}</ul>
          </div>`;
        }).join('')}
      </div>`;
  }

  function renderFuture() {
    const FC = C.future;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    $('#future').innerHTML = `
      <div class="sec-head" data-fade><span class="sec-index">${FC.index}</span><span class="sec-label">${esc(FC.label)}</span></div>
      <h2 class="sec-title" id="futureTitle" data-split="words" style="margin-bottom:clamp(2rem,5vw,4rem)">${esc(FC.title)}</h2>
      <ol class="future__list">
        ${FUTURE.map((g, i) => `
          <li class="goal" data-fade>
            <span class="goal__n" aria-hidden="true">${roman[i] || i + 1}</span>
            <h3 class="goal__t">${esc(g.goal)}</h3>
            <p class="goal__d">${esc(g.description)}</p>
          </li>`).join('')}
      </ol>
      <p class="future__closing" data-fade>${esc(FC.closing)}</p>`;
  }

  function renderContact() {
    const CC = C.contact, F = CC.form;
    $('#contact').innerHTML = `
      <div class="sec-head" data-fade><span class="sec-index">${CC.index}</span><span class="sec-label">${esc(CC.label)}</span></div>
      <div class="contact__grid">
        <div class="contact__main">
          <h2 class="sec-title" id="contactTitle" data-split="words">${esc(CC.title)}</h2>
          <p class="contact__intro" data-fade>${esc(CC.intro)}</p>
          <div class="contact__email-wrap" data-fade>
            <span class="contact__email-label">${esc(CC.emailLabel)}</span>
            <a class="contact__email" href="mailto:${esc(P.email)}" data-magnetic>${esc(P.email)}</a>
          </div>
        </div>
        <form class="form" id="contactForm" data-fade>
          <div class="field"><label for="cf-name">${esc(F.name)}</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
          <div class="field"><label for="cf-email">${esc(F.email)}</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="cf-msg">${esc(F.message)}</label><textarea id="cf-msg" name="message" rows="4" required></textarea></div>
          <button class="btn btn--primary" type="submit" data-magnetic>${esc(F.send)} <span class="btn__arrow" aria-hidden="true">→</span></button>
          <p class="form__status" id="formStatus" role="status"></p>
        </form>
      </div>`;
  }

  function renderFooter() {
    const FT = C.footer;
    $('#footer').innerHTML = `
      <p class="footer__name">${esc(P.name)}</p>
      <ul class="footer__social">${P.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span class="sr-only"> (${esc(C.projects.visit)})</span></a></li>`).join('')}</ul>
      <a class="footer__top" href="#top">${esc(FT.top)} ↑</a>
      <div class="footer__meta"><span>© ${new Date().getFullYear()} ${esc(P.name)}. ${esc(FT.rights)}</span><span>${esc(FT.note)}</span></div>`;
  }

  /* ------------------------------------------------------------------------
     2. TEXT SPLITTING (words or characters, each wrapped in a clipping mask)
        Wrap text in *asterisks* in data.js to make that part italic/accent.
        Word masks reflow naturally on resize, so no re-splitting is needed.
     ------------------------------------------------------------------------ */
  function splitText(el, mode = 'words') {
    const raw = el.textContent.trim();
    const sr = document.createElement('span');          // accessible copy
    sr.className = 'sr-only';
    sr.textContent = raw.replace(/\*/g, '');
    const vis = document.createElement('span');          // visual, hidden from AT
    vis.className = 'split';
    vis.setAttribute('aria-hidden', 'true');

    const pieces = [];
    raw.split(/(\*[^*]+\*)/).filter(Boolean).forEach((part) => {
      const italic = part.length > 2 && part.startsWith('*') && part.endsWith('*');
      (italic ? part.slice(1, -1) : part).split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { vis.appendChild(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'w' + (italic ? ' is-italic' : '');
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

  /* ------------------------------------------------------------------------
     3. SMOOTH SCROLL, PROGRESS, NAVIGATION
     ------------------------------------------------------------------------ */
  function initLenis() {
    if (!motionOK() || typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))   // expo-out
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  /** Scroll progress bar — works with or without Lenis/GSAP. */
  function initProgress() {
    const bar = $('#progressBar');
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /** Highlight the nav link of the section currently in the middle of the screen. */
  function initNavSpy() {
    const setActive = (id) => $$('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === id;
      a.classList.toggle('is-active', on);
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...C.nav.map((n) => n.id)].forEach((id) => { const el = $('#' + id); if (el) io.observe(el); });
  }

  /** In-page links: smooth scroll via Lenis, correct target when the timeline is pinned. */
  const anchorTarget = (el) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el);

  function scrollToTarget(target, immediate = false) {
    if (state.lenis) state.lenis.scrollTo(target, { duration: immediate ? 0 : 1.6, immediate, force: true });
    else if (typeof target === 'number') scrollTo(0, target);
    else target.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = id === '#top' ? $('#top') : $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(id === '#top' ? 0 : anchorTarget(el));
      history.replaceState(null, '', id);
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------------
     4. REVEAL ANIMATIONS
     ------------------------------------------------------------------------ */
  let heroPieces = [];

  function initReveals() {
    // Text: words/characters rise out of their masks
    $$('[data-split]').forEach((el) => {
      const mode = el.dataset.split;
      const pieces = splitText(el, mode);
      if (el.closest('.hero')) {            // hero characters wait below their masks for the intro
        gsap.set(pieces, { yPercent: 115 });
        heroPieces.push(...pieces);
        return;
      }

      const trigger = el.dataset.trigger ? $(el.dataset.trigger) : el;

      if (el.hasAttribute('data-scrub')) {
        // Statement: words fill from muted to full ink as you scroll
        gsap.fromTo(pieces, { opacity: 0.18 }, {
          opacity: 1, ease: 'none', stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true }
        });
        return;
      }
      gsap.set(pieces, { yPercent: 115 });
      ScrollTrigger.create({
        trigger, start: el.dataset.trigger ? 'top 65%' : 'top 88%', once: true,
        onEnter: () => gsap.to(pieces, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: mode === 'chars' ? 0.025 : 0.05 })
      });
    });

    // Generic fade-up blocks
    $$('[data-fade]').forEach((el) => {
      const trigger = el.dataset.trigger ? $(el.dataset.trigger) : el;
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1.1, ease: 'expo.out',
        clearProps: 'transform,opacity',      // so CSS hover transforms work afterwards
        scrollTrigger: { trigger, start: el.dataset.trigger ? 'top 65%' : 'top 90%', once: true }
      });
    });

    // Hero: parallax drift
    gsap.utils.toArray('.hero__line').forEach((line, i) => {
      gsap.to(line, {
        xPercent: i ? 6 : -6, ease: 'none',
        scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
      });
    });
    gsap.to('.hero__portrait-frame img', {
      yPercent: 12, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /** Animated number counters ("24", "40+", "43/45" …). */
  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const m = String(el.dataset.count).match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = Number(m[1]), suffix = m[2], o = { v: 0 };
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 2, ease: 'expo.out',
          onUpdate: () => { el.textContent = Math.round(o.v) + suffix; }
        })
      });
    });
  }

  /** Skill bars grow from the left and numbers count up. */
  function initSkills() {
    $$('.skill').forEach((li, i) => {
      const level = Number(li.dataset.level);
      const fill = $('.skill__fill', li), val = $('.skill__val', li), o = { v: 0 };
      gsap.set(fill, { scaleX: 0 });
      val.textContent = '0';
      ScrollTrigger.create({
        trigger: li, start: 'top 94%', once: true,
        onEnter: () => {
          const delay = (i % 4) * 0.08;
          gsap.to(fill, { scaleX: level / 100, duration: 1.6, ease: 'expo.out', delay });
          gsap.to(o, { v: level, duration: 1.6, ease: 'expo.out', delay, onUpdate: () => { val.textContent = Math.round(o.v); } });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. TIMELINE — horizontal scroll-driven on desktop, stacked on mobile
     ------------------------------------------------------------------------ */

  /** Rolling four-digit year counter. */
  function makeCounter(rootEl) {
    const strips = $$('.yc-strip', rootEl);
    let current = '';
    return {
      set(value, instant = false) {
        const s = String(value).padStart(4, '0');
        if (s === current) return;
        strips.forEach((strip, i) => {
          if (s[i] === current[i]) return;
          const y = -10 * Number(s[i]);
          instant ? gsap.set(strip, { yPercent: y })
                  : gsap.to(strip, { yPercent: y, duration: 0.7, ease: 'expo.out', overwrite: true });
        });
        current = s;
      }
    };
  }

  /** Paused reveal timeline for one timeline card (clip-path image + text). */
  function makeItemReveal(item) {
    const media = $('.tl-media', item), img = $('img', media), body = $$('.tl-body > span', item);
    gsap.set(media, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set(img, { scale: 1.35 });
    gsap.set(body, { y: 28, opacity: 0 });
    return gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0)
      .to(img, { scale: 1, duration: 1.6 }, 0)
      .to(body, { y: 0, opacity: 1, duration: 1, stagger: 0.07 }, 0.25);
  }

  function setTimelineMode(mode) {
    state.tl.mode = mode;
    $('#timeline').classList.toggle('is-h', mode === 'horizontal');
    root.dataset.tl = mode;
  }

  function buildTimeline() {
    if (state.tl.mm) state.tl.mm.revert();
    state.tl.trigger = null;
    setTimelineMode('vertical');
    if (!hasGSAP) return;

    const section = $('#timeline'), track = $('#tlTrack');
    const mm = gsap.matchMedia();
    state.tl.mm = mm;

    /* ---- Desktop + motion: pinned section, vertical scroll drives horizontal travel ---- */
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      setTimelineMode('horizontal');

      const items = $$('.tl-item', track);
      const years = items.map((it) => Number(it.dataset.year));
      const counter = makeCounter($('#yc'));
      const setFill = gsap.quickSetter($('#tlFill'), 'scaleX');
      const posEl = $('#tlPos'), ticksEl = $('#tlTicks');
      let centers = [];
      const maxX = () => Math.max(1, track.scrollWidth - innerWidth);
      const focusX = () => innerWidth * 0.4;       // the "now" line of the timeline

      const measure = () => {
        centers = items.map((it) => it.offsetLeft + it.offsetWidth / 2);
        ticksEl.innerHTML = centers.map((c) =>
          `<span class="tl__tick" style="left:${clamp((c - focusX()) / maxX(), 0, 1) * 100}%"></span>`).join('');
      };

      // Update counter, rail and active card from scroll progress (0–1)
      let lastActive = -1;
      const onProgress = (p) => {
        if (!centers.length) return;
        const f = p * maxX() + focusX();
        let i = centers.findIndex((c) => c > f);
        let idx, t = 0;
        if (i === -1) { idx = items.length - 1; }
        else if (i === 0) { idx = 0; }
        else { idx = i - 1; t = (f - centers[idx]) / (centers[i] - centers[idx]); }
        const y1 = years[Math.min(idx + 1, items.length - 1)];
        counter.set(Math.round(years[idx] + (y1 - years[idx]) * t));
        const active = t > 0.5 ? idx + 1 : idx;
        if (active !== lastActive) {
          lastActive = active;
          items.forEach((it, n) => it.classList.toggle('is-active', n === active));
          posEl.textContent = `${pad(active + 1)} / ${pad(items.length)}`;
        }
        setFill(p);
      };

      measure();
      counter.set(years[0] || 2014, true);
      posEl.textContent = `01 / ${pad(items.length)}`;

      const tween = gsap.to(track, {
        x: () => -maxX(), ease: 'none',
        scrollTrigger: {
          trigger: section, pin: true, scrub: true, start: 'top top',
          end: () => '+=' + maxX(), invalidateOnRefresh: true, anticipatePin: 1,
          onRefresh: (self) => { measure(); onProgress(self.progress); },
          onUpdate: (self) => onProgress(self.progress)
        }
      });
      state.tl.trigger = tween.scrollTrigger;

      // Each card reveals as it enters from the right
      items.forEach((it) => {
        const reveal = makeItemReveal(it);
        ScrollTrigger.create({
          trigger: it, containerAnimation: tween, start: 'left 92%', once: true,
          onEnter: () => reveal.play()
        });
        if (it.offsetLeft < innerWidth * 0.9) reveal.play();   // already on screen at the start
      });

      // Keyboard: focusing a card scrolls the page so that card reaches the "now" line
      const onFocusIn = (e) => {
        const it = e.target.closest('.tl-item');
        if (!it) return;
        const st = tween.scrollTrigger;
        const p = clamp((centers[items.indexOf(it)] - focusX()) / maxX(), 0, 1);
        const y = st.start + p * (st.end - st.start);
        if (Math.abs(scrollY - y) > 4) scrollToTarget(y);
      };
      track.addEventListener('focusin', onFocusIn);

      return () => {                       // cleanup when the media query stops matching
        track.removeEventListener('focusin', onFocusIn);
        setTimelineMode('vertical');
      };
    });

    /* ---- Mobile / tablet + motion: stacked list with scroll reveals ---- */
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      setTimelineMode('vertical');
      $$('.tl-item', track).forEach((it) => {
        const reveal = makeItemReveal(it);
        ScrollTrigger.create({ trigger: it, start: 'top 88%', once: true, onEnter: () => reveal.play() });
        ScrollTrigger.create({
          trigger: it, start: 'top 60%', end: 'bottom 60%',
          toggleClass: { targets: it, className: 'is-active' }
        });
      });
    });
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
  }

  function setFilter(cat) {
    if (cat === state.filter) return;
    state.filter = cat;
    $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));

    const apply = () => {
      // Return to the start of the timeline, then rebuild items + scroll logic
      const section = $('#timeline');
      const top = anchorTarget(section).getBoundingClientRect().top + scrollY;
      renderTimelineItems();
      buildTimeline();
      scrollToTarget(top, true);
      if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
      if (motionOK() && state.tl.mode === 'vertical') {
        gsap.from('.tl-item', { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out', stagger: 0.06 });
      }
    };

    if (motionOK()) {
      gsap.to($$('.tl-item'), { opacity: 0, y: -24, duration: 0.4, ease: 'power3.in', stagger: 0.025, onComplete: apply });
    } else apply();
  }

  /* ---- Detail modal (native <dialog>: focus trap + Esc come for free) ---- */
  function initModal() {
    const dlg = $('#modal');
    const M = C.modal, TL = C.timeline;

    const fill = (e, index, total) => {
      dlg.innerHTML = `
        <div class="modal__inner" data-lenis-prevent>
          <button class="modal__close" type="button" data-close>${esc(M.close)} <span aria-hidden="true">✕</span></button>
          <div class="modal__media"><div class="modal__reveal"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="1500"></div></div>
          <div class="modal__body">
            <p class="modal__meta"><b>${esc(categoryLabel(e.category))}</b><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</p>
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
        </div>`;
      state.modal.id = e.id;
    };

    const animateIn = (delay = 0) => {
      if (!motionOK()) return;
      gsap.set($('.modal__inner', dlg), { opacity: 1 });
      gsap.fromTo($('.modal__reveal', dlg), { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', delay });
      gsap.from($('.modal__reveal img', dlg), { scale: 1.3, duration: 1.6, ease: 'expo.out', delay });
      gsap.from($$('.modal__body > *', dlg), { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: delay + 0.25 });
    };

    const open = (id) => {
      const index = state.items.findIndex((e) => e.id === id);
      if (index < 0 || state.modal.open) return;
      fill(state.items[index], index, state.items.length);
      state.modal.open = true;
      dlg.showModal();
      root.classList.add('modal-open');
      state.lenis?.stop();
      $('[data-close]', dlg).focus();
      if (motionOK()) {
        gsap.fromTo(dlg, { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' });
        animateIn(0.35);
      }
    };

    const requestClose = () => {
      if (!state.modal.open || state.modal.closing) return;
      state.modal.closing = true;
      if (!motionOK()) { dlg.close(); return; }
      gsap.to(dlg, {
        clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut',
        onComplete: () => { dlg.close(); gsap.set(dlg, { clearProps: 'clipPath' }); }
      });
    };

    const step = (dir) => {
      const list = state.items;
      let i = list.findIndex((e) => e.id === state.modal.id);
      i = (i + dir + list.length) % list.length;
      const swap = () => {
        fill(list[i], i, list.length);
        $(`[data-step="${dir}"]`, dlg)?.focus();
        animateIn(0);
      };
      if (motionOK()) gsap.to($('.modal__inner', dlg), { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: swap });
      else swap();
    };

    // Open from any card
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-open]');
      if (card) open(card.dataset.open);
    });
    // Close / step inside the dialog
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) requestClose();
      const s = e.target.closest('[data-step]');
      if (s) step(Number(s.dataset.step));
    });
    // Esc → animated close
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });
    // Arrow keys move between entries
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
    // Cleanup after it is closed (by us or by the browser)
    dlg.addEventListener('close', () => {
      const id = state.modal.id;
      state.modal.open = false; state.modal.closing = false;
      root.classList.remove('modal-open');
      state.lenis?.start();
      $(`[data-open="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    });
  }

  /* ---- Theme toggle (with View Transitions where supported) ---- */
  function setThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    const btn = $('#themeBtn');
    btn.setAttribute('aria-label', dark ? C.theme.toLight : C.theme.toDark);
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f0f0e' : '#f3f0e8');
  }

  function initTheme() {
    $('#themeBtn').addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const apply = () => {
        root.dataset.theme = next;
        try { localStorage.setItem('ex1-theme', next); } catch (_) { /* storage blocked */ }
        setThemeLabel();
      };
      if (document.startViewTransition && !reduceMQ.matches) document.startViewTransition(apply);
      else apply();
    });
  }

  /* ---- Mobile menu ---- */
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
    $('#menuBtn').textContent = C.menu.open;
    if (!state.modal.open) state.lenis?.start();
    root.classList.remove('modal-open');
  }

  function initMenu() {
    const btn = $('#menuBtn');
    btn.addEventListener('click', () => {
      const open = !root.classList.contains('menu-open');
      if (!open) return closeMenu();
      root.classList.add('menu-open', 'modal-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = C.menu.close;
      state.lenis?.stop();
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 900px)').addEventListener('change', closeMenu);
  }

  /* ---- Project rows: hover preview that follows the cursor ---- */
  function initProjects() {
    if (!finePointer.matches || !motionOK()) return;
    root.classList.add('has-preview');
    const prev = $('#projPreview'), img = $('img', prev);
    const xTo = gsap.quickTo(prev, 'x', { duration: 0.6, ease: 'expo.out' });
    const yTo = gsap.quickTo(prev, 'y', { duration: 0.6, ease: 'expo.out' });
    $$('.proj').forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        img.src = row.dataset.img;
        xTo(e.clientX); yTo(e.clientY);
        gsap.fromTo(prev, { scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      });
      row.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
      row.addEventListener('pointerleave', () => gsap.to(prev, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'expo.out', overwrite: 'auto' }));
    });
  }

  /* ---- Custom cursor ring with contextual label ---- */
  function initCursor() {
    if (!finePointer.matches || !motionOK()) return;
    const cur = $('#cursor'), label = $('.cursor__label', cur);
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'expo.out' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'expo.out' });
    addEventListener('pointermove', (e) => {
      cur.classList.add('is-on');
      xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-big'); }
      else cur.classList.remove('is-big');
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
  }

  /* ---- Magnetic buttons ---- */
  function initMagnetic() {
    if (!finePointer.matches || !motionOK()) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---- Contact form (no backend: hands the message to the visitor's email app) ---- */
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

  /* ------------------------------------------------------------------------
     7. LOADER, INTRO & BOOT
     ------------------------------------------------------------------------ */

  /** Counter loader, ~2.2s total. Resolves slightly early so the hero intro overlaps the exit. */
  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('#loader');
      if (!motionOK()) { loader.remove(); root.classList.remove('is-loading'); return resolve(); }

      const num = $('#loaderNum'), o = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => { loader.remove(); root.classList.remove('is-loading'); state.lenis?.start(); }
      });
      tl.to(o, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(o.v); } })
        .to('.loader__count, .loader__top, .loader__skip', { opacity: 0, duration: 0.25, ease: 'power2.out' })
        .call(resolve, null, '+=0.1')
        .to(loader, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '<');

      // Skippable: button, click anywhere, or Enter / Space / Esc
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
      .to(heroPieces, { yPercent: 0, duration: 1.4, stagger: 0.04 }, 0)
      .from('.hero__meta > *', { y: 20, opacity: 0, duration: 1, stagger: 0.1 }, 0.2)
      .fromTo('.hero__portrait-frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .from('.hero__caption', { opacity: 0, y: 10, duration: 1 }, 0.9)
      .from('.hero__foot > *', { y: 28, opacity: 0, duration: 1.1, stagger: 0.1 }, 0.5)
      // clearProps: a lingering transform would trap the fixed mobile menu inside the header
      .from('.site-header', { y: -30, opacity: 0, duration: 1.1, clearProps: 'transform,opacity' }, 0.6);
  }

  function boot() {
    root.classList.add('is-loading');
    renderAll();

    // Features that work without GSAP
    initTheme(); initMenu(); initAnchors(); initProgress(); initNavSpy();
    initFilters(); initModal(); initContactForm();

    if (motionOK()) {
      state.lenis = initLenis();
      state.lenis?.stop();                       // locked until the loader ends
      initReveals();
      initCounters();
      initSkills();
      initProjects();
      initCursor();
      initMagnetic();
    }
    buildTimeline();

    if (hasGSAP) {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      // Re-measure when fonts and images settle
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      addEventListener('load', () => ScrollTrigger.refresh());
    }

    runLoader().then(playIntro);
  }

  boot();
})();
