/* ==========================================================================
   shared/iamwar.js — the "I AM WAR" key art + brand treatment used by all
   six templates.

   1. IAW.art()      returns an inline SVG: the director, her camera, and the
                     child's shadow on a wall above a city of light.
   2. IAW.mount()    fills every <section id="iamwar" data-variant="…"> feature.
   3. boldify()      wraps every mention of "I Am War" in <b class="iaw"> —
                     and, inside project areas, also "art" and "cinema".
   Plain script (no modules): works from a server or from file://.
   ========================================================================== */
(function () {
  'use strict';
  var D = window.portfolio;
  if (!D) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var uid = 0;

  /* ---------- 1. THE ART ------------------------------------------------ */
  function art(label) {
    var id = 'iaw' + (++uid);
    // seeded pseudo-random so the skyline is identical on every load
    var seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var sky = '', wins = '', x = -6;
    while (x < 610) {
      var w = 18 + Math.floor(rnd() * 26), h = 38 + Math.floor(rnd() * 120);
      sky += '<rect x="' + x + '" y="' + (582 - h) + '" width="' + w + '" height="' + (h + 6) + '"/>';
      for (var wy = 582 - h + 8; wy < 574; wy += 11) {
        for (var wx = x + 4; wx < x + w - 5; wx += 8) {
          if (rnd() > 0.62) wins += '<rect x="' + wx + '" y="' + wy + '" width="3" height="4"/>';
        }
      }
      x += w + 2 + Math.floor(rnd() * 5);
    }
    var bricks = '';
    for (var by = 620, row = 0; by < 750; by += 34, row++) {
      bricks += '<path d="M0 ' + by + ' H600"/>';
      for (var bx = (row % 2 ? 30 : 0); bx < 600; bx += 60) bricks += '<path d="M' + bx + ' ' + by + ' v34"/>';
    }
    return '' +
'<svg class="iaw-art" viewBox="0 0 600 750" role="img" aria-label="' + esc(label || 'Key art for I Am War') + '" xmlns="http://www.w3.org/2000/svg">' +
'<defs>' +
  '<filter id="' + id + 'r" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
  '<filter id="' + id + 'g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .96  0 0 0 0 .88  0 0 0 .7 -.22"/></filter>' +
  '<radialGradient id="' + id + 'o" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffc766" stop-opacity=".95"/><stop offset=".45" stop-color="#ff7a2e" stop-opacity=".45"/><stop offset="1" stop-color="#e5352b" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity=".05"/></linearGradient>' +
  '<linearGradient id="' + id + 'b" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffc766" stop-opacity=".5"/><stop offset="1" stop-color="#ffc766" stop-opacity="0"/></linearGradient>' +
  '<clipPath id="' + id + 'c"><rect width="600" height="750"/></clipPath>' +
'</defs>' +
'<g clip-path="url(#' + id + 'c)">' +
  '<rect width="600" height="750" fill="#0b0907"/>' +
  '<g class="iaw-l iaw-l--sky">' +
    '<ellipse cx="300" cy="548" rx="420" ry="250" fill="url(#' + id + 'o)"/>' +
    '<g fill="#17110c" filter="url(#' + id + 'r)">' + sky + '</g>' +
    '<g class="iaw-win" fill="#ffc766">' + wins + '</g>' +
  '</g>' +
  '<g class="iaw-title" font-family="var(--iaw-art-font,\'Big Shoulders Display\',Impact,\'Arial Narrow\',sans-serif)" font-weight="900" filter="url(#' + id + 'r)">' +
    '<text x="36" y="206" font-size="118" textLength="272" lengthAdjust="spacingAndGlyphs" fill="none" stroke="#efe6d4" stroke-width="2.6">I AM</text>' +
    '<text x="32" y="430" font-size="238" textLength="536" lengthAdjust="spacingAndGlyphs" fill="#efe6d4">WAR</text>' +
  '</g>' +
  '<g class="iaw-l iaw-l--wall">' +
    '<path d="M0 590 L44 583 L96 589 L156 580 L232 586 L304 578 L384 587 L452 580 L522 586 L600 577 V750 H0Z" fill="#1c1611" filter="url(#' + id + 'r)"/>' +
    '<g stroke="#0b0907" stroke-width="2" fill="none" opacity=".75">' + bricks + '</g>' +
    '<path d="M238 580 L250 604 L262 590 L268 582Z" fill="#0b0907"/>' +
    '<path d="M390 586 L398 612 L416 596 L420 587Z" fill="#0b0907"/>' +
    '<path d="M284 580 L316 580 L344 750 L226 750Z" fill="url(#' + id + 's)"/>' +
    '<ellipse cx="276" cy="722" rx="26" ry="30" fill="#000" opacity=".5"/>' +
  '</g>' +
  '<g class="iaw-l iaw-l--child" fill="#080605" stroke="#ffc766" stroke-opacity=".55" stroke-width="1.2">' +
    '<circle cx="300" cy="530" r="15"/>' +
    '<path d="M286 546 Q300 540 314 546 L319 582 L282 582Z"/>' +
    '<path d="M286 580 L283 612 Q283 616 288 616 L296 616 L297 582Z M303 580 L304 616 L312 616 Q317 616 316 611 L314 580Z"/>' +
  '</g>' +
  '<g class="iaw-l iaw-l--dir">' +
    '<path class="iaw-ray" d="M392 640 L296 566 L292 622Z" fill="url(#' + id + 'b)"/>' +
    '<path d="M360 750 C374 704 424 690 466 684 L548 684 C596 692 622 722 632 750Z" fill="#070504" stroke="#ffc766" stroke-opacity=".35" stroke-width="1.4"/>' +
    '<path d="M474 646 C466 590 538 580 556 626 C572 668 566 722 560 750 L500 750 C520 712 514 668 492 660Z" fill="#070504"/>' +
    '<rect x="498" y="668" width="30" height="24" rx="8" fill="#070504"/>' +
    '<ellipse cx="514" cy="640" rx="36" ry="45" fill="#0d0a08" stroke="#ffc766" stroke-opacity=".5" stroke-width="1.4"/>' +
    '<g fill="#14100c" stroke="#ffc766" stroke-opacity=".7" stroke-width="1.4">' +
      '<rect x="412" y="626" width="86" height="46" rx="6"/>' +
      '<rect x="374" y="634" width="42" height="30" rx="3"/>' +
      '<rect x="366" y="630" width="9" height="38" rx="2"/>' +
      '<rect x="436" y="614" width="38" height="11" rx="2"/>' +
      '<rect x="482" y="618" width="22" height="14" rx="2"/>' +
    '</g>' +
    '<circle class="iaw-rec" cx="488" cy="640" r="3.6" fill="#e5352b"/>' +
  '</g>' +
  '<g class="iaw-frame" fill="none" stroke="#ffc766" stroke-width="2.4" stroke-linecap="square">' +
    '<path d="M222 478 v-22 h22 M392 456 h22 v22 M222 646 v22 h22 M414 646 v22 h-22" transform="translate(-4 0)"/>' +
    '<g stroke="none" fill="#ffc766" font-family="\'Courier Prime\',\'Courier New\',monospace" font-size="11" letter-spacing="1.5">' +
      '<circle class="iaw-rec" cx="232" cy="441" r="3.4" fill="#e5352b"/><text x="241" y="445">REC</text><text x="346" y="445">00:14:00</text>' +
    '</g>' +
  '</g>' +
  '<g fill="#efe6d4" font-family="\'Courier Prime\',\'Courier New\',monospace" font-size="12" letter-spacing="3.2" opacity=".85">' +
    '<text x="36" y="46">A FILM BY</text><text x="36" y="64" font-weight="700">ELHAM HESAMI</text><text x="540" y="46" text-anchor="end">2026</text>' +
  '</g>' +
  '<rect width="600" height="750" filter="url(#' + id + 'g)" opacity=".4" style="mix-blend-mode:overlay"/>' +
'</g></svg>';
  }

  /* ---------- 2. THE FEATURE SECTION ------------------------------------ */
  function mount() {
    var I = D.iamwar || {};
    var works = (D.projects || []).map(function (p) {
      return '<li><a href="#projects">' + esc(String(p.title).replace(/^I Am War\s*[—–-]\s*/i, '')) + '</a></li>';
    }).join('');
    var els = document.querySelectorAll('#iamwar');
    els.forEach(function (el) {
      el.classList.add('iaw-feature');
      el.setAttribute('aria-labelledby', 'iawTitle');
      el.innerHTML =
        '<div class="iaw__inner">' +
          '<figure class="iaw__art" data-iaw-art>' + art(I.caption) + '<figcaption>' + esc(I.caption || '') + '</figcaption></figure>' +
          '<div class="iaw__text">' +
            '<p class="iaw__kicker">' + esc(I.kicker || '') + '</p>' +
            '<h2 class="iaw__title" id="iawTitle" aria-label="I Am War"><span aria-hidden="true">' + esc((I.title || ['I AM', 'WAR'])[0]) + '</span> <span aria-hidden="true">' + esc((I.title || ['I AM', 'WAR'])[1]) + '</span></h2>' +
            '<p class="iaw__tag">' + esc(I.tagline || '') + '</p>' +
            '<p class="iaw__body">' + esc(I.body || '') + '</p>' +
            '<p class="iaw__by">' + esc(I.filmBy || '') + '</p>' +
            '<p class="iaw__works-label">' + esc(I.worksLabel || '') + '</p>' +
            '<ul class="iaw__works">' + works + '</ul>' +
            '<a class="iaw__cta" href="#projects">' + esc(I.cta || '') + ' <span aria-hidden="true">→</span></a>' +
          '</div>' +
        '</div>';
    });
    // gentle pointer parallax + reveal (skipped for reduced motion)
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) document.documentElement.classList.add('iaw-js');
    document.querySelectorAll('[data-iaw-art]').forEach(function (fig) {
      if (reduce || !('IntersectionObserver' in window)) { fig.classList.add('is-in'); return; }
      new IntersectionObserver(function (en, io) { if (en[0].isIntersecting) { fig.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.2 }).observe(fig);
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        fig.addEventListener('pointermove', function (e) {
          var r = fig.getBoundingClientRect();
          fig.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          fig.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        });
        fig.addEventListener('pointerleave', function () { fig.style.setProperty('--px', 0); fig.style.setProperty('--py', 0); });
      }
    });
  }

  /* ---------- 3. EMBOLDEN "I AM WAR" (and art / cinema in projects) ------ */
  var RE_ALL = /I\s+Am\s+War/gi;
  var RE_PRO = /\b(I\s+Am\s+War|art|cinema)\b/gi;
  var SKIP = 'SCRIPT,STYLE,TEXTAREA,INPUT,NOSCRIPT,SVG,TITLE,OPTION,CODE';
  var PROJECT_AREA = '#projects, #iamwar, [data-iaw-extra]';
  var busy = false;

  function wrap(node, re) {
    var text = node.nodeValue, m, last = 0, frag = null;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      frag = frag || document.createDocumentFragment();
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var b = document.createElement('b');
      b.className = /^art$|^cinema$/i.test(m[0]) ? 'iaw iaw--word' : 'iaw';
      b.textContent = m[0];
      frag.appendChild(b);
      last = m.index + m[0].length;
    }
    if (!frag) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function boldify(root) {
    if (busy || !root) return;
    busy = true;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || !n.nodeValue || n.nodeValue.length < 3) return NodeFilter.FILTER_REJECT;
        if (p.closest(SKIP.toLowerCase().split(',').join(',')) || p.closest('#term, [data-no-iaw], b.iaw')) return NodeFilter.FILTER_REJECT;
        return /I\s+Am\s+War|\bart\b|\bcinema\b/i.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (node) {
      var p = node.parentElement;
      if (!p) return;
      wrap(node, p.closest(PROJECT_AREA) ? RE_PRO : RE_ALL);
    });
    busy = false;
  }

  function watch() {
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued || busy) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; boldify(document.body); mo.takeRecords(); });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: false });
  }

  window.IAW = { art: art, mount: mount, boldify: boldify };
  mount();
  boldify(document.body);
  watch();
  // after the page scripts have rendered their content
  window.addEventListener('DOMContentLoaded', function () { boldify(document.body); });
  window.addEventListener('load', function () { boldify(document.body); });
})();
