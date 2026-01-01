#!/bin/bash

# Nexlife Backend Deployment Script for Vercel
# This script helps deploy the backend with proper email configuration

echo "🚀 Nexlife Backend Vercel Deployment"
echo "===================================="
echo ""

# Check if in backend directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ .env created. Please edit it with your actual credentials."
        exit 1
    else
        echo "❌ Error: env.example not found"
        exit 1
    fi
fi

# Test email connection before deploying
echo "📧 Testing email connection..."
npm run test-connection

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Email connection test failed!"
    echo "Please fix the issues before deploying to Vercel."
    echo ""
    read -p "Do you want to deploy anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "✅ Email connection test passed!"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Ask for deployment type
echo "Select deployment type:"
echo "1) Production (--prod)"
echo "2) Preview (default)"
read -p "Enter choice (1-2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo ""
        echo "🚀 Deploying preview..."
        vercel
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Verify these variables are set:"
    echo "   - SMTP_HOST=smtpout.secureserver.net"
    echo "   - SMTP_PORT=587"
    echo "   - SMTP_USER=info@nexlifeinternational.com"
    echo "   - SMTP_PASS=Nexlife@2025"
    echo "   - IMAP_HOST=imap.secureserver.net"
    echo "   - IMAP_PORT=993"
    echo "   - IMAP_USER=info@nexlifeinternational.com"
    echo "   - IMAP_PASS=Nexlife@2025"
    echo ""
    echo "5. Test the deployment with:"
    echo "   curl -X POST https://your-backend.vercel.app/api/test-email \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"to\": \"your-email@example.com\", \"template\": \"contact\"}'"
    echo ""
    echo "📚 For troubleshooting, see EMAIL_FIX_VERCEL.md"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above."
    exit 1
fi
