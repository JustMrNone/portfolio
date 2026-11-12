/* ==========================================================================
   EX6 — DIRECTOR'S CUT · main.js
   Structure:
     0. Setup & helpers
     1. Rendering (data -> HTML)
     2. Timeline = the edit suite   (pinned scroll scrubs a playhead)
     3. Posters, mixing desk, counters
     4. Modal, theme, menu, nav spy, progress, form
     5. Loader, intro animation & boot
   All content comes from window.portfolio (shared/data.js).
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     0. SETUP & HELPERS
     ------------------------------------------------------------------------ */
  const D = window.portfolio;
  if (!D) { console.error('shared/data.js did not load.'); return; }
  const { person: P, timeline: TL, projects: PR, skills: SK, stats: ST, future: FU, copy: C } = D;
  const CN = C.cinema;

  const $  = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');          // *accent* -> <em>
  const plain = (s) => String(s ?? '').replace(/\*/g, '');
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const root = document.documentElement;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionOK = () => hasGSAP && !reduceMQ.matches;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const CATS = Object.keys(C.timeline.categories);               // lane order
  const catLabel = (k) => C.timeline.categories[k] || k;
  const catColor = (k) => `var(--c-${k})`;
  const lastYear = Math.max(...TL.map((e) => e.year));

  const state = {
    filter: 'all',
    vis: TL.map((_, i) => i),    // global indices that match the filter
    cur: 0,                      // position inside vis
    u: 0,                        // continuous position (for the playhead)
    pinned: false,
    playing: false, timer: 0,
    lenis: null,
    modal: { open: false, gi: 0, last: null, closing: false }
  };

  /* ------------------------------------------------------------------------
     1. RENDERING
     ------------------------------------------------------------------------ */
  const heading = (idx, label, title, id) => `
    <header class="sh" data-reveal>
      <p class="sh__label"><b>SC ${esc(idx)}</b> ${esc(label)}</p>
      <h2 class="sh__title" id="${id}">${fmt(title)}</h2>
    </header>`;

  function renderAll() {
    document.title = `${P.name} — ${P.title}`;
    $('meta[name="description"]')?.setAttribute('content', P.bio);
    $('#skipLink').textContent = C.skipLink;
    $('#loaderName').textContent = P.name;
    $('#loaderLabel').textContent = CN.leader;
    $('#loaderSkip').textContent = C.loader.skip;
    const initials = P.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    $('#brand').innerHTML = `<span class="brand__mark" aria-hidden="true">${esc(initials)}</span><span class="brand__name">${esc(P.name)}</span>`;
    $('#brand').setAttribute('aria-label', `${P.name} — home`);
    $('#menuBtn').textContent = C.menu.open;
    $('#navList').innerHTML = C.nav.map((n, i) =>
      `<li><a href="#${n.id}" data-nav="${n.id}"><span class="nav-i">${pad(i + 1)}</span>${esc(n.label)}</a></li>`).join('');
    renderHero(); renderReel(); renderAbout(); renderTimeline(); renderProjects(); renderSkills(); renderFuture(); renderContact(); renderFooter();
    setThemeLabel();
  }

  function renderHero() {
    const [first, ...rest] = P.name.split(' ');
    const ring = 'I AM WAR • I AM WAR • I AM WAR • ';
    $('#top').innerHTML = `
      <div class="hero__media"><img src="${esc(P.avatar)}" alt="${esc(P.avatarAlt)}" width="800" height="1000" fetchpriority="high" decoding="async"></div>
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__bar hero__bar--t" aria-hidden="true"></div>
      <div class="hero__bar hero__bar--b" aria-hidden="true"></div>
      <div class="hero__hud" aria-hidden="true">
        <div class="hud__tl"><i class="hud__rec"></i><span>${esc(CN.rec)}</span><span id="hudTC">00:00:00:00</span></div>
        <div class="hud__tr">24 FPS · 1/48 · ISO 800 · 2.39:1</div>
      </div>
      <div class="hero__focus" id="focusBox" aria-hidden="true"><span>AF</span></div>
      <div class="hero__inner">
        <p class="hero__eyebrow" data-hero>${esc(C.hero.eyebrow)}</p>
        <h1 class="hero__name" id="heroName" aria-label="${esc(P.name)}">
          <span aria-hidden="true" data-split>${esc(first)}</span>
          <span aria-hidden="true" data-split>${esc(rest.join(' '))}</span>
        </h1>
        <div class="hero__sub">
          <div data-hero>
            <p class="hero__title">${esc(P.title)}</p>
            <p class="hero__lede">${esc(P.bio)}</p>
            <div class="hero__cta">
              <a class="btn btn--primary" href="#timeline">${esc(C.hero.cta1)} <span aria-hidden="true">↓</span></a>
              <a class="btn" href="#contact">${esc(C.hero.cta2)}</a>
            </div>
          </div>

        </div>
      </div>
      <a class="hero__badge" href="#iamwar" aria-label="I Am War — ${esc(D.iamwar.tagline)}" data-hero>
            <svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><path id="badgePath" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" fill="none"/><text><textPath href="#badgePath" textLength="292" lengthAdjust="spacing">${ring}</textPath></text></svg>
            <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg></span>
          </a>
      <span class="hero__scroll" aria-hidden="true">${esc(C.hero.scroll)}</span>`;
  }

  function renderReel() {
    const frames = TL.slice(0, 12).map((e) => `<div class="reel__f"><img src="${esc(e.image)}" alt="" width="300" height="200" loading="lazy" decoding="async"></div>`).join('');
    $('#reel').innerHTML = `<div class="reel__track">${frames}${frames}</div>`;
  }

  function renderAbout() {
    const A = C.about;
    $('#about').innerHTML = `
      <div class="wrap">
        ${heading(A.index, A.label, `Meet *${P.name.split(' ')[0]}.*`, 'aboutTitle')}
        <div class="about__grid">
          <article class="script" id="script" data-reveal>
            <p class="sp-slug">${esc(CN.scriptFade)}</p>
            <p class="sp-slug">${esc(CN.scriptSlug)}</p>
            ${P.about.map((t) => `<p class="sp-act" data-type>${esc(t)}</p>`).join('')}
            <p class="sp-cue">${esc(P.name)}</p>
            <p class="sp-par">(${esc(CN.welcome.toLowerCase())})</p>
            <p class="sp-dia" data-type>${fmt(A.statement)}</p>
            <dl class="sp-facts">
              <div><dt>${esc(A.facts.school)}</dt><dd>${esc(P.university)}</dd></div>
              <div><dt>${esc(A.facts.applying)}</dt><dd>${esc(P.degree)}</dd></div>
              <div><dt>${esc(A.facts.based)}</dt><dd>${esc(P.location)}</dd></div>
            </dl>
            <p class="sp-trans">${esc(CN.scriptCut)}</p>
          </article>
          <aside class="slate" id="slate" aria-label="${esc(CN.slate.prod)}" data-reveal>
            <div class="slate__clap" id="clap" aria-hidden="true"></div>
            <div class="slate__body">
              <div class="slate__stripe" aria-hidden="true"></div>
              <dl class="slate__meta">
                <div class="wide"><dt>${esc(CN.slate.prod)}</dt><dd>${esc(D.iamwar.title.join(' '))}</dd></div>
                <div><dt>${esc(CN.slate.dir)}</dt><dd>${esc(P.name)}</dd></div>
                <div><dt>${esc(CN.slate.date)}</dt><dd>${lastYear}</dd></div>
                <div><dt>${esc(CN.slate.roll)}</dt><dd>A01</dd></div>
                <div><dt>${esc(CN.slate.scene)} / ${esc(CN.slate.take)}</dt><dd>01 / 01</dd></div>
              </dl>
              <dl class="slate__stats">
                ${ST.map((s) => `<div class="stat"><dt>${esc(s.label)}</dt><dd data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
              </dl>
            </div>
          </aside>
        </div>
      </div>`;
  }

  function renderTimeline() {
    const T = C.timeline;
    const projLabel = (C.nav.find((n) => n.id === 'projects') || {}).label || 'Work';
    $('#timeline').innerHTML = `
      <div class="tl__pin" id="tlPin">
        <div class="tl__stage" id="tlStage">
          <a class="skip-link skip-link--tl" href="#projects">Skip to ${esc(projLabel)}</a>
          <header class="tl__head">
            <div>
              <p class="tl__label"><b>SC ${esc(T.index)}</b> ${esc(T.label)} · <span id="tlCount"></span></p>
              <h2 class="tl__title" id="tlTitle">${fmt(T.title)}</h2>
            </div>
            <div class="chips" id="chips" role="group" aria-label="${esc(T.filtersLabel)}">
              <button class="chip" type="button" data-cat-filter="all" aria-pressed="true"><i></i>${esc(T.all)}</button>
              ${CATS.map((k) => `<button class="chip" type="button" data-cat-filter="${k}" aria-pressed="false" style="--c:${catColor(k)}"><i></i>${esc(catLabel(k))}</button>`).join('')}
            </div>
          </header>
          <div class="tl__main">
            <div class="mon" id="mon" role="img" aria-label="${esc(CN.monitor)}">
              <div class="mon__img" id="monImgs">${TL.map((e, i) => `<img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="900" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-img="${i}">`).join('')}</div>
              <div class="mon__shade"></div>
              <div class="mon__cut" id="monCut"></div>
              <div class="mon__ui" aria-hidden="true">
                <div class="mon__top"><span class="mon__pgm"><i></i>PGM</span><span class="mon__cat" id="monCat"></span><span id="monClip"></span></div>
                <span></span>
                <div class="mon__bottom"><span class="mon__year" id="monYear"></span><span class="mon__date" id="monDate"></span></div>
              </div>
              <button class="mon__hit" id="monHit" type="button" tabindex="-1" aria-hidden="true"></button>
            </div>
            <div class="info" id="info" aria-live="polite"></div>
          </div>
          <div class="strip" id="strip">
            <div class="strip__ctl">
              <button class="tbtn" id="tlPrev" type="button" aria-label="${esc(CN.prev)}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2.4v14H6zM20 5v14L9.5 12z"/></svg></button>
              <button class="tbtn tbtn--play" id="tlPlay" type="button" aria-pressed="false" aria-label="${esc(CN.play)}"><svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg><svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg></button>
              <button class="tbtn" id="tlNext" type="button" aria-label="${esc(CN.next)}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.6 5H18v14h-2.4zM4 5v14l10.5-7z"/></svg></button>
              <span class="strip__tc" id="tlTC" aria-hidden="true"></span>
              <span class="strip__hint" aria-hidden="true">${esc(T.hint)}</span>
            </div>
            <div class="strip__labels" aria-hidden="true">
              <span></span>
              ${CATS.map((k) => `<span style="--c:${catColor(k)}"><i></i><b>${esc(catLabel(k))}</b></span>`).join('')}
            </div>
            <div class="strip__view" id="stripView">
              <div class="strip__track" id="stripTrack" style="--cols:${TL.length}">
                <div class="ruler" aria-hidden="true">${TL.map((e, i) => (i === 0 || TL[i - 1].year !== e.year) ? `<span style="left:calc(120px + ${i} * var(--col))">${e.year}</span>` : '').join('')}</div>
                ${TL.map((e, i) => `<button class="clip" type="button" data-clip="${i}" style="--i:${i};--lane:${Math.max(0, CATS.indexOf(e.category))};--c:${catColor(e.category)}" aria-label="${esc(`${e.title}, ${e.date}`)}"><span>${e.year} · ${esc(e.title)}</span></button>`).join('')}
              </div>
              <div class="playhead" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  const splitTitle = (t) => {
    const parts = String(t).split(/\s+[—–]\s+/);
    return { main: parts[0], sub: parts.slice(1).join(' — ') };
  };

  function renderProjects() {
    const Pj = C.projects;
    $('#projects').innerHTML = `
      <div class="wrap-outer">
        ${heading(Pj.index, Pj.label, Pj.title, 'projTitle')}
        <div class="posters__scroller" id="posters" tabindex="0" role="region" aria-label="${esc(Pj.label)}">
          ${PR.map((p, i) => {
            const { main, sub } = splitTitle(p.title);
            return `<article class="poster">
              <a class="poster__link" href="${esc(p.link)}" target="_blank" rel="noopener" draggable="false" aria-label="${esc(p.title)} — ${esc(Pj.visit)}">
                <span class="poster__art"><img src="${esc(p.image)}" alt="" width="1200" height="900" loading="lazy" decoding="async" draggable="false"></span>
                <span class="poster__body">
                  <span class="poster__top"><span>No. ${pad(i + 1)}</span><span>${esc(p.year)}</span></span>
                  <span>
                    <span class="poster__main">${esc(main)}</span>
                    ${sub ? `<span class="poster__sub">${esc(sub)}</span>` : ''}
                    <span class="poster__desc">${esc(p.description)}</span>
                    <ul class="poster__credits">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                    <span class="poster__foot"><span>${esc(P.name)}</span><span aria-hidden="true">↗</span></span>
                  </span>
                </span>
              </a>
            </article>`;
          }).join('')}
        </div>
        <div class="posters__ctl">
          <button class="tbtn" id="postPrev" type="button" aria-label="${esc(CN.prev)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="tbtn" id="postNext" type="button" aria-label="${esc(CN.next)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
          <div class="posters__bar" aria-hidden="true"><span id="postBar"></span></div>
          <span class="posters__hint" aria-hidden="true">${esc(CN.swipe)}</span>
        </div>
      </div>`;
  }

  function renderSkills() {
    const S = C.skills;
    const groups = Object.keys(S.groups);
    $('#skills').innerHTML = `
      <div class="wrap">
        ${heading(S.index, S.label, S.title, 'skillsTitle')}
        <div class="mixer" id="mixer">
          ${groups.map((g) => {
            const list = SK.filter((s) => s.group === g);
            return `<section class="desk" data-reveal aria-label="${esc(S.groups[g])}">
              <div class="desk__head"><h3>${esc(S.groups[g])}</h3><span class="desk__leds" aria-hidden="true"><i></i><i></i><i></i></span></div>
              <div class="desk__strips" style="--cols:${list.length}">
                ${list.map((s) => `<div class="ch" data-level="${s.level}">
                  <span class="ch__val" aria-hidden="true">${s.level}</span>
                  <div class="ch__fader" role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}">
                    <span class="ch__slot"></span>
                    <span class="ch__meter">${'<i></i>'.repeat(10)}</span>
                    <span class="ch__cap"></span>
                  </div>
                  <span class="ch__name">${esc(s.name)}</span>
                </div>`).join('')}
              </div>
            </section>`;
          }).join('')}
        </div>
        <p class="mixer-hint">${esc(CN.mixerHint)}</p>
      </div>`;
  }

  function renderFuture() {
    const F = C.future;
    $('#future').innerHTML = `
      <div class="wrap">
        ${heading(F.index, F.label, F.title, 'futureTitle')}
        <div class="coming">
          ${FU.map((f, i) => `<article class="tease" data-reveal>
            <span class="tease__num" aria-hidden="true">${pad(i + 1)}</span>
            <span class="tease__tag"><i></i>${esc(CN.comingSoon)} · ${esc(CN.next)}</span>
            <h3>${esc(f.goal)}</h3>
            <p>${esc(f.description)}</p>
          </article>`).join('')}
        </div>
        <div class="the-end" data-reveal>
          <p class="the-end__k">${esc(CN.thanks)}</p>
          <p class="big">${fmt(F.closing)}</p>
        </div>
      </div>`;
  }

  function renderContact() {
    const K = C.contact, f = K.form;
    const roles = CN.creditsRoles;
    const group = (k, v) => `<div class="credits__group"><small>${esc(k)}</small><b>${esc(v)}</b></div>`;
    const credits = [
      group(CN.nowShowing, D.iamwar.title.join(' ')),
      group(roles.director, P.name), group(roles.writer, P.name), group(roles.artist, P.name), group(roles.editor, P.name),
      ...PR.map((p) => group(D.iamwar.worksLabel, p.title)),
      group(C.about.facts.school, P.university),
      group(C.about.facts.based, P.location),
      group(CN.thanks, '♥')
    ].join('');
    $('#contact').innerHTML = `
      <div class="wrap">
        ${heading(K.index, K.label, K.title, 'contactTitle')}
        <div class="contact__grid">
          <div data-reveal>
            <p class="contact__intro">${esc(K.intro)}</p>
            <a class="contact__mail" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
            <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</div>
            <form class="form" id="contactForm" novalidate>
              <div class="field"><label for="fName">${esc(f.name)}</label><input id="fName" name="name" type="text" autocomplete="name" required></div>
              <div class="field"><label for="fEmail">${esc(f.email)}</label><input id="fEmail" name="email" type="email" autocomplete="email" required></div>
              <div class="field"><label for="fMsg">${esc(f.message)}</label><textarea id="fMsg" name="message" rows="4" required></textarea></div>
              <div><button class="btn btn--primary" type="submit">${esc(f.send)} <span aria-hidden="true">→</span></button></div>
              <p class="form__ok" id="formOk" role="status"></p>
            </form>
          </div>
          <div class="credits" aria-hidden="true" data-reveal><div class="credits__roll">${credits}${credits}</div></div>
        </div>
      </div>`;
  }

  function renderFooter() {
    $('#footer').innerHTML = `
      <p class="footer__word" aria-hidden="true" data-no-iaw>I AM WAR</p>
      <div class="footer__row">
        <span>${esc(C.footer.note)}</span>
        <span>© ${new Date().getFullYear()} ${esc(P.name)}. ${esc(C.footer.rights)}</span>
        <a href="#top" data-top>${esc(C.footer.top)} ↑</a>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     2. TIMELINE — THE EDIT SUITE
     ------------------------------------------------------------------------ */
  const el = {};
  function cacheTimeline() {
    ['tl', 'tlPin', 'tlStage', 'monImgs', 'monCut', 'monCat', 'monClip', 'monYear', 'monDate', 'info', 'stripView', 'stripTrack', 'tlTC', 'tlCount', 'tlPlay', 'tlPrev', 'tlNext']
      .forEach((id) => { el[id] = document.getElementById(id === 'tl' ? 'timeline' : id); });
    el.imgs = $$('img', el.monImgs);
    el.clips = $$('.clip', el.stripTrack);
  }

  const colCenter = (gi) => {
    const col = parseFloat(getComputedStyle(el.tl).getPropertyValue('--col')) || 112;
    return 120 + gi * col + col / 2;
  };

  /** Position the strip so the playhead sits on position `u` (a fractional index into vis). */
  function placeStrip(u) {
    const n = state.vis.length;
    const uu = clamp(u, 0, Math.max(0, n - 1));
    const i0 = Math.floor(uu), i1 = Math.min(n - 1, i0 + 1), f = uu - i0;
    const x = lerp(colCenter(state.vis[i0]), colCenter(state.vis[i1]), f);
    const ph = el.stripView.clientWidth * 0.4;
    el.stripView.style.setProperty('--ph', `${ph}px`);
    el.stripTrack.style.transform = `translate3d(${(ph - x).toFixed(1)}px,0,0)`;
    state.u = uu;
  }

  function setCurrent(k, opts = {}) {
    const n = state.vis.length;
    if (!n) return;
    k = clamp(k, 0, n - 1);
    const changed = k !== state.cur || opts.force;
    state.cur = k;
    const gi = state.vis[k], e = TL[gi];
    if (!changed) return;

    el.imgs.forEach((im) => im.classList.toggle('is-on', +im.dataset.img === gi));
    el.clips.forEach((c) => c.setAttribute('aria-current', String(+c.dataset.clip === gi)));
    el.monCat.textContent = catLabel(e.category);
    el.monCat.style.setProperty('--c', catColor(e.category));
    el.monClip.textContent = CN.clipOf.replace('{n}', pad(k + 1)).replace('{total}', pad(n));
    el.monYear.textContent = e.year;
    el.monDate.textContent = e.date + (e.age != null ? ` · ${C.timeline.age} ${e.age}` : '');
    el.tlTC.textContent = `${pad(k + 1)} / ${pad(n)}`;
    el.tlCount.textContent = C.timeline.count.replace('{n}', n);
    el.info.innerHTML = `
      <p class="info__meta" style="--c:${catColor(e.category)}"><b>${esc(catLabel(e.category))}</b><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(C.timeline.age)} ${e.age}</span>` : ''}</p>
      <h3 class="info__title">${esc(e.title)}</h3>
      <p class="info__sub">${esc(e.subtitle)}</p>
      <p class="info__desc">${esc(e.description)}</p>
      <ul class="info__tags">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <button class="btn btn--primary" type="button" data-open="${esc(e.id)}">${esc(C.timeline.open)} <span aria-hidden="true">→</span></button>`;
    if (!reduceMQ.matches) {
      el.info.classList.remove('is-swap'); void el.info.offsetWidth; el.info.classList.add('is-swap');
      if (!opts.initial) { el.monCut.classList.remove('is-cut'); void el.monCut.offsetWidth; el.monCut.classList.add('is-cut'); }
    }
    el.tlPrev.disabled = k === 0; el.tlNext.disabled = k === n - 1;
  }

  /** Scroll position that puts the playhead on stop k (pinned mode). */
  function pinMetrics() {
    const r = el.tlPin.getBoundingClientRect();
    return { top: r.top + scrollY, total: Math.max(1, r.height - el.tlStage.offsetHeight) };
  }

  function scrollToY(y, immediate) {
    if (state.lenis) state.lenis.scrollTo(y, { immediate: !!immediate, duration: 1.2 });
    else scrollTo({ top: y, behavior: immediate || reduceMQ.matches ? 'auto' : 'smooth' });
  }

  function goTo(k, immediate) {
    const n = state.vis.length;
    k = clamp(k, 0, n - 1);
    if (state.pinned) {
      const m = pinMetrics();
      scrollToY(m.top + (n > 1 ? (k / (n - 1)) * m.total : 0) + (k > 0 ? 1 : 0), immediate);
    } else {
      setCurrent(k);
      el.stripTrack.style.transition = reduceMQ.matches ? 'none' : 'transform 0.7s cubic-bezier(.16,1,.3,1)';
      placeStrip(k);
    }
  }

  let scrollQueued = false;
  function onTimelineScroll() {
    if (!state.pinned || scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const r = el.tlPin.getBoundingClientRect();
      const total = Math.max(1, r.height - el.tlStage.offsetHeight);
      const p = clamp(-r.top / total, 0, 1);
      const u = p * (state.vis.length - 1);
      placeStrip(u);
      setCurrent(Math.round(u));
    });
  }

  function applyFilter(cat) {
    state.filter = cat;
    state.vis = TL.map((e, i) => i).filter((i) => cat === 'all' || TL[i].category === cat);
    $$('[data-cat-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.catFilter === cat)));
    el.clips.forEach((c) => { const off = !state.vis.includes(+c.dataset.clip); c.classList.toggle('is-off', off); c.disabled = off; });
    el.tl.style.setProperty('--n', state.vis.length);
    stopPlay();
    if (state.pinned) { const m = pinMetrics(); if (scrollY > m.top) scrollToY(m.top, true); }
    state.cur = -1;                       // force a refresh
    setCurrent(0, { force: true, initial: true });
    el.stripTrack.style.transition = 'none';
    placeStrip(0);
    el.tlCount.textContent = C.timeline.count.replace('{n}', state.vis.length);
    requestAnimationFrame(onTimelineScroll);
  }

  function togglePlay() { state.playing ? stopPlay() : startPlay(); }
  function startPlay() {
    if (state.vis.length < 2) return;
    state.playing = true;
    el.tlPlay.setAttribute('aria-pressed', 'true'); el.tlPlay.setAttribute('aria-label', CN.pause);
    if (state.cur >= state.vis.length - 1) goTo(0);
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (state.cur >= state.vis.length - 1) return stopPlay();
      goTo(state.cur + 1);
    }, 3400);
  }
  function stopPlay() {
    state.playing = false; clearInterval(state.timer);
    el.tlPlay.setAttribute('aria-pressed', 'false'); el.tlPlay.setAttribute('aria-label', CN.play);
  }

  function initTimeline() {
    cacheTimeline();
    state.pinned = motionOK();
    el.tl.classList.toggle('is-static', !state.pinned);
    el.tl.style.setProperty('--n', TL.length);
    setCurrent(0, { force: true, initial: true });
    placeStrip(0);

    document.addEventListener('click', (ev) => {
      const chip = ev.target.closest('[data-cat-filter]');
      if (chip) { applyFilter(chip.dataset.catFilter); return; }
      const clip = ev.target.closest('.clip');
      if (clip) { const k = state.vis.indexOf(+clip.dataset.clip); if (k >= 0) goTo(k); return; }
      if (ev.target.closest('#monHit')) { openModal(state.vis[state.cur]); return; }
      const op = ev.target.closest('[data-open]');
      if (op && !op.closest('dialog')) { const gi = TL.findIndex((e) => e.id === op.dataset.open); if (gi >= 0) openModal(gi); }
    });
    el.tlPrev.addEventListener('click', () => { stopPlay(); goTo(state.cur - 1); });
    el.tlNext.addEventListener('click', () => { stopPlay(); goTo(state.cur + 1); });
    el.tlPlay.addEventListener('click', togglePlay);
    ['wheel', 'touchstart'].forEach((t) => addEventListener(t, () => { if (state.playing) stopPlay(); }, { passive: true }));
    new IntersectionObserver(([en]) => { if (!en.isIntersecting && state.playing) stopPlay(); }).observe(el.tlStage);
    addEventListener('scroll', onTimelineScroll, { passive: true });
    addEventListener('resize', () => { placeStrip(state.u); onTimelineScroll(); });
    onTimelineScroll();
  }

  /* ------------------------------------------------------------------------
     3. POSTERS, MIXING DESK, COUNTERS
     ------------------------------------------------------------------------ */
  function initPosters() {
    const sc = $('#posters'), bar = $('#postBar');
    const upd = () => {
      const max = sc.scrollWidth - sc.clientWidth, p = max > 0 ? sc.scrollLeft / max : 0;
      const w = clamp(sc.clientWidth / sc.scrollWidth, 0.08, 1) * 100;
      bar.style.width = `${w}%`; bar.style.transform = `translateX(${p * (100 / (w / 100) - 100)}%)`;
    };
    sc.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    const step = () => ($('.poster', sc)?.getBoundingClientRect().width || 300) + 24;
    $('#postPrev').addEventListener('click', () => sc.scrollBy({ left: -step(), behavior: reduceMQ.matches ? 'auto' : 'smooth' }));
    $('#postNext').addEventListener('click', () => sc.scrollBy({ left: step(), behavior: reduceMQ.matches ? 'auto' : 'smooth' }));

    // drag to scroll (mouse only; touch scrolls natively)
    let down = false, sx = 0, sl = 0, moved = 0;
    sc.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = sc.scrollLeft; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) { sc.classList.add('is-drag'); sc.scrollLeft = sl - dx; }
    });
    addEventListener('pointerup', () => { if (down) { down = false; setTimeout(() => sc.classList.remove('is-drag'), 0); } });
    sc.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);

    // 3D tilt + light sweep on fine pointers
    if (finePointer.matches && !reduceMQ.matches) {
      $$('.poster__link', sc).forEach((a) => {
        a.addEventListener('pointermove', (e) => {
          const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          a.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`); a.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
          a.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); a.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        });
        a.addEventListener('pointerleave', () => { a.style.setProperty('--rx', '0deg'); a.style.setProperty('--ry', '0deg'); });
      });
    }
  }

  /* Mixing desk — every fader is a skill. Drag one: it springs back. */
  const easeElastic = (t) => (t === 0 || t === 1) ? t : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function setLevel(ch, v) {
    ch.style.setProperty('--v', v.toFixed(4));
    const lit = Math.round(v * 10);
    $$('.ch__meter i', ch).forEach((s, i) => s.classList.toggle('on', 10 - i <= lit));
    $('.ch__val', ch).textContent = Math.round(v * 100);
  }
  function tween(ch, to, ms, ease, delay = 0) {
    cancelAnimationFrame(ch._raf);
    if (reduceMQ.matches) { ch._v = to; setLevel(ch, to); return; }
    const from = ch._v ?? 0, t0 = performance.now() + delay;
    const tick = (now) => {
      const t = clamp((now - t0) / ms, 0, 1);
      if (now >= t0) { ch._v = lerp(from, to, ease(t)); setLevel(ch, ch._v); }
      if (t < 1) ch._raf = requestAnimationFrame(tick);
    };
    ch._raf = requestAnimationFrame(tick);
  }
  function initMixer() {
    const chans = $$('.ch');
    chans.forEach((ch) => {
      const base = +ch.dataset.level / 100, fader = $('.ch__fader', ch);
      ch._v = 0; setLevel(ch, 0);
      let drag = false;
      const fromEvent = (e) => {
        const r = fader.getBoundingClientRect();
        return clamp((r.bottom - 18 - e.clientY) / Math.max(1, r.height - 36), 0, 1);
      };
      fader.addEventListener('pointerdown', (e) => { drag = true; fader.setPointerCapture(e.pointerId); cancelAnimationFrame(ch._raf); ch._v = fromEvent(e); setLevel(ch, ch._v); });
      fader.addEventListener('pointermove', (e) => { if (drag) { ch._v = fromEvent(e); setLevel(ch, ch._v); } });
      const up = () => { if (!drag) return; drag = false; tween(ch, base, 1100, easeElastic); };
      fader.addEventListener('pointerup', up); fader.addEventListener('pointercancel', up);
      ch._base = base;
    });
    const run = () => chans.forEach((ch, i) => tween(ch, ch._base, 1300, easeOut, (i % 4) * 110));
    if ('IntersectionObserver' in window && !reduceMQ.matches) {
      new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.25 }).observe($('#mixer'));
    } else chans.forEach((ch) => { ch._v = ch._base; setLevel(ch, ch._base); });
  }

  function initCounters() {
    $$('[data-count]').forEach((n) => {
      const m = String(n.dataset.count).match(/^(\d+)(.*)$/); if (!m) return;
      const target = +m[1], suffix = m[2];
      const run = () => {
        const t0 = performance.now(), dur = 1400;
        const tick = (now) => { const t = clamp((now - t0) / dur, 0, 1); n.textContent = Math.round(target * easeOut(t)) + (t === 1 ? suffix : ''); if (t < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      };
      if (reduceMQ.matches || !('IntersectionObserver' in window)) return;
      n.textContent = '0';
      new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.5 }).observe(n);
    });
  }

  /* ------------------------------------------------------------------------
     4. MODAL, THEME, MENU, NAV SPY, PROGRESS, FORM
     ------------------------------------------------------------------------ */
  function modalHTML(gi) {
    const e = TL[gi], k = state.vis.indexOf(gi), n = state.vis.length, M = C.modal;
    return `
      <div class="modal__card" id="modalCard" style="--c:${catColor(e.category)}">
        <button class="modal__close" id="modalClose" type="button" aria-label="${esc(M.close)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
        <div class="modal__media"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="1500"></div>
        <div class="modal__body">
          <p class="modal__meta"><b>${esc(catLabel(e.category))}</b><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(C.timeline.age)} ${e.age}</span>` : ''}</p>
          <h3 class="modal__title" id="modalTitle">${esc(e.title)}</h3>
          <p class="modal__sub">${esc(e.subtitle)}</p>
          <p class="modal__desc">${esc(e.description)}</p>
          <ul class="modal__tags" aria-label="${esc(M.tags)}">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <div class="modal__nav">
            <button class="tbtn" id="modalPrev" type="button" aria-label="${esc(M.prev)}" ${k <= 0 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
            <button class="tbtn" id="modalNext" type="button" aria-label="${esc(M.next)}" ${k >= n - 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
            ${e.link ? `<a class="btn" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(M.visit)} ↗</a>` : ''}
            <span class="modal__count">${pad(k + 1)} ${esc(M.of)} ${pad(n)}</span>
          </div>
        </div>
      </div>`;
  }

  function openModal(gi) {
    const dlg = $('#modal');
    if (state.modal.open) return;
    stopPlay();
    state.modal = { open: true, gi, last: document.activeElement, closing: false };
    dlg.innerHTML = modalHTML(gi);
    dlg.showModal();
    state.lenis?.stop();
    root.style.overflow = 'hidden';
    const card = $('#modalCard');
    if (motionOK()) gsap.fromTo(card, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out', clearProps: 'transform' });
    $('#modalClose').focus({ preventScroll: true });
  }
  function stepModal(dir) {
    const k = state.vis.indexOf(state.modal.gi) + dir;
    if (k < 0 || k >= state.vis.length) return;
    const gi = state.vis[k]; state.modal.gi = gi;
    const dlg = $('#modal'), card = $('#modalCard');
    const swap = () => {
      dlg.innerHTML = modalHTML(gi);
      const c = $('#modalCard');
      if (motionOK()) gsap.fromTo(c, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform' });
      ($(dir > 0 ? '#modalNext' : '#modalPrev') || $('#modalClose')).focus({ preventScroll: true });
    };
    if (motionOK() && card) gsap.to(card, { opacity: 0, x: dir * -30, duration: 0.18, ease: 'power2.in', onComplete: swap }); else swap();
    setCurrent(k);                                  // keep the monitor in sync
    placeStrip(k);
  }
  function closeModal() {
    const dlg = $('#modal');
    if (!state.modal.open || state.modal.closing) return;
    state.modal.closing = true;
    const done = () => {
      dlg.close(); dlg.innerHTML = '';
      root.style.overflow = ''; state.lenis?.start();
      state.modal.open = false; state.modal.closing = false;
      state.modal.last?.focus?.({ preventScroll: true });
      if (state.pinned) goTo(state.cur, true);
    };
    const card = $('#modalCard');
    if (motionOK() && card) gsap.to(card, { opacity: 0, y: 24, scale: 0.97, duration: 0.3, ease: 'power3.in', onComplete: done }); else done();
  }
  function initModal() {
    const dlg = $('#modal');
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) return closeModal();
      if (e.target.closest('#modalClose')) return closeModal();
      if (e.target.closest('#modalPrev')) return stepModal(-1);
      if (e.target.closest('#modalNext')) return stepModal(1);
    });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') stepModal(1);
      if (e.key === 'ArrowLeft') stepModal(-1);
    });
  }

  function setThemeLabel() {
    const t = root.dataset.theme;
    $('#themeBtn').setAttribute('aria-label', t === 'dark' ? C.theme.toLight : C.theme.toDark);
    $('#themeBtn').setAttribute('title', t === 'dark' ? CN.lights.on : CN.lights.off);
    $('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0a0908' : '#ece5d6');
  }
  function initTheme() {
    $('#themeBtn').addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      const apply = () => { root.dataset.theme = next; try { localStorage.setItem('ex6-theme', next); } catch (e) {} setThemeLabel(); };
      if (document.startViewTransition && motionOK()) document.startViewTransition(apply); else apply();
    });
  }

  function initMenu() {
    const btn = $('#menuBtn'), nav = $('#siteNav');
    const set = (open) => {
      nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? C.menu.close : C.menu.open;
      open ? state.lenis?.stop() : state.lenis?.start();
      root.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    nav.addEventListener('click', (e) => { if (e.target.closest('a') && btn.getAttribute('aria-expanded') === 'true') set(false); });
    matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  function initNavSpy() {
    const links = $$('[data-nav]');
    const setActive = (id) => links.forEach((a) => a.setAttribute('aria-current', String(a.dataset.nav === id)));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    C.nav.forEach((n) => { const s = document.getElementById(n.id); if (s) io.observe(s); });
  }

  function initScrollUI() {
    const bar = $('#progressBar'), header = $('#header'), tc = $('#runtimeTC');
    let q = false;
    const upd = () => {
      q = false;
      const max = root.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
      header.classList.toggle('is-stuck', scrollY > 40);
      document.body.classList.toggle('at-hero', scrollY < innerHeight * 0.6);
      const f = Math.round(p * 840 * 24), ff = f % 24, s = Math.floor(f / 24);
      tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
    };
    addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
    // hero REC timecode (real time), paused when off-screen
    const hud = $('#hudTC'); let visible = true, t0 = performance.now();
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe($('#top'));
    if (!reduceMQ.matches) setInterval(() => {
      if (!visible) return;
      const t = (performance.now() - t0) / 1000, s = Math.floor(t);
      hud.textContent = `00:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((t % 1) * 24))}`;
    }, 83);
  }

  function initFocusBox() {
    const hero = $('#top'), box = $('#focusBox');
    if (!finePointer.matches || !motionOK()) return;
    const xTo = gsap.quickTo(box, 'x', { duration: 0.35, ease: 'power3.out' }), yTo = gsap.quickTo(box, 'y', { duration: 0.35, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect(); box.classList.add('is-on'); xTo(e.clientX - r.left); yTo(e.clientY - r.top);
    });
    hero.addEventListener('pointerleave', () => box.classList.remove('is-on'));
  }

  function initForm() {
    const form = $('#contactForm'), ok = $('#formOk');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const subject = `${C.contact.form.subjectPrefix} ${d.get('name')}`;
      const body = `${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`;
      ok.textContent = C.contact.form.success;
      location.href = `mailto:${P.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  function initLenis() {
    if (!motionOK() || typeof Lenis === 'undefined') return null;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('skip-link')) return;
      const id = a.getAttribute('href').slice(1), t = id === 'top' ? 0 : document.getElementById(id);
      if (t === null) return; e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 });
    });
    return lenis;
  }

  /* ------------------------------------------------------------------------
     5. LOADER, INTRO ANIMATION & BOOT
     ------------------------------------------------------------------------ */
  function splitChars(node) {
    const text = node.textContent;
    node.textContent = '';
    [...text].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; node.appendChild(s); });
    return $$('.ch', node);
  }

  /** Split every text node inside `node` into per-character spans (keeps <b>/<em> structure). */
  function splitDeep(node) {
    const label = node.textContent;
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts = []; let t;
    while ((t = w.nextNode())) texts.push(t);
    texts.forEach((tn) => {
      const frag = document.createDocumentFragment();
      [...tn.nodeValue].forEach((c) => { const s = document.createElement('span'); s.className = 'tc'; s.setAttribute('aria-hidden', 'true'); s.textContent = c; frag.appendChild(s); });
      tn.parentNode.replaceChild(frag, tn);
    });
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = label;
    node.prepend(sr);
    return $$('.tc', node);
  }

  function runLoader() {
    return new Promise((resolve) => {
      const loader = $('#loader');
      if (reduceMQ.matches) { loader.remove(); root.classList.remove('is-loading'); return resolve(); }
      const num = $('#loaderNum'); let n = 3, finished = false;
      const tick = () => { num.textContent = n; num.classList.remove('is-tick'); void num.offsetWidth; num.classList.add('is-tick'); };
      tick();
      const timers = [setTimeout(() => { n = 2; tick(); }, 560), setTimeout(() => { n = 1; tick(); }, 1120), setTimeout(finish, 1680)];
      function finish() {
        if (finished) return; finished = true; timers.forEach(clearTimeout);
        loader.classList.add('is-out'); root.classList.remove('is-loading');
        setTimeout(() => loader.remove(), 900);
        resolve();
      }
      $('#loaderSkip').addEventListener('click', finish);
      addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); }, { once: true });
    });
  }

  function playIntro() {
    if (!motionOK()) return;
    const hero = $('#top');
    const chars = $$('[data-split]', hero).flatMap(splitChars);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__bar', { height: '46svh', duration: 1.6, ease: 'expo.inOut' }, 0)
      .from('.hero__media img', { scale: 1.2, filter: 'grayscale(0.45) contrast(1.12) brightness(0.78) blur(14px)', duration: 2.2 }, 0)
      .from(chars, { yPercent: 70, opacity: 0, rotateX: -40, duration: 1.2, stagger: 0.035 }, 0.5)
      .from('[data-hero]', { y: 30, opacity: 0, duration: 1.1, stagger: 0.14, clearProps: 'transform,opacity' }, 0.9)
      .from('.hero__hud', { opacity: 0, duration: 1 }, 1.2);
  }

  function initScrollAnimations() {
    if (!motionOK()) return;
    // hero parallax
    gsap.to('.hero__media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__inner', { yPercent: -8, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '#top', start: '40% top', end: 'bottom top', scrub: true } });
    // generic reveals
    $$('[data-reveal]').forEach((n) => gsap.from(n, { y: 44, opacity: 0, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: n, start: 'top 88%', once: true } }));
    // clapperboard claps shut
    const clap = $('#clap');
    if (clap) gsap.fromTo(clap, { rotate: -24 }, { rotate: -1, duration: 0.7, ease: 'bounce.out', clearProps: 'transform', scrollTrigger: { trigger: '#slate', start: 'top 82%', once: true } });
    // typewriter: the screenplay types itself
    $$('[data-type]').forEach((p) => {
      const chars = splitDeep(p);
      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, { opacity: 1, duration: 0.001, stagger: { amount: Math.min(2.4, chars.length * 0.012) }, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
    });
    // posters + teasers
    gsap.from('.poster', { x: 80, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#posters', start: 'top 85%', once: true } });
    $$('.tease__num').forEach((n) => gsap.fromTo(n, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: n.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    // film reel drifts a little faster while scrolling
    gsap.to('.reel__track', { x: '-=120', ease: 'none', scrollTrigger: { trigger: '#reel', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  async function boot() {
    renderAll();
    root.classList.add('is-loading');
    initTheme(); initMenu(); initModal(); initForm();
    initNavSpy(); initScrollUI();
    initTimeline(); initPosters(); initMixer(); initCounters();
    const loaded = runLoader();
    await loaded;
    state.lenis = initLenis();
    initScrollAnimations(); initFocusBox();
    playIntro();
    if (hasGSAP) { addEventListener('load', () => ScrollTrigger.refresh()); document.fonts?.ready.then(() => { ScrollTrigger.refresh(); onTimelineScroll(); }); }
    // re-run the "I AM WAR" emphasis over the freshly rendered page
    window.IAW?.boldify(document.body);
  }

  boot();
})();
