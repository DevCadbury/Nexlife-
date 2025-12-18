# Vercel Deployment Guide for Nexlife Backend API

## Prerequisites
- Vercel CLI installed (`npm i -g vercel`)
- Vercel account with access to the nexlife-international project
- All environment variables configured in Vercel dashboard

## Environment Variables Setup

Before deploying, ensure these environment variables are set in your Vercel dashboard:

### Email Configuration
- `SMTP_HOST`: Your SMTP server host
- `SMTP_PORT`: SMTP port (usually 587 or 465)
- `SMTP_SECURE`: true/false for secure connection
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `CONTACT_TO`: Email address for contact form submissions

### Database Configuration
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name

### Authentication
- `JWT_SECRET`: Secret key for JWT tokens
- `DASH_PASSWORD`: Dashboard password
- `SUPERADMIN_EMAIL`: Super admin email
- `SUPERADMIN_PASSWORD`: Super admin password

### Cloudinary (for image uploads)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### IMAP (for inbound email processing)
- `IMAP_HOST`: IMAP server host
- `IMAP_PORT`: IMAP port
- `IMAP_SECURE`: true/false for secure connection
- `IMAP_USER`: IMAP username
- `IMAP_PASS`: IMAP password

## Deployment Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Login to Vercel (if not already logged in):**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Set production domain (optional):**
   If you want to use a custom domain, configure it in Vercel dashboard or use:
   ```bash
   vercel domains add nexlife-api.vercel.app
   ```

## CORS Configuration

The backend is configured to allow requests from:
- `https://nexlife-admin.vercel.app/` (Admin panel)
- `https://www.nexlifeinternational.com/` (Main website)
- `http://localhost:3000` (Local development)
- `http://localhost:5173` (Local development)

## API Endpoints

After deployment, your API will be available at:
`https://nexlife-api.vercel.app/`

Available endpoints:
- `/api/auth/*` - Authentication routes
- `/api/gallery/*` - Gallery management
- `/api/inquiries/*` - Contact inquiries
- `/api/analytics/*` - Analytics data
- `/api/staff/*` - Staff management
- `/api/subscribers/*` - Newsletter subscribers
- `/api/logs/*` - System logs
- `/api/exports/*` - Data exports

## Testing Deployment

After deployment, test the API endpoints using tools like Postman or curl:

```bash
curl https://nexlife-api.vercel.app/api/analytics/status
```

## Troubleshooting

1. **Environment Variables**: Ensure all required environment variables are set in Vercel dashboard
2. **CORS Issues**: Check that the requesting domain is in the allowed origins list
3. **Database Connection**: Verify MongoDB URI and credentials
4. **Function Timeout**: API functions have a 30-second timeout limit

## Updating Deployment

To update the deployed version:
```bash
cd backend
vercel --prod
```

The deployment will automatically update with the latest code changes.