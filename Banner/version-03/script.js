/* I AM WAR — Version 03: Horizon
   Gentle pointer-driven depth: front layer, pieces and photo move at
   different speeds. Skipped on touch screens and for reduced-motion. */
(() => {
  const root = document.getElementById('banner');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.05;
    y += (ty - y) * 0.05;
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
