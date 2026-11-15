/* I AM WAR — Version 01: Slate
   1. static film-grain tile  2. photo crossfades  3. a very gentle pointer shift */
(() => {
  const banner = document.getElementById('banner');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Grain — generated once, no image file.
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() * 255;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  banner.style.setProperty('--grain', `url(${c.toDataURL()})`);

  // 2. Crossfades — any element with data-fade="seconds" cycles its <img> children.
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

  // 3. Pointer shift — eased; the loop sleeps once settled.
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;
    banner.style.setProperty('--px', x.toFixed(3));
    banner.style.setProperty('--py', y.toFixed(3));
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) ? requestAnimationFrame(tick) : 0;
  };
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
})();
