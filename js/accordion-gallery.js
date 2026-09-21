// "Accordion gallery" — vanilla JS + GSAP port of React Bits'
// AccordionGallery component. Hover (desktop) or tap (touch) brings a
// photo forward; only one panel is ever expanded at a time.

// Each item points at exactly one file in images/gallery/ — drop a
// replacement photo in with the same filename and it just works, no
// other sizes/formats to regenerate.
const ITEMS = [
  {
    image: 'images/gallery/curtains-01.jpg',
    label: 'Sheer & Drape',
    category: 'curtains',
    alt: 'Layered sheer and drape curtains with tiebacks in a Malerkotla bedroom',
  },
  {
    image: 'images/gallery/bedding-01.jpg',
    label: 'Bed Linen',
    category: 'linen',
    alt: 'Bed linen styling with a backlit custom fabric headboard mural',
  },
  {
    image: 'images/gallery/upholstery-01.jpg',
    label: 'Upholstery',
    category: 'upholstery',
    alt: 'Custom green velvet upholstered banquette seating',
  },
  {
    image: 'images/gallery/curtains-02.jpg',
    label: 'Tailored Curtains',
    category: 'curtains',
    alt: 'Custom-fitted curtains dressing a living room window',
  },
  {
    image: 'images/gallery/bedding-02.jpg',
    label: 'Linen Styling',
    category: 'linen',
    alt: 'Coordinated cushions and quilt styled on a made bed',
  },
  {
    image: 'images/gallery/upholstery-02.jpg',
    label: 'Sofa Rework',
    category: 'upholstery',
    alt: 'Reupholstered seating in a commercial lounge setting',
  },
];

const CONFIG = {
  defaultIndex: 2,
  accentColor: 'var(--color-accent)',
  overlayColor: 'var(--color-ink)',
  textColor: 'var(--color-dark-text)',
  gap: 10,
  radius: 16,
  expandRatio: 0.6,
  duration: 0.6,
  ease: 'power3.out',
  parallax: 0.5,
  tilt: 8,
  stagger: 0.06,
  showLabels: true,
  grayscale: true,
};

function heightForWidth(w) {
  if (w >= 1440) return 560;
  if (w >= 768) return 460;
  return 380;
}

// Below this width the accordion switches to a vertical stack so tapping/hovering
// a panel actually grows it taller, instead of a horizontal row of thin strips.
const VERTICAL_BREAKPOINT = 520;
const VERTICAL_HEIGHT = 1;

