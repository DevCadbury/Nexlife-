# Vercel Deployment Guide for Nexlife Admin Panel

## Prerequisites
- Vercel CLI installed (`npm i -g vercel`)
- Vercel account with access to the nexlife-admin project
- Backend API deployed at https://nexlife-api.vercel.app/

## Environment Variables Setup

Set this environment variable in your Vercel dashboard:

### Backend Configuration
- `NEXT_PUBLIC_BACKEND_URL`: `https://nexlife-api.vercel.app`

## Deployment Steps

1. **Navigate to admin panel directory:**
   ```bash
   cd adminPanel/admin-panel
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
   vercel domains add nexlife-admin.vercel.app
   ```

## API Configuration

The admin panel is configured to:
- Use `NEXT_PUBLIC_BACKEND_URL` environment variable for backend API calls
- Fall back to `/api` reverse proxy for local development
- Include JWT authentication headers automatically

## Features

After deployment, your admin panel will be available at:
`https://nexlife-admin.vercel.app/`

Available features:
- Dashboard with analytics and statistics
- Inquiry management (view, reply, mark as read)
- Staff management
- Gallery management
- Email campaign management
- System logs and exports

## Testing Deployment

After deployment, test by accessing:
`https://nexlife-admin.vercel.app/`

## Troubleshooting

1. **Backend Connection**: Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly
2. **CORS Issues**: Backend should allow requests from the admin panel domain
3. **Authentication**: JWT tokens should be properly handled

## Updating Deployment

To update the deployed version:
```bash
cd adminPanel/admin-panel
vercel --prod
```

The deployment will automatically update with the latest code changes.