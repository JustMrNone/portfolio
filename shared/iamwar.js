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
  '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050403"/><stop offset=".6" stop-color="#0b0806"/><stop offset="1" stop-color="#ffc766" stop-opacity=".55"/></linearGradient>' +
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
    '<g class="iaw-hair">' +
    '<path d="M536.0 605.8 L537.8 602.3 L539.6 599.7 L541.5 597.4 L543.4 595.3 L545.3 593.4 L547.3 592.0 L549.2 591.1 L551.2 590.4 L553.3 589.8 L555.3 589.2 L557.5 588.7 L559.6 588.2 L561.8 587.8 L564.0 587.5 L566.3 587.2 L568.6 586.8 L570.9 586.5 L573.3 586.2 L575.8 585.9 L578.2 585.5 L580.8 585.1 L583.4 584.7 L586.0 584.2 L588.7 583.6 L591.4 583.0 L594.2 582.2 L597.1 581.4 L600.0 580.5 L603.0 579.5 L606.0 578.4 L609.1 577.2 L612.3 575.8 L615.5 574.3 L618.8 572.7 L622.2 570.9 L625.6 569.0 L629.1 566.9 L632.6 564.7 L636.3 562.3 L640.0 559.8 L640.0 560.2 L636.3 562.9 L632.6 565.4 L629.1 567.7 L625.6 569.9 L622.2 572.0 L618.8 573.9 L615.5 575.7 L612.3 577.4 L609.1 579.0 L606.0 580.5 L603.0 581.8 L600.0 583.2 L597.1 584.4 L594.2 585.6 L591.4 586.7 L588.7 587.8 L586.0 588.8 L583.4 589.8 L580.8 590.8 L578.2 591.7 L575.8 592.7 L573.3 593.6 L570.9 594.5 L568.6 595.4 L566.3 596.3 L564.0 597.2 L561.8 598.1 L559.6 599.0 L557.5 599.9 L555.3 600.8 L553.3 601.8 L551.2 602.8 L549.2 603.8 L547.3 604.9 L545.3 605.5 L543.4 605.9 L541.5 606.2 L539.6 606.4 L537.8 606.6 L536.0 606.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M540.0 615.8 L542.4 612.9 L544.8 611.0 L547.2 609.5 L549.6 608.3 L552.0 607.2 L554.4 606.7 L556.9 606.8 L559.3 606.9 L561.7 607.0 L564.2 607.2 L566.6 607.5 L569.1 607.7 L571.6 608.0 L574.1 608.3 L576.6 608.6 L579.2 608.9 L581.7 609.2 L584.3 609.4 L586.9 609.6 L589.5 609.8 L592.1 609.9 L594.8 610.0 L597.5 610.0 L600.2 609.9 L602.9 609.7 L605.7 609.5 L608.5 609.2 L611.3 608.8 L614.2 608.4 L617.1 607.8 L620.0 607.1 L622.9 606.4 L625.9 605.5 L629.0 604.5 L632.0 603.4 L635.1 602.1 L638.3 600.7 L641.5 599.2 L644.7 597.6 L648.0 595.8 L648.0 596.2 L644.7 598.2 L641.5 600.0 L638.3 601.6 L635.1 603.1 L632.0 604.5 L629.0 605.7 L625.9 606.8 L622.9 607.9 L620.0 608.8 L617.1 609.6 L614.2 610.3 L611.3 610.9 L608.5 611.5 L605.7 612.0 L602.9 612.5 L600.2 612.9 L597.5 613.3 L594.8 613.6 L592.1 613.9 L589.5 614.2 L586.9 614.5 L584.3 614.8 L581.7 615.1 L579.2 615.4 L576.6 615.6 L574.1 616.0 L571.6 616.3 L569.1 616.6 L566.6 617.0 L564.2 617.4 L561.7 617.8 L559.3 618.3 L556.9 618.8 L554.4 619.3 L552.0 619.4 L549.6 619.2 L547.2 618.8 L544.8 618.3 L542.4 617.7 L540.0 616.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M542.0 627.8 L544.7 625.5 L547.4 624.4 L550.1 623.6 L552.8 623.1 L555.4 622.8 L558.1 623.0 L560.8 623.7 L563.5 624.4 L566.1 625.1 L568.8 625.8 L571.5 626.6 L574.2 627.4 L576.9 628.1 L579.6 628.9 L582.3 629.7 L585.0 630.4 L587.7 631.2 L590.5 631.9 L593.2 632.6 L596.0 633.2 L598.8 633.8 L601.6 634.4 L604.4 635.0 L607.2 635.5 L610.1 636.0 L613.0 636.4 L615.9 636.8 L618.8 637.1 L621.7 637.4 L624.7 637.6 L627.7 637.8 L630.7 637.9 L633.8 637.9 L636.8 637.9 L639.9 637.8 L643.1 637.6 L646.3 637.3 L649.5 636.9 L652.7 636.4 L656.0 635.8 L656.0 636.2 L652.7 637.0 L649.5 637.7 L646.3 638.3 L643.1 638.7 L639.9 639.1 L636.8 639.4 L633.8 639.6 L630.7 639.7 L627.7 639.8 L624.7 639.7 L621.7 639.6 L618.8 639.5 L615.9 639.3 L613.0 639.0 L610.1 638.7 L607.2 638.3 L604.4 638.0 L601.6 637.6 L598.8 637.2 L596.0 636.8 L593.2 636.4 L590.5 636.0 L587.7 635.6 L585.0 635.2 L582.3 634.9 L579.6 634.6 L576.9 634.3 L574.2 634.1 L571.5 633.9 L568.8 633.8 L566.1 633.7 L563.5 633.7 L560.8 633.7 L558.1 633.8 L555.4 633.5 L552.8 632.9 L550.1 632.2 L547.4 631.3 L544.7 630.2 L542.0 628.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M538.0 639.8 L540.7 639.0 L543.4 639.0 L546.0 639.4 L548.7 639.9 L551.4 640.7 L554.0 641.7 L556.6 643.1 L559.3 644.4 L561.9 645.8 L564.6 647.2 L567.2 648.6 L569.9 649.9 L572.5 651.3 L575.2 652.7 L577.9 654.1 L580.6 655.5 L583.3 656.8 L586.0 658.2 L588.7 659.6 L591.5 660.9 L594.3 662.3 L597.1 663.6 L599.9 664.9 L602.8 666.3 L605.7 667.6 L608.6 668.9 L611.6 670.1 L614.6 671.4 L617.6 672.7 L620.7 673.9 L623.8 675.1 L627.0 676.2 L630.2 677.4 L633.4 678.4 L636.7 679.5 L640.1 680.5 L643.5 681.4 L646.9 682.3 L650.4 683.0 L654.0 683.8 L654.0 684.2 L650.4 683.7 L646.9 683.1 L643.5 682.4 L640.1 681.7 L636.7 681.0 L633.4 680.2 L630.2 679.3 L627.0 678.4 L623.8 677.4 L620.7 676.4 L617.6 675.4 L614.6 674.3 L611.6 673.2 L608.6 672.0 L605.7 670.8 L602.8 669.6 L599.9 668.4 L597.1 667.1 L594.3 665.9 L591.5 664.6 L588.7 663.3 L586.0 662.0 L583.3 660.8 L580.6 659.5 L577.9 658.3 L575.2 657.1 L572.5 656.0 L569.9 654.9 L567.2 653.8 L564.6 652.8 L561.9 651.8 L559.3 650.9 L556.6 650.0 L554.0 649.2 L551.4 648.2 L548.7 647.0 L546.0 645.6 L543.4 644.2 L540.7 642.6 L538.0 640.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M530.0 599.8 L531.7 596.6 L533.4 594.0 L535.2 591.7 L537.0 589.6 L538.8 587.6 L540.7 585.9 L542.6 584.4 L544.6 583.0 L546.6 581.7 L548.7 580.3 L550.8 579.1 L553.0 577.8 L555.2 576.6 L557.4 575.4 L559.7 574.3 L562.0 573.1 L564.4 572.0 L566.8 570.9 L569.3 569.7 L571.8 568.6 L574.3 567.5 L576.9 566.3 L579.5 565.2 L582.1 564.0 L584.8 562.7 L587.6 561.4 L590.3 560.1 L593.2 558.7 L596.0 557.2 L598.9 555.7 L601.8 554.0 L604.8 552.3 L607.8 550.4 L610.9 548.5 L614.0 546.4 L617.1 544.2 L620.3 541.8 L623.5 539.3 L626.7 536.6 L630.0 533.8 L630.0 534.2 L626.7 537.2 L623.5 540.1 L620.3 542.8 L617.1 545.3 L614.0 547.8 L610.9 550.1 L607.8 552.3 L604.8 554.4 L601.8 556.4 L598.9 558.3 L596.0 560.1 L593.2 561.8 L590.3 563.4 L587.6 564.9 L584.8 566.4 L582.1 567.8 L579.5 569.1 L576.9 570.4 L574.3 571.7 L571.8 572.9 L569.3 574.1 L566.8 575.2 L564.4 576.4 L562.0 577.5 L559.7 578.7 L557.4 579.9 L555.2 581.1 L553.0 582.3 L550.8 583.6 L548.7 585.0 L546.6 586.4 L544.6 587.9 L542.6 589.5 L540.7 591.1 L538.8 592.7 L537.0 594.3 L535.2 595.9 L533.4 597.5 L531.7 599.0 L530.0 600.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M544.0 647.8 L547.1 648.3 L550.2 649.2 L553.3 650.3 L556.3 651.5 L559.3 652.7 L562.3 654.1 L565.2 655.8 L568.2 657.5 L571.1 659.2 L573.9 661.0 L576.8 662.8 L579.6 664.6 L582.5 666.4 L585.3 668.3 L588.1 670.2 L590.9 672.2 L593.7 674.1 L596.4 676.1 L599.2 678.1 L602.0 680.1 L604.8 682.1 L607.6 684.1 L610.3 686.2 L613.1 688.2 L615.9 690.2 L618.7 692.2 L621.5 694.2 L624.4 696.1 L627.2 698.0 L630.1 699.9 L632.9 701.7 L635.8 703.5 L638.8 705.3 L641.7 707.0 L644.7 708.6 L647.7 710.2 L650.7 711.7 L653.8 713.1 L656.9 714.5 L660.0 715.8 L660.0 716.2 L656.9 715.1 L653.8 713.8 L650.7 712.5 L647.7 711.2 L644.7 709.8 L641.7 708.4 L638.8 707.0 L635.8 705.5 L632.9 704.0 L630.1 702.4 L627.2 700.8 L624.4 699.2 L621.5 697.6 L618.7 695.9 L615.9 694.2 L613.1 692.5 L610.3 690.7 L607.6 689.0 L604.8 687.2 L602.0 685.4 L599.2 683.6 L596.4 681.7 L593.7 679.9 L590.9 678.0 L588.1 676.2 L585.3 674.3 L582.5 672.5 L579.6 670.6 L576.8 668.8 L573.9 667.0 L571.1 665.2 L568.2 663.4 L565.2 661.7 L562.3 660.0 L559.3 658.2 L556.3 656.2 L553.3 654.3 L550.2 652.4 L547.1 650.5 L544.0 648.2Z" fill="url(#' + id + 'h)"/>' +
    '<path d="M536.0 605.8 L537.8 602.3 L539.6 599.7 L541.5 597.4 L543.4 595.3 L545.3 593.4 L547.3 592.0 L549.2 591.1 L551.2 590.4 L553.3 589.8 L555.3 589.2 L557.5 588.7 L559.6 588.2 L561.8 587.8 L564.0 587.5 L566.3 587.2 L568.6 586.8 L570.9 586.5 L573.3 586.2 L575.8 585.9 L578.2 585.5 L580.8 585.1 L583.4 584.7 L586.0 584.2 L588.7 583.6 L591.4 583.0 L594.2 582.2 L597.1 581.4 L600.0 580.5 L603.0 579.5 L606.0 578.4 L609.1 577.2 L612.3 575.8 L615.5 574.3 L618.8 572.7 L622.2 570.9 L625.6 569.0 L629.1 566.9 L632.6 564.7 L636.3 562.3 L640.0 559.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '<path d="M540.0 615.8 L542.4 612.9 L544.8 611.0 L547.2 609.5 L549.6 608.3 L552.0 607.2 L554.4 606.7 L556.9 606.8 L559.3 606.9 L561.7 607.0 L564.2 607.2 L566.6 607.5 L569.1 607.7 L571.6 608.0 L574.1 608.3 L576.6 608.6 L579.2 608.9 L581.7 609.2 L584.3 609.4 L586.9 609.6 L589.5 609.8 L592.1 609.9 L594.8 610.0 L597.5 610.0 L600.2 609.9 L602.9 609.7 L605.7 609.5 L608.5 609.2 L611.3 608.8 L614.2 608.4 L617.1 607.8 L620.0 607.1 L622.9 606.4 L625.9 605.5 L629.0 604.5 L632.0 603.4 L635.1 602.1 L638.3 600.7 L641.5 599.2 L644.7 597.6 L648.0 595.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '<path d="M542.0 627.8 L544.7 625.5 L547.4 624.4 L550.1 623.6 L552.8 623.1 L555.4 622.8 L558.1 623.0 L560.8 623.7 L563.5 624.4 L566.1 625.1 L568.8 625.8 L571.5 626.6 L574.2 627.4 L576.9 628.1 L579.6 628.9 L582.3 629.7 L585.0 630.4 L587.7 631.2 L590.5 631.9 L593.2 632.6 L596.0 633.2 L598.8 633.8 L601.6 634.4 L604.4 635.0 L607.2 635.5 L610.1 636.0 L613.0 636.4 L615.9 636.8 L618.8 637.1 L621.7 637.4 L624.7 637.6 L627.7 637.8 L630.7 637.9 L633.8 637.9 L636.8 637.9 L639.9 637.8 L643.1 637.6 L646.3 637.3 L649.5 636.9 L652.7 636.4 L656.0 635.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '<path d="M538.0 639.8 L540.7 639.0 L543.4 639.0 L546.0 639.4 L548.7 639.9 L551.4 640.7 L554.0 641.7 L556.6 643.1 L559.3 644.4 L561.9 645.8 L564.6 647.2 L567.2 648.6 L569.9 649.9 L572.5 651.3 L575.2 652.7 L577.9 654.1 L580.6 655.5 L583.3 656.8 L586.0 658.2 L588.7 659.6 L591.5 660.9 L594.3 662.3 L597.1 663.6 L599.9 664.9 L602.8 666.3 L605.7 667.6 L608.6 668.9 L611.6 670.1 L614.6 671.4 L617.6 672.7 L620.7 673.9 L623.8 675.1 L627.0 676.2 L630.2 677.4 L633.4 678.4 L636.7 679.5 L640.1 680.5 L643.5 681.4 L646.9 682.3 L650.4 683.0 L654.0 683.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '<path d="M530.0 599.8 L531.7 596.6 L533.4 594.0 L535.2 591.7 L537.0 589.6 L538.8 587.6 L540.7 585.9 L542.6 584.4 L544.6 583.0 L546.6 581.7 L548.7 580.3 L550.8 579.1 L553.0 577.8 L555.2 576.6 L557.4 575.4 L559.7 574.3 L562.0 573.1 L564.4 572.0 L566.8 570.9 L569.3 569.7 L571.8 568.6 L574.3 567.5 L576.9 566.3 L579.5 565.2 L582.1 564.0 L584.8 562.7 L587.6 561.4 L590.3 560.1 L593.2 558.7 L596.0 557.2 L598.9 555.7 L601.8 554.0 L604.8 552.3 L607.8 550.4 L610.9 548.5 L614.0 546.4 L617.1 544.2 L620.3 541.8 L623.5 539.3 L626.7 536.6 L630.0 533.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '<path d="M544.0 647.8 L547.1 648.3 L550.2 649.2 L553.3 650.3 L556.3 651.5 L559.3 652.7 L562.3 654.1 L565.2 655.8 L568.2 657.5 L571.1 659.2 L573.9 661.0 L576.8 662.8 L579.6 664.6 L582.5 666.4 L585.3 668.3 L588.1 670.2 L590.9 672.2 L593.7 674.1 L596.4 676.1 L599.2 678.1 L602.0 680.1 L604.8 682.1 L607.6 684.1 L610.3 686.2 L613.1 688.2 L615.9 690.2 L618.7 692.2 L621.5 694.2 L624.4 696.1 L627.2 698.0 L630.1 699.9 L632.9 701.7 L635.8 703.5 L638.8 705.3 L641.7 707.0 L644.7 708.6 L647.7 710.2 L650.7 711.7 L653.8 713.1 L656.9 714.5 L660.0 715.8" fill="none" stroke="#ffc766" stroke-opacity=".4" stroke-width="1.1"/>' +
    '</g>' +'<path d="M488 628 C490 600 516 592 536 606 C534 622 520 632 504 634Z" fill="#070504"/>' +
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


  /* ---------- 4. THE WAR MOMENT — canvas atmosphere --------------------- */
  /* Ash, embers, distant flashes, glitch bars and — at the end of every
     cycle — a flock of paper cranes rising. Mounted on any element. */
  function warFx(host, opts) {
    opts = opts || {};
    var cv = document.createElement('canvas');
    cv.className = 'war-fx' + (opts.inline ? ' war-fx--in' : '');
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = 1, raf = 0, alive = true, visible = true;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rnd = Math.random, parts = [], cranes = [], flash = 0, nextFlash = 1.2, nextCranes = 4, glitch = [], nextGlitch = 2, t0 = performance.now(), last = t0;

    function resize() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(kind, fresh) {
      var ember = kind === 'ember';
      return { k: kind, x: rnd() * w, y: fresh ? (ember ? h + 10 : -10) : rnd() * h,
        vx: (rnd() - 0.5) * (ember ? 24 : 18), vy: ember ? -(30 + rnd() * 60) : 18 + rnd() * 34,
        r: ember ? 1.2 + rnd() * 2.6 : 0.8 + rnd() * 2, a: 0.4 + rnd() * 0.6, ph: rnd() * 6.28 };
    }
    function crane(x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = 'rgba(255,246,230,0.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.35); ctx.lineTo(-s * 0.2, -s * 0.08); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(239,226,204,0.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s, -s * 0.5); ctx.lineTo(s * 0.2, -s * 0.08); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,240,0.98)'; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.08); ctx.lineTo(0, s * 0.65); ctx.lineTo(s * 0.2, -s * 0.08); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.08); ctx.lineTo(s * 0.62, -s * 0.42); ctx.lineTo(s * 0.5, -s * 0.2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      // atmosphere: breathing red vignette
      var g = ctx.createRadialGradient(w / 2, h * 0.9, h * 0.1, w / 2, h * 0.9, h * 0.95);
      g.addColorStop(0, 'rgba(255,120,50,' + (0.16 + Math.sin(t * 1.4) * 0.05) + ')'); g.addColorStop(1, 'rgba(229,53,43,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // flash
      nextFlash -= dt;
      if (nextFlash <= 0) { flash = 1; nextFlash = 3 + rnd() * 5; }
      if (flash > 0) { ctx.fillStyle = 'rgba(255,150,80,' + (flash * 0.28) + ')'; ctx.fillRect(0, 0, w, h); flash = Math.max(0, flash - dt * 2.2); }
      // particles
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], ember = p.k === 'ember';
        p.x += (p.vx + Math.sin(t * 0.9 + p.ph) * 10) * dt; p.y += p.vy * dt;
        if (p.y < -20 || p.y > h + 20 || p.x < -20 || p.x > w + 20) parts[i] = spawn(p.k, true);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        if (ember) { ctx.shadowColor = '#ff7a2e'; ctx.shadowBlur = 8; ctx.fillStyle = 'rgba(255,' + (140 + p.ph * 12 | 0) + ',60,' + (p.a * (0.6 + Math.sin(t * 6 + p.ph) * 0.4)) + ')'; }
        else { ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(220,212,200,' + p.a * 0.55 + ')'; }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      // cranes
      nextCranes -= dt;
      if (nextCranes <= 0) {
        nextCranes = 9 + rnd() * 3;
        for (var c = 0; c < 6; c++) cranes.push({ x: w * (0.1 + rnd() * 0.8), y: h + 30 + rnd() * 90, s: Math.max(10, w * (0.012 + rnd() * 0.012)), v: 36 + rnd() * 28, ph: rnd() * 6.28, life: 0 });
      }
      cranes = cranes.filter(function (k) { return k.y > -60; });
      cranes.forEach(function (k) {
        k.y -= k.v * dt; k.life += dt;
        var sway = Math.sin(t * 1.1 + k.ph);
        ctx.globalAlpha = Math.min(1, k.life * 1.2) * Math.min(1, Math.max(0, k.y / (h * 0.25)));
        crane(k.x + sway * 26, k.y, k.s, sway * 0.18);
      });
      ctx.globalAlpha = 1;
      // glitch bars
      nextGlitch -= dt;
      if (nextGlitch <= 0) { nextGlitch = 2 + rnd() * 4; glitch = []; for (var q = 0; q < 3 + (rnd() * 3 | 0); q++) glitch.push({ y: rnd() * h, hh: 2 + rnd() * 14, x: (rnd() - 0.5) * 60, life: 0.16 }); }
      glitch.forEach(function (b) {
        if (b.life <= 0) return; b.life -= dt;
        ctx.fillStyle = 'rgba(255,59,46,0.32)'; ctx.fillRect(b.x, b.y, w, b.hh);
        ctx.fillStyle = 'rgba(80,220,255,0.16)'; ctx.fillRect(-b.x, b.y + b.hh, w, 2);
      });
    }
    function start() {
      resize();
      var n = Math.round(Math.min(110, Math.max(36, w * h / 9000)));
      for (var i = 0; i < n; i++) parts.push(spawn(i % 3 === 0 ? 'ember' : 'ash', false));
      if (reduce) { frame(performance.now()); cancelAnimationFrame(raf); return; }   // one still frame
      raf = requestAnimationFrame(frame);
    }
    var ro = ('ResizeObserver' in window) ? new ResizeObserver(function () { resize(); }) : null;
    if (ro) ro.observe(cv);
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }) : null;
    if (io) io.observe(cv);
    start();
    return { stop: function () { alive = false; cancelAnimationFrame(raf); ro && ro.disconnect(); io && io.disconnect(); cv.remove(); } };
  }

  /* In templates 1–5 the detail dialog is theirs; we simply lay the atmosphere over it
     whenever it shows the war moment (and take it away again afterwards). */
  function watchWarDialogs() {
    var special = (D.timeline || []).filter(function (e) { return e.special === 'war'; })[0];
    if (!special) return;
    var check = function () {
      document.querySelectorAll('dialog').forEach(function (d) {
        var has = d.querySelector('canvas.war-fx');
        var show = d.open && (d.textContent || '').indexOf(special.title) !== -1;
        if (show && !has) { d._war = warFx(d); d.classList.add('is-war'); }
        else if (!show && has) { d._war && d._war.stop(); d._war = null; d.classList.remove('is-war'); }
      });
    };
    new MutationObserver(function () { requestAnimationFrame(check); }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
  }

  window.IAW = { art: art, mount: mount, boldify: boldify, warFx: warFx };
  mount();
  boldify(document.body);
  watch();
  watchWarDialogs();
  // after the page scripts have rendered their content
  window.addEventListener('DOMContentLoaded', function () { boldify(document.body); });
  window.addEventListener('load', function () { boldify(document.body); });
})();
