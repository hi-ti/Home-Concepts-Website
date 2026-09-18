// Reviews carousel — horizontal scroll-snap row with floating prev/next
// buttons that hide themselves at either end of the track.
export function initReviewsCarousel() {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  if (!track || !prevBtn || !nextBtn) return;

  function step() {
    const card = track.querySelector('.review-card');
    if (!card) return track.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function sync() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    prevBtn.toggleAttribute('disabled', track.scrollLeft <= 4);
    nextBtn.toggleAttribute('disabled', track.scrollLeft >= maxScroll - 4);
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync, { passive: true });
  sync();
}
