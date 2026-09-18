export function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const THRESHOLD = 40;
  let ticking = false;

  const sync = () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  };

  sync();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(sync);
        ticking = true;
      }
    },
    { passive: true }
  );
}
