@echo off
REM Nexlife International - Vercel Deployment Script for Windows
REM This script automates the deployment process to Vercel

echo 🚀 Starting Nexlife International deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Vercel CLI is not installed!
    echo [INFO] Installing Vercel CLI globally...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Vercel CLI!
        pause
        exit /b 1
    )
    echo [SUCCESS] Vercel CLI installed successfully!
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] You are not logged in to Vercel!
    echo [INFO] Please log in to Vercel...
    vercel login
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not in a git repository!
    pause
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo [INFO] Current branch: %CURRENT_BRANCH%

REM Check for uncommitted changes
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    echo [WARNING] You have uncommitted changes!
    set /p COMMIT_CHANGES="Do you want to commit them before deployment? (y/n): "
    if /i "%COMMIT_CHANGES%"=="y" (
        echo [INFO] Committing changes...
        git add .
        git commit -m "Auto-commit before Vercel deployment"
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to commit changes!
            pause
            exit /b 1
        )
        echo [SUCCESS] Changes committed!
    ) else (
        echo [WARNING] Proceeding with uncommitted changes...
    )
)

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

REM Run build to check for errors
echo [INFO] Building project...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)
echo [SUCCESS] Build completed successfully!

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo [SUCCESS] 🎉 Deployment completed successfully!
echo [INFO] Your site is now live on Vercel!

REM Get deployment URL
for /f "tokens=*" %%i in ('vercel ls --json ^| jq -r ".[0].url" 2^>nul') do set DEPLOYMENT_URL=%%i
if "%DEPLOYMENT_URL%"=="" set DEPLOYMENT_URL=Check Vercel dashboard for URL
echo [INFO] Deployment URL: https://%DEPLOYMENT_URL%

REM Ask to open in browser
set /p OPEN_BROWSER="Do you want to open the deployment in your browser? (y/n): "
if /i "%OPEN_BROWSER%"=="y" (
    start https://%DEPLOYMENT_URL%
)

echo [SUCCESS] Deployment script completed!
pause
