@echo off
REM Nexlife Backend Deployment Script for Vercel (Windows)
REM This script helps deploy the backend with proper email configuration

echo.
echo ========================================
echo  Nexlife Backend Vercel Deployment
echo ========================================
echo.

REM Check if in backend directory
if not exist "server.js" (
    echo [ERROR] Please run this script from the backend directory
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist "env.example" (
        copy env.example .env
        echo [SUCCESS] .env created. Please edit it with your actual credentials.
        exit /b 1
    ) else (
        echo [ERROR] env.example not found
        exit /b 1
    )
)

REM Test email connection before deploying
echo [INFO] Testing email connection...
call npm run test-connection

if errorlevel 1 (
    echo.
    echo [ERROR] Email connection test failed!
    echo Please fix the issues before deploying to Vercel.
    echo.
    set /p continue="Do you want to deploy anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo Deployment cancelled.
        exit /b 1
    )
)

echo.
echo [SUCCESS] Email connection test passed!
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Vercel CLI not found
    echo Install it with: npm install -g vercel
    exit /b 1
)

REM Ask for deployment type
echo Select deployment type:
echo 1^) Production (--prod^)
echo 2^) Preview (default^)
set /p choice="Enter choice (1-2): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Deploying to production...
    vercel --prod
) else (
    echo.
    echo [INFO] Deploying preview...
    vercel
)

if errorlevel 1 (
    echo.
    echo [ERROR] Deployment failed!
    echo Check the error messages above.
    exit /b 1
)

echo.
echo [SUCCESS] Deployment successful!
echo.
echo ========================================
echo  Next Steps
echo ========================================
echo.
echo 1. Go to Vercel dashboard: https://vercel.com/dashboard
echo 2. Select your project
echo 3. Go to Settings - Environment Variables
echo 4. Verify these variables are set:
echo    - SMTP_HOST=smtpout.secureserver.net
echo    - SMTP_PORT=587
echo    - SMTP_USER=info@nexlifeinternational.com
echo    - SMTP_PASS=Nexlife@2025
echo    - IMAP_HOST=imap.secureserver.net
echo    - IMAP_PORT=993
echo    - IMAP_USER=info@nexlifeinternational.com
echo    - IMAP_PASS=Nexlife@2025
echo.
echo 5. Test the deployment with:
echo    curl -X POST https://your-backend.vercel.app/api/test-email ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"to\": \"your-email@example.com\", \"template\": \"contact\"}"
echo.
echo For troubleshooting, see EMAIL_FIX_VERCEL.md
echo.

pause
