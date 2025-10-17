# Visitor Tracking Environment Variable Fix

## Overview
Fixed the visitor tracking script to use environment-based backend URL instead of hardcoded localhost or production URL.

---

## Problem
The visitor tracking script was using hardcoded URLs:
```javascript
const backendUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000'
  : 'https://nexlife-international-backend.vercel.app';
```

This caused issues because:
- ❌ Hardcoded localhost URL doesn't match actual backend port
- ❌ Production URL was hardcoded and not using .env configuration
- ❌ No flexibility for different environments (dev, staging, production)
- ❌ Couldn't switch backend URLs without code changes

---

## Solution

### 1. Updated Visitor Tracking Script
**File**: `public/visitor-tracker.js`

```javascript
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
```

**Changes**:
- ✅ Uses `window.__VITE_BACKEND_URL__` injected from environment
- ✅ Falls back to production URL from .env (`https://nexlife-api.vercel.app`)
- ✅ No more hostname detection or hardcoded URLs

---

### 2. Updated HTML to Inject Environment Variable
**File**: `index.html`

```html
<!-- Visitor Tracking Script -->
<script>
  // Inject backend URL from environment variable
  window.__VITE_BACKEND_URL__ = '%VITE_BACKEND_URL%';
</script>
<script src="/visitor-tracker.js"></script>
```

**How it works**:
1. Placeholder `%VITE_BACKEND_URL%` is added to HTML
2. Vite plugin replaces placeholder with actual env value at build/serve time
3. Value is assigned to `window.__VITE_BACKEND_URL__`
4. Tracking script reads from `window.__VITE_BACKEND_URL__`

---

### 3. Created Vite Plugin for Environment Injection
**File**: `vite.config.js`

Added custom plugin to replace environment variable placeholders in HTML:

```javascript
import { defineConfig, loadEnv } from "vite";

// Custom plugin to inject environment variables into HTML
function htmlEnvPlugin() {
  return {
    name: 'html-env',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { server }) {
        // Get environment variables
        const mode = server?.config.mode || 'production';
        const env = loadEnv(mode, process.cwd(), '');
        
        // Replace placeholders in HTML
        return html.replace(/%(\w+)%/g, (match, key) => {
          return env[key] || '';
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlEnvPlugin()],
  // ... rest of config
});
```

**Plugin Features**:
- ✅ Runs before React plugin (order: 'pre')
- ✅ Loads environment variables based on mode (dev/production)
- ✅ Replaces all `%VARIABLE_NAME%` placeholders with actual values
- ✅ Returns empty string if variable not found
- ✅ Works in both development and production builds

---

## Environment Variables

### Current .env Configuration
```properties
VITE_BACKEND_URL=https://nexlife-api.vercel.app
VITE_API_URL=https://nexlife-api.vercel.app/api
```

### How Environment Variables Are Used

#### Development Mode:
```bash
npm run dev
# Vite loads .env file
# VITE_BACKEND_URL = https://nexlife-api.vercel.app
# HTML placeholder replaced: window.__VITE_BACKEND_URL__ = 'https://nexlife-api.vercel.app'
```

#### Production Build:
```bash
npm run build
# Vite loads .env.production (if exists) or .env
# VITE_BACKEND_URL = https://nexlife-api.vercel.app
# HTML placeholder replaced in built index.html
```

---

## Testing

### 1. Development Testing
```bash
cd d:\next\nexlife-international
npm run dev
```

**Verify**:
1. Open browser console
2. Type `window.__VITE_BACKEND_URL__`
3. Should show: `https://nexlife-api.vercel.app`
4. Visit any page
5. Check Network tab for tracking request to correct URL

### 2. Production Testing
```bash
npm run build
npm run preview
```

**Verify**:
1. Check built `dist/index.html`
2. Search for `window.__VITE_BACKEND_URL__`
3. Should show actual URL, not placeholder
4. Test tracking in preview server

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `public/visitor-tracker.js` | Updated backend URL logic | ~10 |
| `index.html` | Added env injection script | +4 |
| `vite.config.js` | Added htmlEnvPlugin | +20 |

---

## Benefits

### Before:
❌ Hardcoded URLs  
❌ Manual URL changes for different environments  
❌ Localhost/production detection logic  
❌ Inflexible configuration  

