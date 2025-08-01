// Check for URL parameters
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("charity-footprints")) {
  trackEvent("charity-footprints-visit");

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
  trackEvent("portfolio-visit");

  const heroText = document.querySelector(".hero-text");
  const purchaseDetails = document.querySelector(".purchase-details");
  const heroDescription = document.querySelector(".hero-description");
  const aboutSectionDescription = document.querySelector(
    "#about-section .description"
  );
  const interviewSectionDescription = document.querySelector(
    "#interview-section .description"
  );
  if (heroText) {
    heroText.innerText = "Content Strategy & Production";
  }
  if (heroDescription) {
    heroDescription.innerHTML =
      `<h3>Attract and nurture your supporters!</h3><p>Help supporters connect with your organization by giving them a face, a voice, and a story to connect with.</p><p>Joey interviews your stakeholders to craft content that wins hearts and minds.</p>`;
  }
  if (interviewSectionDescription) {
    interviewSectionDescription.innerHTML =
      `<h3>Create high-quality content with your stakeholders remotely.</h3><p>I create content with program alums, donors, staff, and partners no matter where in the world they are. Each interview is an opportunity to capture authentic stories and insights. I craft this raw material into a complete marketing content library.</p>`;
  }
  if (aboutSectionDescription) {
    aboutSectionDescription.innerHTML = `
      <h3>I love working with nonprofits!</h3><p>As a former Director of Media & Content for a digital agency, my team and I bridged the marketing and programmatic needs for clients like Harvard Law, Bridgespan, and Microsoft. My favorite clients were always the mission-driven organizations. Now my focus is on making impactful media accessible to organizations of all sizes. I also teach the next generation of media and technology experts at NYU and Columbia. I am always learning and always sharing what I learn. Join me!</p>
      `;
  }
  if (purchaseDetails) {
    purchaseDetails.innerHTML = `
        <button id="msg-me-btn" class="buy-btn" onclick="window.location.href='https://www.linkedin.com/in/joeyazoulai/'; trackEvent('portfolio-linkedin-message-click');">
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
        `;
  }
} else if (urlParams.has("kate-reuther")) {
  trackEvent("kate-reuther-visit");
  const promoText = document.querySelector(".promo-text");
  const discountPrice = document.querySelector(".discount-price");
  const fullPrice = document.querySelector(".full-price");
  const subText = document.querySelector(".button-subtext");

  if (promoText) {
    promoText.classList.add("kate-reuther");
    promoText.innerHTML = `Use code KATE15 at<br />
          checkout for 15% discount`;
  }
  if (discountPrice) {
    discountPrice.classList.add("kate-reuther");
  }
  if (fullPrice) {
    fullPrice.classList.add("kate-reuther");
  }
  
  if (subText) {
    subText.innerHTML = "Pay $380 Deposit";
  }
  
} 
