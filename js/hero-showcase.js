// Image-led hero showcase: a crossfading background with staggered text,
// plus a compact "current / next" preview pair on the right that doubles
// as manual navigation. Autoplay advances through the slides continuously.

// Each slide points at exactly one hero photo and one gallery thumbnail —
// drop a replacement in images/hero/ or images/gallery/ with the same
// filename and it just works, no other sizes/formats to regenerate.
const SLIDES = [
  {
    eyebrow: 'Home Office',
    title: 'Printed Roller Blinds',
    desc: 'Statement prints on made-to-measure roller blinds for any room.',
    bg: 'images/hero/hero-01.jpg',
    card: 'images/gallery/curtains-01.jpg',
    cardLabel: 'Printed Blinds',
  },
  {
    eyebrow: 'Bedroom',
    title: 'Custom Bed Linen',
    desc: 'Sheets, quilts and cushions styled to finish the room.',
    bg: 'images/hero/hero-02.jpg',
    card: 'images/gallery/bedding-01.jpg',
    cardLabel: 'Bed Linen',
  },
  {
    eyebrow: 'Living Spaces',
    title: 'Upholstery &amp; Sofa',
    desc: 'Re-covering and custom builds, made to last.',
    bg: 'images/hero/hero-03.jpg',
    card: 'images/gallery/upholstery-01.jpg',
    cardLabel: 'Upholstery',
  },
  {
    eyebrow: 'Living Room',
    title: 'Tailored Curtains',
    desc: 'Custom curtains fitted to every window, from measure to install.',
    bg: 'images/hero/hero-04.jpg',
    card: 'images/gallery/curtains-02.jpg',
    cardLabel: 'Curtains',
  },
  {
    eyebrow: 'Bedroom',
    title: 'Curtain Nooks',
    desc: 'Sheers and drapes tailored to fit any nook or corner.',
    bg: 'images/hero/hero-05.jpg',
    card: 'images/gallery/curtains-03.jpg',
    cardLabel: 'Curtains',
  },
];

const SLIDE_DURATION = 6000;
const EXIT_DURATION = 320;

export function initHeroShowcase() {
  const hero = document.getElementById('hero');
  const bgRoot = document.getElementById('heroBg');
  const content = document.getElementById('heroContent');
  const eyebrowEl = document.getElementById('heroEyebrow');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');
  const stack = document.getElementById('heroCardsTrack');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (!hero || !bgRoot || !content || !stack) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = SLIDES.length;

  // --- background layers (2, alternating) ---
  const bgLayerA = document.createElement('div');
  const bgLayerB = document.createElement('div');
  bgLayerA.className = 'hero__bg-layer';
  bgLayerB.className = 'hero__bg-layer';
  bgRoot.append(bgLayerA, bgLayerB);
  let activeLayer = bgLayerA;
  let inactiveLayer = bgLayerB;

  function preload(url) {
    const img = new Image();
    img.src = url;
  }

  function setBackground(index, animate) {
    const url = SLIDES[index].bg;
    inactiveLayer.style.backgroundImage = `url("${url}")`;
    if (!animate) {
      inactiveLayer.style.transition = 'none';
      activeLayer.style.transition = 'none';
    }
    inactiveLayer.classList.add('is-active');
    activeLayer.classList.remove('is-active');
    if (!animate) {
      // force reflow then restore transitions
      void inactiveLayer.offsetWidth;
      inactiveLayer.style.transition = '';
      activeLayer.style.transition = '';
    }
    const tmp = activeLayer;
    activeLayer = inactiveLayer;
    inactiveLayer = tmp;
  }

  // --- compact preview pair: current (large) + next (small) ---
  const currentCard = document.createElement('div');
  currentCard.className = 'hero__preview-card hero__preview-card--current';
  const currentImg = document.createElement('img');
  currentImg.alt = '';
  currentImg.loading = 'eager';
  const currentLabel = document.createElement('span');
  currentLabel.className = 'hero__preview-card__label';
  currentCard.append(currentImg, currentLabel);

  const nextCard = document.createElement('div');
  nextCard.className = 'hero__preview-card hero__preview-card--next';
  nextCard.setAttribute('role', 'button');
  nextCard.setAttribute('tabindex', '0');
  const nextImg = document.createElement('img');
  nextImg.alt = '';
  nextImg.loading = 'lazy';
  const nextLabel = document.createElement('span');
  nextLabel.className = 'hero__preview-card__label';
  const nextTag = document.createElement('span');
  nextTag.className = 'hero__preview-card__tag';
  nextTag.textContent = 'Next';
  nextCard.append(nextImg, nextTag, nextLabel);

  stack.append(currentCard, nextCard);

  function paintCards(i) {
    const cur = SLIDES[i];
    const upcoming = SLIDES[(i + 1) % n];
    currentImg.src = cur.card;
    currentLabel.textContent = cur.cardLabel;
    nextCard.setAttribute('aria-label', `Show ${upcoming.cardLabel} slide`);
    nextImg.src = upcoming.card;
    nextLabel.textContent = upcoming.cardLabel;
  }

  // --- state ---
  let index = 0;
  let timer = null;
  let isAnimating = false;

  function renderContent(i) {
    eyebrowEl.textContent = SLIDES[i].eyebrow;
    titleEl.innerHTML = SLIDES[i].title;
    descEl.textContent = SLIDES[i].desc;
  }

  function goTo(newIndex, dir) {
    if (isAnimating || newIndex === index) return;
    isAnimating = true;
    stopAutoplay();

    index = newIndex;

    const finish = () => {
      renderContent(index);
      setBackground(index, !reduceMotion);
      if (!reduceMotion) {
        stack.classList.add('is-swapping');
        window.setTimeout(() => {
          paintCards(index);
          stack.classList.remove('is-swapping');
        }, 160);
      } else {
        paintCards(index);
      }
      if (!reduceMotion) {
        content.classList.remove('is-exiting');
        content.classList.add('is-entering');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => content.classList.remove('is-entering'));
        });
      }
      preload(SLIDES[(index + 1) % n].bg);

      window.setTimeout(
        () => {
          isAnimating = false;
          startAutoplay();
        },
        reduceMotion ? 0 : 400
      );
    };

    if (reduceMotion) {
      finish();
    } else {
      content.classList.add('is-exiting');
      window.setTimeout(finish, EXIT_DURATION);
    }
  }

  function next() {
    goTo((index + 1) % n, 1);
  }

  function prev() {
    goTo((index - 1 + n) % n, -1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, SLIDE_DURATION);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  // --- interaction ---
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  nextCard.addEventListener('click', next);
  nextCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
    }
  });

  let hoverPaused = false;
  hero.addEventListener('mouseenter', () => {
    hoverPaused = true;
    stopAutoplay();
  });
  hero.addEventListener('mouseleave', () => {
    hoverPaused = false;
    if (!isAnimating) startAutoplay();
  });

  let heroHasFocus = false;
  hero.addEventListener('focusin', () => (heroHasFocus = true));
  hero.addEventListener('focusout', () => (heroHasFocus = false));
  document.addEventListener('keydown', (e) => {
    if (!heroHasFocus) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (!hoverPaused && !isAnimating) {
      startAutoplay();
    }
  });

  // --- initial paint ---
  renderContent(0);
  activeLayer.style.backgroundImage = `url("${SLIDES[0].bg}")`;
  activeLayer.classList.add('is-active');
  preload(SLIDES[1].bg);
  paintCards(0);
  startAutoplay();
}
