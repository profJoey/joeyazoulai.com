document.addEventListener("DOMContentLoaded", function() {
  // Only select iframes with both video-embed and autoplay-video for autoplay logic
  const autoplayIframes = Array.from(document.querySelectorAll('iframe.video-embed.autoplay-video'));
  const allIframes = Array.from(document.querySelectorAll('iframe.video-embed'));
  const players = allIframes.map(iframe => new Vimeo.Player(iframe, {muted: true, loop: true}));
  let currentPlayingIdx = null;

  // Set initial opacity for all videos
  allIframes.forEach(iframe => iframe.classList.remove('in-view'));

  // If there are autoplay videos, play the first one on load
  if (autoplayIframes.length > 0) {
    const firstAutoplay = autoplayIframes[0];
    const idx = allIframes.indexOf(firstAutoplay);
    if (idx !== -1) {
      players[idx].play().catch(() => {});
      firstAutoplay.classList.add('in-view');
      currentPlayingIdx = idx;
    }
  }

  function handleIntersect(entries) {
    // Only consider autoplay videos for autoplay logic
    let newIdx = currentPlayingIdx;
    entries.forEach(entry => {
      if (entry.target.classList.contains('autoplay-video') && entry.intersectionRatio >= 0.9) {
        const idx = allIframes.indexOf(entry.target);
        if (idx !== -1) newIdx = idx;
      }
    });

    if (newIdx !== currentPlayingIdx && newIdx !== null) {
      // Pause the old autoplay video
      if (currentPlayingIdx !== null) {
        players[currentPlayingIdx].pause();
        allIframes[currentPlayingIdx].classList.remove('in-view');
      }
      // Play the new one
      players[newIdx].play().catch(() => {});
      allIframes[newIdx].classList.add('in-view');
      currentPlayingIdx = newIdx;
    }

    // Opacity animation for all videos: in-view if at least 90% visible
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.8) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: Array.from({length: 101}, (_, i) => i / 100)
  });

  allIframes.forEach(iframe => observer.observe(iframe));

  // Logo carousel logic
  const track = document.querySelector('.logo-track');
  const logos = Array.from(document.querySelectorAll('.logo-img'));
  const visibleCount = 3;
  let currentIndex = 0;
  let intervalId;

  function updateCarousel() {
    const logoWidth = logos[0]?.offsetWidth || 120;
    const gap = parseFloat(getComputedStyle(logos[0]).marginRight) || 8;
    const moveX = (logoWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${moveX}px)`;
  }

  function nextSlide() {
    currentIndex++;
    if (currentIndex > logos.length - visibleCount) {
      currentIndex = 0;
    }
    updateCarousel();
  }

  function startCarousel() {
    intervalId = setInterval(nextSlide, 2200);
  }

  function stopCarousel() {
    clearInterval(intervalId);
  }

  if (track && logos.length > visibleCount) {
    updateCarousel();
    startCarousel();
    track.addEventListener('mouseenter', stopCarousel);
    track.addEventListener('mouseleave', startCarousel);
    window.addEventListener('resize', updateCarousel);
  }
});