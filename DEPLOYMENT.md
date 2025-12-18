# Vercel Deployment Guide for NexLife International

This guide will help you deploy the NexLife International website to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Node.js installed locally (for testing)

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git repository**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Build Settings**

   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at the provided URL

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **For production deployment**
   ```bash
   vercel --prod
   ```

## Configuration Files

The following files have been created/configured for Vercel deployment:

### `vercel.json`

- Configures build settings and routing
- Sets up SPA routing for React Router
- Optimizes asset caching

### `vite.config.js`

- Updated with build optimizations
- Code splitting configuration
- Asset handling for production

### `.vercelignore`

- Excludes unnecessary files from deployment

## Environment Variables

If you need to set environment variables:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add your variables (e.g., API keys, database URLs)

## Custom Domain

To use a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Domains
3. Add your domain
4. Follow the DNS configuration instructions

## Build Optimization

The project is configured with:

- Code splitting for better performance
- Asset optimization
- Proper caching headers
- SPA routing support

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Routing issues**: Ensure `vercel.json` has the correct rewrites
3. **Asset loading**: Verify image paths are correct
4. **Environment variables**: Make sure they're set in Vercel dashboard

### Build Logs:

- Check the build logs in Vercel dashboard for detailed error information
- Use `vercel logs` command if using CLI

## Performance Tips

1. **Image Optimization**: Consider using Vercel's Image Optimization
2. **CDN**: Vercel automatically provides global CDN
3. **Caching**: Static assets are cached for optimal performance

## Support

For Vercel-specific issues, refer to:

- [Vercel Documentation](https://vercel.com/docs)
- [Vite + Vercel Guide](https://vercel.com/guides/deploying-vitejs-to-vercel)

## Local Testing

Before deploying, test the production build locally:

```bash
npm run build
npm run preview
```

This will help identify any issues before deployment.
