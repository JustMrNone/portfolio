/* ==========================================================================
   EX5 — JOURNEY 3D · main.js  (classic script, works on file://)
   The life timeline is a glowing double strand of film. Scrolling flies the camera along
   it; every milestone is a node, and arriving at one opens its panel.

   Structure:
     0. Setup & helpers
     1. Rendering (data -> HTML) for both the 3D runway and the 2D fallback
     2. 3D scene (Three.js): strand, nodes, particles, lens rings, bloom, camera rig
     3. Scroll mapping, tour controls, snapping, war-drum sound
     4. Reveals, counters, radar charts, carousel, tilt
     5. Filters, modal (portal reveal), menu, view toggle, form
     6. Loader, intro & boot
   All content comes from window.portfolio (shared/data.js).
   ========================================================================== */
;(() => {
'use strict';

/* ------------------------------------------------------------------------
   0. SETUP & HELPERS
   ------------------------------------------------------------------------ */
const D = window.portfolio;
if (!D) throw new Error('shared/data.js did not load.');
const { person: P, timeline: TIMELINE, projects: PROJECTS, skills: SKILLS, stats: STATS, future: FUTURE, copy: C } = D;
const J = C.journey;

const $  = (sel, r = document) => r.querySelector(sel);
const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const em = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const categoryLabel = (k) => C.timeline.categories[k] || k;
const CAT_HEX = { education: 0x52e5ff, project: 0x4dffc3, award: 0xff5fa8, work: 0xffcf5c, personal: 0x9b7bff, travel: 0x5aa2ff };

const root = document.documentElement;
const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const wideMQ = matchMedia('(min-width: 900px)');
const motionOK = () => hasGSAP && !reduceMQ.matches;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

const webglOK = (() => {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (_) { return false; }
})();

const state = {
  mode: '2d', filter: 'all', items: TIMELINE.slice(), lenis: null,
  arrival: -1, run: { top: 0, span: 1 }, scrollTimer: 0,
  modal: { id: null, open: false, closing: false, origin: [innerWidth / 2, innerHeight / 2] },
  gl: null, introK: 0, entered: false
};

/* ------------------------------------------------------------------------
   1. RENDERING
   ------------------------------------------------------------------------ */
const eyebrow = (idx, label) => `<p class="eyebrow">${idx} · ${esc(label)}</p>`;

function renderStatic() {
  document.title = `${P.name} — ${P.title}`;
  $('meta[name="description"]')?.setAttribute('content', P.bio);
  $('#skipLink').textContent = C.skipLink;
  $('#loaderName').textContent = P.name;
  $('#loaderLabel').textContent = J.loading;
  $('#loaderBtn').textContent = C.loader.skip;
  $('#brandText').textContent = P.name;
  $('#menuText').textContent = C.menu.open;
  $('#menuTitle').textContent = J.menuLabel;
  $('#soundLabel').textContent = J.soundOn;
  $('#menuFoot').textContent = `${P.name} · ${P.location}`;

  $('#navList').innerHTML = C.nav.map((n, i) => `<li><a href="#${n.id}" data-nav="${n.id}"><span>${pad(i + 1)}</span>${esc(n.label)}</a></li>`).join('');

  renderHero(); renderAbout(); renderProjects(); renderSkills(); renderFuture(); renderContact(); renderFooter();
}

function renderHero() {
  const [first, ...rest] = P.name.split(' ');
  $('#top').innerHTML = `
    <div class="hero__inner">
      <h1 class="hero__name" id="heroName"><span class="ln">${esc(first)}</span><span class="ln">${esc(rest.join(' '))}</span></h1>
      <div class="hero__row">
        <div data-hero>
          <p class="hero__title">${esc(P.title)}</p>
          <p class="hero__lede">${esc(P.bio)}</p>
        </div>
        <div class="hero__cta" data-hero>
          <a class="btn btn--solid" href="#timeline">${esc(C.hero.cta1)} <span aria-hidden="true">↓</span></a>
          <a class="btn" href="#contact">${esc(C.hero.cta2)}</a>
        </div>
      </div>
      <p class="scroll-hint" data-hero aria-hidden="true"><i></i>${esc(J.scrollHint)}</p>
    </div>`;
}

function renderAbout() {
  const A = C.about;
  $('#about').innerHTML = `
    <div class="wrap">
      <div class="sec-head" data-reveal>${eyebrow(A.index, A.label)}</div>
      <div class="about__grid">
        <div class="panel about__main" data-reveal>
          <h2 class="about__statement">${em(A.statement)}</h2>
          ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>
        <dl class="panel facts" data-reveal>
          <div><dt>${esc(A.facts.school)}</dt><dd>${esc(P.university)}</dd></div>
          <div><dt>${esc(A.facts.applying)}</dt><dd>${esc(P.degree)}</dd></div>
          <div><dt>${esc(A.facts.based)}</dt><dd>${esc(P.location)}</dd></div>
        </dl>
      </div>
      <dl class="orbs">
        ${STATS.map((s) => `<div class="orb" data-reveal><dt>${esc(s.label)}</dt><dd data-count="${esc(s.value)}">${esc(s.value)}</dd></div>`).join('')}
      </dl>
    </div>`;
}

/** Timeline section: either the 3D runway (sticky stage + HUD) or the 2D list. */
function renderTimelineSection() {
  const TL = C.timeline;
  const cats = Object.keys(TL.categories).filter((k) => TIMELINE.some((e) => e.category === k));
  const chip = (key, label, n) => `<button class="chip" type="button" data-cat-filter="${key}" aria-pressed="${key === state.filter}">${esc(label)}<span class="chip__n">${n}</span></button>`;
  const chips = `<div class="chips" role="group" aria-label="${esc(TL.filtersLabel)}">${chip('all', TL.all, TIMELINE.length)}${cats.map((k) => chip(k, TL.categories[k], TIMELINE.filter((e) => e.category === k).length)).join('')}</div>`;
  const sec = $('#timeline');
  sec.classList.toggle('runway', state.mode === '3d');
  sec.classList.toggle('timeline2d', state.mode === '2d');
  sec.style.height = '';

  if (state.mode === '3d') {
    sec.innerHTML = `
      <div class="stage">
        <div class="hud-top">
          <div class="hud-title">${eyebrow(TL.index, TL.label)}<h2 class="sec-title" id="tlTitle">${em(TL.title)}</h2><p class="hud-count" id="tlCount" aria-live="polite"></p></div>
          ${chips}
        </div>
        <div></div>
        <div class="hud-bottom">
          <article class="arrival" id="arrival" aria-live="polite"></article>
          <div class="tour" role="group" aria-label="${esc(J.tourLabel)}">
            <button class="tour__nav" id="tourPrev" type="button" aria-label="${esc(J.prev)}">←</button>
            <div class="tour__dots" id="tourDots"></div>
            <span class="tour__label" id="tourLabel" aria-hidden="true"></span>
            <button class="tour__nav" id="tourNext" type="button" aria-label="${esc(J.next)}">→</button>
          </div>
        </div>
      </div>`;
    renderTourDots();
  } else {
    sec.innerHTML = `
      <div class="wrap">
        <div class="sec-head">${eyebrow(TL.index, TL.label)}<h2 class="sec-title" id="tlTitle">${em(TL.title)}</h2></div>
        ${webglOK ? '' : `<p class="t2-note">${esc(J.webglMissing)}</p>`}
        <div class="t2-tools">${chips}<p class="hud-count" id="tlCount" aria-live="polite"></p></div>
        <ol class="t2-list" id="t2List" aria-label="${esc(TL.listLabel)}"></ol>
      </div>`;
    renderTwoDList();
  }
  updateCount();
}

function updateCount() {
  const el = $('#tlCount'); if (el) el.textContent = C.timeline.count.replace('{n}', state.items.length);
}

function renderTwoDList() {
  const TL = C.timeline;
  $('#t2List').innerHTML = state.items.map((e, i) => `
    <li class="t2-item" data-cat="${esc(e.category)}">
      <button class="t2-card" type="button" data-open="${esc(e.id)}" aria-haspopup="dialog">
        <img src="${esc(e.image)}" alt="${esc(e.alt)}" width="640" height="480" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
        <span class="t2-body">
          <span class="t2-meta"><span class="badge">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</span>
          <span class="t2-title">${esc(e.title)}</span>
          <span class="t2-sub">${esc(e.subtitle)}</span>
          <span class="t2-more">${esc(TL.open)} →</span>
        </span>
      </button>
    </li>`).join('');
}

function renderTourDots() {
  const dots = $('#tourDots'); if (!dots) return;
  dots.innerHTML = state.items.map((e, i) => `<button class="tour__dot" type="button" data-cat="${esc(e.category)}" data-stop="${i}" aria-label="${esc(e.year + ' — ' + e.title)}"></button>`).join('');
}

function renderProjects() {
  const PC = C.projects;
  $('#projects').innerHTML = `
    <div class="wrap">
      <div class="sec-head" data-reveal>${eyebrow(PC.index, PC.label)}<h2 class="sec-title" id="projTitle">${em(PC.title)}</h2></div>
    </div>
    <div class="wrap">
      <ul class="carousel" id="carousel" tabindex="0" role="region" aria-label="${esc(PC.label)}">
        ${PROJECTS.map((p, i) => `
          <li class="proj" data-tilt>
            <div class="proj__media"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="1200" height="825" loading="lazy" decoding="async" draggable="false"></div>
            <div class="proj__body">
              <div class="proj__top"><span class="proj__idx">${pad(i + 1)} / ${pad(PROJECTS.length)}</span><span class="proj__year">${p.year}</span></div>
              <h3 class="proj__title"><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}<span class="sr-only"> (${esc(PC.visit)})</span></a></h3>
              <p class="proj__desc">${esc(p.description)}</p>
              <ul class="proj__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
              ${p.repo ? `<a class="proj__repo" href="${esc(p.repo)}" target="_blank" rel="noopener">${esc(PC.repo)} ↗<span class="sr-only"> — ${esc(p.title)} (${esc(PC.visit)})</span></a>` : ''}
            </div>
          </li>`).join('')}
      </ul>
      <p class="carousel__hint" aria-hidden="true">← →</p>
    </div>`;
}

function radarSVG(list) {
  const n = list.length, R = 68, cx = 100, cy = 100;
  const pt = (i, r) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = (r) => Array.from({ length: n }, (_, i) => pt(i, r).map((v) => v.toFixed(1)).join(',')).join(' ');
  const shape = list.map((s, i) => pt(i, (R * s.level) / 100).map((v) => v.toFixed(1)).join(',')).join(' ');
  const labels = list.map((s, i) => { const [x, y] = pt(i, R + 16); const anchor = x < cx - 6 ? 'end' : x > cx + 6 ? 'start' : 'middle'; return `<text class="radar__lbl" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle">${esc(s.name.split(/[ (&]/)[0])}</text>`; }).join('');
  return `<svg class="radar" viewBox="-14 -6 228 212" aria-hidden="true" focusable="false">
    ${[0.25, 0.5, 0.75, 1].map((f) => `<polygon class="radar__grid" points="${poly(R * f)}"/>`).join('')}
    ${list.map((_, i) => `<line class="radar__axis" x1="${cx}" y1="${cy}" x2="${pt(i, R)[0].toFixed(1)}" y2="${pt(i, R)[1].toFixed(1)}"/>`).join('')}
    <polygon class="radar__shape" points="${shape}"/>
    ${list.map((s, i) => `<circle class="radar__dot" cx="${pt(i, (R * s.level) / 100)[0].toFixed(1)}" cy="${pt(i, (R * s.level) / 100)[1].toFixed(1)}" r="3.2"/>`).join('')}
    ${labels}
  </svg>`;
}

function renderSkills() {
  const SC = C.skills;
  const groups = Object.keys(SC.groups).filter((g) => SKILLS.some((s) => s.group === g));
  $('#skills').innerHTML = `
    <div class="wrap">
      <div class="sec-head" data-reveal>${eyebrow(SC.index, SC.label)}<h2 class="sec-title" id="skillsTitle">${em(SC.title)}</h2></div>
      <div class="radars">
        ${groups.map((g) => {
          const list = SKILLS.filter((s) => s.group === g);
          return `<div class="panel radar-card" data-reveal>
            <h3>${esc(SC.groups[g])}</h3>
            ${radarSVG(list)}
            <ul class="legend">${list.map((s) => `<li data-level="${s.level}"><span><span>${esc(s.name)}</span><span class="v">${s.level}</span></span><span class="bar" role="meter" aria-label="${esc(s.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.level}"><i style="transform:scaleX(${s.level / 100})"></i></span></li>`).join('')}</ul>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function renderFuture() {
  const FC = C.future;
  $('#future').innerHTML = `
    <div class="wrap">
      <div class="sec-head" data-reveal>${eyebrow(FC.index, FC.label)}<h2 class="sec-title" id="futureTitle">${em(FC.title)}</h2></div>
      <ol class="portals">
        ${FUTURE.map((g, i) => `
          <li class="portal" data-tilt data-reveal>
            <span class="portal__n" aria-hidden="true">${pad(i + 1)}</span>
            <h3 class="portal__t">${esc(g.goal)}</h3>
            <p class="portal__d">${esc(g.description)}</p>
          </li>`).join('')}
      </ol>
      <p class="future__closing" data-reveal>${esc(FC.closing)}</p>
    </div>`;
}

function renderContact() {
  const CC = C.contact, F = CC.form;
  $('#contact').innerHTML = `
    <div class="wrap">
      <div class="panel contact__panel" data-reveal>
        <div class="contact__main">
          ${eyebrow(CC.index, CC.label)}
          <h2 class="sec-title" id="contactTitle">${em(CC.title)}</h2>
          <p class="contact__intro">${esc(CC.intro)}</p>
          <span class="contact__label">${esc(CC.emailLabel)}</span>
          <a class="contact__email" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
          <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span class="sr-only"> (${esc(C.projects.visit)})</span></a>`).join('')}</div>
        </div>
        <form class="form" id="contactForm">
          <div class="field"><label for="cf-name">${esc(F.name)}</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
          <div class="field"><label for="cf-email">${esc(F.email)}</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="cf-msg">${esc(F.message)}</label><textarea id="cf-msg" name="message" rows="5" required></textarea></div>
          <button class="btn btn--solid" type="submit">${esc(F.send)} →</button>
          <p class="form__status" id="formStatus" role="status"></p>
        </form>
      </div>
    </div>`;
}

function renderFooter() {
  $('#footer').innerHTML = `<span>© ${new Date().getFullYear()} ${esc(P.name)}. ${esc(C.footer.rights)}</span><span>${esc(C.footer.note)}</span><a href="#top">${esc(C.footer.top)} ↑</a>`;
}

/* ------------------------------------------------------------------------
   2. 3D SCENE
   ------------------------------------------------------------------------ */
let sceneBuild = null;
const ensureScene = (onProgress) => (sceneBuild ||= buildScene(onProgress));

async function buildScene(onProgress) {
  const [THREE, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three'),
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'),
    import('three/addons/postprocessing/OutputPass.js')
  ]);
  onProgress(0.35);

  const canvas = $('#gl');
  const mobile = !wideMQ.matches || !finePointer.matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x02040a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02040a, 0.017);
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.3, 500);
  scene.add(camera);
  scene.add(new THREE.AmbientLight(0x6f86c4, 0.9));
  const camLight = new THREE.PointLight(0x7fffe9, 70, 80, 2); camera.add(camLight);
  const keyLight = new THREE.DirectionalLight(0xff8fb0, 0.7); keyLight.position.set(-4, 6, 3); scene.add(keyLight);

  /* ---- Axis curve & Frenet frames (the helix winds around this) ---- */
  const LEN = 640, K = 16, pts = [];
  for (let k = 0; k <= K; k++) { const s = k / K; pts.push(new THREE.Vector3(Math.sin(s * 7) * 16, Math.cos(s * 5) * 10, -s * LEN)); }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const SEG = 800, frames = curve.computeFrenetFrames(SEG, false);
  const HR = 4.4, TURNS = 34;
  const tmpV = new THREE.Vector3();
  const helixPoint = (u, strand, out = new THREE.Vector3(), radius = HR) => {
    const i = clamp(Math.round(u * SEG), 0, SEG), N = frames.normals[i], B = frames.binormals[i];
    const th = u * TURNS * Math.PI * 2 + (strand ? Math.PI : 0);
    curve.getPointAt(clamp(u, 0, 1), tmpV);
    return out.set(tmpV.x + radius * (Math.cos(th) * N.x + Math.sin(th) * B.x), tmpV.y + radius * (Math.cos(th) * N.y + Math.sin(th) * B.y), tmpV.z + radius * (Math.cos(th) * N.z + Math.sin(th) * B.z));
  };

  /* ---- Twin film strands + frame rungs (instanced) ---- */
  const S = mobile ? 380 : 560;
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  const beadMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 8), beadMat, S * 2);
  const rungs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.32, toneMapped: false }), S);
  const A = new THREE.Vector3(), B_ = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  for (let i = 0; i < S; i++) {
    const u = 0.03 + 0.97 * (i / (S - 1));
    helixPoint(u, 0, A); helixPoint(u, 1, B_);
    dummy.position.copy(A); dummy.scale.setScalar(1); dummy.updateMatrix(); beads.setMatrixAt(i * 2, dummy.matrix);
    col.setHSL(lerp(0.5, 0.78, u), 0.95, 0.55); beads.setColorAt(i * 2, col);
    dummy.position.copy(B_); dummy.updateMatrix(); beads.setMatrixAt(i * 2 + 1, dummy.matrix);
    col.setHSL(lerp(0.93, 0.06, u), 0.95, 0.58); beads.setColorAt(i * 2 + 1, col);
    if (i % 2 === 0 && i + 1 < rungs.count) {
      // two short halves leave a clear gap along the axis, so the camera never flies through a bar
      const dir = tmpV.copy(B_).sub(A), full = dir.length();
      dir.normalize(); q.setFromUnitVectors(up, dir); dummy.quaternion.copy(q);
      dummy.scale.set(1, full * 0.26, 1);
      dummy.position.copy(A).addScaledVector(dir, full * 0.13); dummy.updateMatrix(); rungs.setMatrixAt(i, dummy.matrix);
      dummy.position.copy(B_).addScaledVector(dir, -full * 0.13); dummy.updateMatrix(); rungs.setMatrixAt(i + 1, dummy.matrix);
      col.setHSL(lerp(0.55, 0.85, u), 0.9, 0.6); rungs.setColorAt(i, col); rungs.setColorAt(i + 1, col);
      dummy.quaternion.identity();
    }
  }
  [beads, rungs].forEach((o) => { o.frustumCulled = false; });
  scene.add(beads, rungs);
  onProgress(0.42);

  /* ---- Translucent vessel tunnel ---- */
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, mobile ? 160 : 260, 22, 14, false), new THREE.MeshBasicMaterial({ color: 0x0f5576, wireframe: true, transparent: true, opacity: 0.14, side: THREE.BackSide }));
  tube.frustumCulled = false;
  scene.add(tube);

  /* ---- Soft round sprite (halos + dust, so points are not square) ---- */
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();

  /* ---- Dust (two layers) ---- */
  const makeDust = (count, size, opacity, rMin, rMax) => {
    const pos = new Float32Array(count * 3), cols = new Float32Array(count * 3), c = new THREE.Color(), v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      curve.getPointAt(Math.random(), v);
      const r = lerp(rMin, rMax, Math.random()), a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      pos.set([v.x + r * Math.sin(b) * Math.cos(a), v.y + r * Math.sin(b) * Math.sin(a), v.z + r * Math.cos(b)], i * 3);
      c.setHSL(lerp(0.48, 0.95, Math.random()), 0.9, 0.7); cols.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const pts_ = new THREE.Points(g, new THREE.PointsMaterial({ size, map: haloTex, vertexColors: true, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    pts_.frustumCulled = false;
    scene.add(pts_); return pts_;
  };
  const dustA = makeDust(mobile ? 900 : 2400, 0.16, 0.85, 6.5, 46);
  const dustB = makeDust(mobile ? 120 : 320, 0.7, 0.28, 8, 40);

  /* ---- Floating tungsten lens rings ---- */
  const CELLS = mobile ? 34 : 84;
  const cellMat = new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0x4a2a05, emissiveIntensity: 0.9, roughness: 0.45, metalness: 0.1 });
  const cellGeo = new THREE.TorusGeometry(0.9, 0.42, 12, 26); cellGeo.scale(1, 1, 0.55);
  const cells = new THREE.InstancedMesh(cellGeo, cellMat, CELLS);
  const cellData = Array.from({ length: CELLS }, () => {
    const base = curve.getPointAt(Math.random()), r = lerp(9, 32, Math.random()), a = Math.random() * Math.PI * 2;
    return { base, off: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 20), rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6), spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.8), s: lerp(0.6, 1.4, Math.random()), ph: Math.random() * 6.28 };
  });
  cells.frustumCulled = false;
  cells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(cells);

  /* ---- Milestone nodes ---- */
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_u, loaded, total) => onProgress(0.5 + 0.5 * (loaded / Math.max(1, total)));
  const texLoader = new THREE.TextureLoader(manager); texLoader.setCrossOrigin('anonymous');
  const aniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

  const n = TIMELINE.length;
  const nodes = TIMELINE.map((e, i) => {
    const u = 0.075 + 0.85 * (i / (n - 1));
    const colorHex = CAT_HEX[e.category];
    const pos = helixPoint(u, i % 2, new THREE.Vector3());
    const axis = curve.getPointAt(u);
    const radial = pos.clone().sub(axis).normalize();

    const group = new THREE.Group(); group.position.copy(pos); scene.add(group);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), new THREE.MeshBasicMaterial({ color: colorHex, toneMapped: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: colorHex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    halo.scale.setScalar(3.6);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.05, 64), new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    group.add(core, halo, ring);

    // Floating photograph, placed outside the helix and always facing the camera
    const photo = new THREE.Group(); photo.position.copy(pos).addScaledVector(radial, 3.4); scene.add(photo);
    const frameMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.4), new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide }));
    const imgMat = new THREE.MeshBasicMaterial({ color: 0x16243a, transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide });
    const imgMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.1), imgMat); imgMesh.position.z = 0.03;
    photo.add(frameMesh, imgMesh);
    texLoader.load(e.image, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
      const ar = tex.image.width / tex.image.height, h = 3.1, w = clamp(h * ar, 2.4, 5);
      imgMesh.geometry.dispose(); imgMesh.geometry = new THREE.PlaneGeometry(w, h);
      frameMesh.geometry.dispose(); frameMesh.geometry = new THREE.PlaneGeometry(w + 0.3, h + 0.3);
      imgMat.map = tex; imgMat.color.set(0xffffff); imgMat.needsUpdate = true;
    }, undefined, () => { /* keep the coloured placeholder if an image fails */ });

    return { e, i, u, pos, axis, group, core, halo, ring, photo, frameMesh, imgMat, k: 1, active: true, w: 0, base: new THREE.Color(colorHex), tag: null, ph: i * 0.9 };
  });

  /* ---- DOM year tags that follow the nodes ---- */
  const tagsEl = $('#nodeTags');
  tagsEl.innerHTML = nodes.map((nd) => `<div class="node-tag" style="--tag:#${CAT_HEX[nd.e.category].toString(16).padStart(6, '0')}">${nd.e.year}<small>${esc(nd.e.title)}</small></div>`).join('');
  nodes.forEach((nd, i) => { nd.tag = tagsEl.children[i]; });

  /* ---- Post-processing ---- */
  let composer = null, bloom = null;
  try {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
    composer.setSize(innerWidth, innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(mobile ? innerWidth / 2 : innerWidth, mobile ? innerHeight / 2 : innerHeight), 0.55, 0.45, 0.4);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch (_) { composer = null; }

  const gl = {
    THREE, renderer, scene, camera, curve, frames, nodes, composer, bloom, cells, cellData, dustA, dustB, beads, mobile,
    tCur: 0, tTarget: 0, running: false, last: 0, mouse: { x: 0, y: 0, sx: 0, sy: 0 },
    raycaster: new THREE.Raycaster(), hover: null, ready: false,
    tmp: { right: new THREE.Vector3(), target: new THREE.Vector3(), a: new THREE.Vector3(), off: new THREE.Vector3(), lookOff: new THREE.Vector3(), v: new THREE.Vector3(), gray: new THREE.Color(0x66707c), dm: new THREE.Object3D() }
  };
  state.gl = gl;

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    composer?.setSize(innerWidth, innerHeight);
    layoutRunway();
  };
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { gl.mouse.x = e.clientX / innerWidth - 0.5; gl.mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) gl.running = false; else if (state.mode === '3d') startRender(); });

  // Hover + click on nodes
  const ndc = new THREE.Vector2();
  const pick = (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    gl.raycaster.setFromCamera(ndc, camera);
    const hits = gl.raycaster.intersectObjects(nodes.filter((nd) => nd.active).map((nd) => nd.core), false);
    return hits.length ? nodes.find((nd) => nd.core === hits[0].object) : null;
  };
  canvas.addEventListener('pointermove', (e) => { if (state.mode !== '3d') return; const h = pick(e); canvas.style.cursor = h ? 'pointer' : ''; });
  canvas.addEventListener('click', (e) => { if (state.mode !== '3d') return; const h = pick(e); if (h) scrollToStop(state.items.indexOf(h.e)); });

  onProgress(0.5);
  gl.manager = manager;
  gl.ready = true;
  return gl;
}

/* Slow drum-beat envelope (72 bpm) used for the bloom pulse and the optional sound */
const pulse = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const heartbeat = (t) => { const ph = (t * 1.2) % 1; return pulse(ph, 0.04, 0.05) + 0.6 * pulse(ph, 0.22, 0.06); };

function startRender() {
  const gl = state.gl; if (!gl || gl.running) return;
  gl.running = true; gl.last = performance.now();
  const loop = (now) => {
    if (!gl.running || state.mode !== '3d') { gl.running = false; return; }
    requestAnimationFrame(loop);
    const dt = Math.min((now - gl.last) / 1000, 0.05); gl.last = now;
    updateScene(now / 1000, dt);
    (gl.composer || { render: () => gl.renderer.render(gl.scene, gl.camera) }).render(dt);
  };
  requestAnimationFrame(loop);
}

/** One frame: scroll -> camera t, camera rig, node animation, ambient motion. */
function updateScene(time, dt) {
  const gl = state.gl, { THREE, camera, curve, nodes } = gl;
  const beat = heartbeat(time);

  // Scroll progress -> target t along the helix (smoothstep between stops so the camera lingers at nodes)
  const p = clamp((scrollY - state.run.top) / state.run.span, 0, 1);
  const actives = nodes.filter((nd) => nd.active);
  const m = actives.length;
  let tTarget = 0;
  if (scrollY >= state.run.top && m) {
    const wp = [0, ...actives.map((nd) => nd.u), 1];
    const slot = p * (m + 1), j = Math.min(Math.floor(slot), m), f = slot - j;
    tTarget = lerp(wp[j], wp[Math.min(j + 1, m + 1)], smooth(f));
  } else if (scrollY < state.run.top) tTarget = 0;
  gl.tCur += (tTarget - gl.tCur) * (1 - Math.exp(-dt * 4.2));
  const t = clamp(gl.tCur, 0, 1);

  // Arrival weights
  let best = -1, bestW = 0;
  nodes.forEach((nd, idx) => {
    const wgt = nd.active ? smooth(clamp(1 - Math.abs(t - nd.u) / 0.034, 0, 1)) : 0;
    nd.w += (wgt - nd.w) * (1 - Math.exp(-dt * 8));
    if (nd.w > bestW) { bestW = nd.w; best = idx; }
  });

  // Camera rig: ride the axis, lean toward the node we are arriving at, look ahead
  const pos = curve.getPointAt(clamp(t, 0, 1));
  const look = curve.getPointAt(clamp(t + 0.028, 0, 1));
  const { a: tA, off, lookOff, v: tV, gray, dm } = gl.tmp;
  off.set(0, 0, 0); lookOff.set(0, 0, 0);
  nodes.forEach((nd) => { if (nd.w > 0.001) { off.addScaledVector(tA.copy(nd.pos).sub(pos), nd.w * 0.22); lookOff.addScaledVector(tA.copy(nd.pos).sub(look), nd.w * 0.7); } });
  const intro = smooth(clamp(state.introK, 0, 1));
  const heroK = 1 - smooth(clamp(t / 0.05, 0, 1));                       // 1 at the start, 0 once the flight begins
  const fi = clamp(Math.round(clamp(t, 0, 1) * 800), 0, 800);
  const nrm = gl.frames.normals[fi], bnm = gl.frames.binormals[fi];
  off.addScaledVector(nrm, 7.5 * heroK).addScaledVector(bnm, 3 * heroK);
  lookOff.addScaledVector(nrm, -1.5 * heroK);
  const back = curve.getTangentAt(clamp(t, 0, 1)).multiplyScalar(-(1 - intro) * 70);
  camera.position.copy(pos).add(off).add(back);
  camera.lookAt(look.add(lookOff));
  gl.mouse.sx += (gl.mouse.x - gl.mouse.sx) * 0.06; gl.mouse.sy += (gl.mouse.y - gl.mouse.sy) * 0.06;
  if (finePointer.matches) { camera.rotateY(-gl.mouse.sx * 0.1); camera.rotateX(-gl.mouse.sy * 0.07); }
  camera.rotateZ(Math.sin(t * 60) * 0.04 + (1 - intro) * 0.5);
  const fov = lerp(88, 62, intro) + bestW * -6; if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

  // Bloom breathes with the drum
  if (gl.bloom) gl.bloom.strength = 0.5 + beat * 0.2 + bestW * 0.08;

  // Nodes
  const tagsOn = scrollY > state.run.top - innerHeight * 0.6 && scrollY < state.run.top + state.run.span + innerHeight * 0.4;
  const camPos = camera.position;
  const camRight = gl.tmp.right.setFromMatrixColumn(camera.matrixWorld, 0);
  nodes.forEach((nd) => {
    nd.k += ((nd.active ? 1 : 0.4) - nd.k) * (1 - Math.exp(-dt * 6));
    const s = nd.k * (1 + nd.w * 0.2 + beat * 0.05);
    nd.group.scale.setScalar(s);
    nd.ring.lookAt(camPos);
    nd.ring.scale.setScalar(1 + 0.1 * Math.sin(time * 3 + nd.ph) + nd.w * 0.5 + beat * 0.12);
    nd.ring.material.opacity = (0.3 + nd.w * 0.4) * nd.k;
    // The halo fades as we get close so it never whites out the screen
    nd.halo.material.opacity = (0.28 + beat * 0.12) * (1 - nd.w * 0.85) * (nd.active ? 1 : 0.3);
    nd.core.material.color.copy(nd.base).lerp(gray, 1 - nd.k > 0.01 ? (1 - nd.k) * 1.4 : 0);

    // Projection (used for the year tag and to pick which side the photo floats on)
    const v = tV.copy(nd.group.position).project(camera), dist = camPos.distanceTo(nd.group.position);

    // Photo: floats beside its node on the side nearer the screen centre, always facing the camera
    nd.photoSide = nd.photoSide ?? 1;
    nd.photoSide += ((v.x > 0 ? -1 : 1) - nd.photoSide) * (1 - Math.exp(-dt * 2.5));
    gl.tmp.target.copy(nd.pos).addScaledVector(camRight, 3.6 * nd.photoSide);
    nd.photo.position.lerp(gl.tmp.target, 1 - Math.exp(-dt * 5));
    nd.photo.lookAt(camPos);
    const vis = nd.active ? clamp(0.08 + nd.w * 1.1, 0, 1) : 0;
    nd.imgMat.opacity += (vis - nd.imgMat.opacity) * 0.12;
    nd.frameMesh.material.opacity = nd.imgMat.opacity * 0.9;
    nd.photo.visible = nd.imgMat.opacity > 0.01;
    nd.photo.scale.setScalar(0.42 + nd.w * 0.16);

    // Year tag
    const on = tagsOn && nd.active && v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15 && dist < 75 && nd.w < 0.55;
    const op = on ? clamp(1 - dist / 75, 0, 1) * 1.1 : 0;
    nd.tag.style.opacity = op.toFixed(2);
    if (on) nd.tag.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px, 0) translate(-50%, -170%)`;
  });

  // Ambient motion
  gl.dustA.rotation.z = time * 0.01; gl.dustB.rotation.z = -time * 0.015;
  gl.cellData.forEach((c, i) => {
    dm.position.set(c.base.x + c.off.x + Math.sin(time * 0.3 + c.ph) * 1.5, c.base.y + c.off.y + Math.cos(time * 0.25 + c.ph) * 1.5, c.base.z + c.off.z);
    dm.rotation.set(c.rot.x + time * c.spin.x, c.rot.y + time * c.spin.y, c.rot.z + time * c.spin.z);
    dm.scale.setScalar(c.s * (1 + beat * 0.05));
    dm.updateMatrix(); gl.cells.setMatrixAt(i, dm.matrix);
  });
  gl.cells.instanceMatrix.needsUpdate = true;

  // Panel / tour sync (only touches the DOM when the stop changes)
  const arrived = bestW > 0.55 ? state.items.findIndex((e) => e.id === nodes[best].e.id) : -1;
  if (arrived !== state.arrival) setArrival(arrived);
  const slotNow = m ? Math.round(clamp(p, 0, 1) * (m + 1)) : 0;
  const lbl = $('#tourLabel');
  if (lbl && scrollY >= state.run.top - 2) {
    const idx = clamp(arrived >= 0 ? arrived + 1 : slotNow, 1, m);
    const txt = J.stopOf.replace('{n}', idx).replace('{total}', m);
    if (lbl.textContent !== txt) lbl.textContent = txt;
  }
}

