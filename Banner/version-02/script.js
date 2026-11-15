/* I AM WAR — Version 02: Bone
   1. photo crossfades  2. the pinned prints drift a few pixels with the pointer.
   Both are skipped / reduced for reduced-motion and touch screens. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Crossfades — any element with data-fade="seconds" cycles its <img> children.
  if (!reduce) {
    document.querySelectorAll('[data-fade]').forEach((box, i) => {
      const imgs = [...box.querySelectorAll(':scope > img')];
      if (imgs.length < 2) return;
      const every = (parseFloat(box.dataset.fade) || 8) * 1000;
      let n = 0;
      const next = () => {
        if (!document.hidden) {
          imgs[n].classList.remove('on');
          n = (n + 1) % imgs.length;
          imgs[n].classList.add('on');
        }
        setTimeout(next, every + Math.random() * 1500);   // irregular, never in lockstep
      };
      setTimeout(next, every * 0.4 + i * 900);
    });
  }

  // 2. Pointer drift.
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.07; y += (ty - y) * 0.07;
    root.style.setProperty('--px', x.toFixed(3));
    root.style.setProperty('--py', y.toFixed(3));
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) ? requestAnimationFrame(tick) : 0;
  };
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();
