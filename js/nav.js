export function initNav() {
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileNav');
  if (!toggle || !drawer) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    drawer.removeAttribute('data-open');
    toggle.focus();
  };

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('data-open', 'true');
    const firstLink = drawer.querySelector('a');
    if (firstLink) firstLink.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || drawer.getAttribute('data-open') !== 'true') return;
    const focusable = drawer.querySelectorAll('a, button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
