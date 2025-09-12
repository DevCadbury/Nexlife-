#!/bin/bash

# Nexlife International - Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 Starting Nexlife International deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed!"
    print_status "Installing Vercel CLI globally..."
    npm install -g vercel
    print_success "Vercel CLI installed successfully!"
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You are not logged in to Vercel!"
    print_status "Please log in to Vercel..."
    vercel login
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    read -p "Do you want to commit them before deployment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Committing changes..."
        git add .
        git commit -m "Auto-commit before Vercel deployment"
        print_success "Changes committed!"
    else
        print_warning "Proceeding with uncommitted changes..."
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run build to check for errors
print_status "Building project..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Please fix the errors before deploying."
    exit 1
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "🎉 Deployment completed successfully!"
    print_status "Your site is now live on Vercel!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "Check Vercel dashboard for URL")
    print_status "Deployment URL: https://$DEPLOYMENT_URL"
    
    # Open in browser (optional)
    read -p "Do you want to open the deployment in your browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "https://$DEPLOYMENT_URL"
        elif command -v open &> /dev/null; then
            open "https://$DEPLOYMENT_URL"
        elif command -v start &> /dev/null; then
            start "https://$DEPLOYMENT_URL"
        else
            print_warning "Could not open browser automatically. Please visit: https://$DEPLOYMENT_URL"
        fi
    fi
else
    print_error "Deployment failed!"
    exit 1
fi

print_success "Deployment script completed!"