### After:
✅ Environment-based URLs  
✅ Single source of truth (.env file)  
✅ Easy to change without code modifications  
✅ Works in all environments (dev/staging/production)  
✅ Consistent with other API calls in the app  

---

## How to Change Backend URL

### For Development:
1. Edit `.env` file
2. Change `VITE_BACKEND_URL=https://your-new-backend.com`
3. Restart dev server: `npm run dev`

### For Production:
1. Create `.env.production` (or edit `.env`)
2. Set `VITE_BACKEND_URL=https://your-production-backend.com`
3. Rebuild: `npm run build`

### For Vercel Deployment:
1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add `VITE_BACKEND_URL` with your production backend URL
4. Redeploy

---

## Additional Environment Variables You Can Inject

You can inject any environment variable into HTML using the same pattern:

```html
<script>
  window.__VITE_BACKEND_URL__ = '%VITE_BACKEND_URL%';
  window.__VITE_API_KEY__ = '%VITE_API_KEY%';
  window.__VITE_APP_VERSION__ = '%VITE_APP_VERSION%';
</script>
```

Just make sure to:
1. Add the variable to `.env` file
2. Use `%VARIABLE_NAME%` placeholder in HTML
3. Access via `window.__VARIABLE_NAME__` in scripts

---

## Troubleshooting

### Issue: Placeholder not being replaced
**Solution**: 
- Ensure variable is in .env file
- Variable name must match exactly (case-sensitive)
- Restart Vite dev server
- Clear browser cache

### Issue: undefined in console
**Solution**:
- Check if .env file exists
- Verify variable name in .env
- Make sure Vite is loading the .env file
- Check vite.config.js plugin is enabled

### Issue: Tracking not working
**Solution**:
1. Check browser console for errors
2. Verify backend URL: `console.log(window.__VITE_BACKEND_URL__)`
3. Check Network tab for tracking requests
4. Verify backend is reachable from browser
5. Check CORS settings on backend

---

## Best Practices

### 1. Environment Variables Naming
- ✅ Use `VITE_` prefix for Vite to expose to client
- ✅ Use descriptive names: `VITE_BACKEND_URL`, `VITE_API_URL`
- ❌ Don't use generic names: `URL`, `API`

### 2. Security
- ⚠️ Never put sensitive data in client-side env variables
- ⚠️ Variables starting with `VITE_` are exposed to the client
- ✅ Keep API keys and secrets on the backend only

### 3. Documentation
- ✅ Document all env variables in README
- ✅ Provide `.env.example` file
- ✅ List required variables for deployment

---

## Related Files

### Contact Form (Already using env correctly)
**File**: `src/lib/contact.js`

```javascript
const BASE_URL = import.meta.env.VITE_API_URL;

export const submitInquiry = async (data) => {
  const response = await fetch(`${BASE_URL}/inquiries`, {
    // ...
  });
};
```

### Likes System (Already using env correctly)
**File**: `src/lib/likes.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
```

### Now Visitor Tracking (Updated to match)
**File**: `public/visitor-tracker.js`

```javascript
const backendUrl = window.__VITE_BACKEND_URL__ || 
                   'https://nexlife-api.vercel.app';
```

---

## Deployment Checklist

### Vercel Deployment:
- [ ] Set `VITE_BACKEND_URL` in Vercel environment variables
- [ ] Set `VITE_API_URL` in Vercel environment variables
- [ ] Redeploy after adding environment variables
- [ ] Test tracking on deployed site
- [ ] Verify backend receives tracking requests

### Manual Deployment:
- [ ] Ensure .env.production exists with correct values
- [ ] Run `npm run build`
- [ ] Deploy dist/ folder
- [ ] Test tracking on deployed site

---

## Summary

The visitor tracking system now uses environment-based configuration:

1. **Backend URL**: Read from `VITE_BACKEND_URL` in .env
2. **HTML Injection**: Custom Vite plugin replaces placeholders
3. **Tracking Script**: Reads from `window.__VITE_BACKEND_URL__`
4. **Fallback**: Uses production URL if env var not set

This makes the system:
- ✅ More maintainable
- ✅ Environment-agnostic
- ✅ Easier to deploy
- ✅ Consistent with the rest of the app

**No more hardcoded URLs! 🎉**
