// Data-driven "timed cards" hero showcase: crossfading background,
// staggered text, a sliding card filmstrip, autoplay + progress bar.
// One coordinated transition per slide change, per the reference spec.

// Each slide points at exactly one hero photo and one gallery thumbnail —
// drop a replacement in images/hero/ or images/gallery/ with the same
// filename and it just works, no other sizes/formats to regenerate.
const SLIDES = [
  {
    eyebrow: 'Living Room · Malerkotla',
    title: 'Sheer &amp; Drape Curtains',
    desc: 'Layered curtains stitched to your windows, in fabric you choose.',
    bg: 'images/hero/hero-01.jpg',
    card: 'images/gallery/curtains-01.jpg',
    cardLabel: 'Curtains',
  },
  {
    eyebrow: 'Bedroom · Malerkotla',
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
    eyebrow: 'Living Room · Malerkotla',
    title: 'Tailored Curtains',
    desc: 'Custom curtains fitted to every window, from measure to install.',
    bg: 'images/hero/hero-04.jpg',
    card: 'images/gallery/curtains-02.jpg',
    cardLabel: 'Curtains',
  },
  {
    eyebrow: 'Bedroom · Malerkotla',
    title: 'Curtain Nooks',
    desc: 'Sheers and drapes tailored to fit any nook or corner.',
    bg: 'images/hero/hero-05.jpg',
    card: 'images/gallery/curtains-03.jpg',
    cardLabel: 'Curtains',
  },
];

const SLIDE_DURATION = 4000;
const EXIT_DURATION = 320;
const CLONE_SETS = 3; // render 3x the data so the card strip can slide continuously without a visible reset

export function initHeroShowcase() {
  const hero = document.getElementById('hero');
  const bgRoot = document.getElementById('heroBg');
  const content = document.getElementById('heroContent');
  const eyebrowEl = document.getElementById('heroEyebrow');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');
  const track = document.getElementById('heroCardsTrack');
  const progressBar = document.getElementById('heroProgressBar');
  const slideNumEl = document.getElementById('heroSlideNum');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (!hero || !bgRoot || !content || !track) return;

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

  // --- card filmstrip (cloned 3x for seamless infinite sliding) ---
  const cardEls = [];
  for (let set = 0; set < CLONE_SETS; set++) {
    SLIDES.forEach((slide, i) => {
      const card = document.createElement('div');
      card.className = 'hero__card';
      card.dataset.index = String(i);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', slide.cardLabel);
      const img = document.createElement('img');
      img.src = slide.card;
      img.alt = '';
      img.loading = 'lazy';
      const label = document.createElement('span');
      label.className = 'hero__card__label';
      label.textContent = slide.cardLabel;
      card.append(img, label);
      track.appendChild(card);
      cardEls.push(card);
    });
  }

  const middleSetStart = n * Math.floor(CLONE_SETS / 2);
  let trackPos = middleSetStart; // absolute position within the cloned array

  function cardMetrics() {
    // offsetWidth ignores the CSS transform: scale() on active/inactive cards,
    // unlike getBoundingClientRect() — we want the untransformed layout box.
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cardEls[0].offsetWidth + gap;
  }

  function renderTrack(animate) {
    const step = cardMetrics();
    const containerWidth = track.parentElement.clientWidth;
    const offset = containerWidth / 2 - step / 2; // center the active card
    const x = offset - trackPos * step;
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    if (!animate) {
      void track.offsetWidth;
      track.style.transition = '';
    }
    cardEls.forEach((card, i) => {
      card.classList.toggle('is-active', i === trackPos);
    });
  }

  // --- progress bar ---
  function restartProgress() {
    progressBar.classList.remove('is-animating');
    void progressBar.offsetWidth;
    progressBar.style.setProperty('--hero-slide-duration', `${SLIDE_DURATION}ms`);
    if (!reduceMotion) progressBar.classList.add('is-animating');
  }

  // --- state ---
  let index = 0;
  let timer = null;
  let isAnimating = false;

  function renderContent(i) {
    eyebrowEl.textContent = SLIDES[i].eyebrow;
    titleEl.innerHTML = SLIDES[i].title;
    descEl.textContent = SLIDES[i].desc;
    slideNumEl.textContent = String(i + 1).padStart(2, '0');
  }

  function goTo(newIndex, dir) {
    if (isAnimating || newIndex === index) return;
    isAnimating = true;
    stopAutoplay();

    trackPos += dir;
    index = newIndex;

    const finish = () => {
      renderContent(index);
      setBackground(index, !reduceMotion);
      renderTrack(!reduceMotion);
      restartProgress();
      if (!reduceMotion) {
        content.classList.remove('is-exiting');
        content.classList.add('is-entering');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => content.classList.remove('is-entering'));
        });
      }
      preload(SLIDES[(index + 1) % n].bg);

      // if we've drifted into an outer clone set, silently recenter once settled
      window.setTimeout(() => {
        const wantedPos = middleSetStart + index;
        if (trackPos !== wantedPos) {
          trackPos = wantedPos;
          renderTrack(false);
        }
        isAnimating = false;
        startAutoplay();
      }, reduceMotion ? 0 : 950);
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

  track.addEventListener('click', (e) => {
    const card = e.target.closest('.hero__card');
    if (!card) return;
    const cardIndex = Number(card.dataset.index);
    if (cardIndex === index) return;
    const dir = cardIndex > index || (index === n - 1 && cardIndex === 0) ? 1 : -1;
    goTo(cardIndex, dir);
  });

  track.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.hero__card');
    if (!card) return;
    e.preventDefault();
    card.click();
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

  window.addEventListener(
    'resize',
    () => {
      renderTrack(false);
    },
    { passive: true }
  );

  // --- initial paint ---
  renderContent(0);
  activeLayer.style.backgroundImage = `url("${SLIDES[0].bg}")`;
  activeLayer.classList.add('is-active');
  preload(SLIDES[1].bg);
  renderTrack(false);
  restartProgress();
  startAutoplay();
}
