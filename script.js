document.addEventListener("DOMContentLoaded", function() {
  // Only select iframes with both video-embed and autoplay-video for autoplay logic
  const autoplayIframes = Array.from(document.querySelectorAll('iframe.video-embed.autoplay-video'));
  const allIframes = Array.from(document.querySelectorAll('iframe.video-embed'));
  // Initialize players with proper options for reliable autoplay
  const players = allIframes.map(iframe => {
    const options = {
      muted: true,
      loop: true,
      autopause: false,
      background: true,
      playsinline: true,
      controls: false
    };

    // Modify URL parameters for autoplay videos
    if (iframe.classList.contains('autoplay-video')) {
      let src = new URL(iframe.src);
      src.searchParams.set('autoplay', '1');
      src.searchParams.set('muted', '1');
      src.searchParams.set('controls', '1');
      iframe.src = src.toString();
    }

    return new Vimeo.Player(iframe, options);
  });

  let currentPlayingIdx = null;

  // Set initial opacity for all videos
  allIframes.forEach(iframe => iframe.classList.remove('in-view'));

  // Initialize first video immediately
  if (autoplayIframes.length > 0) {
    const firstAutoplay = autoplayIframes[0];
    const idx = allIframes.indexOf(firstAutoplay);
    if (idx !== -1) {
      players[idx].ready().then(() => {
        console.log('First player ready');
        return players[idx].setVolume(0);
      }).then(() => {
        console.log('Volume set to 0');
        return players[idx].play();
      }).then(() => {
        console.log('First video playing');
        firstAutoplay.classList.add('in-view');
        currentPlayingIdx = idx;
      }).catch(error => {
        console.error('Error initializing first video:', error);
      });
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
      // Pause and mute the old autoplay video
      if (currentPlayingIdx !== null) {
        players[currentPlayingIdx].pause().then(() => {
          players[currentPlayingIdx].setMuted(true);
        }).catch(() => {});
        allIframes[currentPlayingIdx].classList.remove('in-view');
      }
      // Play the new one (already muted from initialization)
      players[newIdx].play().catch(() => {});
      allIframes[newIdx].classList.add('in-view');
      currentPlayingIdx = newIdx;
    }

    // Opacity animation for all videos: in-view if at least 80% visible
    entries.forEach(entry => {
      const idx = allIframes.indexOf(entry.target);
      if (entry.intersectionRatio >= 0.8) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
        // Mute videos when they leave viewport
        if (idx !== -1) {
          players[idx].pause().then(() => {
            players[idx].setMuted(true);
          }).catch(() => {});
        }
      }
    });
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: Array.from({length: 101}, (_, i) => i / 100)
  });

  allIframes.forEach(iframe => observer.observe(iframe));

  // Logo carousel logic removed for static display
});