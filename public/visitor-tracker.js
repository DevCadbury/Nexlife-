// Visitor tracking script for Nexlife International website
// Include this script in the <head> of your HTML pages
// This script tracks ALL page visits, including repeat visits from the same user

(function() {
  // Only track if not on admin panel
  if (window.location.pathname.startsWith('/admin')) {
    return;
  }

  // Get or create a unique visitor ID (stored in localStorage)
  function getVisitorId() {
    let visitorId = localStorage.getItem('nexlife_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('nexlife_visitor_id', visitorId);
    }
    return visitorId;
  }

  // Get country from IP (using ipapi.co service)
  function getCountryFromIP(callback) {
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        callback(data.country_name || 'Unknown');
      })
      .catch(() => {
        callback('Unknown');
      });
  }

  // Track the visit - EVERY visit is tracked, including repeats
  function trackVisit(country) {
    const data = {
      page: window.location.pathname,
      country: country,
      visitorId: getVisitorId(), // Unique visitor identifier
      ip: '', // Will be set by server from request
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };

    // Get backend URL from window (injected by Vite) or use production URL
    const backendUrl = window.__VITE_BACKEND_URL__ || 
                       'https://nexlife-api.vercel.app';

    fetch(`${backendUrl}/api/analytics/visitors/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .catch(err => {
      // Silently fail - don't break the page
      console.warn('Failed to track visit:', err);
    });
  }

  // Track visit when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      getCountryFromIP(trackVisit);
    });
  } else {
    getCountryFromIP(trackVisit);
  }

  // Also track on page visibility change (when user comes back to tab)
  let lastVisitTime = Date.now();
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      const timeSinceLastVisit = Date.now() - lastVisitTime;
      // Only track if more than 30 seconds have passed (to avoid excessive tracking)
      if (timeSinceLastVisit > 30000) {
        getCountryFromIP(trackVisit);
      }
      lastVisitTime = Date.now();
    }
  });
})();