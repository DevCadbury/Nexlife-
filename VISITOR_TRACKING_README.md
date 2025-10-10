# Visitor Tracking Setup

To enable visitor analytics on your main website, add the following script tag to the `<head>` section of your HTML pages:

```html
<script src="/visitor-tracker.js"></script>
```

## What it does:
- Automatically tracks page visits from your main website (excludes admin panel)
- Captures visitor country, page URL, referrer, and user agent
- Sends data to your analytics API for dashboard visualization

## Implementation:
1. Copy the `visitor-tracker.js` file from the `public` folder to your main website's public directory
2. Include the script tag in all your website pages
3. Visitor data will start appearing in your admin analytics dashboard

## Note:
The tracking script uses a free IP geolocation service (ipapi.co) to determine visitor countries. For production use, you may want to replace this with a more reliable service or implement server-side geolocation.