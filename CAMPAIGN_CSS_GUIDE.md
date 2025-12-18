# Email Campaign CSS & HTML Guide

## ✅ Fixed Issues

1. **CSS Not Showing in Campaigns** - ✅ RESOLVED
   - CSS from `<style>` tags is now automatically inlined
   - Email clients properly render styles
   - Preview shows exact email appearance

2. **Raw HTML Support** - ✅ ADDED
   - New "Raw HTML" mode for custom emails
   - Complete control over email design
   - Automatic CSS processing for compatibility

## 🎨 Campaign Content Modes

### 1. Plain Text Mode
- **Use Case:** Simple text emails
- **Features:** 
  - Clean, unformatted messages
  - Fast to create
  - Maximum deliverability

### 2. HTML Template Mode
- **Use Case:** Professional branded emails
- **Features:**
  - 4 pre-designed templates (Newsletter, Promotional, Announcement, Product)
  - Automatic styling with Nexlife branding
  - Message inserted into template structure
  - Mobile responsive

### 3. Raw HTML Mode 🆕
- **Use Case:** Custom-designed HTML emails with your own CSS
- **Features:**
  - Paste complete HTML documents
  - Full CSS support (automatically inlined)
  - Perfect for marketing agencies or designers
  - Iframe preview shows exact rendering

## 📧 How CSS Inlining Works

### Before (Problem)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { background: #f0f0f0; padding: 20px; }
    h1 { color: #333; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```
**Result:** Email clients strip `<style>` tags → No styling 😞

### After (Solution)
The system automatically converts to:
```html
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="container" style="background: #f0f0f0; padding: 20px;">
    <h1 style="color: #333; font-size: 24px;">Hello World</h1>
  </div>
</body>
</html>
```
**Result:** Styles preserved → Perfect rendering 🎉

## 🚀 Using Raw HTML Mode

### Step 1: Select Raw HTML
In Campaign Manager:
1. Click **"Raw HTML"** button (purple icon)
2. Template selection disappears
3. Large code editor appears

### Step 2: Paste Your HTML
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: Arial, sans-serif; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      padding: 40px; 
      text-align: center; 
    }
    .header h1 { 
      color: white; 
      margin: 0; 
    }
    .content { 
      padding: 30px; 
      color: #333; 
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Special Announcement</h1>
    </div>
    <div class="content">
      <p>Your custom content here...</p>
    </div>
  </div>
</body>
</html>
```

### Step 3: Preview
- Click **"Show Preview"**
- Iframe renders with CSS intact
- See exactly how subscribers will see it

### Step 4: Send
- Click **"Send Campaign"**
- CSS automatically inlined
- Compatible with all email clients

## 🎯 Best Practices

### For Email CSS
1. **Use Inline Styles** - Always add `style="..."` attributes (system does this automatically)
2. **Use Tables for Layout** - Email clients love tables more than divs
3. **Avoid External CSS** - No `<link>` tags to external stylesheets
4. **Test Background Images** - Not all clients support them
5. **Use Absolute URLs** - For images: `https://yourdomain.com/image.png`

### For HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Your CSS here - will be auto-inlined */
  </style>
</head>
<body style="margin:0; padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <!-- Your content here -->
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 🔧 Technical Details

### CSS Inlining Function
Located in: `backend/config/email.js`

```javascript
function inlineStyles(html) {
  // Extracts <style> tags
  // Parses CSS rules
  // Applies as inline style="" attributes
  // Handles classes, IDs, and element selectors
  // Returns processed HTML
}
```

### Supported Selectors
- ✅ **Classes:** `.container`, `.button`, `.header`
- ✅ **Elements:** `body`, `table`, `td`, `h1`, `p`
- ✅ **IDs:** `#header`, `#footer`
- ⚠️ **Pseudo-classes:** `:hover` (limited support in email)
- ❌ **Media Queries:** Work in `<style>` but not inlined

### Template vs Raw HTML Detection
In `backend/routes/subscribers.js`:
```javascript
const isCompleteHtml = isHtml && (
  message.trim().toLowerCase().startsWith('<!doctype html') || 
  message.trim().toLowerCase().startsWith('<html')
);

if (isCompleteHtml) {
  // Send via rawHtml template (with CSS inlining)
  results = await sendBulkEmail(targetEmails, "rawHtml", {...});
} else {
  // Send via campaign template
  results = await sendBulkEmail(targetEmails, "campaign", {...});
}
```

## 📊 Preview vs Actual Email

### Admin Panel Preview
- Uses `<iframe srcDoc="...">` for isolated rendering
- Shows CSS exactly as designed
- Safe from page CSS conflicts

### Actual Email
- CSS automatically inlined by `inlineStyles()`
- Compatible with Gmail, Outlook, Yahoo, etc.
- Mobile-responsive (if designed that way)

## 🐛 Troubleshooting

### CSS Not Showing
1. ✅ Check if using Raw HTML mode
2. ✅ Verify `<style>` tags are in `<head>`
3. ✅ Ensure selectors match your HTML elements
4. ✅ Preview in iframe before sending

### Preview Looks Different
- Preview shows exact HTML you provided
- Sent email has CSS inlined automatically
- Both should look identical

### Email Client Issues
- **Gmail:** Excellent support ✅
- **Outlook:** Use tables for layout ⚠️
- **Yahoo:** Good support ✅
- **Apple Mail:** Excellent support ✅

## 📚 Example Templates

### Minimal Clean Email
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello!</h1>
    <p>Your message here.</p>
  </div>
</body>
</html>
```

### Professional Product Email
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; }
    .header { background: #0066cc; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { padding: 40px 30px; }
    .button { background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Product Launch</h1>
    </div>
    <div class="content">
      <p>We're excited to announce...</p>
      <a href="https://nexlifeinternational.com" class="button">Learn More</a>
    </div>
  </div>
</body>
</html>
```

## 🎉 Benefits Summary

1. **CSS Works Everywhere** - Automatic inlining ensures compatibility
2. **Accurate Previews** - Iframe shows exact email appearance
3. **Designer-Friendly** - Raw HTML mode for full creative control
4. **No Manual Work** - CSS processing happens automatically
5. **Mobile Responsive** - Design once, works on all devices

---

**Need Help?** Check the inline documentation in the Campaign Manager or review existing campaign templates for examples.
