document.addEventListener("DOMContentLoaded", function() {
  // Only select iframes with both video-embed and autoplay-video for autoplay logic
  const autoplayIframes = Array.from(document.querySelectorAll('iframe.video-embed.autoplay-video'));
  const allIframes = Array.from(document.querySelectorAll('iframe.video-embed'));
  const players = allIframes.map(iframe => new Vimeo.Player(iframe, {muted: true, loop: true}));
  let currentPlayingIdx = null;

  // Set initial opacity for all videos
  allIframes.forEach(iframe => iframe.classList.remove('in-view'));

  // Add mute button functionality
  document.querySelectorAll('.mute-button').forEach((button, index) => {
    button.addEventListener('click', () => {
      const muteIcon = button.querySelector('.mute-icon');
      const unmuteIcon = button.querySelector('.unmute-icon');
      
      players[index].getMuted().then(muted => {
        if (muted) {
          players[index].setMuted(false);
          muteIcon.style.display = 'none';
          unmuteIcon.style.display = 'block';
        } else {
          players[index].setMuted(true);
          muteIcon.style.display = 'block';
          unmuteIcon.style.display = 'none';
        }
      });
    });
  });

  // Function to update mute button state
  function updateMuteButton(index, muted) {
    const button = allIframes[index].parentElement.querySelector('.mute-button');
    if (button) {
      const muteIcon = button.querySelector('.mute-icon');
      const unmuteIcon = button.querySelector('.unmute-icon');
      muteIcon.style.display = muted ? 'block' : 'none';
      unmuteIcon.style.display = muted ? 'none' : 'block';
    }
  }

  // If there are autoplay videos, play the first one on load
  if (autoplayIframes.length > 0) {
    const firstAutoplay = autoplayIframes[0];
    const idx = allIframes.indexOf(firstAutoplay);
    if (idx !== -1) {
      players[idx].play().catch(() => {});
      firstAutoplay.classList.add('in-view');
      currentPlayingIdx = idx;
      updateMuteButton(idx, true);
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
          updateMuteButton(currentPlayingIdx, true);
        }).catch(() => {});
        allIframes[currentPlayingIdx].classList.remove('in-view');
      }
      // Play the new one (already muted from initialization)
      players[newIdx].play().catch(() => {});
      allIframes[newIdx].classList.add('in-view');
      currentPlayingIdx = newIdx;
      updateMuteButton(newIdx, true);
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
            updateMuteButton(idx, true);
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