# Complete Nexlife Deployment Guide

## Overview
This guide covers deploying both the Nexlife Backend API and Admin Panel to Vercel.

## Backend API Deployment

### Location: `backend/`
### Vercel URL: `https://nexlife-api.vercel.app/`

#### Environment Variables (Vercel Dashboard):
- `NEXT_PUBLIC_BACKEND_URL`: `https://nexlife-api.vercel.app`
- `MONGODB_URI`: Your MongoDB connection string
- `MONGODB_DB`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `CONTACT_TO`: Email for contact form submissions
- `DASH_PASSWORD`: Dashboard password
- `SUPERADMIN_EMAIL` & `SUPERADMIN_PASSWORD`: Super admin credentials
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `IMAP_HOST`, `IMAP_PORT`, `IMAP_SECURE`, `IMAP_USER`, `IMAP_PASS`

#### Deployment:
```bash
cd backend
./deploy.sh  # or deploy.bat on Windows
```

## Admin Panel Deployment

### Location: `adminPanel/admin-panel/`
### Vercel URL: `https://nexlife-admin.vercel.app/`

#### Environment Variables (Vercel Dashboard):
- `NEXT_PUBLIC_BACKEND_URL`: `https://nexlife-api.vercel.app`

#### Deployment:
```bash
cd adminPanel/admin-panel
./deploy.sh  # or deploy.bat on Windows
```

## CORS Configuration

The backend allows requests from:
- `https://nexlife-admin.vercel.app/` (Admin panel)
- `https://www.nexlifeinternational.com/` (Main website)
- Local development URLs (`localhost:3000`, `localhost:4000`, etc.)

## API Endpoints

### Backend API: `https://nexlife-api.vercel.app/api/`
- `/auth/*` - Authentication routes
- `/gallery/*` - Gallery management
- `/inquiries/*` - Contact inquiries
- `/analytics/*` - Analytics data
- `/staff/*` - Staff management
- `/subscribers/*` - Newsletter subscribers
- `/logs/*` - System logs
- `/exports/*` - Data exports

### Admin Panel: `https://nexlife-admin.vercel.app/`
- Dashboard with analytics
- Inquiry management
- Staff management
- Gallery management
- Email campaigns
- System logs

## Deployment Order

1. **Deploy Backend First**
   - Set all environment variables in Vercel dashboard
   - Deploy using the deployment script
   - Verify API is accessible at `https://nexlife-api.vercel.app/api/health`

2. **Deploy Admin Panel Second**
   - Set `NEXT_PUBLIC_BACKEND_URL` to `https://nexlife-api.vercel.app`
   - Deploy using the deployment script
   - Verify admin panel loads at `https://nexlife-admin.vercel.app`

## Testing

After deployment:
1. Test backend: `curl https://nexlife-api.vercel.app/api/health`
2. Test admin panel: Visit `https://nexlife-admin.vercel.app`
3. Test CORS: Admin panel should communicate with backend API

## Troubleshooting

### Backend Issues:
- Check environment variables in Vercel dashboard
- Verify MongoDB connection string
- Check Vercel function logs

### Admin Panel Issues:
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check that backend allows admin panel domain in CORS
- Check browser console for API errors

### CORS Issues:
- Ensure backend CORS allows admin panel domain
- Check that requests include proper headers
- Verify JWT tokens are being sent correctly