@echo off
echo Nexlife Backend Vercel Deployment Script
echo ========================================

cd backend

echo Installing dependencies...
npm install

echo Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo Logging into Vercel...
vercel login

echo Deploying to Vercel...
vercel --prod

echo Deployment complete!
echo.
echo Remember to set the following environment variables in your Vercel dashboard:
echo - MONGODB_URI
echo - MONGODB_DB
echo - JWT_SECRET
echo - SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
echo - CONTACT_TO
echo - DASH_PASSWORD
echo - SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
echo - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
echo - IMAP_HOST, IMAP_PORT, IMAP_SECURE, IMAP_USER, IMAP_PASS
echo.
echo Your API will be available at: https://nexlife-api.vercel.app