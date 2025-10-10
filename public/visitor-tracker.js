// Visitor tracking script for Nexlife International website
// Include this script in the <head> of your HTML pages

(function() {
  // Only track if not on admin panel
  if (window.location.pathname.startsWith('/admin')) {
    return;
  }

  // Get country from IP (you might want to use a service like ipapi.co or similar)
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

  // Track the visit
  function trackVisit(country) {
    const data = {
      page: window.location.pathname,
      country: country,
      ip: '', // Will be set by server
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    fetch('http://localhost:4000/api/analytics/visitors/track', {
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
})();