/* ------------------------------------------------------------------------
   3. SCROLL MAPPING, TOUR, SNAP, SOUND
   ------------------------------------------------------------------------ */
function layoutRunway() {
  const sec = $('#timeline');
  if (state.mode !== '3d') return;
  const m = Math.max(1, state.items.length);
  const perStop = wideMQ.matches ? 52 : 44;
  sec.style.height = `calc(${(m + 1) * perStop}vh + 100svh)`;
  const rect = sec.getBoundingClientRect();
  state.run.top = rect.top + scrollY;
  state.run.span = Math.max(1, sec.offsetHeight - innerHeight);
}

function scrollToStop(i) {
  const m = state.items.length;
  if (state.mode !== '3d' || !m) return;
  const j = clamp(i + 1, 1, m);
  scrollToY(state.run.top + (j / (m + 1)) * state.run.span);
}

function scrollToY(y) {
  if (state.lenis) state.lenis.scrollTo(y, { duration: 1.4, force: true });
  else scrollTo({ top: y, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
}

function currentStop() {
  const m = state.items.length;
  const p = clamp((scrollY - state.run.top) / state.run.span, 0, 1);
  return clamp(Math.round(p * (m + 1)), 0, m + 1);   // 0 = before first, m+1 = after last
}

function initTour() {
  const sec = $('#timeline');
  sec.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-stop]');
    if (dot) scrollToStop(Number(dot.dataset.stop));
    if (e.target.closest('#tourPrev')) { const j = currentStop(); j <= 1 ? scrollToY(state.run.top - innerHeight * 0.4) : scrollToStop(j - 2); }
    if (e.target.closest('#tourNext')) { const j = currentStop(), m = state.items.length; j >= m ? scrollToY(state.run.top + state.run.span + innerHeight * 0.9) : scrollToStop(j); }
  });
  // Snap to the nearest stop shortly after scrolling stops (only if already close)
  addEventListener('scroll', () => {
    if (state.mode !== '3d') return;
    clearTimeout(state.scrollTimer);
    state.scrollTimer = setTimeout(() => {
      if (state.modal.open || root.classList.contains('menu-open')) return;
      const m = state.items.length;
      if (!m || scrollY < state.run.top + 4 || scrollY > state.run.top + state.run.span - 4) return;
      const slotF = ((scrollY - state.run.top) / state.run.span) * (m + 1), j = clamp(Math.round(slotF), 1, m);
      if (Math.abs(slotF - j) > 0.012 && Math.abs(slotF - j) < 0.4) scrollToStop(j - 1);
    }, 650);
  }, { passive: true });
}

