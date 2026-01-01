# Email Setup Guide for Nexlife Backend

This guide will help you configure email functionality using Hostinger's SMTP service.

## Prerequisites

1. A Hostinger hosting account with email service
2. A domain email address (e.g., `contact@nexlifeinternational.com`)
3. Access to Hostinger control panel

## Hostinger Email Configuration

### Step 1: Create Email Account

1. Log in to your Hostinger control panel
2. Go to **Email** section
3. Create a new email account (e.g., `contact@nexlifeinternational.com`)
4. Set a strong password for the email account

### Step 2: Get SMTP Settings

From your Hostinger control panel, note down these settings:

- **SMTP Host**: `smtp.hostinger.com`
- **SMTP Port**: `587` (for TLS) or `465` (for SSL)
- **Security**: TLS (recommended) or SSL
- **Username**: Your full email address
- **Password**: Your email account password

### Step 3: Configure Environment Variables

1. Copy `env.example` to `.env`:

   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Hostinger email settings:

   ```env
   # Hostinger Email Configuration
   SMTP_HOST=smtpout.secureserver.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=contact@nexlifeinternational.com
   SMTP_PASS=your-email-password

   # Where to send contact form emails
   CONTACT_TO=contact@nexlifeinternational.com
   ```

## Available Email Endpoints

### 1. Contact Form (`POST /api/contact`)

Sends contact form submissions to your email.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about products",
  "message": "I would like to know more about your products."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "messageId": "unique-message-id"
}
```

### 2. Newsletter Subscription (`POST /api/newsletter`)

Handles newsletter signups.

**Request Body:**

```json
{
  "email": "subscriber@example.com"
}
```

### 3. Product Inquiry (`POST /api/inquiry`)

For product-specific inquiries.

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "ABC Corp",
  "productName": "Product XYZ",
  "message": "I'm interested in bulk pricing for Product XYZ."
}
```

### 4. Test Email (`POST /api/test-email`)

**Requires authentication** - Tests email configuration.

**Request Body:**

```json
{
  "to": "test@example.com",
  "template": "contact"
}
```

## Email Templates

The system includes three pre-built email templates:

1. **Contact Template**: For general contact form submissions
2. **Newsletter Template**: For newsletter subscriptions
3. **Inquiry Template**: For product inquiries

All templates include:

- Professional HTML formatting
- Nexlife branding
- Responsive design
- Both HTML and plain text versions

## Testing Your Setup

### 1. Test Email Configuration

Use the test endpoint to verify your email setup:

```bash
curl -X POST http://localhost:4000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: nexlife_dash_auth=1" \
  -d '{"to": "your-email@example.com"}'
```

### 2. Test Contact Form

```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message to verify email functionality."
  }'
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**

   - Verify your email credentials
   - Check if 2FA is enabled (disable for SMTP)
   - Ensure the email account exists

2. **Connection Timeout**

   - Check your firewall settings
   - Verify SMTP host and port
   - Try different ports (587 vs 465)

3. **Emails Not Received**

   - Check spam folder
   - Verify recipient email address
   - Check Hostinger email logs

4. **SSL/TLS Errors**
   - Try `SMTP_SECURE=false` for port 587
   - Try `SMTP_SECURE=true` for port 465
   - Check if your hosting provider supports the security method

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed SMTP connection logs.

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **Email Validation**: All endpoints include email format validation
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Input Sanitization**: All user inputs are validated and sanitized

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique passwords
3. Enable SSL/TLS for email transmission
4. Monitor email delivery rates
5. Set up proper error logging

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your Hostinger email settings
3. Test with a simple email client first
4. Contact Hostinger support for SMTP issues

## API Documentation

For complete API documentation, visit your backend dashboard at:
`http://your-domain.com/` (after authentication)

The dashboard shows all available endpoints and their usage.

