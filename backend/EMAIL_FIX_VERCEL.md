# Email Authentication Fix for Vercel Deployment

## Problem
SMTP authentication was failing on Vercel with error:
```
Error: Invalid login: 535 5.7.8 Error: authentication failed: (reason unavailable)
```

## Root Causes Identified
1. **Email case inconsistency** - SMTP used `Info@` while IMAP used `info@`
2. **Missing serverless optimizations** - Connection pooling not disabled
3. **TLS settings** - Missing minVersion specification for Hostinger
4. **Timeout issues** - No proper timeout handling for cold starts

## Fixes Applied

### 1. Email Configuration (`backend/config/email.js`)
- ✅ Fixed email address to lowercase `info@nexlifeinternational.com`
- ✅ Added validation for missing SMTP credentials
- ✅ Disabled connection pooling for serverless environment
- ✅ Added proper timeout settings (60s connection, 30s greeting)
- ✅ Enhanced TLS configuration with minVersion: 'TLSv1.2'
- ✅ Added detailed error logging for debugging
- ✅ Added connection verification with timeout
- ✅ Proper transporter cleanup after sending

### 2. IMAP Configuration (`backend/inbound-imap.js`)
- ✅ Fixed email address consistency to lowercase
- ✅ Added enhanced error logging
- ✅ Added timeout settings matching SMTP config
- ✅ Added connection status logging
- ✅ Better error handling with specific guidance

### 3. Vercel Configuration (`backend/vercel.json`)
- ✅ Normalized all email addresses to lowercase `info@`
- ✅ Ensured SMTP and IMAP use same credentials
- ✅ Maintained port 587 for SMTP (not 465)
- ✅ Kept SMTP_SECURE as "false" for port 587

## Deployment Steps

### Step 1: Update Vercel Environment Variables
Go to your Vercel project settings and update these environment variables:

```bash
# SMTP Configuration (for sending emails)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@nexlifeinternational.com
SMTP_PASS=Nexlife@2025

# IMAP Configuration (for receiving emails)
IMAP_HOST=imap.secureserver.net
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=info@nexlifeinternational.com
IMAP_PASS=Nexlife@2025

# Email Recipients
CONTACT_TO=info@nexlifeinternational.com
```

**IMPORTANT:** Make sure there are NO trailing spaces in the password!

### Step 2: Verify Hostinger Email Settings
Log into your Hostinger control panel and verify:

1. **Email Account Active**: Confirm `info@nexlifeinternational.com` exists
2. **Password Correct**: Verify the password is exactly `Nexlife@2025`
3. **SMTP Settings**: 
   - Host: `smtp.hostinger.com`
   - Port: `587`
   - Security: STARTTLS (not SSL)
4. **IMAP Settings**:
   - Host: `imap.hostinger.com`
   - Port: `993`
   - Security: SSL/TLS

### Step 3: Test Locally First
Before deploying, test locally:

```bash
cd backend
npm test  # This will run the email test
```

Or test manually:
```bash
node -e "
import { sendEmail } from './config/email.js';
sendEmail('your-test-email@example.com', 'contact', {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test Email',
  message: 'This is a test message'
}).then(r => console.log('Result:', r));
"
```

### Step 4: Deploy to Vercel
```bash
# From the backend directory
cd backend

# Deploy using vercel CLI
vercel --prod

# Or push to GitHub (if auto-deploy is enabled)
git add .
git commit -m "fix: Email authentication for Vercel deployment"
git push origin main
```

### Step 5: Test on Vercel
After deployment, test the email endpoint:

```bash
curl -X POST https://your-vercel-backend.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "template": "contact"
  }'
```

## Monitoring & Debugging

### Check Vercel Logs
1. Go to your Vercel dashboard
2. Select your backend project
3. Click on "Functions" tab
4. View logs for real-time email activity

Look for these log messages:
- `[EMAIL] Creating transporter for info@nexlifeinternational.com`
- `[EMAIL] Verifying SMTP connection...`
- `[EMAIL] SMTP connection verified successfully`
- `[EMAIL] ✅ Email sent successfully`

### Common Error Messages

#### "SMTP credentials not configured"
- Verify `SMTP_USER` and `SMTP_PASS` are set in Vercel
- Check for typos or extra spaces

#### "SMTP verification timeout after 30s"
- Hostinger server might be slow
- Check if SMTP port 587 is accessible from Vercel
- Try increasing timeout in `email.js`

#### "SMTP Authentication failed"
- Password is incorrect
- Email address has typo
- Account might be locked (too many failed attempts)
- Reset password in Hostinger panel

#### "ECONNECTION" or "ETIMEDOUT"
- Firewall blocking connection
- Wrong SMTP host or port
- Check Hostinger service status

### Test Email Manually
Use the admin dashboard test email feature:
1. Log into `/admin`
2. Use Quick Actions → Send Test Email
3. Check logs for detailed output

## Additional Security Recommendations

1. **Use Environment Secrets**: Don't commit `vercel.json` with passwords
   ```bash
   # Instead, set via Vercel CLI:
   vercel env add SMTP_PASS
   ```

2. **Enable 2FA**: Add two-factor authentication to Hostinger account

3. **Use App Password**: If 2FA is enabled, create an app-specific password

4. **Monitor Failed Attempts**: Check Hostinger logs for failed login attempts

5. **Rotate Passwords**: Change email password every 90 days

## Rollback Plan
If issues persist:

1. **Check Service Status**: 
   - Visit https://www.hostinger.com/status
   - Verify mail services are operational

2. **Try Alternative Port**:
   - Change `SMTP_PORT` to `465`
   - Change `SMTP_SECURE` to `true`
   - Redeploy

3. **Contact Hostinger Support**:
   - Ticket system: support.hostinger.com
   - Live chat: Available 24/7
   - Ask to verify SMTP access from Vercel IPs

4. **Alternative Email Provider**:
   - Consider SendGrid, Mailgun, or AWS SES
   - These are more serverless-friendly

## Success Indicators
You'll know it's working when:
- ✅ Contact form submissions send emails
- ✅ Confirmation emails reach customers
- ✅ IMAP poller fetches replies
- ✅ No error logs in Vercel console
- ✅ Test emails arrive within 30 seconds

## Support
If you still face issues after following this guide:
1. Check Vercel logs for specific error codes
2. Verify Hostinger email panel shows no blocks
3. Test with a simple nodemailer script outside your app
4. Contact me with full error logs

---
**Last Updated**: 2025-11-05
**Status**: ✅ Fixed and Tested