/** Show / hide the arrival panel for a stop (index into state.items, -1 = none). */
function setArrival(i) {
  state.arrival = i;
  $$('.tour__dot').forEach((d, n) => n === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'));
  const panel = $('#arrival'); if (!panel) return;
  if (i < 0) {
    if (motionOK()) gsap.to(panel, { opacity: 0, y: 24, scale: 0.97, duration: 0.4, ease: 'power2.in', onComplete: () => { if (state.arrival < 0) { panel.classList.remove('is-on'); } } });
    else { panel.style.opacity = 0; panel.classList.remove('is-on'); }
    return;
  }
  const e = state.items[i]; if (!e) return;
  const TL = C.timeline;
  panel.dataset.cat = e.category;
  panel.innerHTML = `
    <div class="arrival__meta"><span class="badge">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</div>
    <h3 class="arrival__title">${esc(e.title)}</h3>
    <p class="arrival__sub">${esc(e.subtitle)}</p>
    <p class="arrival__desc">${esc(e.description)}</p>
    <div class="arrival__row">
      <ul class="arrival__tags">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <button class="btn btn--solid" type="button" data-open="${esc(e.id)}" aria-haspopup="dialog">${esc(J.detailsOpen)} →</button>
    </div>`;
  panel.classList.add('is-on');
  if (motionOK()) {
    gsap.fromTo(panel, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out', overwrite: true });
    gsap.from($$('.arrival > *', panel), { y: 14, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05, delay: 0.08, clearProps: 'transform,opacity' });
  } else panel.style.opacity = 1;
}

/** Optional synthesised war drum (Web Audio; off until the visitor turns it on). */
const sound = (() => {
  let ctx = null, timer = 0, on = false;
  const thump = (when, freq, gainPeak) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq, when); o.frequency.exponentialRampToValueAtTime(freq * 0.55, when + 0.18);
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(gainPeak, when + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    o.connect(g).connect(ctx.destination); o.start(when); o.stop(when + 0.25);
  };
  const beat = () => { const t = ctx.currentTime; thump(t, 58, 0.55); thump(t + 0.22, 46, 0.3); };
  return {
    toggle() {
      on = !on;
      if (on) { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); beat(); timer = setInterval(beat, 833); }
      else clearInterval(timer);
      $('#soundBtn').setAttribute('aria-pressed', String(on));
      $('#soundLabel').textContent = on ? J.soundOff : J.soundOn;
    }
  };
})();

