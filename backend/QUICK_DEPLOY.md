# 🚀 Quick Deployment Guide - Email Fix

## The Problem
Email authentication was failing on Vercel with `Error: authentication failed: 535 5.7.8`

## The Solution
We fixed:
1. ✅ Email address consistency (all lowercase `info@`)
2. ✅ Serverless optimizations (no connection pooling)
3. ✅ Proper timeout handling (60s)
4. ✅ Enhanced TLS configuration
5. ✅ Better error logging

## Deploy Now (3 Steps)

### Step 1: Test Locally
```bash
cd backend
npm run test-connection
```

**Expected output:**
```
✅ SMTP: PASSED
✅ IMAP: PASSED
🎉 All tests passed!
```

### Step 2: Update Vercel Environment Variables
Go to: https://vercel.com/your-username/nexlife-api/settings/environment-variables

**Set these variables:**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@nexlifeinternational.com
SMTP_PASS=Nexlife@2025

IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=info@nexlifeinternational.com
IMAP_PASS=Nexlife@2025

CONTACT_TO=info@nexlifeinternational.com
```

**IMPORTANT:** 
- Use ALL lowercase for email addresses
- NO trailing spaces in passwords
- Apply to "Production" environment

### Step 3: Deploy
```bash
# Using the script (recommended)
./deploy-vercel.bat   # Windows
./deploy-vercel.sh    # Linux/Mac

# Or manually
vercel --prod
```

## Verify Deployment

### Test Email Sending
```bash
curl -X POST https://your-backend.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "template": "contact"}'
```

### Check Logs
1. Go to Vercel dashboard
2. Select your project
3. Click "Functions" → View logs
4. Look for: `[EMAIL] ✅ Email sent successfully`

## Common Issues & Quick Fixes

### Issue: "SMTP credentials not configured"
**Fix:** Set `SMTP_USER` and `SMTP_PASS` in Vercel env vars

### Issue: "SMTP Authentication failed"
**Fix:** 
1. Verify password in Hostinger
2. Use lowercase email address
3. Reset password if locked

### Issue: "Connection timeout"
**Fix:**
1. Check SMTP port is `587` (not 465)
2. Check `SMTP_SECURE` is `false`
3. Verify Hostinger service status

### Issue: "IMAP poller error"
**Fix:**
1. Ensure IMAP credentials match SMTP
2. Verify IMAP port is `993`
3. Set `IMAP_SECURE` to `true`

## Success Checklist
- [ ] Local test passes (`npm run test-connection`)
- [ ] Vercel env vars updated (all lowercase emails)
- [ ] Deployment successful
- [ ] Test email received
- [ ] No errors in Vercel logs
- [ ] Contact form works on website
- [ ] IMAP poller running (check logs)

## Still Not Working?

### 1. Check Hostinger
- Log into Hostinger control panel
- Verify email account is active
- Check for any security alerts
- Try resetting password

### 2. Check Vercel
- Verify all env vars are set correctly
- Check for typos in variable names
- Ensure variables are applied to Production
- Redeploy after changing env vars

### 3. Alternative: Use Port 465
If port 587 doesn't work, try:
```
SMTP_PORT=465
SMTP_SECURE=true
```

### 4. Get Help
- Check full guide: `EMAIL_FIX_VERCEL.md`
- View Vercel logs for error details
- Contact Hostinger support if account locked
- Test with different email provider (SendGrid/Mailgun)

## Support Files
- `EMAIL_FIX_VERCEL.md` - Complete troubleshooting guide
- `test-email-connection.js` - Connection test script
- `deploy-vercel.bat/sh` - Automated deployment
- `config/email.js` - Updated email config

---
**Last Updated:** 2025-11-05
**Status:** ✅ Ready to deploy
