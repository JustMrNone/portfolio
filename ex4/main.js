/* ==========================================================================
   EX4 — PLAYFUL · main.js
   Structure:
     0. Setup & helpers
     1. Rendering (data -> HTML)
     2. Effects: confetti, cursor sparkles, marquee tapes, sticker parallax
     3. Smooth scroll, progress rider, navigation
     4. Reveals & counters
     5. Timeline: winding SVG path, walker, stops, draggable polaroids
     6. Interactions: filters, flip cards, skill bubbles, modal, theme, menu, form
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
  const PL = C.playful;

  const $  = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  /** *word* -> <span class="hl">word</span> (headings) or <mark> (running text) */
  const hl = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
  const mark = (s) => esc(s).replace(/\*([^*]+)\*/g, '<mark>$1</mark>');
  const categoryLabel = (k) => C.timeline.categories[k] || k;
  const CAT_COLOR = { education: 'blue', project: 'green', award: 'yellow', work: 'orange', personal: 'pink', travel: 'purple' };
  const COLORS = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'];
  const HEX = ['#ffd23f', '#ff6b9d', '#4d8dff', '#35d6a0', '#ff8a3d', '#a07bff'];
  const sticker = (id, color) => `<svg viewBox="0 0 64 64" ${color ? `style="--c:var(--${color})"` : ''} aria-hidden="true"><use href="#s-${id}"/></svg>`;

  const root = document.documentElement;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const wideMQ = matchMedia('(min-width: 900px)');
  const motionOK = () => hasGSAP && !reduceMQ.matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const state = { filter: 'all', items: TIMELINE.slice(), lenis: null, tlCtx: null, path: null, modal: { id: null, open: false, closing: false }, heroTiles: [] };

  /* ------------------------------------------------------------------------
     1. RENDERING
     ------------------------------------------------------------------------ */
  function renderAll() {
    document.title = `${P.name} — ${P.title}`;
    $('meta[name="description"]')?.setAttribute('content', P.bio);
    $('#skipLink').textContent = C.skipLink;
    $('#loaderLabel').textContent = C.loader.label;
    $('#loaderSkip').textContent = C.loader.skip;
    $('#brandText').textContent = P.name;
    $('#menuBtn').textContent = C.menu.open;

    $('#navList').innerHTML = C.nav.map((n) => `<li><a href="#${n.id}" data-nav="${n.id}">${esc(n.label)}</a></li>`).join('');

    renderHero(); renderAbout(); renderTimelineShell(); renderTimelineItems();
    renderProjects(); renderSkills(); renderFuture(); renderContact(); renderFooter();
    setThemeLabel();
  }

  const tapeStrip = (words, cls) => {
    const row = words.map((w, i) => `<span>${esc(w)}${sticker(['star', 'cross', 'heart', 'pill'][i % 4], COLORS[(i + 1) % 6])}</span>`).join('');
    return `<div class="tape-strip ${cls}">${row}${row}</div>`;
  };

  function renderHero() {
    const [first, ...rest] = P.name.split(' ');
    const tiles = (word, off) => [...word].map((ch, i) => `<span class="tile" style="--bg:var(--${COLORS[(i + off) % 6]});--r:${i % 2 ? 2.5 : -2.5}deg">${esc(ch)}</span>`).join('');
    $('#top').innerHTML = `
      <div class="hero__inner">
        <div class="hero__text">
          <p class="hero__hi" data-intro>${esc(PL.greeting)} ${sticker('heart', 'pink')}</p>
          <h1 class="hero__name" id="heroName">
            <span class="sr-only">${esc(P.name)}</span>
            <span class="name-line" aria-hidden="true">${tiles(first, 0)}</span>
            <span class="name-line" aria-hidden="true">${tiles(rest.join(' ').replace(/\s/g, ''), 3)}</span>
          </h1>
          <p class="hero__title" data-intro>${esc(P.title)}</p>
          <p class="bubble block" data-intro>${esc(P.bio)}</p>
          <div class="hero__cta" data-intro>
            <a class="btn btn--pink" href="#timeline">${esc(C.hero.cta1)} <span aria-hidden="true">↓</span></a>
            <a class="btn btn--white" href="#contact">${esc(C.hero.cta2)}</a>
          </div>
        </div>
        <div class="hero__visual">
          <span class="floaty f1" data-pop aria-hidden="true">${sticker('pill', 'yellow')}</span>
          <span class="floaty f2" data-pop aria-hidden="true">${sticker('heart', 'pink')}</span>
          <span class="floaty f3" data-pop aria-hidden="true">${sticker('cross', 'green')}</span>
          <span class="floaty f4" data-pop aria-hidden="true">${sticker('thermo', 'orange')}</span>
          <span class="floaty f5" data-pop aria-hidden="true">${sticker('steth', 'blue')}</span>
          <figure class="polaroid hero__polaroid" id="heroPolaroid">
            <span class="tape" aria-hidden="true"></span>
            <span class="polaroid__img"><img src="${esc(P.avatar)}" alt="${esc(P.avatarAlt)}" width="800" height="1000" fetchpriority="high" decoding="async"></span>
            <figcaption class="polaroid__cap"><span class="polaroid__title">${esc(P.name)}</span><span class="polaroid__meta"><span>${esc(C.hero.portraitCaption)}</span><span>${esc(P.location)}</span></span></figcaption>
          </figure>
          <p class="hero__hint hand" aria-hidden="true"><svg viewBox="0 0 60 60"><path d="M6 50C10 20 30 8 54 14M54 14l-14-8M54 14l-8 14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(PL.dragHint)}</p>
        </div>
      </div>`;
    $('#top').insertAdjacentHTML('afterend', `<div class="tapes" aria-hidden="true">${tapeStrip([P.title, P.degree, ...STATS.map((s) => `${s.value} ${s.label}`)], 'tape-strip--a')}${tapeStrip(SKILLS.map((s) => s.name), 'tape-strip--b')}</div>`);
  }

  function renderAbout() {
    const A = C.about;
    const facts = [[A.facts.school, P.university], [A.facts.applying, P.degree], [A.facts.based, P.location]];
    const bgs = ['yellow', 'pink', 'green'];
    $('#about').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal><span class="sec-tag">${A.index} · ${esc(A.label)}</span></div>
        <div class="about__grid">
          <div class="notebook block" data-reveal>
            <h2 class="about__statement">${mark(A.statement)}</h2>
            ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <div class="notes">
            <p class="notes__title hand" data-reveal>${esc(PL.aboutNote)}</p>
            ${facts.map(([k, v], i) => `<div class="sticky wob" style="--bg:var(--${bgs[i]})" data-reveal><b>${esc(k)}</b>${esc(v)}</div>`).join('')}
          </div>
        </div>
        <dl class="stats">
          ${STATS.map((s, i) => `<div class="stat wob" style="--bg:var(--${['yellow', 'pink', 'green', 'blue'][i % 4]})" data-reveal><dt>${esc(s.label)}</dt><dd class="stat__v" data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
        </dl>
      </div>`;
  }

  function renderTimelineShell() {
    const TL = C.timeline;
    const cats = Object.keys(TL.categories).filter((k) => TIMELINE.some((e) => e.category === k));
    const chip = (key, label, n) => `<button class="chip" type="button" data-cat-filter="${key}" aria-pressed="${key === 'all'}">${esc(label)}<span class="chip__n">${n}</span></button>`;
    $('#timeline').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="sec-tag">${TL.index} · ${esc(TL.label)}</span>
          <h2 class="sec-title" id="tlTitle">${hl(TL.title)}</h2>
        </div>
        <div class="tl__tools" data-reveal>
          <div class="chips" role="group" aria-label="${esc(TL.filtersLabel)}">
            ${chip('all', TL.all, TIMELINE.length)}
            ${cats.map((k) => chip(k, TL.categories[k], TIMELINE.filter((e) => e.category === k).length)).join('')}
          </div>
          <div class="tl__actions">
            <button class="btn btn--blue" type="button" id="shuffleBtn">${esc(PL.shuffle)}</button>
            <button class="btn btn--green" type="button" id="tidyBtn">${esc(PL.tidy)}</button>
          </div>
        </div>
        <p class="tl__note hand" data-reveal>${sticker('star', 'yellow')} ${esc(PL.mapNote)} · <span id="tlCount" aria-live="polite"></span></p>
        <div class="tl__wrap" id="tlWrap">
          <svg class="tl__svg" id="tlSvg" aria-hidden="true" focusable="false"><path class="tl__ghost" id="tlGhost"/><path class="tl__line" id="tlLine"/></svg>
          <div class="tl__stops" id="tlStops" aria-hidden="true"></div>
          <div class="tl__walker" id="tlWalker" aria-hidden="true">${sticker('pill', 'yellow')}</div>
          <ol class="tl__list" id="tlList" aria-label="${esc(TL.listLabel)}"></ol>
        </div>
      </div>`;
  }

  function renderTimelineItems() {
    const TL = C.timeline;
    state.items = TIMELINE.filter((e) => state.filter === 'all' || e.category === state.filter);
    const rots = [-3, 2.5, -1.5, 3, -2.5, 1.5];
    $('#tlList').innerHTML = state.items.map((e, i) => `
      <li class="tl-item ${i % 2 === 0 ? 'is-left' : 'is-right'}" data-id="${esc(e.id)}">
        <div class="tl-card" style="--r:${rots[i % 6]}deg">
          <span class="tape" aria-hidden="true"></span>
          <button class="polaroid" type="button" data-open="${esc(e.id)}" aria-haspopup="dialog">
            ${e.highlight ? `<span class="milestone" aria-hidden="true">${sticker('star', 'yellow')}<span>${esc(TL.milestone)}</span></span>` : ''}
            <span class="polaroid__img"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="600" height="600" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" draggable="false"></span>
            <span class="polaroid__cap">
              <span class="polaroid__title">${esc(e.title)}</span>
              <span class="polaroid__meta"><span>${esc(e.date)}</span><span class="cat-dot" style="--bg:var(--${CAT_COLOR[e.category]})">${esc(categoryLabel(e.category))}</span></span>
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
        <div class="sec-head" data-reveal>
          <span class="sec-tag">${PC.index} · ${esc(PC.label)}</span>
          <h2 class="sec-title" id="projTitle">${hl(PC.title)}</h2>
        </div>
        <ul class="cards">
          ${PROJECTS.map((p, i) => `
            <li data-reveal>
              <div class="tcard">
                <div class="tcard__face tcard__front">
                  <span class="tcard__shine" aria-hidden="true"></span>
                  <div class="tcard__img"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="1200" height="900" loading="lazy" decoding="async"></div>
                  <div class="tcard__top"><h3 class="tcard__title">${esc(p.title)}</h3><span class="tcard__year">${p.year}</span></div>
                  <ul class="tcard__chips" aria-label="Technologies">${p.tech.slice(0, 2).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                  <button class="flip-btn" type="button" data-flip aria-label="${esc(PL.flip)}: ${esc(p.title)}">${esc(PL.flip)} ↻</button>
                </div>
                <div class="tcard__face tcard__back" inert>
                  <h3 class="tcard__title">${esc(p.title)}</h3>
                  <p class="tcard__desc">${esc(p.description)}</p>
                  <ul class="tcard__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                  <div class="tcard__links">
                    <a class="btn btn--pink" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(C.modal.visit)} ↗<span class="sr-only"> (${esc(PC.visit)})</span></a>
                    ${p.repo ? `<a class="btn btn--white" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(PC.repo)}<span class="sr-only"> (${esc(PC.visit)})</span></a>` : ''}
                  </div>
                  <button class="flip-btn" type="button" data-flip aria-label="${esc(PL.flipBack)}: ${esc(p.title)}">↺ ${esc(PL.flipBack)}</button>
                </div>
              </div>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  function renderSkills() {
    const SC = C.skills;
    const groups = Object.keys(SC.groups).filter((g) => SKILLS.some((s) => s.group === g));
    const gcolor = { technical: 'blue', creative: 'pink', language: 'green', soft: 'orange' };
    $('#skills').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="sec-tag">${SC.index} · ${esc(SC.label)}</span>
          <h2 class="sec-title" id="skillsTitle">${hl(SC.title)}</h2>
        </div>
        <p class="skills__note hand" data-reveal>${esc(PL.skillsNote)}</p>
        <div class="skills__legend" role="group" aria-label="${esc(PL.groupsLabel)}" data-reveal>
          ${groups.map((g) => `<button class="legend" type="button" data-group-filter="${g}" data-group="${g}" aria-pressed="false"><i></i>${esc(SC.groups[g])}</button>`).join('')}
        </div>
        <ul class="cloud" id="cloud">
          ${SKILLS.map((s, i) => `
            <li class="bubble-skill" data-group="${s.group}" style="--lvl:${s.level};--r:${[-4, 3, -2, 5, -5, 2][i % 6]}deg;--dy:${[0, 14, -10, 8, -14, 4][i % 6]}px;--d:${-(i % 7) * 0.6}s">
              <button type="button" data-skill="${i}" aria-label="${esc(s.name)}, ${s.level} / 100"><span class="v" data-count="${s.level}">${s.level}</span><span class="n">${esc(s.name)}</span></button>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  function renderFuture() {
    const FC = C.future;
    const stickers = [['pill', 'yellow'], ['heart', 'pink'], ['steth', 'green']];
    $('#future').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="sec-tag">${FC.index} · ${esc(FC.label)}</span>
          <h2 class="sec-title" id="futureTitle">${hl(FC.title)}</h2>
        </div>
        <ol class="stairs">
          ${FUTURE.map((g, i) => `
            <li class="step" data-step>
              <span class="step__hero" aria-hidden="true">${sticker(stickers[i % 3][0], stickers[i % 3][1])}</span>
              ${i === FUTURE.length - 1 ? `<span class="step__flag" id="flag" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M14 6v54" stroke="var(--line)" stroke-width="5" stroke-linecap="round"/><path d="M16 8c10-6 18 6 32 0v26c-14 6-22-6-32 0z" fill="var(--yellow)" stroke="var(--line)" stroke-width="4" stroke-linejoin="round"/></svg></span>` : ''}
              <span class="step__n" aria-hidden="true">${i + 1}</span>
              <h3 class="step__t">${esc(g.goal)}</h3>
              <p class="step__d">${esc(g.description)}</p>
            </li>`).join('')}
        </ol>
        <p class="future__closing" data-reveal>${mark(FC.closing)}</p>
      </div>`;
  }

  function renderContact() {
    const CC = C.contact, F = CC.form;
    $('#contact').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <span class="sec-tag">${CC.index} · ${esc(CC.label)}</span>
          <h2 class="sec-title" id="contactTitle">${hl(CC.title)}</h2>
        </div>
        <div class="postcard" data-reveal>
          <form class="postcard__side" id="contactForm">
            <p class="postcard__intro">${esc(CC.intro)}</p>
            <div class="field"><label for="cf-name">${esc(F.name)}</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
            <div class="field"><label for="cf-email">${esc(F.email)}</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="cf-msg">${esc(F.message)}</label><textarea id="cf-msg" name="message" rows="4" required></textarea></div>
            <button class="btn btn--pink" type="submit" style="justify-self:start">${esc(F.send)} →</button>
            <p class="form__status" id="formStatus" role="status"></p>
          </form>
          <div class="postcard__side">
            <div class="stamp" id="stamp" aria-hidden="true">${sticker('heart', 'pink')}<span>${esc(PL.stamp)}</span></div>
            <svg class="postmark" viewBox="0 0 120 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="24" cy="24" r="18"/><path d="M52 12c8-6 12 6 20 0s12 6 20 0M52 24c8-6 12 6 20 0s12 6 20 0M52 36c8-6 12 6 20 0s12 6 20 0"/></g></svg>
            <p class="address__to hand">${esc(PL.to)}</p>
            <a class="address__email wob" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
            <div class="address__lines" aria-hidden="true"><span></span><span></span><span></span></div>
            <p class="hand" style="font-size:1.5rem;line-height:1">${esc(CC.emailLabel)}</p>
            <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span class="sr-only"> (${esc(C.projects.visit)})</span></a>`).join('')}</div>
          </div>
        </div>
      </div>`;
  }

  function renderFooter() {
    const FT = C.footer;
    $('#footer').innerHTML = `
      ${tapeStrip([P.name, P.title, P.degree, P.location], 'tape-strip--a')}
      <div class="footer__row"><span>© ${new Date().getFullYear()} ${esc(P.name)}. ${esc(FT.rights)}</span><span>${esc(FT.note)}</span><a href="#top">${esc(FT.top)} ↑</a></div>`;
    $('#footer .tape-strip').setAttribute('aria-hidden', 'true');
  }

  /* ------------------------------------------------------------------------
     2. EFFECTS
     ------------------------------------------------------------------------ */

  /** Confetti engine (circles, rectangles, stars and film frames). */
  const confetti = (() => {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    let parts = [], raf = 0, dpr = 1;
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener('resize', resize);

    const star = (r) => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); };
    function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life < p.max && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = clamp((p.max - p.life) / 25, 0, 1);
        ctx.fillStyle = p.c; ctx.strokeStyle = '#14121f'; ctx.lineWidth = 1.6;
        if (p.shape === 0) { ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); ctx.strokeRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); }
        else if (p.shape === 1) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.2, 0, 7); ctx.fill(); ctx.stroke(); }
        else if (p.shape === 2) { star(p.s * 0.75); ctx.fill(); ctx.stroke(); }
        else { const w = p.s, h = p.s * 0.8; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.clearRect(-w / 5, -h / 5, w * 0.4, h * 0.4); }
        ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(step); else { raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    return {
      burst(x, y, { count = 70, spread = Math.PI * 2, angle = -Math.PI / 2, power = 12 } = {}) {
        if (!motionOK()) return;
        const host = document.querySelector('dialog[open]') || document.body;   // keep it above an open dialog
        if (cv.parentNode !== host) host.appendChild(cv);
        for (let i = 0; i < count; i++) {
          const a = angle + (Math.random() - 0.5) * spread, v = power * (0.35 + Math.random() * 0.85);
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.34, rot: rand(0, 6.3), vr: rand(-0.35, 0.35), s: rand(7, 15), c: HEX[Math.floor(Math.random() * HEX.length)], shape: Math.floor(Math.random() * 4), life: 0, max: rand(80, 150) });
        }
        if (!raf) raf = requestAnimationFrame(step);
      }
    };
  })();
  const burstAt = (el, opts) => { const r = el.getBoundingClientRect(); confetti.burst(r.left + r.width / 2, r.top + r.height / 2, opts); };

  /** Little plus/star sparkles trailing the cursor. */
  function initSparks() {
    if (!finePointer.matches || !motionOK()) return;
    const box = $('#sparks');
    let last = 0;
    addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - last < 55 || box.childElementCount > 28) return;
      last = now;
      const s = document.createElement('i');
      s.className = 'spark';
      s.style.cssText = `left:${e.clientX + rand(-6, 6)}px;top:${e.clientY + rand(-6, 6)}px`;
      s.innerHTML = sticker(Math.random() < 0.5 ? 'cross' : 'star', COLORS[Math.floor(Math.random() * 6)]);
      s.addEventListener('animationend', () => s.remove());
      box.appendChild(s);
    }, { passive: true });
  }

  /** Tape strips scroll sideways; scrolling the page speeds them up. */
  function initMarquee() {
    if (!motionOK()) return;
    const tweens = $$('.tape-strip').map((strip, i) => gsap.fromTo(strip, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 34, ease: 'none', repeat: -1 }));
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const boost = clamp(1 + Math.abs(self.getVelocity()) / 220, 1, 9);
        tweens.forEach((tw) => gsap.to(tw, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1.4, ease: 'power2.out' }) }));
      }
    });
  }

  /** Hero stickers drift opposite to the cursor at different depths; click = party. */
  function initStickers() {
    $$('.floaty').forEach((el) => el.addEventListener('click', () => {
      burstAt(el, { count: 40, power: 10 });
      if (motionOK()) gsap.fromTo(el, { rotation: -25, scale: 0.7 }, { rotation: 0, scale: 1, duration: 1, ease: 'elastic.out(1,0.35)' });
    }));
    if (!finePointer.matches || !motionOK()) return;
    const items = $$('.floaty').map((el, i) => ({ xTo: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }), yTo: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }), depth: 14 + i * 9 }));
    $('#top').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      items.forEach((it) => { it.xTo(-nx * it.depth * 2); it.yTo(-ny * it.depth * 2); });
    });
    // Hero letters hop when hovered
    $$('.tile').forEach((t) => t.addEventListener('pointerenter', () => gsap.fromTo(t, { y: 0 }, { y: -16, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' })));
  }

  /* ------------------------------------------------------------------------
     3. SMOOTH SCROLL, PROGRESS, NAVIGATION
     ------------------------------------------------------------------------ */
  function initLenis() {
    if (!motionOK() || typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  function scrollToTarget(target) {
    if (state.lenis) state.lenis.scrollTo(target, { duration: 1.5, force: true });
    else if (typeof target === 'number') scrollTo({ top: target, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  }

  function initProgress() {
    const fill = $('#progressFill'), rider = $('#progressRider');
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      fill.style.transform = `scaleX(${p})`;
      rider.style.transform = `translateX(${p * (innerWidth - 26)}px)`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  function initNavSpy() {
    const links = $$('[data-nav]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          const on = a.dataset.nav === en.target.id;
          a.classList.toggle('is-active', on);
          on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...C.nav.map((n) => n.id)].forEach((id) => { const el = $('#' + id); if (el) io.observe(el); });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href'), el = $(id);
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
     4. REVEALS & COUNTERS
     ------------------------------------------------------------------------ */
  function initReveals() {
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 70, rotation: rand(-3, 3), opacity: 0, scale: 0.94, duration: 1.1, ease: 'back.out(1.5)', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    // Staircase rises step by step, then the flag unfurls
    const steps = $$('[data-step]');
    if (steps.length) {
      steps.forEach((s) => gsap.set(s, { yPercent: 40, opacity: 0 }));
      ScrollTrigger.create({
        trigger: '.stairs', start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to(steps, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.6)', stagger: 0.22, clearProps: 'transform,opacity' });
          gsap.from('.step__hero', { y: 30, scale: 0, rotation: -40, duration: 0.9, ease: 'elastic.out(1,0.5)', stagger: 0.22, delay: 0.5 });
          gsap.from('#flag', { scaleX: 0, rotation: -20, duration: 1.2, ease: 'elastic.out(1,0.45)', delay: 1.2 });
        }
      });
    }
    // Skill bubbles pop in
    const bubbles = $$('.bubble-skill');
    gsap.set(bubbles, { scale: 0 });
    ScrollTrigger.create({
      trigger: '#cloud', start: 'top 85%', once: true,
      onEnter: () => gsap.to(bubbles, { scale: 1, duration: 0.9, ease: 'back.out(2.2)', stagger: { each: 0.045, from: 'random' } })
    });
  }

  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const m = String(el.dataset.count).match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = Number(m[1]), suffix = m[2], o = { v: 0 };
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: el, start: 'top 95%', once: true,
        onEnter: () => gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } })
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. TIMELINE — winding path, walker, stops, draggable polaroids
     ------------------------------------------------------------------------ */

  /** Pointer-drag a polaroid. A short tap still opens it; a real drag does not. */
  function makeDraggable(el) {
    if (el._drag) return;
    el._drag = true;
    const pos = { x: 0, y: 0 };
    el._pos = pos;
    let sx = 0, sy = 0, ox = 0, oy = 0, down = false, moved = false, pid = null;

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; moved = false; pid = e.pointerId; sx = e.clientX; sy = e.clientY; ox = pos.x; oy = pos.y;
    });
    el.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== pid) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved) {
        if (Math.hypot(dx, dy) < 7) return;
        moved = true;
        el.classList.add('is-dragging');
        el.setPointerCapture(pid);                       // capture only once it is a real drag
        if (motionOK()) gsap.to(el, { scale: 1.07, duration: 0.3, ease: 'back.out(2)' });
      }
      pos.x = ox + dx; pos.y = oy + dy;
      if (motionOK()) gsap.to(el, { x: pos.x, y: pos.y, rotation: clamp(dx * 0.06, -14, 14), duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
      else el.style.translate = `${pos.x}px ${pos.y}px`;
    });
    const end = () => {
      if (!down) return;
      down = false;
      if (moved) {
        el._suppress = true; setTimeout(() => { el._suppress = false; }, 0);
        el.classList.remove('is-dragging');
        if (motionOK()) gsap.to(el, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1,0.45)' });
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => { if (el._suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    el.addEventListener('dragstart', (e) => e.preventDefault());
  }

  const resetCards = (shuffle = false) => {
    const cards = $$('.tl-card');
    cards.forEach((c) => {
      const t = { x: shuffle ? rand(-70, 70) : 0, y: shuffle ? rand(-40, 40) : 0, rotation: shuffle ? rand(-10, 10) : 0 };
      if (c._pos) { c._pos.x = t.x; c._pos.y = t.y; }
      if (motionOK()) gsap.to(c, { ...t, duration: 1.1, ease: 'elastic.out(1,0.5)', overwrite: 'auto' });
      else c.style.translate = `${t.x}px ${t.y}px`;
    });
  };

  /** Catmull-Rom spline through the points, as an SVG cubic path. */
  function splinePath(pts) {
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  /** (Re)measure the list and draw the winding path with one stop per entry. */
  function buildPath() {
    const wrap = $('#tlWrap'), list = $('#tlList'), svg = $('#tlSvg'), stopsEl = $('#tlStops');
    const W = wrap.clientWidth, H = wrap.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const wide = W >= 800;
    const cx = wide ? W / 2 : 28;
    const amp = wide ? Math.min(W * 0.2, 240) : 11;
    const items = $$('.tl-item', list);
    const pts = [{ x: cx, y: 0 }];
    const stops = [];
    items.forEach((it, i) => {
      const y = list.offsetTop + it.offsetTop + it.offsetHeight / 2;
      const left = it.classList.contains('is-left');
      // path swings to the side opposite the polaroid so the two never collide
      const x = wide ? cx + (left ? amp : -amp) : cx + (i % 2 ? amp : -amp);
      pts.push({ x, y });
      stops.push({ x, y, e: state.items[i] });
    });
    pts.push({ x: cx, y: H });
    const d = splinePath(pts);
    const prevProgress = state.path?.progress || 0;     // keep the walker where it was after a re-measure
    const line = $('#tlLine'), ghost = $('#tlGhost');
    ghost.setAttribute('d', d); line.setAttribute('d', d);
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = motionOK() ? len : 0;

    // Fraction of the path at which each stop sits (path is monotonic in y)
    const fracAtY = (y) => { let lo = 0, hi = len; for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; line.getPointAtLength(mid).y < y ? (lo = mid) : (hi = mid); } return lo / len; };
    stopsEl.innerHTML = stops.map((s) => `<span class="tl-stop ${motionOK() ? '' : 'is-on'}" style="left:${s.x}px;top:${s.y}px;--bg:var(--${CAT_COLOR[s.e.category]})">${s.e.year}</span>`).join('');
    state.path = { line, len, stops: stops.map((s, i) => ({ el: stopsEl.children[i], f: fracAtY(s.y) })) };
    if (motionOK()) moveWalker(prevProgress);
  }

  function moveWalker(p) {
    const P_ = state.path; if (!P_) return;
    state.path.progress = p;
    const at = P_.len * p, pt = P_.line.getPointAtLength(at), pt2 = P_.line.getPointAtLength(Math.min(P_.len, at + 4));
    gsap.set($('#tlWalker'), { x: pt.x, y: pt.y, rotation: Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 57.3 - 20 });
    P_.line.style.strokeDashoffset = P_.len * (1 - p);
    P_.stops.forEach((s) => s.el.classList.toggle('is-on', p >= s.f - 0.002));
  }

  function buildTimeline() {
    state.tlCtx?.revert();
    $$('.tl-card').forEach(makeDraggable);
    buildPath();
    if (!motionOK()) return;

    state.tlCtx = gsap.context(() => {
      const wrap = $('#tlWrap');
      // The path draws itself while you scroll; the walker rides its tip
      ScrollTrigger.create({
        trigger: wrap, start: 'top 65%', end: 'bottom 55%', scrub: 0.6, invalidateOnRefresh: true,
        onRefresh: () => buildPath(),
        onUpdate: (self) => moveWalker(self.progress)
      });
      // Polaroids spring in; milestones & awards throw confetti
      $$('.tl-item').forEach((it, i) => {
        const e = state.items[i], card = $('.polaroid', it), dir = it.classList.contains('is-left') ? -1 : 1;
        gsap.set(card, { opacity: 0 });
        ScrollTrigger.create({
          trigger: it, start: 'top 85%', once: true,
          onEnter: () => {
            gsap.fromTo(card, { scale: 0.4, rotation: dir * 24, y: 120, opacity: 0 }, { scale: 1, rotation: 0, y: 0, opacity: 1, duration: 1.4, ease: 'elastic.out(1,0.55)', clearProps: 'transform' });
            gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.3, overwrite: false });
            if (e && (e.highlight || e.category === 'award')) gsap.delayedCall(0.45, () => burstAt(card, { count: 55, power: 11, spread: Math.PI * 1.1 }));
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. INTERACTIONS
     ------------------------------------------------------------------------ */
  function initFilters() {
    $('#timeline').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat-filter]');
      if (chip) setFilter(chip.dataset.catFilter);
    });
    $('#shuffleBtn').addEventListener('click', () => resetCards(true));
    $('#tidyBtn').addEventListener('click', () => resetCards(false));
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { buildPath(); if (hasGSAP) ScrollTrigger.refresh(); }, 200); });
    document.fonts?.ready.then(() => { buildPath(); if (hasGSAP) ScrollTrigger.refresh(); });
  }

  function setFilter(cat) {
    if (cat === state.filter) return;
    state.filter = cat;
    $$('[data-cat-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.catFilter === cat)));
    const apply = () => {
      state.path = null;
      renderTimelineItems();
      buildTimeline();
      if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
    };
    if (motionOK()) {
      // The old polaroids fall off the page
      gsap.to($$('.tl-card'), { y: 520, rotation: () => rand(-35, 35), opacity: 0, duration: 0.8, ease: 'power3.in', stagger: 0.04, onComplete: apply });
      gsap.to('#tlStops', { opacity: 0, duration: 0.4, onComplete: () => gsap.set('#tlStops', { opacity: 1 }) });
    } else apply();
  }

  function initFlipCards() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-flip]');
      if (!btn) return;
      const card = btn.closest('.tcard'), flipped = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', flipped);
      $('.tcard__front', card).toggleAttribute('inert', flipped);
      $('.tcard__back', card).toggleAttribute('inert', !flipped);
      (flipped ? $('.tcard__back .flip-btn', card) : $('.tcard__front .flip-btn', card)).focus({ preventScroll: true });
    });
    // Holographic shine follows the pointer
    $$('.tcard').forEach((c) => c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--sx', (100 - ((e.clientX - r.left) / r.width) * 100) + '%');
      $$('.tcard__shine', c).forEach((s) => s.style.setProperty('--sx', (100 - ((e.clientX - r.left) / r.width) * 100) + '%'));
    }));
  }

  function initSkillBubbles() {
    const cloud = $('#cloud');
    cloud.addEventListener('click', (e) => {
      const b = e.target.closest('[data-skill]');
      if (!b) return;
      burstAt(b, { count: 26, power: 8 });
      if (motionOK()) gsap.fromTo(b, { scale: 0.85 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1,0.35)' });
    });
    $('#skills').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-group-filter]');
      if (!btn) return;
      const g = btn.dataset.groupFilter, on = btn.getAttribute('aria-pressed') !== 'true';
      $$('[data-group-filter]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', String(on));
      cloud.classList.toggle('has-filter', on);
      $$('.bubble-skill', cloud).forEach((li) => li.classList.toggle('is-lit', on && li.dataset.group === g));
    });
  }

  /* ---- Detail modal (native <dialog>: focus trap + Esc included) ---- */
  function initModal() {
    const dlg = $('#modal'), M = C.modal, TL = C.timeline;

    const fill = (e, index, total) => {
      dlg.style.setProperty('--bg', `var(--${CAT_COLOR[e.category]})`);
      dlg.innerHTML = `
        <div class="modal__card"><div class="modal__inner" data-lenis-prevent>
          <button class="modal__close" type="button" data-close>${esc(M.close)} ✕</button>
          <div class="modal__media">
            <figure class="polaroid"><span class="tape" aria-hidden="true"></span>
              <span class="polaroid__img"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="800" height="800"></span>
              <figcaption class="polaroid__cap"><span class="polaroid__title">${esc(e.title)}</span><span class="polaroid__meta"><span>${esc(e.date)}</span></span></figcaption>
            </figure>
          </div>
          <div class="modal__body">
            <p class="modal__meta"><span class="cat-dot">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</p>
            <h2 class="modal__title" id="modalTitle">${esc(e.title)}</h2>
            <p class="modal__sub">${esc(e.subtitle)}</p>
            <p class="modal__desc">${esc(e.description)}</p>
            <ul class="modal__tags" aria-label="${esc(M.tags)}">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            ${e.link ? `<a class="btn btn--pink modal__link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(M.visit)} ↗<span class="sr-only"> (${esc(C.projects.visit)})</span></a>` : ''}
            <nav class="modal__nav" aria-label="Timeline">
              <button class="modal__step" type="button" data-step="-1">← ${esc(M.prev)}</button>
              <span class="modal__count">${pad(index + 1)} ${esc(M.of)} ${pad(total)}</span>
              <button class="modal__step" type="button" data-step="1">${esc(M.next)} →</button>
            </nav>
          </div>
        </div></div>`;
      state.modal.id = e.id;
    };

    const celebrate = () => {
      const e = state.items.find((x) => x.id === state.modal.id);
      if (e && (e.highlight || e.category === 'award')) burstAt($('.modal__media .polaroid', dlg), { count: 70, power: 12 });
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
        gsap.fromTo($('.modal__card', dlg), { scale: 0.55, rotation: -7, y: 90, opacity: 0 }, { scale: 1, rotation: 0, y: 0, opacity: 1, duration: 1, ease: 'elastic.out(1,0.7)', clearProps: 'transform,opacity', onComplete: celebrate });
        gsap.from($$('.modal__body > *', dlg), { y: 24, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.06, delay: 0.2, clearProps: 'transform,opacity' });
      }
    };

    const requestClose = () => {
      if (!state.modal.open || state.modal.closing) return;
      state.modal.closing = true;
      dlg.classList.add('is-closing');
      if (!motionOK()) { dlg.close(); return; }
      gsap.to($('.modal__card', dlg), { scale: 0.6, rotation: 6, y: 70, opacity: 0, duration: 0.45, ease: 'back.in(1.8)', onComplete: () => { dlg.close(); } });
    };

    const step = (dir) => {
      const list = state.items;
      let i = list.findIndex((e) => e.id === state.modal.id);
      i = (i + dir + list.length) % list.length;
      const swap = () => {
        fill(list[i], i, list.length);
        $(`[data-step="${dir}"]`, dlg)?.focus();
        if (motionOK()) { gsap.from($('.modal__media .polaroid', dlg), { rotation: dir * 18, x: dir * 80, opacity: 0, duration: 0.9, ease: 'elastic.out(1,0.6)' }); gsap.from($$('.modal__body > *', dlg), { x: dir * 30, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04, clearProps: 'transform,opacity' }); }
        celebrate();
      };
      if (motionOK()) gsap.to($('.modal__inner', dlg), { opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: () => { swap(); gsap.set($('.modal__inner', dlg), { opacity: 1 }); } });
      else swap();
    };

    document.addEventListener('click', (e) => { const c = e.target.closest('[data-open]'); if (c) open(c.dataset.open); });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) return requestClose();
      if (e.target.closest('[data-close]')) requestClose();
      const s = e.target.closest('[data-step]'); if (s) step(Number(s.dataset.step));
    });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
    dlg.addEventListener('close', () => {
      const id = state.modal.id;
      state.modal.open = false; state.modal.closing = false;
      root.classList.remove('modal-open');
      state.lenis?.start();
      document.body.appendChild($('#confetti'));
      $(`[data-open="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    });
  }

  /* ---- Theme: circular reveal from the toggle button ---- */
  function setThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    $('#themeBtn').setAttribute('aria-label', dark ? C.theme.toLight : C.theme.toDark);
    $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#16132a' : '#fff6e0');
  }

  function initTheme() {
    const btn = $('#themeBtn');
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const apply = () => { root.dataset.theme = next; try { localStorage.setItem('ex4-theme', next); } catch (_) { /* blocked */ } setThemeLabel(); };
      if (!document.startViewTransition || reduceMQ.matches) return apply();
      const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(apply).ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' });
      });
    });
  }

  /* ---- Mobile menu ---- */
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open', 'modal-open');
    const b = $('#menuBtn'); b.setAttribute('aria-expanded', 'false'); b.textContent = C.menu.open;
    if (!state.modal.open) state.lenis?.start();
  }
  function initMenu() {
    const b = $('#menuBtn');
    b.addEventListener('click', () => {
      if (root.classList.contains('menu-open')) return closeMenu();
      root.classList.add('menu-open', 'modal-open');
      b.setAttribute('aria-expanded', 'true'); b.textContent = C.menu.close;
      state.lenis?.stop();
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    matchMedia('(min-width: 1000px)').addEventListener('change', closeMenu);
  }

  function initContact() {
    const form = $('#contactForm'), F = C.contact.form;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const subject = encodeURIComponent(`${F.subjectPrefix} ${f.get('name')}`);
      const body = encodeURIComponent(`${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`);
      $('#formStatus').textContent = F.success;
      const stamp = $('#stamp');
      if (motionOK()) { gsap.fromTo(stamp, { scale: 2.2, rotation: -25, opacity: 0.2 }, { scale: 1, rotation: 7, opacity: 1, duration: 0.7, ease: 'bounce.out' }); burstAt(stamp, { count: 90, power: 13 }); }
      setTimeout(() => { location.href = `mailto:${P.email}?subject=${subject}&body=${body}`; }, motionOK() ? 700 : 0);
    });
    // Clicking the hero polaroid's heart/stamp = party
    $('#stamp')?.addEventListener('click', () => burstAt($('#stamp'), { count: 50 }));
  }

  /* ------------------------------------------------------------------------
     7. LOADER, INTRO & BOOT
     ------------------------------------------------------------------------ */
  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('#loader');
      if (!motionOK()) { loader.remove(); root.classList.remove('is-loading'); return resolve(); }
      const num = $('#loaderNum'), fill = $('#capFill'), o = { v: 0 };
      let lastTen = 0;
      const colors = ['#ff6b9d', '#ffd23f', '#35d6a0', '#4d8dff', '#ff8a3d'];
      const tl = gsap.timeline({ onComplete: () => { loader.remove(); root.classList.remove('is-loading'); state.lenis?.start(); } });
      tl.to(o, {
          v: 100, duration: 1.15, ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(o.v);
            num.textContent = v;
            fill.setAttribute('x', String(-260 + (o.v / 100) * 260));
            const ten = Math.floor(v / 10);
            if (ten !== lastTen) { lastTen = ten; fill.setAttribute('fill', colors[ten % colors.length]); gsap.fromTo(num, { scale: 1.3 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }); }
          }
        })
        .to('#loaderContent', { scale: 0, rotation: -12, duration: 0.4, ease: 'back.in(2)' })
        .call(resolve, null, '>-0.1')
        .to('.loader__stripes i', { yPercent: -101, duration: 0.7, ease: 'expo.inOut', stagger: 0.07 }, '>-0.05');

      const skip = () => tl.timeScale(8);
      $('#loaderSkip').addEventListener('click', skip);
      loader.addEventListener('click', skip);
      addEventListener('keydown', (e) => { if (['Enter', ' ', 'Escape'].includes(e.key) && $('#loader')) skip(); });
      $('#loaderSkip').focus({ preventScroll: true });
    });
  }

  function playIntro() {
    if (!motionOK()) return;
    const tiles = $$('.tile');
    gsap.timeline()
      .from(tiles, { y: -260, scale: 0, rotation: () => rand(-90, 90), opacity: 0, duration: 1.2, ease: 'back.out(1.9)', stagger: 0.05, clearProps: 'transform,opacity' }, 0)
      .from('[data-intro]', { y: 40, rotation: -3, opacity: 0, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.1, clearProps: 'transform,opacity' }, 0.35)
      .from('#heroPolaroid', { x: 260, rotation: 50, opacity: 0, duration: 1.5, ease: 'elastic.out(1,0.55)' }, 0.3)
      .from('.hero__hint', { opacity: 0, y: 20, duration: 0.8, ease: 'back.out(2)' }, 1.3)
      .from('.floaty', { scale: 0, rotation: -60, duration: 1, ease: 'elastic.out(1,0.5)', stagger: 0.12 }, 0.7)
      .from('.nav > *', { y: -70, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.1, clearProps: 'transform' }, 0.5);
  }

  function boot() {
    root.classList.add('is-loading');
    renderAll();

    initTheme(); initMenu(); initAnchors(); initProgress(); initNavSpy();
    initFilters(); initFlipCards(); initSkillBubbles(); initModal(); initContact();
    makeDraggable($('#heroPolaroid'));

    if (motionOK()) {
      state.lenis = initLenis();
      state.lenis?.stop();
      initReveals(); initCounters(); initMarquee(); initSparks();
    }
    initStickers();
    buildTimeline();

    if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); addEventListener('load', () => ScrollTrigger.refresh()); }
    runLoader().then(playIntro);
  }

  boot();
})();