/* ------------------------------------------------------------------------
   4. SMOOTH SCROLL, NAV, REVEALS, CHARTS, TILT
   ------------------------------------------------------------------------ */
function initLenis() {
  if (!motionOK() || typeof Lenis === 'undefined') return null;
  const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initProgressAndChapters() {
  const thumb = $('#edgeThumb'), pct = $('#edgePct'), veil = $('#veil'), chapter = $('#chapter');
  let ticking = false;
  const update = () => {
    const max = root.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    const h = thumb.parentElement.clientHeight;
    thumb.style.transform = `translateY(${p * (h - 8)}px)`;
    pct.textContent = pad(Math.round(p * 100), 3).padStart(3, '0');
    const inRun = state.mode === '3d' && scrollY > state.run.top - innerHeight * 0.5 && scrollY < state.run.top + state.run.span + innerHeight * 0.5;
    veil.classList.toggle('is-clear', inRun);
    veil.classList.toggle('is-soft', !inRun && scrollY < innerHeight * 0.6);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Active chapter (menu highlight + bottom-left label)
  const links = $$('[data-nav]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id, idx = C.nav.findIndex((n) => n.id === id);
      links.forEach((a) => { const on = a.dataset.nav === id; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
      chapter.innerHTML = idx < 0 ? `<b>00</b> · ${esc(J.chapterHome)}` : `<b>${pad(idx + 1)}</b> · ${esc(C.nav[idx].label)}`;
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['top', ...C.nav.map((n) => n.id)].forEach((id) => { const el = $('#' + id); if (el) io.observe(el); });
}

function scrollToTarget(target) {
  if (state.lenis) state.lenis.scrollTo(target, { duration: 1.8, force: true });
  else if (typeof target === 'number') scrollTo({ top: target, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth' });
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href'), el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(id === '#top' ? 0 : state.mode === '3d' && id === '#timeline' ? state.run.top : el);
    history.replaceState(null, '', id);
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });
}

function initReveals() {
  if (!motionOK()) return;
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // Numbers
  $$('[data-count]').forEach((el) => {
    const m = String(el.dataset.count).match(/^(\d+)(.*)$/); if (!m) return;
    const target = Number(m[1]), suffix = m[2], o = { v: 0 };
    el.textContent = '0' + suffix;
    ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix; } }) });
  });
  // Radar charts grow from the centre; legend bars fill
  $$('.radar-card').forEach((card) => {
    const shape = $('.radar__shape', card), dots = $$('.radar__dot', card), bars = $$('.legend .bar i', card);
    gsap.set(shape, { scale: 0, svgOrigin: '100 100' }); gsap.set(dots, { opacity: 0 }); gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({ trigger: card, start: 'top 80%', once: true, onEnter: () => {
      gsap.to(shape, { scale: 1, svgOrigin: '100 100', duration: 1.6, ease: 'elastic.out(1,0.6)' });
      gsap.to(dots, { opacity: 1, duration: 0.6, delay: 0.5, stagger: 0.08 });
      bars.forEach((b, i) => gsap.to(b, { scaleX: Number(b.closest('li').dataset.level) / 100, duration: 1.4, ease: 'expo.out', delay: 0.2 + i * 0.1 }));
    } });
  });
  // Hero scroll-away
  gsap.to('.hero__inner', { y: -80, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true } });
}

