@echo off
echo Nexlife Admin Panel Vercel Deployment Script
echo ============================================

cd adminPanel\admin-panel

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
echo Remember to set the following environment variable in your Vercel dashboard:
echo - NEXT_PUBLIC_BACKEND_URL: https://nexlife-api.vercel.app
echo.
echo Your admin panel will be available at: https://nexlife-admin.vercel.app