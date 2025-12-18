#!/bin/bash

echo "Nexlife Admin Panel Vercel Deployment Script"
echo "============================================"

cd adminPanel/admin-panel

echo "Installing dependencies..."
npm install

echo "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo "Logging into Vercel..."
vercel login

echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
echo ""
echo "Remember to set the following environment variable in your Vercel dashboard:"
echo "- NEXT_PUBLIC_BACKEND_URL: https://nexlife-api.vercel.app"
echo ""
echo "Your admin panel will be available at: https://nexlife-admin.vercel.app"