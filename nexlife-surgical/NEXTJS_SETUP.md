# Nexlife International - Next.js Conversion

This project has been successfully converted from React + Vite to Next.js 15 with the App Router, maintaining the exact same UI/UX.

## 🚀 Quick Start

### 1. Install Dependencies

First, backup your current `package.json` and use the Next.js version:

```bash
# Backup current package.json
cp package.json package.vite.json

# Use the Next.js package.json
cp package.nextjs.json package.json

# Install dependencies
npm install
```

### 2. Use Next.js TypeScript Config

```bash
# Backup current tsconfig
cp tsconfig.json tsconfig.vite.json

# Use the Next.js tsconfig
cp tsconfig.nextjs.json tsconfig.json
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
nexlife-sur/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with Navbar & Footer
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   ├── products/
│   │   └── page.tsx             # Products listing page
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx         # Dynamic product detail page
│   ├── about/
│   │   └── page.tsx             # About page
│   ├── contact/
│   │   └── page.tsx             # Contact page
│   └── not-found.tsx            # 404 page
├── components/                   # Shared components
│   ├── Navbar.tsx               # Navigation bar
│   └── Footer.tsx               # Footer
├── lib/
│   └── data/
│       └── products.ts          # Products data
├── public/
│   └── images/                  # Static images
│       ├── nexlife-logo.png     # Nexlife logo
│       └── logo.png             # Alternative logo
├── next.config.js               # Next.js configuration
├── package.nextjs.json          # Next.js dependencies
└── tsconfig.nextjs.json         # TypeScript config for Next.js
```

## 🔄 Key Conversions Made

### Navigation
- `react-router` → `next/navigation`
- `Link` from `react-router` → `Link` from `next/link`
- `useParams()` → `useParams()` from `next/navigation`
- `useSearchParams()` → `useSearchParams()` from `next/navigation`
- `Navigate` component → `notFound()` function

### Components
- Added `"use client"` directive for interactive components
- Converted `<img>` to Next.js `<Image>` component for optimization
- Updated all imports to use `@/` path alias

### Pages Created
1. **Home** (`app/page.tsx`) - Hero carousel, categories, featured products
2. **Products** (`app/products/page.tsx`) - Filterable product listing
3. **Product Detail** (`app/product/[slug]/page.tsx`) - Individual product pages
4. **About** (`app/about/page.tsx`) - Company information
5. **Contact** (`app/contact/page.tsx`) - Contact form
6. **404** (`app/not-found.tsx`) - Error page

## 🎨 Features Maintained

✅ Exact same UI/UX as original  
✅ All animations and transitions  
✅ Responsive design  
✅ Hero carousel with auto-play  
✅ Product filtering and search  
✅ Category navigation  
✅ Mobile-responsive navigation drawer  
✅ Contact form validation  
✅ All Radix UI components  
✅ Tailwind CSS styling  
✅ Lucide React icons  

## 🖼️ Images & Assets

All images from `src/public/` are now in the `public/` directory:
- Logo images: `/images/nexlife-logo.png` and `/images/logo.png`
- All other assets from `src/public/` are available in `public/`

## 📦 Dependencies

The Next.js version includes all the same UI libraries:
- Next.js 15.1.6
- React 18.3.1
- Tailwind CSS 4.1.12
- Radix UI components
- Lucide React icons
- All other original dependencies

## 🔧 Configuration Files

### next.config.js
Configures Next.js to allow Unsplash images and other settings.

### tsconfig.nextjs.json
TypeScript configuration optimized for Next.js with path aliases.

## 🚨 Important Notes

1. **Image Optimization**: The Next.js `<Image>` component provides automatic optimization
2. **Server Components**: Most pages are server components by default for better performance
3. **Client Components**: Interactive components use `"use client"` directive
4. **Route Handlers**: Can be added in `app/api/` for backend functionality
5. **Metadata**: SEO metadata is configured in `app/layout.tsx`

## 📝 Scripts

```json
{
  "dev": "next dev",          // Start development server
  "build": "next build",      // Build for production
  "start": "next start",      // Start production server
  "lint": "next lint"         // Run ESLint
}
```

## 🌐 Environment Variables

Create a `.env.local` file for environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
# Add other environment variables as needed
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

## 🆘 Troubleshooting

### Issue: Images not loading
- Make sure images are in the `public/` directory
- Reference them with `/images/...` (no `public` in the path)

### Issue: Module not found
- Run `npm install` to ensure all dependencies are installed
- Check that path aliases in `tsconfig.json` are correct

### Issue: Build errors
- Delete `.next` folder and `node_modules`
- Run `npm install` and `npm run build` again

## ✨ What's Next?

You can now:
- Add API routes in `app/api/`
- Implement server-side data fetching
- Add authentication with NextAuth.js
- Deploy to Vercel, Netlify, or any Node.js host
- Add more pages and features

---

**Converted by:** Claude Code  
**Date:** June 7, 2026  
**Framework:** Next.js 15 with App Router
