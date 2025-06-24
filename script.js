document.addEventListener("DOMContentLoaded", function() {
  // Create SVG icons for mute/unmute
  const muteIcon = `<svg viewBox="0 0 24 24"><path d="M12 4L6 10H3v4h3l6 6V4zm5.03 4.71l1.41 1.41c.78.78 1.81 1.17 2.83 1.17 1.02 0 2.05-.39 2.83-1.17l1.41-1.41c-1.55-1.55-4.1-1.55-5.66 0zm2.83-2.83l1.41 1.41C23.11 9.13 24 11.51 24 14c0 2.49-.89 4.87-2.73 6.71l-1.41-1.41C21.45 18.55 22.17 16.65 22.17 14.7c0-1.95-.72-3.85-2.17-5.3z"/></svg>`;
  const unmuteIcon = `<svg viewBox="0 0 24 24"><path d="M3 10v4h3l6 6V4L6 10H3zm13.59 6.41L15 14.83l-2.59 2.59L11 16.01l2.59-2.59L11 10.83l1.41-1.41L15 12.01l2.59-2.59L19 10.83l-2.59 2.59L19 16.01l-1.41 1.41z"/></svg>`;
  
  // Only select iframes with both video-embed and autoplay-video for autoplay logic
  const autoplayIframes = Array.from(document.querySelectorAll('iframe.video-embed.autoplay-video'));
  const allIframes = Array.from(document.querySelectorAll('iframe.video-embed'));
  // Initialize players with proper options for reliable autoplay
  const players = allIframes.map(iframe => {
    // Create mute button for each video
    const muteButton = document.createElement('button');
    muteButton.className = 'mute-button';
    muteButton.innerHTML = `${unmuteIcon} <span>Unmute</span>`;
    iframe.parentElement.appendChild(muteButton);
    
    const options = {
      muted: true,
      loop: true,
      autopause: false,
      background: false,
      playsinline: true,
      controls: false,
      title: false,
      byline: false,
      portrait: false
    };

    // Modify URL parameters for autoplay videos
    if (iframe.classList.contains('autoplay-video')) {
      let src = new URL(iframe.src);
      src.searchParams.set('autoplay', '1');
      src.searchParams.set('muted', '1');
      src.searchParams.set('controls', '0');
      iframe.src = src.toString();
    }

    return new Vimeo.Player(iframe, options);
  });

  let currentPlayingIdx = null;

  // Set initial opacity for all videos
  allIframes.forEach(iframe => iframe.classList.remove('in-view'));

  // Utility to update mute button UI
  function updateMuteButtonUI(player, muteButton) {
    player.getMuted().then(isMuted => {
      if (isMuted) {
        muteButton.innerHTML = `${unmuteIcon} <span>Unmute</span>`;
      } else {
        muteButton.innerHTML = `${muteIcon} <span>Mute</span>`;
      }
    });
  }

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
        // Add mute button click handler
        const muteButton = firstAutoplay.parentElement.querySelector('.mute-button');
        if (muteButton) {
          muteButton.addEventListener('click', async () => {
            try {
              const muted = await players[idx].getMuted();
              if (muted) {
                await players[idx].setMuted(false);
                await players[idx].setVolume(1.0);
              } else {
                await players[idx].setMuted(true);
                await players[idx].setVolume(0);
              }
              updateMuteButtonUI(players[idx], muteButton);
            } catch (error) {
              console.error('Error toggling mute state:', error);
            }
          });
          // Initial sync
          updateMuteButtonUI(players[idx], muteButton);
        }
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
          players[currentPlayingIdx].setMuted(true).then(() => {
            const muteButton = allIframes[currentPlayingIdx].parentElement.querySelector('.mute-button');
            if (muteButton) updateMuteButtonUI(players[currentPlayingIdx], muteButton);
          });
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
            players[idx].setMuted(true).then(() => {
              const muteButton = allIframes[idx].parentElement.querySelector('.mute-button');
              if (muteButton) updateMuteButtonUI(players[idx], muteButton);
            });
          }).catch(() => {});
        }
      }
    });
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: Array.from({length: 101}, (_, i) => i / 100)
  });

  allIframes.forEach((iframe, index) => {
    observer.observe(iframe);
    // Add mute button click handler for all videos
    const muteButton = iframe.parentElement.querySelector('.mute-button');
    if (muteButton) {
      muteButton.addEventListener('click', async () => {
        try {
          const muted = await players[index].getMuted();
          if (muted) {
            await players[index].setMuted(false);
            await players[index].setVolume(1.0);
          } else {
            await players[index].setMuted(true);
            await players[index].setVolume(0);
          }
          updateMuteButtonUI(players[index], muteButton);
        } catch (error) {
          console.error('Error toggling mute state:', error);
        }
      });
      // Initial sync
      updateMuteButtonUI(players[index], muteButton);
    }
  });

  // --- Robust LinkedIn .social-gallery fade logic (no impact on other sections) ---
  const socialGalleries = Array.from(document.querySelectorAll('.social-gallery'));
  let currentVisibleGallery = null;
  let fadeInTimeouts = [];
  const intersectionRatios = new Map();
  const galleryObserver = new IntersectionObserver((entries) => {
    // Update intersection ratios for all observed sections
    entries.forEach(entry => {
      intersectionRatios.set(entry.target, entry.intersectionRatio);
    });
    // Find the section with the highest ratio > 0
    let maxRatio = 0;
    let mostVisible = null;
    intersectionRatios.forEach((ratio, section) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostVisible = section;
      }
    });
    // If at least one is in view, show the most visible one
    if (mostVisible) {
      if (currentVisibleGallery !== mostVisible) {
        // Instantly fade out all iframes in all sections
        socialGalleries.forEach(section => {
          const wrappers = Array.from(section.querySelectorAll('.linkedin-wrapper'));
          wrappers.forEach(wrapper => {
            const iframe = wrapper.querySelector('iframe');
            if (iframe) iframe.classList.remove('fade-visible');
          });
        });
        // Clear any pending fade-in timeouts
        fadeInTimeouts.forEach(t => clearTimeout(t));
        fadeInTimeouts = [];
        // Fade in the most visible section's iframes staggered
        const wrappers = Array.from(mostVisible.querySelectorAll('.linkedin-wrapper'));
        wrappers.forEach((wrapper, i) => {
          const timeout = setTimeout(() => {
            const iframe = wrapper.querySelector('iframe');
            if (iframe) iframe.classList.add('fade-visible');
          }, i * 350);
          fadeInTimeouts.push(timeout);
        });
        currentVisibleGallery = mostVisible;
      }
    } else {
      // If none are in view, fade out all
      socialGalleries.forEach(section => {
        const wrappers = Array.from(section.querySelectorAll('.linkedin-wrapper'));
        wrappers.forEach(wrapper => {
          const iframe = wrapper.querySelector('iframe');
          if (iframe) iframe.classList.remove('fade-visible');
        });
      });
      fadeInTimeouts.forEach(t => clearTimeout(t));
      fadeInTimeouts = [];
      currentVisibleGallery = null;
    }
  }, { threshold: Array.from({length: 101}, (_, i) => i / 100) });
  socialGalleries.forEach(section => {
    Array.from(section.querySelectorAll('.linkedin-wrapper iframe')).forEach(f => f.classList.remove('fade-visible'));
    galleryObserver.observe(section);
    intersectionRatios.set(section, 0);
  });

  // Disable scrollbars on all LinkedIn embeds
  document.querySelectorAll('.linkedin-wrapper iframe').forEach(iframe => {
    iframe.setAttribute('scrolling', 'no');
    // For extra robustness, also set style
    iframe.style.overflow = 'hidden';
  });
});

// Unlock testimonial scroll on 'More' click
function setupTestimonialMoreButton() {
  var wrapper = document.querySelector('.testimonial-wrapper');
  var moreLabel = wrapper ? wrapper.querySelector('.more-label') : null;
  if (!wrapper || !moreLabel) return;

  // Prevent scroll initially
  wrapper.classList.remove('scrolling');

  moreLabel.addEventListener('click', function() {
    wrapper.classList.add('scrolling');
    // Animate scroll to bottom
    wrapper.scrollTo({
      top: wrapper.scrollHeight,
      behavior: 'smooth'
    });
    // Hide the label
    moreLabel.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', setupTestimonialMoreButton);