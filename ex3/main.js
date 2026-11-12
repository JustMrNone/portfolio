/* ==========================================================================
   EX3 — NEON GRID · main.js
   Structure:
     0. Setup & helpers (scramble + typewriter effects)
     1. Rendering (data -> HTML)
     2. Canvas effects: particle field, audio-waveform monitor, reticle cursor
     3. Smooth scroll, progress, navigation
     4. Reveals, counters, LED meters
     5. Timeline: sticky terminal + mission log
     6. Interactions: filters, project tabs, drawer, contact, hover scramble
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
  const T = C.terminal;

  const $  = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const plain = (s) => String(s).replace(/\*/g, '');          // strip *emphasis* markers
  const categoryLabel = (k) => C.timeline.categories[k] || k;

  const root = document.documentElement;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const wideMQ = matchMedia('(min-width: 900px)');
  const motionOK = () => hasGSAP && !reduceMQ.matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const state = {
    filter: 'all', items: TIMELINE.slice(), active: -1, lenis: null, io: null,
    modal: { id: null, open: false, closing: false }, project: 0, termToken: 0
  };

  /* ---- Scramble / decode text effect ---- */
  const GLYPHS = '▓▒░#$%&*+=<>/\\[]{}0123456789ABCDEFXZ';
  const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  const scrambled = (text) => [...text].map((c) => (c === ' ' ? ' ' : randGlyph())).join('');

  function scramble(node, finalText, { duration = 900, delay = 0 } = {}) {
    cancelAnimationFrame(node._raf);
    if (!motionOK()) { node.textContent = finalText; return; }
    const start = performance.now() + delay, len = finalText.length;
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const reveal = Math.floor(t * len);
      let out = '';
      for (let i = 0; i < len; i++) out += finalText[i] === ' ' || i < reveal ? finalText[i] : randGlyph();
      node.textContent = out;
      if (t < 1) node._raf = requestAnimationFrame(tick);
      else node.textContent = finalText;
    };
    node._raf = requestAnimationFrame(tick);
  }

  /** Turn [data-decode] elements into (screen-reader copy + scrambling visual copy). */
  function prepareDecode(scope = document) {
    $$('[data-decode]', scope).forEach((el) => {
      if (el._dec) return;
      const text = plain(el.textContent.trim());
      const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
      const vis = document.createElement('span'); vis.className = 'dec'; vis.setAttribute('aria-hidden', 'true');
      vis.textContent = motionOK() ? scrambled(text) : text;
      el.textContent = ''; el.append(sr, vis);
      el._dec = { node: vis, text };
    });
  }
  const runDecode = (el, opts) => { if (el._dec) scramble(el._dec.node, el._dec.text, opts); };

  /** Typewriter. Resolves when finished or when `isStale()` becomes true. */
  function typeInto(el, text, cps, isStale = () => false) {
    return new Promise((resolve) => {
      if (!motionOK()) { el.textContent = text; return resolve(); }
      const start = performance.now();
      const tick = (now) => {
        if (isStale()) return resolve();
        const n = Math.min(text.length, Math.floor((now - start) / 1000 * cps));
        el.textContent = text.slice(0, n);
        if (n < text.length) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  /* ------------------------------------------------------------------------
     1. RENDERING
     ------------------------------------------------------------------------ */
  const secMeta = (idx, label) => `<div class="sec-meta"><b>[${idx}]</b><span>// ${esc(label)}</span></div>`;
  const btn = (cls, href, label, extra = '') => `<a class="btn ${cls}" href="${href}" ${extra}><span class="lbl" data-scramble>${esc(label)}</span></a>`;

  function renderAll() {
    document.title = `${P.name} — ${P.title}`;
    $('meta[name="description"]')?.setAttribute('content', P.bio);
    $('#skipLink').textContent = C.skipLink;
    $('#brand').setAttribute('aria-label', P.name);
    $('#loaderSkip').textContent = C.loader.skip;

    $('#navList').innerHTML = C.nav.map((n, i) =>
      `<li><a href="#${n.id}" data-nav="${n.id}"><span class="n">${pad(i + 1)}</span><span class="l">${esc(n.label)}</span></a></li>`).join('');

    renderHero(); renderAbout(); renderTimeline(); renderProjects();
    renderSkills(); renderFuture(); renderContact(); renderFooter();
  }

  function ledHTML(level, extra = '') {
    const lit = Math.round(level / 10);
    return `<span class="led" ${extra}>${Array.from({ length: 10 }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('')}</span>`;
  }

  function renderHero() {
    const [first, ...rest] = P.name.split(' ');
    const top3 = SKILLS.filter((s) => s.group !== 'language').sort((a, b) => b.level - a.level).slice(0, 3);
    $('#top').innerHTML = `
      <div class="bento">
        <div class="cell b-name" data-intro>
          <div>
            <p class="cell__label">${esc(T.labels.identity)}</p>
            <p class="hero__title">${esc(P.title)}</p>
            <h1 class="hero__name" id="heroName"><span data-decode>${esc(first)}</span><span data-decode>${esc(rest.join(' '))}</span></h1>
          </div>
          <div>
            <p class="hero__lede">${esc(P.bio)}</p>
            <div class="hero__cta">
              ${btn('btn--solid', '#timeline', C.hero.cta1)}
              ${btn('btn--ghost', '#contact', C.hero.cta2)}
            </div>
          </div>
        </div>
        <figure class="cell b-photo" data-intro>
          <div class="photo">
            <img src="${esc(P.avatar)}" alt="${esc(P.avatarAlt)}" width="800" height="1000" fetchpriority="high" decoding="async">
            <span class="photo__scan" aria-hidden="true"></span>
            <figcaption class="photo__tag"><span>${esc(P.name)}</span><span><b aria-hidden="true">●</b> ${esc(C.hero.portraitCaption)}</span></figcaption>
          </div>
        </figure>
        <div class="cell b-ecg" data-intro>
          <p class="cell__label">${esc(T.labels.vitals)}</p>
          <div class="ecg-bpm" aria-hidden="true"><span id="bpm">24</span><small>${esc(T.bpm)}</small></div>
          <div class="ecg-wrap"><canvas id="ecg" aria-hidden="true"></canvas></div>
        </div>
        <div class="cell b-status" data-intro>
          <p class="cell__label">${esc(T.labels.status)}</p>
          <p class="status-line"><span class="status-dot" aria-hidden="true"></span><span><b>${esc(T.online)}</b> — ${esc(T.status)}</span></p>
          <p class="status-prompt" aria-hidden="true">${esc(T.prompt)}<span class="caret"></span></p>
        </div>
        <div class="cell b-skills" data-intro>
          <p class="cell__label">${esc(T.labels.skills)}</p>
          <ul class="mini-skills">
            ${top3.map((s) => `<li><span>${esc(s.name)}<span class="v">${s.level}</span></span>${ledHTML(s.level, `role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}"`)}</li>`).join('')}
          </ul>
        </div>
        <div class="cell b-count" data-intro>
          <p class="cell__label">${esc(T.labels.counter)}</p>
          <p class="count-num" data-count="${esc(STATS[0].value)}">${esc(STATS[0].value)}</p>
          <p class="count-cap">${esc(STATS[0].label)}</p>
        </div>
      </div>`;
  }

  function renderAbout() {
    const A = C.about;
    const rows = [[T.labels.identity, P.name], [A.facts.school, P.university], [A.facts.applying, P.degree], [A.facts.based, P.location]];
    $('#about').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>${secMeta(A.index, A.label)}</div>
        <div class="about__grid">
          <div class="cell" data-reveal>
            <p class="cell__label">${esc(T.labels.dossier)}</p>
            <dl class="dossier">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          </div>
          <div class="cell about__story" data-reveal>
            <h2 class="about__statement" data-decode>${esc(plain(A.statement))}</h2>
            ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
        </div>
        <dl class="stats" aria-label="${esc(T.labels.stats)}">
          ${STATS.map((s) => `<div class="cell stat" data-reveal><dt>${esc(s.label)}</dt><dd class="stat__v" data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
        </dl>
      </div>`;
  }

  function renderTimeline() {
    const TL = C.timeline;
    const cats = Object.keys(TL.categories).filter((k) => TIMELINE.some((e) => e.category === k));
    const chip = (key, label, n) => `<button class="chip" type="button" data-cat-filter="${key}" aria-pressed="${key === 'all'}">${esc(label)}<span class="chip__n">${n}</span></button>`;
    $('#timeline').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          ${secMeta(TL.index, TL.label)}
          <h2 class="sec-title" id="tlTitle" data-decode>${esc(plain(TL.title))}</h2>
        </div>
        <div class="tl__tools" data-reveal>
          <div class="chips" role="group" aria-label="${esc(TL.filtersLabel)}">
            ${chip('all', TL.all, TIMELINE.length)}
            ${cats.map((k) => chip(k, TL.categories[k], TIMELINE.filter((e) => e.category === k).length)).join('')}
          </div>
          <p class="tl__count" id="tlCount" aria-live="polite"></p>
        </div>
        <div class="tl__grid">
          <div class="cell term" id="term" aria-hidden="true">
            <div class="term__bar"><i></i><i></i><i></i><span>${esc(T.title)}</span><span class="term__pos" id="tPos">00/00</span></div>
            <div class="term__body">
              <p class="term__cmd"><span class="pr">${esc(T.prompt)}</span> <span id="tCmd"></span><span class="caret"></span></p>
              <div class="term__shot" id="tShot"><img id="tImg" alt="" width="800" height="500"></div>
              <h3 class="term__title" id="tTitle"></h3>
              <p class="term__meta" id="tMeta"></p>
              <p class="term__sub" id="tSub"></p>
              <p class="term__desc" id="tDesc"></p>
              <p class="term__tags" id="tTags"></p>
            </div>
          </div>
          <ol class="log" id="tlLog" aria-label="${esc(TL.listLabel)}"></ol>
        </div>
      </div>`;
    renderLogRows();
  }

  function renderLogRows() {
    const TL = C.timeline;
    state.items = TIMELINE.filter((e) => state.filter === 'all' || e.category === state.filter);
    $('#tlLog').innerHTML = state.items.map((e, i) => `
      <li class="log-item" data-id="${esc(e.id)}" data-cat="${esc(e.category)}">
        <button class="log-row" type="button" data-open="${esc(e.id)}" aria-haspopup="dialog">
          <span class="log-row__year">${e.year}<span class="log-row__idx">${pad(i + 1)}</span></span>
          <span class="log-row__main">
            <span class="log-row__meta"><span>${esc(e.date)}</span><span class="badge">${esc(categoryLabel(e.category))}</span>${e.age != null ? `<span>${esc(TL.age)} ${pad(e.age)}</span>` : ''}${e.highlight ? `<span class="badge" style="--cat:var(--magenta)">${esc(TL.milestone)}</span>` : ''}</span>
            <span class="log-row__title">${esc(e.title)}</span>
            <span class="log-row__sub">${esc(e.subtitle)}</span>
            <span class="log-row__thumb"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="640" height="360" loading="lazy" decoding="async"></span>
            <span class="log-row__desc">${esc(e.description.length > 150 ? e.description.slice(0, 147).trimEnd() + '…' : e.description)}</span>
            <span class="log-row__open">${esc(T.openFile)} ↗</span>
          </span>
        </button>
      </li>`).join('');
    $('#tlCount').textContent = T.records.replace('{n}', state.items.length);
    state.active = -1;
  }

  function renderProjects() {
    const PC = C.projects;
    $('#projects').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          ${secMeta(PC.index, PC.label)}
          <h2 class="sec-title" id="projTitle" data-decode>${esc(plain(PC.title))}</h2>
        </div>
        <div class="cases" data-reveal>
          <div class="case-tabs" role="tablist" aria-label="${esc(T.labels.cases)}" aria-orientation="vertical" id="caseTabs">
            ${PROJECTS.map((p, i) => `
              <button class="case-tab" role="tab" type="button" id="tab-${i}" aria-controls="casePanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
                <span class="case-tab__n">${pad(i + 1)}</span><span class="case-tab__t">${esc(p.title)}</span><span class="case-tab__y">${p.year}</span>
              </button>`).join('')}
          </div>
          <div class="cell case-panel" id="casePanel" role="tabpanel" aria-labelledby="tab-0" tabindex="0"></div>
        </div>
      </div>`;
    showProject(0, false);
  }

  function showProject(i, animate = true) {
    const p = PROJECTS[i], PC = C.projects;
    state.project = i;
    $$('.case-tab').forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.tabIndex = n === i ? 0 : -1;
    });
    const panel = $('#casePanel');
    panel.setAttribute('aria-labelledby', `tab-${i}`);
    panel.innerHTML = `
      <div class="case-panel__shot"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="1200" height="900" decoding="async"></div>
      <div class="case-panel__body">
        <p class="case-panel__id"><span>${esc(T.labels.cases)} / ${pad(i + 1)}</span><b>${p.year}</b></p>
        <h3 class="case-panel__title"><span class="sr-only">${esc(p.title)}</span><span class="dec" aria-hidden="true">${esc(p.title)}</span></h3>
        <p class="case-panel__desc">${esc(p.description)}</p>
        <ul class="case-panel__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="case-panel__links">
          <a class="btn btn--solid" href="${esc(p.link)}" target="_blank" rel="noopener"><span class="lbl" data-scramble>${esc(C.modal.visit)} ↗</span><span class="sr-only"> (${esc(PC.visit)})</span></a>
          ${p.repo ? `<a class="btn btn--ghost" href="${esc(p.repo)}" target="_blank" rel="noopener"><span class="lbl" data-scramble>${esc(PC.repo)}</span><span class="sr-only"> (${esc(PC.visit)})</span></a>` : ''}
        </div>
      </div>`;
    if (animate && motionOK()) {
      scramble($('.dec', panel), p.title, { duration: 700 });
      gsap.fromTo($('.case-panel__shot', panel), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.out', clearProps: 'clipPath' });
      gsap.from($$('.case-panel__body > *', panel), { y: 18, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity' });
    }
  }

  function renderSkills() {
    const SC = C.skills;
    const groups = Object.keys(SC.groups).filter((g) => SKILLS.some((s) => s.group === g));
    $('#skills').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          ${secMeta(SC.index, SC.label)}
          <h2 class="sec-title" id="skillsTitle" data-decode>${esc(plain(SC.title))}</h2>
        </div>
        <div class="skills__grid">
          ${groups.map((g, gi) => `
            <div class="cell skill-cell" data-reveal>
              <p class="cell__label">${pad(gi + 1)} / ${pad(groups.length)}</p>
              <h3>${esc(SC.groups[g])}</h3>
              <ul class="skill-list">
                ${SKILLS.filter((s) => s.group === g).map((s) => `
                  <li class="skill" data-level="${s.level}">
                    <span>${esc(s.name)}</span>
                    ${ledHTML(s.level, `role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}"`)}
                    <span class="skill__v">${s.level}</span>
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
        <div class="sec-head" data-reveal>
          ${secMeta(FC.index, FC.label)}
          <h2 class="sec-title" id="futureTitle" data-decode>${esc(plain(FC.title))}</h2>
        </div>
        <ol class="road">
          <svg class="road__path" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M10,6 L150,48 L290,90" /></svg>
          ${FUTURE.map((g, i) => `
            <li data-reveal>
              <article class="cell goal">
                <p class="cell__label">${esc(T.labels.roadmap)}</p>
                <span class="goal__n" aria-hidden="true">${pad(i + 1)}</span>
                <h3 class="goal__t">${esc(g.goal)}</h3>
                <p class="goal__d">${esc(g.description)}</p>
                <div class="goal__bar" aria-hidden="true"><span></span></div>
              </article>
            </li>`).join('')}
        </ol>
        <p class="future__closing" id="closing" data-text="${esc(FC.closing)}">${esc(FC.closing)}</p>
      </div>`;
  }

  function renderContact() {
    const CC = C.contact, F = CC.form;
    $('#contact').innerHTML = `
      <div class="wrap">
        <div class="sec-head" data-reveal>
          ${secMeta(CC.index, CC.label)}
          <h2 class="sec-title" id="contactTitle" data-decode>${esc(plain(CC.title))}</h2>
        </div>
        <div class="contact__grid">
          <form class="cell console" id="contactForm" data-reveal>
            <p class="cell__label">${esc(T.labels.console)}</p>
            <p class="console__intro">${esc(CC.intro)}</p>
            <div class="prompt-field"><label for="cf-name">${esc(F.name)}</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
            <div class="prompt-field"><label for="cf-email">${esc(F.email)}</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
            <div class="prompt-field prompt-field--area"><label for="cf-msg">${esc(F.message)}</label><textarea id="cf-msg" name="message" rows="4" required></textarea></div>
            <button class="btn btn--solid" type="submit"><span class="lbl" data-scramble>${esc(T.execute)} → ${esc(F.send)}</span></button>
            <p class="form__status" id="formStatus" role="status"></p>
          </form>
          <div class="cell reach" data-reveal>
            <p class="cell__label">${esc(CC.emailLabel)}</p>
            <a class="reach__email" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
            <div class="reach__row">
              <button class="btn btn--ghost" type="button" id="copyBtn"><span class="lbl">${esc(T.copy)}</span></button>
              <span class="sr-only" id="copyStatus" role="status"></span>
            </div>
            <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener"><span>${esc(s.label)}</span><span aria-hidden="true">↗</span><span class="sr-only"> (${esc(C.projects.visit)})</span></a>`).join('')}</div>
          </div>
        </div>
      </div>`;
  }

  function renderFooter() {
    $('#footer').innerHTML = `
      <span><b>${esc(P.name)}</b> © ${new Date().getFullYear()}</span>
      <span>${esc(P.location)} · <time id="clock">--:--:--</time></span>
      <span>${esc(C.footer.note)}</span>
      <a href="#top">${esc(C.footer.top)} ↑</a>`;
  }

  /* ------------------------------------------------------------------------
     2. CANVAS EFFECTS (single shared requestAnimationFrame loop)
     ------------------------------------------------------------------------ */
  const loops = [];
  let rafId = 0;
  const frame = (now) => {
    rafId = requestAnimationFrame(frame);
    for (const l of loops) if (l.active()) l.draw(now);
  };
  const startLoops = () => { if (!rafId && !document.hidden && loops.length) rafId = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; } else startLoops();   // paused when tab hidden
  });

  /** Mouse-reactive particle field. */
  function initField() {
    const cv = $('#field'), ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, parts = [], last = performance.now();
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.round((w * h) / 17000), 26, 110);
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6, m: Math.random() < 0.18
      }));
      if (!motionOK()) draw(performance.now());
    };

    function draw(now) {
      const dt = clamp((now - last) / 16.7, 0.2, 3); last = now;
      ctx.clearRect(0, 0, w, h);
      const animate = motionOK();
      for (const p of parts) {
        if (animate) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 150 && d > 0.1) { const f = (150 - d) / 150; p.x += (dx / d) * f * 2.4 * dt; p.y += (dy / d) * f * 2.4 * dt; }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 105) { ctx.strokeStyle = `rgba(25,240,255,${(1 - d / 105) * 0.18})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 170) { ctx.strokeStyle = `rgba(255,46,166,${(1 - dm / 170) * 0.5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = a.m ? 'rgba(255,46,166,0.85)' : 'rgba(25,240,255,0.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    if (motionOK()) loops.push({ active: () => true, draw });
  }

  /** Audio-waveform monitor in the hero. */
  function initECG() {
    const cv = $('#ecg'); if (!cv) return;
    const ctx = cv.getContext('2d'), bpmEl = $('#bpm');
    let w = 0, h = 0, visible = true, lastBpmTick = 0, bpm = 66;
    const ecg = (p) => {                       // one audio burst (decaying wave), p in [0,1)
      if (p < 0.5) return Math.sin(p * 90) * Math.exp(-p * 7) * 0.95;
      if (p >= 0.62 && p < 0.9) return Math.sin((p - 0.62) * 70) * Math.exp(-(p - 0.62) * 12) * 0.45;
      return 0;
    };
    const resize = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };
    function draw(now) {
      const t = motionOK() ? now / 1000 : 5;
      const period = 60 / bpm, pxPerSec = Math.max(70, w * 0.55), mid = h * 0.62, amp = h * 0.46;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(25,240,255,0.08)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 18) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,46,166,0)'); g.addColorStop(1, 'rgba(255,46,166,1)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.shadowColor = '#ff2ea6'; ctx.shadowBlur = 8;
      ctx.beginPath();
      let y = mid;
      for (let x = 0; x <= w; x += 2) {
        const ts = t - (w - x) / pxPerSec, ph = ((ts / period) % 1 + 1) % 1;
        y = mid - ecg(ph) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w - 2, y, 3, 0, Math.PI * 2); ctx.fill();
    }
    new ResizeObserver(resize).observe(cv);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(cv);   // paused when off-screen
    resize();
    if (motionOK()) loops.push({ active: () => visible, draw });
  }

  /** Crosshair cursor with live coordinates. */
  function initReticle() {
    if (!finePointer.matches || !motionOK()) return;
    const el = $('#reticle'), xy = $('#reticleXY');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3.out' });
    let queued = false, mx = 0, my = 0;
    addEventListener('pointermove', (e) => {
      el.classList.add('is-on'); xTo(e.clientX); yTo(e.clientY);
      mx = e.clientX; my = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(() => { xy.textContent = `X${pad(Math.round(mx), 3)} Y${pad(Math.round(my), 3)}`; queued = false; }); }
    }, { passive: true });
    document.addEventListener('pointerover', (e) => el.classList.toggle('is-hot', !!e.target.closest('a, button, [role="tab"], input, textarea')));
    document.documentElement.addEventListener('pointerleave', () => el.classList.remove('is-on'));
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
    const fill = $('#railFill'), pct = $('#railPct');
    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      fill.style.transform = `scaleY(${p})`;
      pct.textContent = pad(Math.round(p * 100), 3);
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
      scrollToTarget(id === '#top' ? 0 : el);
      history.replaceState(null, '', id);
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  }

  function initClockAndPct() {
    const clock = $('#clock');
    const tick = () => {
      try { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Europe/Madrid' }); }
      catch (_) { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); }
    };
    tick();
    setInterval(() => { if (!document.hidden) tick(); }, 1000);
  }

  /* ------------------------------------------------------------------------
     4. REVEALS, COUNTERS, LED METERS
     ------------------------------------------------------------------------ */
  function initReveals() {
    // Headings decode when they scroll into view
    $$('[data-decode]').forEach((el) => {
      if (el.closest('.hero')) return;
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => runDecode(el, { duration: 1000 }) });
    });
    // Cells and blocks slide in
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 36, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    // Roadmap dashed path draws across
    const path = $('.road__path');
    if (path) gsap.fromTo(path, { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', duration: 2, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.road', start: 'top 75%', once: true }
    });
    // Closing line types itself out
    const closing = $('#closing');
    if (closing) {
      const text = closing.dataset.text;
      closing.textContent = '';
      ScrollTrigger.create({
        trigger: closing, start: 'top 92%', once: true,
        onEnter: () => { closing.innerHTML = ''; const span = document.createElement('span'); closing.append(span); typeInto(span, text, 55).then(() => closing.append(Object.assign(document.createElement('span'), { className: 'caret' }))); }
      });
      closing.setAttribute('aria-label', text);
    }
  }

  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const m = String(el.dataset.count).match(/^(\d+)(.*)$/);
      if (!m) return;
      const target = Number(m[1]), suffix = m[2], o = { v: 0 };
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: el, start: 'top 95%', once: true,
        onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } })
      });
    });
  }

  /** LED segments light up one by one; numbers count with them. */
  function initLeds() {
    const animateLed = (led, valEl, level, startDelay = 0) => {
      const segs = $$('i', led), lit = Math.round(level / 10), o = { v: 0 };
      segs.forEach((s) => s.classList.remove('on'));
      if (valEl) valEl.textContent = '0';
      segs.slice(0, lit).forEach((s, k) => gsap.delayedCall(startDelay + k * 0.07, () => s.classList.add('on')));
      if (valEl) gsap.to(o, { v: level, duration: lit * 0.07 + 0.2, delay: startDelay, ease: 'power2.out', onUpdate: () => { valEl.textContent = Math.round(o.v); } });
    };
    $$('.skill').forEach((li, i) => {
      const led = $('.led', li), val = $('.skill__v', li), level = Number(li.dataset.level);
      $$('i', led).forEach((s) => s.classList.remove('on'));
      val.textContent = '0';
      ScrollTrigger.create({ trigger: li, start: 'top 94%', once: true, onEnter: () => animateLed(led, val, level, (i % 4) * 0.1) });
    });
    $$('.mini-skills li').forEach((li, i) => {
      const led = $('.led', li), val = $('.v', li), level = Number(led.getAttribute('aria-valuenow'));
      $$('i', led).forEach((s) => s.classList.remove('on'));
      val.textContent = '0';
      state.heroLeds = state.heroLeds || [];
      state.heroLeds.push(() => animateLed(led, val, level, 0.8 + i * 0.15));
    });
  }

  /* ------------------------------------------------------------------------
     5. TIMELINE — sticky terminal that "types" the active mission-log entry
     ------------------------------------------------------------------------ */
  function showEntry(i) {
    const e = state.items[i];
    if (!e || !wideMQ.matches) return;
    const token = ++state.termToken, stale = () => token !== state.termToken, TL = C.timeline;
    const els = { cmd: $('#tCmd'), img: $('#tImg'), shot: $('#tShot'), title: $('#tTitle'), meta: $('#tMeta'), sub: $('#tSub'), desc: $('#tDesc'), tags: $('#tTags'), pos: $('#tPos') };
    $('#term').dataset.cat = e.category;
    els.pos.textContent = `${pad(i + 1)}/${pad(state.items.length)}`;
    els.img.src = e.image;
    els.cmd.textContent = ''; els.desc.textContent = ''; els.tags.textContent = '';
    els.title.textContent = motionOK() ? scrambled(e.title) : e.title;
    els.meta.innerHTML = `<span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${pad(e.age)}</span>` : ''}<span class="badge" style="--cat:var(--${({ education: 'cyan', project: 'lime', award: 'magenta', work: 'amber', personal: 'violet', travel: 'blue' })[e.category]})">${esc(categoryLabel(e.category))}</span>`;
    els.sub.textContent = e.subtitle;

    if (motionOK()) {
      gsap.fromTo(els.shot, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out', overwrite: true });
      gsap.fromTo(els.img, { scale: 1.25 }, { scale: 1, duration: 1.2, ease: 'expo.out', overwrite: true });
    }
    typeInto(els.cmd, T.command.replace('{id}', e.id), 110, stale).then(() => {
      if (stale()) return;
      scramble(els.title, e.title, { duration: 700 });
      return typeInto(els.desc, e.description, 170, stale);
    }).then(() => {
      if (stale()) return;
      els.tags.textContent = e.tags.map((t) => '#' + t.replace(/\s+/g, '_')).join('  ');
    });
  }

  function setActive(i, force = false) {
    if (!force && i === state.active) return;
    state.active = i;
    $$('.log-item').forEach((li, n) => li.classList.toggle('is-active', n === i));
    showEntry(i);
  }

  /** Watches which log row is in the reading band and syncs the terminal. */
  function observeRows() {
    state.io?.disconnect();
    const rows = $$('.log-item');
    state.io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(rows.indexOf(en.target)); });
    }, { rootMargin: '-40% 0px -45% 0px' });
    rows.forEach((r) => state.io.observe(r));
    rows.forEach((r, i) => $('.log-row', r).addEventListener('focus', () => setActive(i)));
  }

  function initTimeline() {
    observeRows();
    // First entry appears as soon as the terminal scrolls into view
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { if (state.active < 0) setActive(0, true); obs.disconnect(); }
    }, { threshold: 0.25 }).observe($('#term'));
    wideMQ.addEventListener('change', () => { if (wideMQ.matches && state.active >= 0) showEntry(state.active); });
  }

  /* ------------------------------------------------------------------------
     6. INTERACTIONS
     ------------------------------------------------------------------------ */
  function initFilters() {
    $('#timeline').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat-filter]');
      if (chip) setFilter(chip.dataset.catFilter);
    });
  }

  function setFilter(cat) {
    if (cat === state.filter) return;
    state.filter = cat;
    $$('[data-cat-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.catFilter === cat)));
    const apply = () => {
      renderLogRows(); observeRows();
      if (motionOK()) gsap.from('.log-item', { x: 36, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity' });
      setActive(0, true);
      if (hasGSAP) ScrollTrigger.refresh();
    };
    if (motionOK()) gsap.to($$('.log-item'), { x: -30, opacity: 0, duration: 0.35, ease: 'power3.in', stagger: 0.025, onComplete: apply });
    else apply();
  }

  function initProjectTabs() {
    const tabs = $('#caseTabs');
    tabs.addEventListener('click', (e) => {
      const t = e.target.closest('.case-tab');
      if (t) showProject(Number(t.dataset.i));
    });
    tabs.addEventListener('keydown', (e) => {
      const n = PROJECTS.length;
      let i = state.project;
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) i = (i + 1) % n;
      else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) i = (i - 1 + n) % n;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = n - 1;
      else return;
      e.preventDefault();
      showProject(i);
      $(`#tab-${i}`).focus();
    });
  }

  /* ---- Detail drawer (native <dialog>: focus trap + Esc included) ---- */
  function initModal() {
    const dlg = $('#modal'), M = C.modal, TL = C.timeline;

    const fill = (e, index, total) => {
      dlg.dataset.cat = e.category;
      dlg.innerHTML = `
        <div class="drawer__panel"><div class="drawer__inner" data-lenis-prevent>
          <div class="drawer__bar"><span>${esc(T.prompt)} ${esc(T.command.replace('{id}', e.id))}</span><button class="drawer__close" type="button" data-close>${esc(M.close)} ✕</button></div>
          <div class="drawer__shot"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="750"></div>
          <div class="drawer__body">
            <p class="drawer__meta"><span class="badge">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${pad(e.age)}</span>` : ''}</p>
            <h2 class="drawer__title" id="modalTitle"><span class="sr-only">${esc(e.title)}</span><span class="dec" aria-hidden="true">${esc(e.title)}</span></h2>
            <p class="drawer__sub">${esc(e.subtitle)}</p>
            <p class="drawer__desc">${esc(e.description)}</p>
            <ul class="drawer__tags" aria-label="${esc(M.tags)}">${e.tags.map((t) => `<li>${esc(t.replace(/\s+/g, '_'))}</li>`).join('')}</ul>
            ${e.link ? `<a class="btn btn--solid drawer__link" href="${esc(e.link)}" target="_blank" rel="noopener"><span class="lbl" data-scramble>${esc(M.visit)} ↗</span><span class="sr-only"> (${esc(C.projects.visit)})</span></a>` : ''}
            <nav class="drawer__nav" aria-label="Timeline">
              <button class="drawer__step" type="button" data-step="-1">← ${esc(M.prev)}</button>
              <span class="drawer__count">${pad(index + 1)} ${esc(M.of)} ${pad(total)}</span>
              <button class="drawer__step" type="button" data-step="1">${esc(M.next)} →</button>
            </nav>
          </div>
        </div></div>`;
      state.modal.id = e.id;
    };

    const animateContent = (delay = 0) => {
      if (!motionOK()) return;
      gsap.set($('.drawer__inner', dlg), { opacity: 1, x: 0 });
      scramble($('.dec', dlg), state.items.find((x) => x.id === state.modal.id).title, { duration: 800, delay: delay * 1000 });
      gsap.from($('.drawer__shot', dlg), { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.out', delay });
      gsap.from($$('.drawer__body > *', dlg), { y: 22, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, delay: delay + 0.15, clearProps: 'transform,opacity' });
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
      if (motionOK()) { gsap.fromTo($('.drawer__panel', dlg), { xPercent: 100 }, { xPercent: 0, duration: 0.8, ease: 'expo.out' }); animateContent(0.2); }
    };

    const requestClose = () => {
      if (!state.modal.open || state.modal.closing) return;
      state.modal.closing = true;
      dlg.classList.add('is-closing');
      if (!motionOK()) { dlg.close(); return; }
      gsap.to($('.drawer__panel', dlg), { xPercent: 100, duration: 0.55, ease: 'expo.in', onComplete: () => { dlg.close(); } });
    };

    const step = (dir) => {
      const list = state.items;
      let i = list.findIndex((e) => e.id === state.modal.id);
      i = (i + dir + list.length) % list.length;
      const swap = () => { fill(list[i], i, list.length); $(`[data-step="${dir}"]`, dlg)?.focus(); animateContent(0); };
      if (motionOK()) gsap.to($('.drawer__inner', dlg), { opacity: 0, x: dir * -24, duration: 0.2, ease: 'power2.in', onComplete: swap });
      else swap();
    };

    document.addEventListener('click', (e) => { const row = e.target.closest('[data-open]'); if (row) open(row.dataset.open); });
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
      $(`[data-open="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    });
  }

  /** Buttons/links with [data-scramble] decode their label on hover and focus. */
  function initHoverScramble() {
    if (!motionOK()) return;
    const run = (e) => {
      const lbl = e.target.closest('.btn')?.querySelector('[data-scramble]');
      if (!lbl) return;
      lbl.dataset.text = lbl.dataset.text || lbl.textContent;
      scramble(lbl, lbl.dataset.text, { duration: 420 });
    };
    document.addEventListener('pointerover', run);
    document.addEventListener('focusin', run);
  }

  function initContact() {
    const form = $('#contactForm'), F = C.contact.form;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const subject = encodeURIComponent(`${F.subjectPrefix} ${f.get('name')}`);
      const body = encodeURIComponent(`${f.get('message')}\n\n— ${f.get('name')} (${f.get('email')})`);
      location.href = `mailto:${P.email}?subject=${subject}&body=${body}`;
      $('#formStatus').textContent = F.success;
    });
    const copyBtn = $('#copyBtn');
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(P.email); }
      catch (_) {
        const ta = Object.assign(document.createElement('textarea'), { value: P.email });
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      const lbl = $('.lbl', copyBtn);
      lbl.textContent = T.copied; $('#copyStatus').textContent = T.copied;
      setTimeout(() => { lbl.textContent = T.copy; $('#copyStatus').textContent = ''; }, 1800);
    });
  }

  /* ------------------------------------------------------------------------
     7. LOADER, INTRO & BOOT
     ------------------------------------------------------------------------ */
  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('#loader');
      if (!motionOK()) { loader.remove(); root.classList.remove('is-loading'); return resolve(); }

      const lines = C.loader.lines.map((l) => l.replace('{name}', P.name.replace(/\s+/g, '_').toUpperCase()).replace('{n}', TIMELINE.length));
      const log = $('#bootLog'), fill = $('#bootFill'), pct = $('#bootPct'), o = { v: 0 };
      let shown = 0;
      const tl = gsap.timeline({ onComplete: () => { loader.remove(); root.classList.remove('is-loading'); state.lenis?.start(); } });
      tl.to(o, {
        v: 100, duration: 1.5, ease: 'power1.inOut',
        onUpdate: () => {
          const v = Math.round(o.v);
          fill.style.transform = `scaleX(${o.v / 100})`; pct.textContent = pad(v, 3) + '%';
          const want = Math.min(lines.length, Math.floor(o.v / (100 / lines.length)) + 1);
          while (shown < want) { shown++; log.textContent += `> ${lines[shown - 1]}${shown < lines.length ? ' ... OK' : ''}\n`; }
        }
      })
        .call(resolve, null, '+=0.15')
        .to(loader, { opacity: 0, duration: 0.45, ease: 'steps(5)' }, '<');

      const skip = () => tl.timeScale(8);
      $('#loaderSkip').addEventListener('click', skip);
      loader.addEventListener('click', skip);
      addEventListener('keydown', (e) => { if (['Enter', ' ', 'Escape'].includes(e.key) && $('#loader')) skip(); });
      $('#loaderSkip').focus({ preventScroll: true });
    });
  }

  function playIntro() {
    if (!motionOK()) return;
    $$('#top [data-decode]').forEach((el, i) => runDecode(el, { duration: 1100, delay: i * 200 }));
    gsap.from('[data-intro]', { y: 40, opacity: 0, scale: 0.97, duration: 1, ease: 'expo.out', stagger: 0.09, clearProps: 'transform,opacity' });
    gsap.from('.rail', { x: -20, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity' });
    (state.heroLeds || []).forEach((fn) => fn());
  }

  function boot() {
    root.classList.add('is-loading');
    renderAll();
    prepareDecode();

    initProgress(); initNavSpy(); initAnchors(); initClockAndPct();
    initFilters(); initProjectTabs(); initModal(); initContact(); initHoverScramble();
    initTimeline();
    initField(); initECG(); initReticle();

    if (motionOK()) {
      state.lenis = initLenis();
      state.lenis?.stop();
      initReveals(); initCounters(); initLeds();
      ScrollTrigger.sort(); ScrollTrigger.refresh();
      addEventListener('load', () => ScrollTrigger.refresh());
    }
    startLoops();
    runLoader().then(playIntro);
  }

  boot();
})();