export function initAccordionGallery() {
  const root = document.getElementById('ourWorkGallery');
  if (!root) return;

  const items = ITEMS;
  const count = items.length;
  const { gap, radius, expandRatio, duration, ease, parallax, tilt, stagger, showLabels, grayscale } = CONFIG;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';

  let active = Math.min(Math.max(CONFIG.defaultIndex, 0), count - 1);
  let mediaSize = 320;
  let timeline = null;
  let firstRun = true;
  let vertical = false;
  let hoverTimer = null;

  root.style.setProperty('--ag-accent', CONFIG.accentColor);
  root.style.setProperty('--ag-overlay', CONFIG.overlayColor);
  root.style.setProperty('--ag-text', CONFIG.textColor);
  root.style.setProperty('--ag-gap', `${gap}px`);
  root.style.setProperty('--ag-radius', `${radius}px`);
  root.setAttribute('role', 'list');
  root.setAttribute('aria-label', 'Our work image gallery');

  const panels = [];
  const medias = [];
  const bars = [];
  const texts = [];

  items.forEach((item, i) => {
    const panel = document.createElement('div');
    panel.className = 'ag-panel';
    panel.style.borderRadius = `${radius}px`;
    panel.setAttribute('role', 'listitem');
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('aria-label', item.label || '');

    const frame = document.createElement('span');
    frame.className = 'ag-panel__frame';

    const media = document.createElement('span');
    media.className = 'ag-panel__media';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.alt || item.label || '';
    img.draggable = false;
    img.loading = 'lazy';
    media.appendChild(img);

    const overlay = document.createElement('span');
    overlay.className = 'ag-panel__overlay';
    overlay.setAttribute('aria-hidden', 'true');

    frame.append(media, overlay);
    panel.appendChild(frame);

    if (showLabels) {
      const labelWrap = document.createElement('span');
      labelWrap.className = 'ag-panel__label';
      labelWrap.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('span');
      bar.className = 'ag-panel__bar';
      const text = document.createElement('span');
      text.className = 'ag-panel__text';
      text.textContent = item.label || '';
      labelWrap.append(bar, text);
      panel.appendChild(labelWrap);
      bars.push(bar);
      texts.push(text);
    } else {
      bars.push(null);
      texts.push(null);
    }

    root.appendChild(panel);
    panels.push(panel);
    medias.push(media);

    // A brief hover-intent delay so sweeping the cursor across the strip to
    // reach a panel doesn't flip the active image along the way — clicking
    // (or genuinely pausing on a panel) is what changes the focus.
    panel.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => setActive(i), 160);
    });
    panel.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
    });
    panel.addEventListener('focus', () => setActive(i));
    panel.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      setActive(i);
    });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        panels[(i + 1) % count].focus();
        setActive((i + 1) % count);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        panels[(i - 1 + count) % count].focus();
        setActive((i - 1 + count) % count);
      }
    });
  });

  function applyLayout(animate) {
    const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
    const dur = animate && !reduceMotion ? duration : 0;

    if (hasGsap) timeline?.kill();
    const tl = hasGsap ? window.gsap.timeline() : null;

    panels.forEach((panel, i) => {
      const isActive = i === active;
      const media = medias[i];
      const bar = bars[i];
      const text = texts[i];
      const rot = isActive ? 0 : i < active ? tilt : -tilt;
      const drift = Math.max(-1.5, Math.min(1.5, active - i));
      const shift = drift * parallax * mediaSize * 0.06;
      // Inactive panels stay only partly desaturated/dimmed (not full grayscale
      // + heavy overlay) so the gallery reads as bright rather than dull.
      const gray = grayscale ? (isActive ? 0 : 0.5) : 0;

      panel.classList.toggle('ag-panel--active', isActive);
      if (isActive) panel.setAttribute('aria-current', 'true');
      else panel.removeAttribute('aria-current');

      const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };
      const shiftX = vertical ? 0 : isActive ? 0 : shift;
      const shiftY = vertical ? (isActive ? 0 : shift) : 0;

      if (!vertical) {
        panel.style.flex = '';
        panel.style.flexBasis = '';
      }

      if (hasGsap) {
        const panelSize = vertical
          ? { flexGrow: isActive ? 0 : 1, flexBasis: isActive ? '60%' : '0%' }
          : { flexGrow: isActive ? grow : 1 };
        tl.to(panel, { ...panelSize, ...rotProp, duration: dur, ease }, 0);
        tl.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: shiftX,
            y: shiftY,
            '--ag-gray': gray,
            '--ag-dim': isActive ? 0 : 0.16,
            duration: dur,
            ease,
          },
          0
        );
        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: reduceMotion ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      } else {
        // GSAP failed to load (e.g. blocked CDN) — apply state instantly, no animation.
        const rotAxis = vertical ? 'rotateX' : 'rotateY';
        const rotDeg = vertical ? -rot : rot;
        if (vertical) {
          panel.style.flex = isActive ? '0 0 60%' : '1 1 0';
        } else {
          panel.style.flexGrow = isActive ? grow : 1;
        }
        panel.style.transform = `${rotAxis}(${rotDeg}deg)`;
        media.style.transform = `translate(-50%, -50%) translate(${shiftX}px, ${shiftY}px)`;
        media.style.setProperty('--ag-gray', gray);
        media.style.setProperty('--ag-dim', isActive ? 0 : 0.16);
        if (bar && text) {
          bar.style.opacity = isActive ? 1 : 0;
          text.style.opacity = isActive ? 1 : 0;
          bar.style.transform = text.style.transform = isActive ? 'translateX(0)' : 'translateX(-14px)';
        }
      }
    });

    if (hasGsap) timeline = tl;
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    applyLayout(true);
  }

  function measure() {
    const w = window.innerWidth;
    const nowVertical = w <= VERTICAL_BREAKPOINT;
    if (nowVertical !== vertical) {
      vertical = nowVertical;
      root.classList.toggle('accordion-gallery--vertical', vertical);
    }
    const galleryHeight = vertical
      ? Math.max(360, Math.round(window.innerHeight * VERTICAL_HEIGHT))
      : heightForWidth(w);
    root.style.height = `${galleryHeight}px`;

    const rect = root.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    const usable = Math.max(total - gap * (count - 1), 120);
    mediaSize = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
    root.style.setProperty('--ag-media-size', `${mediaSize}px`);
    applyLayout(!firstRun);
  }

  measure();
  firstRun = false;

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(root);
  } else {
    window.addEventListener('resize', measure, { passive: true });
  }

  // Let the "What We Do" service cards jump straight to their matching
  // photo in this gallery instead of just landing on the section.
  document.querySelectorAll('[data-gallery-category]').forEach((link) => {
    const category = link.getAttribute('data-gallery-category');
    const index = items.findIndex((item) => item.category === category);
    if (index === -1) return;
    link.addEventListener('click', () => setActive(index));
  });
}
