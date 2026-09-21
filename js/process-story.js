// "Our Process" scroll-driven story: a sticky image panel on desktop that
// cross-fades between photos as the matching step scrolls through the
// center of the viewport, plus a subtle scroll-linked parallax drift.
// On mobile each step carries its own inline image instead (no sticky panel).

// Swap an `image` path to replace a step's photo — nothing else to update.
const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Choose',
    description: 'Explore fabrics, textures and colours that complement your space.',
    image: 'images/gallery/upholstery-01.jpg',
    alt: 'Close-up of upholstery fabric texture and colour',
  },
  {
    number: '02',
    title: 'Measure',
    description: 'We take precise on-site measurements so everything fits exactly as it should.',
    image: 'images/gallery/curtains-02.jpg',
    alt: 'Curtain track and window ready for fitting',
  },
  {
    number: '03',
    title: 'Customize',
    description: 'Your chosen fabric is shaped and finished specifically for your space.',
    image: 'images/gallery/curtains-03.jpg',
    alt: 'Custom curtain trim and detail work',
  },
  {
    number: '04',
    title: 'Install',
    description: 'Our team handles the final installation and leaves your space ready to enjoy.',
    image: 'images/gallery/curtains-01.jpg',
    alt: 'Finished curtain installation in a bedroom',
  },
];

const DESKTOP_QUERY = '(min-width: 1040px)';
const PARALLAX_RANGE = 36; // total px of image drift across a step's scroll span
const TEXT_PARALLAX_RANGE = 16;

export function initProcessStory() {
  const root = document.getElementById('processStory');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = PROCESS_STEPS.length;

  root.classList.add('process-story');

  const visual = document.createElement('div');
  visual.className = 'process-story__visual';
  visual.setAttribute('aria-hidden', 'true');
  const frame = document.createElement('div');
  frame.className = 'process-story__frame';
  visual.appendChild(frame);

  const list = document.createElement('ol');
  list.className = 'process-story__list';

  const images = [];
  const stepEls = [];

  PROCESS_STEPS.forEach((step, i) => {
    const img = document.createElement('img');
    img.className = 'process-story__image';
    img.src = step.image;
    img.alt = '';
    img.loading = i === 0 ? 'eager' : 'lazy';
    if (i === 0) img.classList.add('is-active');
    frame.appendChild(img);
    images.push(img);

    const li = document.createElement('li');
    li.className = 'process-story__step';
    li.dataset.index = String(i);
    if (i === 0) li.classList.add('is-active');

    const media = document.createElement('div');
    media.className = 'process-story__step-media';
    const mImg = document.createElement('img');
    mImg.src = step.image;
    mImg.alt = step.alt;
    mImg.loading = 'lazy';
    media.appendChild(mImg);

    const body = document.createElement('div');
    body.className = 'process-story__step-body';
    const num = document.createElement('span');
    num.className = 'process-story__num';
    num.textContent = step.number;
    const title = document.createElement('h3');
    title.className = 'process-story__title';
    title.textContent = step.title;
    const desc = document.createElement('p');
    desc.className = 'process-story__desc';
    desc.textContent = step.description;
    body.append(num, title, desc);

    li.append(media, body);
    list.appendChild(li);
    stepEls.push(li);
  });

  root.append(visual, list);

  let active = 0;

  function setActive(i) {
    if (i === active) return;
    const prevBody = stepEls[active]?.querySelector('.process-story__step-body');
    if (prevBody) prevBody.style.transform = '';
    active = i;
    stepEls.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    images.forEach((img, idx) => img.classList.toggle('is-active', idx === i));
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.dataset.index));
            entry.target.classList.add('is-seen');
          }
        });
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 }
    );
    stepEls.forEach((el) => observer.observe(el));
  } else {
    stepEls.forEach((el) => el.classList.add('is-seen'));
  }

  if (reduceMotion) return;

  // Subtle parallax: nudge the sticky image and the active step's text as
  // that step's <li> scrolls through the viewport. Desktop only — on mobile
  // the sticky panel isn't used, so there's nothing to drift.
  let ticking = false;

  function applyParallax() {
    ticking = false;
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;
    const el = stepEls[active];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const progress = Math.min(1, Math.max(0, 1 - center / window.innerHeight));
    const imageShift = (progress - 0.5) * PARALLAX_RANGE;
    const textShift = (progress - 0.5) * TEXT_PARALLAX_RANGE;
    frame.style.transform = `translateY(${imageShift.toFixed(1)}px)`;
    el.querySelector('.process-story__step-body').style.transform = `translateY(${textShift.toFixed(1)}px)`;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', applyParallax, { passive: true });
  applyParallax();
}
