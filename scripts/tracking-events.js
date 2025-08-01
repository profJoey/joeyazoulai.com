const trackingEvents = {
  // Button clicks
  'buy-button-click': {
    description: 'User clicked the buy button',
    context: 'Purchase flow initiation'
  },
  
  // URL parameter visits
  'charity-footprints-visit': {
    description: 'User visited with charity-footprints parameter',
    context: 'Special charity campaign landing'
  },
  'kate-reuther-visit': {
    description: 'User visited with kate-reuther parameter',
    context: 'Kate Reuther specific content'
  },
  'portfolio-visit': {
    description: 'User visited with portfolio parameter', 
    context: 'Portfolio mode viewing'
  },
  'portfolio-linkedin-message-click': {
    description: 'User clicked LinkedIn message button',
    context: 'Contact attempt'
  },
  'events-form-submit': {
    description: 'User submitted the events form',
    context: 'Event registration or inquiry'
  },
  'events-linkedin-message-click': {
    description: 'User clicked LinkedIn message button on events page',
    context: 'Contact attempt from events section'
  },
  'events-website-click': {
    description: 'User clicked visit website button on events page',
    context: 'Contact attempt from events section'
  }
};

// Centralized tracking function
function trackEvent(eventName, customData = {}) {
  if (trackingEvents[eventName]) {
    
    // Log the event to the console for debugging
    console.log(`📊 Tracking: ${eventName} - ${trackingEvents[eventName].description}`);

    fathom.trackEvent(eventName);
    
    // Optional: Add custom data logging
    if (Object.keys(customData).length > 0) {
      console.log('Custom data:', customData);
    }
  } else {
    console.warn(`⚠️ Unknown tracking event: ${eventName}`);
  }
}