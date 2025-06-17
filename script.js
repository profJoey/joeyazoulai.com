document.addEventListener("DOMContentLoaded", function() {
  // Use SVGs from assets/icons for mute/unmute
  const muteIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/></svg>`;
  const unmuteIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`;
  
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