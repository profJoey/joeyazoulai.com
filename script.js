document.addEventListener("DOMContentLoaded", function () {
  // Try to find the buy button after DOM is loaded
  const buyButton = document.getElementById("purchase-btn");
  console.log("Buy button found:", buyButton); // Debug log to check if button exists

  if (buyButton) {
    buyButton.addEventListener("click", function () {
      console.log("Buy button clicked");
      fathom.trackEvent("buy-button-click");
      window.location.href = "https://buy.stripe.com/cNibJ12gcdsmd4t5709fW04";
    });
  } else {
    console.error("Buy button not found - check your HTML class name");
  }

  // Check for charity-footprints URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("charity-footprints")) {
    fathom.trackEvent("charity-footprints");
    const promoText = document.querySelector(".promo-text");
    const discountPrice = document.querySelector(".discount-price");
    const fullPrice = document.querySelector(".full-price");
    const removableLineItem = document.querySelector(".removable-line-item");
    const charityLineItem = document.querySelector("li.charity-footprints");
    const subText = document.querySelector(".button-subtext");
    if (promoText) {
      promoText.classList.add("charity-footprints");
    }
    if (discountPrice) {
      discountPrice.classList.add("charity-footprints");
    }
    if (fullPrice) {
      fullPrice.classList.add("charity-footprints");
    }
    if (removableLineItem) {
      removableLineItem.classList.add("charity-footprints");
    }
    if (charityLineItem) {
      charityLineItem.classList.add("charity-footprints");
    }
    if (subText) {
      subText.innerHTML = "Pay $380 Deposit";
    }
  } else if (urlParams.has("portfolio")) {
    fathom.trackEvent("portfolio");
    const heroText = document.querySelector(".hero-text");
    const purchaseDetails = document.querySelector(".purchase-details");
    const heroDescription = document.querySelector(".hero-description");
    const aboutSectionDescription = document.querySelector("#about-section .description");
    const interviewSectionDescription = document.querySelector("#interview-section .description");
    if (heroText) {
      heroText.innerHTML = "Content Strategy & Production";
    }
    if (heroDescription) {
      heroDescription.innerHTML = "<h3>Attract and nurture supporters!</h3><p>Help supporters connect with your organization by giving them a face, a voice, and a story to connect with.</p><p>Joey interviews your stakeholders to craft content that wins hearts and minds.</p>";
    }
    if (interviewSectionDescription) {
      interviewSectionDescription.innerHTML = "<h3>Create high-quality content with your stakeholders remotely.</h3><p>I create content with program alums, donors, staff, and partners no matter where in the world they are. Each interview is an opportunity to capture authentic stories and insights. I craft this raw material into a complete marketing content library.</p>";
    }
    if (aboutSectionDescription) {
      aboutSectionDescription.innerHTML = "<h3>I love working with nonprofits!</h3><p>As a former Director of Media & Content for a digital agency, my team and I bridged the marketing and programmatic needs for clients like Harvard Law, Bridgespan, and Microsoft. My favorite clients were always the mission-driven organizations. Now my focus is on making impactful media accessible to organizations of all sizes. I also teach the next generation of media and technology experts at NYU and Columbia. I am always learning and always sharing what I learn. Join me!</p>";
    }
    if (purchaseDetails) {
      purchaseDetails.innerHTML = `
        <button id="msg-me-btn" class="buy-btn" onclick="window.location.href='https://www.linkedin.com/in/joeyazoulai/'">
          <div class="buy-btn-text">
            <img style="width: 4rem; height: auto; border-radius: 8px;"
              src="https://azoulai.s3.us-east-2.amazonaws.com/joey.jpg"
              alt="Joey Icon"
              class="joey-icon"
            />
            <span class="button-text">Reach out!</span>
          </div>
          
        </button>
        <span class="button-subtext">Message me on LinkedIn</span>
        `
    }
  }

  // Create SVG icons for mute/unmute
  const muteIcon = `<img src="https://azoulai.s3.us-east-2.amazonaws.com/icons/volume_off.svg" alt="Mute" style="width: 1.2rem; height: 1.2rem;">`;
  const unmuteIcon = `<img src="https://azoulai.s3.us-east-2.amazonaws.com/icons/volume_up.svg" alt="Unmute" style="width: 1.2rem; height: 1.2rem;">`;

  // Only select iframes with both video-embed and autoplay-video for autoplay logic
  const autoplayIframes = Array.from(
    document.querySelectorAll("iframe.video-embed.autoplay-video")
  );
  const allIframes = Array.from(
    document.querySelectorAll("iframe.video-embed")
  );
  // Initialize players with proper options for reliable autoplay
  const players = allIframes.map((iframe) => {
    // Create mute button for each video (except vimeo5 which has controls)
    if (iframe.id !== 'vimeo5') {
      const muteButton = document.createElement("button");
      muteButton.className = "mute-button";
      muteButton.innerHTML = `${unmuteIcon} <span>Unmute</span>`;
      iframe.parentElement.appendChild(muteButton);
    }

    const options = {
      muted: iframe.id === 'vimeo5' ? false : true, // vimeo5 starts unmuted
      loop: true,
      autopause: false,
      background: false,
      playsinline: true,
      controls: iframe.id === 'vimeo5' ? true : false, // Only vimeo5 has controls
      title: false,
      byline: false,
      portrait: false,
    };

    // Modify URL parameters for autoplay videos (but not vimeo5)
    if (iframe.classList.contains("autoplay-video")) {
      let src = new URL(iframe.src);
      src.searchParams.set("autoplay", "1");
      src.searchParams.set("muted", "1");
      src.searchParams.set("controls", "0");
      iframe.src = src.toString();
    }

    return new Vimeo.Player(iframe, options);
  });

  let currentPlayingIdx = null;

  // Set initial opacity for all videos
  allIframes.forEach((iframe) => iframe.classList.remove("in-view"));

  // Utility to update mute button UI
  function updateMuteButtonUI(player, muteButton) {
    player.getMuted().then((isMuted) => {
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
      players[idx]
        .ready()
        .then(() => {
          console.log("First player ready");
          return players[idx].setVolume(0);
        })
        .then(() => {
          console.log("Volume set to 0");
          return players[idx].play();
        })
        .then(() => {
          console.log("First video playing");
          firstAutoplay.classList.add("in-view");
          currentPlayingIdx = idx;
          // Add mute button click handler
          const muteButton =
            firstAutoplay.parentElement.querySelector(".mute-button");
          if (muteButton) {
            muteButton.addEventListener("click", async () => {
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
                console.error("Error toggling mute state:", error);
              }
            });
            // Initial sync
            updateMuteButtonUI(players[idx], muteButton);
          }
        })
        .catch((error) => {
          console.error("Error initializing first video:", error);
        });
    }
  }

  function handleIntersect(entries) {
    // Only consider autoplay videos for autoplay logic
    let newIdx = currentPlayingIdx;
    entries.forEach((entry) => {
      if (
        entry.target.classList.contains("autoplay-video") &&
        entry.intersectionRatio >= 0.9
      ) {
        const idx = allIframes.indexOf(entry.target);
        if (idx !== -1) newIdx = idx;
      }
    });

    if (newIdx !== currentPlayingIdx && newIdx !== null) {
      // Pause and mute the old autoplay video
      if (currentPlayingIdx !== null) {
        players[currentPlayingIdx]
          .pause()
          .then(() => {
            players[currentPlayingIdx].setMuted(true).then(() => {
              const muteButton =
                allIframes[currentPlayingIdx].parentElement.querySelector(
                  ".mute-button"
                );
              if (muteButton)
                updateMuteButtonUI(players[currentPlayingIdx], muteButton);
            });
          })
          .catch(() => {});
        allIframes[currentPlayingIdx].classList.remove("in-view");
      }
      // Play the new one (already muted from initialization)
      players[newIdx].play().catch(() => {});
      allIframes[newIdx].classList.add("in-view");
      currentPlayingIdx = newIdx;
    }

    // Opacity animation for all videos: in-view if at least 80% visible
    entries.forEach((entry) => {
      const idx = allIframes.indexOf(entry.target);
      if (entry.intersectionRatio >= 0.8) {
        entry.target.classList.add("in-view");
        // FIX: Restart video when it comes back into view (but not vimeo5)
        if (idx !== -1 && entry.target.id !== 'vimeo5') {
          players[idx]
            .play()
            .then(() => {
              // Ensure it stays muted unless user has unmuted it
              return players[idx].getMuted();
            })
            .then((isMuted) => {
              if (isMuted) {
                return players[idx].setVolume(0);
              }
            })
            .catch(() => {});
        }
      } else {
        entry.target.classList.remove("in-view");
        // Mute videos when they leave viewport (but not vimeo5)
        if (idx !== -1 && entry.target.id !== 'vimeo5') {
          players[idx]
            .pause()
            .then(() => {
              players[idx].setMuted(true).then(() => {
                const muteButton =
                  allIframes[idx].parentElement.querySelector(".mute-button");
                if (muteButton) updateMuteButtonUI(players[idx], muteButton);
              });
            })
            .catch(() => {});
        }
      }
    });
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100),
  });

  allIframes.forEach((iframe, index) => {
    observer.observe(iframe);
    // Add mute button click handler for all videos except vimeo5
    if (iframe.id !== 'vimeo5') {
      const muteButton = iframe.parentElement.querySelector(".mute-button");
      if (muteButton) {
        muteButton.addEventListener("click", async () => {
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
            console.error("Error toggling mute state:", error);
          }
        });
        // Initial sync
        updateMuteButtonUI(players[index], muteButton);
      }
    }
  });

  // --- Robust LinkedIn .social-gallery fade logic (no impact on other sections) ---
  const socialGalleries = Array.from(
    document.querySelectorAll(".social-gallery")
  );
  let currentVisibleGallery = null;
  let fadeInTimeouts = [];
  const intersectionRatios = new Map();
  const galleryObserver = new IntersectionObserver(
    (entries) => {
      // Update intersection ratios for all observed sections
      entries.forEach((entry) => {
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
          socialGalleries.forEach((section) => {
            const wrappers = Array.from(
              section.querySelectorAll(".linkedin-wrapper")
            );
            wrappers.forEach((wrapper) => {
              const iframe = wrapper.querySelector("iframe");
              if (iframe) iframe.classList.remove("fade-visible");
            });
          });
          // Clear any pending fade-in timeouts
          fadeInTimeouts.forEach((t) => clearTimeout(t));
          fadeInTimeouts = [];
          // Fade in the most visible section's iframes staggered
          const wrappers = Array.from(
            mostVisible.querySelectorAll(".linkedin-wrapper")
          );
          wrappers.forEach((wrapper, i) => {
            const timeout = setTimeout(() => {
              const iframe = wrapper.querySelector("iframe");
              if (iframe) iframe.classList.add("fade-visible");
            }, i * 350);
            fadeInTimeouts.push(timeout);
          });
          currentVisibleGallery = mostVisible;
        }
      } else {
        // If none are in view, fade out all
        socialGalleries.forEach((section) => {
          const wrappers = Array.from(
            section.querySelectorAll(".linkedin-wrapper")
          );
          wrappers.forEach((wrapper) => {
            const iframe = wrapper.querySelector("iframe");
            if (iframe) iframe.classList.remove("fade-visible");
          });
        });
        fadeInTimeouts.forEach((t) => clearTimeout(t));
        fadeInTimeouts = [];
        currentVisibleGallery = null;
      }
    },
    { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
  );
  socialGalleries.forEach((section) => {
    Array.from(section.querySelectorAll(".linkedin-wrapper iframe")).forEach(
      (f) => f.classList.remove("fade-visible")
    );
    galleryObserver.observe(section);
    intersectionRatios.set(section, 0);
  });

  // Disable scrollbars on all LinkedIn embeds
  document.querySelectorAll(".linkedin-wrapper iframe").forEach((iframe) => {
    iframe.setAttribute("scrolling", "no");
    // For extra robustness, also set style
    iframe.style.overflow = "hidden";
  });
});

// Unlock testimonial scroll on 'More' click
function setupTestimonialMoreButton() {
  var wrapper = document.querySelector(".testimonial-wrapper");
  var moreLabel = wrapper ? wrapper.querySelector(".more-label") : null;
  if (!wrapper || !moreLabel) return;

  // Prevent scroll initially
  wrapper.classList.remove("scrolling");

  moreLabel.addEventListener("click", function () {
    wrapper.classList.add("scrolling");
    // Animate scroll to bottom
    wrapper.scrollTo({
      top: wrapper.scrollHeight,
      behavior: "smooth",
    });
    // Hide the label
    moreLabel.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", setupTestimonialMoreButton);

const body = document.querySelector("body");
if (body) {
  body.classList.add("ready");
} else {
  console.error("Body element not found - cannot add 'ready' class");
}