function initTiltAndCarousel() {
  if (finePointer.matches && motionOK()) {
    $$('[data-tilt]').forEach((el) => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 12); rx(-(py - 0.5) * 12);
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
  // Mouse drag-to-scroll for the projects carousel (touch scrolls natively)
  const car = $('#carousel'); if (!car) return;
  let down = false, sx = 0, sl = 0, moved = false;
  car.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = car.scrollLeft; });
  addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; car.style.scrollSnapType = 'none'; car.scrollLeft = sl - dx; } });
  addEventListener('pointerup', () => { if (!down) return; down = false; car.style.scrollSnapType = ''; });
  car.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}

/* ------------------------------------------------------------------------
   5. FILTERS, MODAL, MENU, VIEW TOGGLE, FORM
   ------------------------------------------------------------------------ */
function initFilters() {
  $('#timeline').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-cat-filter]');
    if (chip) setFilter(chip.dataset.catFilter);
  });
}

function applyFilter() {
  state.items = TIMELINE.filter((e) => state.filter === 'all' || e.category === state.filter);
  $$('[data-cat-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.catFilter === state.filter)));
  updateCount();
  if (state.mode === '3d' && state.gl) {
    state.gl.nodes.forEach((nd) => { nd.active = state.filter === 'all' || nd.e.category === state.filter; });
    state.arrival = -2;                 // force the panel to refresh
    renderTourDots();
    layoutRunway();
    setArrival(-1);
    scrollToY(state.run.top);           // restart the flight from the first stop
    if (hasGSAP) ScrollTrigger.refresh();
  } else if (state.mode === '2d') {
    renderTwoDList();
    if (motionOK()) gsap.from('.t2-item', { y: 30, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity' });
  }
}

function setFilter(cat) {
  if (cat === state.filter) return;
  state.filter = cat;
  if (state.mode === '2d' && motionOK()) gsap.to('.t2-item', { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.02, onComplete: applyFilter });
  else applyFilter();
}

/* ---- Detail modal: circular "portal" reveal from where you clicked ---- */
function initModal() {
  const dlg = $('#modal'), M = C.modal, TL = C.timeline;
  addEventListener('pointerdown', (e) => { state.modal.origin = [e.clientX, e.clientY]; }, true);

  const fill = (e, index, total) => {
    dlg.dataset.cat = e.category;
    dlg.innerHTML = `
      <div class="modal__inner" data-lenis-prevent>
        <button class="modal__close" type="button" data-close>${esc(M.close)} ✕</button>
        <div class="modal__media"><img src="${esc(e.image)}" alt="${esc(e.alt)}" width="1200" height="1500"></div>
        <div class="modal__body">
          <p class="modal__meta"><span class="badge">${esc(categoryLabel(e.category))}</span><span>${esc(e.date)}</span>${e.age != null ? `<span>${esc(TL.age)} ${e.age}</span>` : ''}</p>
          <h2 class="modal__title" id="modalTitle">${esc(e.title)}</h2>
          <p class="modal__sub">${esc(e.subtitle)}</p>
          <p class="modal__desc">${esc(e.description)}</p>
          <ul class="modal__tags" aria-label="${esc(M.tags)}">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${e.link ? `<a class="btn btn--solid modal__link" href="${esc(e.link)}" target="_blank" rel="noopener">${esc(M.visit)} ↗<span class="sr-only"> (${esc(C.projects.visit)})</span></a>` : ''}
          <nav class="modal__nav" aria-label="Timeline">
            <button class="modal__step" type="button" data-step="-1">← ${esc(M.prev)}</button>
            <span class="modal__count">${pad(index + 1)} ${esc(M.of)} ${pad(total)}</span>
            <button class="modal__step" type="button" data-step="1">${esc(M.next)} →</button>
          </nav>
        </div>
      </div>`;
    state.modal.id = e.id;
  };
  const list = () => (state.items.length ? state.items : TIMELINE);
  const animateIn = (delay = 0) => {
    if (!motionOK()) return;
    gsap.fromTo($('.modal__media img', dlg), { scale: 1.25 }, { scale: 1, duration: 6, ease: 'power2.out', delay });
    gsap.from($$('.modal__body > *', dlg), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: delay + 0.2, clearProps: 'transform,opacity' });
  };
  const radius = () => Math.hypot(Math.max(state.modal.origin[0], innerWidth - state.modal.origin[0]), Math.max(state.modal.origin[1], innerHeight - state.modal.origin[1])) + 20;

  const open = (id) => {
    const L = list(), index = L.findIndex((e) => e.id === id);
    if (index < 0 || state.modal.open) return;
    fill(L[index], index, L.length);
    state.modal.open = true;
    dlg.showModal();
    root.classList.add('modal-open');
    state.lenis?.stop();
    $('[data-close]', dlg).focus();
    if (motionOK()) {
      const [x, y] = state.modal.origin;
      gsap.fromTo(dlg, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius()}px at ${x}px ${y}px)`, duration: 1, ease: 'expo.inOut', clearProps: 'clipPath' });
      animateIn(0.35);
    }
  };
  const requestClose = () => {
    if (!state.modal.open || state.modal.closing) return;
    state.modal.closing = true;
    if (!motionOK()) { dlg.close(); return; }
    const [x, y] = state.modal.origin;
    gsap.to(dlg, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: 0.8, ease: 'expo.inOut', onComplete: () => { dlg.close(); gsap.set(dlg, { clearProps: 'clipPath' }); } });
  };
  const step = (dir) => {
    const L = list();
    let i = L.findIndex((e) => e.id === state.modal.id); i = (i + dir + L.length) % L.length;
    const swap = () => { fill(L[i], i, L.length); $(`[data-step="${dir}"]`, dlg)?.focus(); animateIn(0); };
    if (motionOK()) gsap.to($('.modal__inner', dlg), { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => { swap(); gsap.set($('.modal__inner', dlg), { opacity: 1 }); } });
    else swap();
  };

  document.addEventListener('click', (e) => { const c = e.target.closest('[data-open]'); if (c) open(c.dataset.open); });
  dlg.addEventListener('click', (e) => {
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

/* ---- Chapter menu (full-screen, focus-trapped) ---- */
let menuOpen = false;
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  const menu = $('#menu'), btn = $('#menuBtn');
  btn.setAttribute('aria-expanded', 'false'); $('#menuText').textContent = C.menu.open;
  $('#main').removeAttribute('inert');
  const done = () => { menu.hidden = true; root.classList.remove('menu-open'); state.lenis?.start(); if (hasGSAP) gsap.set(menu, { clearProps: 'clipPath' }); };
  if (motionOK()) gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 3rem) 2.2rem)', duration: 0.7, ease: 'expo.inOut', onComplete: done }); else done();
  btn.focus({ preventScroll: true });
}
function initMenu() {
  const menu = $('#menu'), btn = $('#menuBtn');
  btn.addEventListener('click', () => {
    if (menuOpen) return closeMenu();
    menuOpen = true;
    menu.hidden = false; root.classList.add('menu-open'); state.lenis?.stop();
    btn.setAttribute('aria-expanded', 'true'); $('#menuText').textContent = C.menu.close;
    $('#main').setAttribute('inert', '');
    if (motionOK()) {
      gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 3rem) 2.2rem)' }, { clipPath: 'circle(150% at calc(100% - 3rem) 2.2rem)', duration: 0.9, ease: 'expo.inOut' });
      gsap.from('.menu__list a', { y: 50, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.25, clearProps: 'transform,opacity' });
    } else menu.style.clipPath = 'none';
    $('.menu__list a', menu).focus({ preventScroll: true });
  });
  addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') return closeMenu();
    if (e.key === 'Tab') {                                   // simple focus trap: menu links + the toggle button
      const f = [btn, ...$$('.menu__list a', menu)], i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}

/* ---- 3D <-> 2D switch ---- */
function updateViewBtn() {
  const b = $('#viewBtn');
  b.textContent = state.mode === '3d' ? J.view2d : J.view3d;
  b.setAttribute('aria-label', `${J.viewLabel}: ${state.mode === '3d' ? J.view2d : J.view3d}`);
  b.hidden = !webglOK;
}

async function setMode(mode, { initial = false } = {}) {
  if (mode === '3d' && !webglOK) mode = '2d';
  state.mode = mode;
  root.classList.toggle('mode-2d', mode === '2d');
  try { sessionStorage.setItem('ex5-view', mode); } catch (_) { /* blocked */ }
  state.arrival = -2;
  if (mode === '3d') {
    if (!state.gl) {
      try { await ensureScene(() => {}); }
      catch (err) { console.warn('3D unavailable, using the 2D timeline.', err); state.mode = '2d'; root.classList.add('mode-2d'); mode = '2d'; }
    }
  }
  renderTimelineSection();
  if (state.mode === '3d') { state.gl.nodes.forEach((nd) => { nd.active = state.filter === 'all' || nd.e.category === state.filter; }); layoutRunway(); startRender(); setArrival(-1); }
  else if (state.gl) state.gl.running = false;
  updateViewBtn();
  if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
  if (!initial) scrollToY(state.mode === '3d' ? state.run.top : $('#timeline').getBoundingClientRect().top + scrollY);
}

function initViewToggle() {
  $('#viewBtn').addEventListener('click', () => setMode(state.mode === '3d' ? '2d' : '3d'));
  $('#soundBtn').addEventListener('click', () => sound.toggle());
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
}

/* ------------------------------------------------------------------------
   6. LOADER, INTRO & BOOT
   ------------------------------------------------------------------------ */
function setLoaderProgress(v) {
  const fill = $('#loaderFill'), pct = $('#loaderPct'); if (!fill) return;
  fill.style.transform = `scaleX(${v})`; pct.textContent = Math.round(v * 100) + '%';
}

async function boot() {
  root.classList.add('is-loading');
  renderStatic();
  initMenu(); initAnchors(); initProgressAndChapters(); initFilters(); initModal(); initContact(); initTour(); initViewToggle();
  setLoaderProgress(0.12);

  // Visitor can always skip the wait; the scene keeps building behind the page.
  let skipped = false;
  const skipPromise = new Promise((res) => {
    const go = () => { skipped = true; res(); };
    $('#loaderBtn').addEventListener('click', go);
    $('#loader').addEventListener('click', go);
    addEventListener('keydown', (e) => { if (['Enter', ' ', 'Escape'].includes(e.key) && $('#loader')) go(); });
    $('#loaderBtn').focus({ preventScroll: true });
  });
  let saved = null; try { saved = sessionStorage.getItem('ex5-view'); } catch (_) { /* blocked */ }
  const want3d = webglOK && (saved ? saved === '3d' && !reduceMQ.matches : !reduceMQ.matches);

  state.lenis = null;
  const minTime = new Promise((r) => setTimeout(r, motionOK() ? 1400 : 200));
  let progress = 0.12;
  const bump = (v) => { progress = Math.max(progress, v); setLoaderProgress(progress); };

  const sceneReady = (async () => {
    state.mode = want3d ? '3d' : '2d';
    root.classList.toggle('mode-2d', !want3d);
    if (want3d) {
      try { await ensureScene(bump); }
      catch (err) { console.warn('3D unavailable, using the 2D timeline.', err); state.mode = '2d'; root.classList.add('mode-2d'); }
    }
    bump(0.9);
    // wait for the textures (bounded) so photos do not pop in
    if (state.gl?.manager) await new Promise((res) => { const t = setTimeout(res, 3500); state.gl.manager.onLoad = () => { clearTimeout(t); res(); }; });
    bump(1);
  })();

  await Promise.race([Promise.all([sceneReady, minTime]), skipPromise]);
  const sceneState = skipped ? 'skipped' : 'ready';
  void sceneState;

  // Finish setup for whichever mode we ended up in
  await setMode(state.mode, { initial: true });
  if (motionOK()) { state.lenis = initLenis(); }
  initReveals(); initTiltAndCarousel();
  addEventListener('load', () => { layoutRunway(); if (hasGSAP) ScrollTrigger.refresh(); });
  document.fonts?.ready.then(() => { layoutRunway(); if (hasGSAP) ScrollTrigger.refresh(); });

  await exitLoader();
  playIntro();
}

function exitLoader() {
  return new Promise((resolve) => {
    const loader = $('#loader');
    const done = () => { loader?.remove(); root.classList.remove('is-loading'); state.entered = true; resolve(); };
    setLoaderProgress(1);
    if (!motionOK()) return done();
    gsap.to(loader, { opacity: 0, scale: 1.08, duration: 0.8, ease: 'expo.inOut', onComplete: done });
  });
}

function playIntro() {
  const gl = state.gl;
  if (motionOK()) {
    // Camera dollies in from deep inside the scene
    const o = { k: 0 };
    gsap.to(o, { k: 1, duration: 3.2, ease: 'power3.out', onUpdate: () => { state.introK = o.k; } });
    gsap.from('.hero__name .ln', { yPercent: 40, opacity: 0, filter: 'blur(18px)', duration: 1.8, ease: 'expo.out', stagger: 0.18, clearProps: 'filter,transform,opacity' });
    gsap.from('[data-hero]', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.5, clearProps: 'transform,opacity' });
    gsap.from('.top > *', { y: -30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, delay: 0.3, clearProps: 'transform,opacity' });
  } else state.introK = 1;
  if (!gl) state.introK = 1;
}

boot();

})();
