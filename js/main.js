import { initNav } from './nav.js';
import { initFloatingWhatsapp } from './floating-whatsapp.js';
import { initReveal } from './reveal.js';
import { initHeaderScroll } from './header-scroll.js';
import { initHeroShowcase } from './hero-showcase.js';
import { initAccordionGallery } from './accordion-gallery.js';
import { initReviewsCarousel } from './reviews-carousel.js';

function safeRun(fn) {
  try {
    fn();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  safeRun(initNav);
  safeRun(initFloatingWhatsapp);
  safeRun(initReveal);
  safeRun(initHeaderScroll);
  safeRun(initHeroShowcase);
  safeRun(initAccordionGallery);
  safeRun(initReviewsCarousel);

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
