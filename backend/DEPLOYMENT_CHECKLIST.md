# 📋 Vercel Deployment Checklist

Use this checklist to ensure a successful deployment with working email functionality.

---

## Pre-Deployment

### Local Testing
- [ ] Navigate to backend directory: `cd backend`
- [ ] Run connection test: `npm run test-connection`
- [ ] Verify both SMTP and IMAP tests pass ✅
- [ ] Check test email arrives in inbox

### Environment Variables Check
- [ ] Open `.env` file
- [ ] Verify `SMTP_USER` is lowercase: `info@nexlifeinternational.com`
- [ ] Verify `IMAP_USER` is lowercase: `info@nexlifeinternational.com`
- [ ] Verify no trailing spaces in passwords
- [ ] Verify SMTP_PORT is `587`
- [ ] Verify IMAP_PORT is `993`

---

## Vercel Dashboard Setup

### Access Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your backend project
- [ ] Click "Settings" tab
- [ ] Click "Environment Variables"

### Set Environment Variables
Copy and set these variables exactly (case-sensitive!):

#### SMTP Configuration
- [ ] `SMTP_HOST` = `smtpout.secureserver.net`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER` = `info@nexlifeinternational.com` ⚠️ lowercase!
- [ ] `SMTP_PASS` = `Nexlife@2025`

#### IMAP Configuration
- [ ] `IMAP_HOST` = `imap.secureserver.net`
- [ ] `IMAP_PORT` = `993`
- [ ] `IMAP_SECURE` = `true`
- [ ] `IMAP_USER` = `info@nexlifeinternational.com` ⚠️ lowercase!
- [ ] `IMAP_PASS` = `Nexlife@2025`

#### Other Configuration
- [ ] `CONTACT_TO` = `info@nexlifeinternational.com` ⚠️ lowercase!
- [ ] `MONGODB_URI` = (your MongoDB connection string)
- [ ] `MONGODB_DB` = `nexlife`
- [ ] `JWT_SECRET` = (your JWT secret)
- [ ] `DASH_PASSWORD` = (your dashboard password)

#### Environment Selection
- [ ] Check "Production" checkbox for all variables
- [ ] Optionally check "Preview" and "Development" as well
- [ ] Click "Save" for each variable

---

## Deployment

### Option 1: Using Script (Recommended)
- [ ] Open terminal in backend directory
- [ ] Run: `./deploy-vercel.bat` (Windows) or `./deploy-vercel.sh` (Mac/Linux)
- [ ] Select "1" for Production deployment
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

### Option 2: Manual
- [ ] Open terminal in backend directory
- [ ] Run: `vercel --prod`
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

---

## Post-Deployment Verification

### Check Vercel Logs
- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Click "Functions" tab
- [ ] Click on the latest deployment
- [ ] Look for these success messages:
  ```
  [EMAIL] Creating transporter for info@nexlifeinternational.com
  [EMAIL] SMTP connection verified successfully
  [IMAP] ✅ Connected successfully
  ```

### Test Email Endpoint
- [ ] Copy your Vercel backend URL
- [ ] Run this command (replace URL and email):
  ```bash
  curl -X POST https://your-backend.vercel.app/api/test-email \
    -H "Content-Type: application/json" \
    -d '{"to": "your-test-email@example.com", "template": "contact"}'
  ```
- [ ] Check for `"success": true` in response
- [ ] Verify test email arrives in inbox

### Test Contact Form
- [ ] Go to your website
- [ ] Navigate to Contact page
- [ ] Fill out contact form
- [ ] Submit form
- [ ] Verify no errors
- [ ] Check admin email receives notification
- [ ] Check customer receives confirmation email

### Check IMAP Poller
- [ ] Wait 5 minutes for IMAP poller to run
- [ ] Check Vercel logs for:
  ```
  [IMAP] Starting cycle for info@nexlifeinternational.com
  [IMAP] ✅ Connected successfully
  ```
- [ ] Verify no authentication errors

---

## Troubleshooting (If Issues Occur)

### Authentication Failed (535 Error)
- [ ] Verify email addresses are lowercase
- [ ] Check for trailing spaces in password
- [ ] Try resetting password in Hostinger
- [ ] Verify account not locked

### Connection Timeout
- [ ] Verify SMTP_PORT is `587` (not 465)
- [ ] Verify SMTP_SECURE is `false`
- [ ] Check Hostinger service status
- [ ] Try alternative port (465 with SECURE=true)

### IMAP Poller Errors
- [ ] Verify IMAP credentials match SMTP
- [ ] Verify IMAP_PORT is `993`
- [ ] Verify IMAP_SECURE is `true`
- [ ] Check IMAP is enabled in Hostinger

### Environment Variables Not Applied
- [ ] Verify "Production" checkbox is selected
- [ ] Redeploy after changing variables
- [ ] Clear browser cache
- [ ] Wait 2-3 minutes for propagation

---

## Success Indicators

You'll know everything is working when:

✅ No errors in Vercel function logs  
✅ Test email arrives successfully  
✅ Contact form submissions work  
✅ Confirmation emails are sent  
✅ IMAP poller connects without errors  
✅ Admin receives inquiry notifications  
✅ No 535 authentication errors  

---

## Rollback Plan

If issues persist:

1. **Check Service Status**
   - [ ] Visit https://www.hostinger.com/status
   - [ ] Verify mail services operational

2. **Try Alternative Configuration**
   - [ ] Change SMTP_PORT to `465`
   - [ ] Change SMTP_SECURE to `true`
   - [ ] Redeploy

3. **Contact Support**
   - [ ] Hostinger: support.hostinger.com
   - [ ] Vercel: vercel.com/support

---

## Final Checklist

Before marking as complete:

- [ ] ✅ Local tests pass
- [ ] ✅ Vercel environment variables set (lowercase emails!)
- [ ] ✅ Deployed successfully
- [ ] ✅ Test email sent and received
- [ ] ✅ Contact form tested and working
- [ ] ✅ No errors in Vercel logs
- [ ] ✅ IMAP poller running without errors
- [ ] ✅ All stakeholders notified of successful deployment

---

## Documentation Reference

- 📖 **Complete Guide**: `EMAIL_FIX_VERCEL.md`
- 🚀 **Quick Deploy**: `QUICK_DEPLOY.md`
- 📊 **Summary**: `EMAIL_FIX_SUMMARY.md`
- 🔧 **Test Script**: `npm run test-connection`

---

## Support

**Need Help?**
1. Review error messages in Vercel logs
2. Check documentation files above
3. Run local test: `npm run test-connection`
4. Verify Hostinger account status

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Status:** [ ] Success  [ ] Issues  [ ] Rolled Back  

**Notes:**
_____________________________________________________
_____________________________________________________
_____________________________________________________

---
**Version:** 1.0.0  
**Last Updated:** November 5, 2025
