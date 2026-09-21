// Instagram reel carousel — a coverflow-style row of vertical (9:16) videos.
// Only the centered/active video plays; it autoplays muted, plays for
// ROTATE_MS, then the carousel advances to the next reel automatically.
// Drop a replacement clip into videos/ with the same filename to swap one out.

const REELS = [
  { src: 'videos/reel-01.mp4' },
  { src: 'videos/reel-02.mp4' },
  { src: 'videos/reel-03.mp4' },
  { src: 'videos/reel-04.mp4' },
  { src: 'videos/reel-05.mp4' },
  { src: 'videos/reel-06.mp4' },
];

const ROTATE_MS = 7000;
const TRANSITION_MS = 550;

function reelBadge() {
  const badge = document.createElement('span');
  badge.className = 'reel-card__badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm0-2 1-2h2l1 2H4Zm4.7 0-1-2h2.4l1 2H8.7Zm4.1 0-1-2h2.4l1 2h-2.4Zm4.1 0-1-2H18l1 2h-2.1ZM10 12v5l4.5-2.5L10 12Z"/></svg>';
  return badge;
}

function muteBadge() {
  const badge = document.createElement('span');
  badge.className = 'reel-card__mute';
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M23 9 17 15M17 9l6 6"/></svg>';
  return badge;
}

export function initInstagramReels() {
  const track = document.getElementById('reelTrack');
  const prevBtn = document.getElementById('reelPrev');
  const nextBtn = document.getElementById('reelNext');
  if (!track || !prevBtn || !nextBtn) return;

  const n = REELS.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Track order: [clone(last), real 0..n-1, clone(first)] — just two extra
  // elements (not a full clone set) so we don't spin up 3x the <video> tags.
  const order = [n - 1, ...REELS.map((_, i) => i), 0];
  const cardEls = [];
  const videoEls = [];

  order.forEach((dataIndex, pos) => {
    const isClone = pos === 0 || pos === order.length - 1;
    const card = document.createElement('div');
    card.className = 'reel-card';
    card.dataset.index = String(dataIndex);
    if (!isClone) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Reel ${dataIndex + 1}`);
    } else {
      card.setAttribute('aria-hidden', 'true');
      card.setAttribute('tabindex', '-1');
    }

    const video = document.createElement('video');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-hidden', 'true');
    const source = document.createElement('source');
    source.src = REELS[dataIndex].src;
    source.type = 'video/mp4';
    video.appendChild(source);
    // Show a real first frame on inactive cards instead of a blank box.
    video.addEventListener('loadedmetadata', () => {
      if (video.currentTime === 0) {
        try {
          video.currentTime = 0.1;
        } catch (err) {
          /* ignore */
        }
      }
    });

    card.append(video, reelBadge(), muteBadge());
    track.appendChild(card);
    cardEls.push(card);
    if (!isClone) videoEls[dataIndex] = video;

    if (!isClone) {
      card.addEventListener('click', () => jumpTo(dataIndex));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          jumpTo(dataIndex);
        }
      });
    }
  });

  let pos = 1; // DOM position of the active card (offset by the leading clone)
  let active = 0;
  let timer = null;
  let isAnimating = false;

  function playActive() {
    const v = videoEls[active];
    if (!v) return;
    v.currentTime = 0;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  function stopVideo(i) {
    const v = videoEls[i];
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0.1;
    } catch (err) {
      /* ignore */
    }
  }

  function render(animate) {
    // offsetWidth ignores the CSS transform:scale() on the active card —
    // getBoundingClientRect() would not, and would throw off the step math.
    const step = cardEls[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 0);
    const containerWidth = track.parentElement.clientWidth;
    const offset = containerWidth / 2 - step / 2;
    const x = offset - pos * step;
    if (!animate || reduceMotion) track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    if (!animate || reduceMotion) {
      void track.offsetWidth;
      track.style.transition = '';
    }
    cardEls.forEach((card, i) => card.classList.toggle('is-active', i === pos));
  }

  function settle() {
    // If we've slid onto a clone, silently snap back to the matching real card.
    if (pos === 0) pos = n;
    else if (pos === order.length - 1) pos = 1;
    render(false);
    isAnimating = false;
  }

  function goTo(newActive, dir) {
    if (isAnimating || newActive === active) return;
    isAnimating = true;
    stopAutoplay();
    stopVideo(active);
    active = newActive;
    pos += dir;
    render(!reduceMotion);
    window.setTimeout(
      () => {
        settle();
        playActive();
        startAutoplay();
      },
      reduceMotion ? 0 : TRANSITION_MS
    );
  }

  function next() {
    goTo((active + 1) % n, 1);
  }

  function prev() {
    goTo((active - 1 + n) % n, -1);
  }

  function jumpTo(i) {
    if (i === active) return;
    const forwardDist = (i - active + n) % n;
    const backwardDist = (active - i + n) % n;
    goTo(i, forwardDist <= backwardDist ? 1 : -1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = window.setInterval(next, ROTATE_MS);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  let hoverPaused = false;
  const carousel = track.closest('.reel-carousel');
  carousel.addEventListener('mouseenter', () => {
    hoverPaused = true;
    stopAutoplay();
  });
  carousel.addEventListener('mouseleave', () => {
    hoverPaused = false;
    if (!isAnimating) startAutoplay();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
      stopVideo(active);
    } else if (!hoverPaused && !isAnimating) {
      playActive();
      startAutoplay();
    }
  });

  window.addEventListener('resize', () => render(false), { passive: true });

  render(false);
  playActive();
  startAutoplay();
}
