// Hides the floating WhatsApp button while the mobile nav drawer is open,
// so it doesn't float on top of the menu (z-index puts it above the drawer).
export function initFloatingWhatsapp() {
  const button = document.getElementById('floatingWhatsapp');
  const drawer = document.getElementById('mobileNav');
  if (!button || !drawer) return;

  const sync = () => {
    button.toggleAttribute('data-hidden', drawer.getAttribute('data-open') === 'true');
  };

  new MutationObserver(sync).observe(drawer, { attributes: true, attributeFilter: ['data-open'] });
  sync();
}
