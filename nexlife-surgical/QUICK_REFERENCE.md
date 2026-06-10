# ⚡ Quick Reference Card - NexLife Next.js

## 🚀 Getting Started (Copy & Paste)

```bash
# 1. Switch to Next.js config
cp package.nextjs.json package.json
cp tsconfig.nextjs.json tsconfig.json

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# Visit: http://localhost:3000
```

---

## 📁 Key Files & Locations

| What | Where |
|------|-------|
| **Home Page** | `app/page.tsx` |
| **Products List** | `app/products/page.tsx` |
| **Product Detail** | `app/product/[slug]/page.tsx` |
| **About** | `app/about/page.tsx` |
| **Contact** | `app/contact/page.tsx` |
| **Navbar** | `components/Navbar.tsx` |
| **Footer** | `components/Footer.tsx` |
| **Products Data** | `lib/data/products.ts` |
| **Your Logos** | `public/images/nexlife-logo.png` |
| | `public/images/logo.png` |
| **Config** | `next.config.js` |

---

## 🎨 Brand Assets

| Asset | Path |
|-------|------|
| **Main Logo** | `/images/nexlife-logo.png` |
| **Alt Logo** | `/images/logo.png` |
| **Navy Color** | `#0D2240` |
| **Teal Color** | `#0A8A78` |
| **Font** | Inter (Google Fonts) |

---

## 📝 Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Production
npm run build            # Build for production
npm start                # Start production server

# Other
npm run lint             # Lint code
npm run dev -- -p 3001   # Use different port
```

---

## 🌐 Routes

| URL | Page |
|-----|------|
| `/` | Home |
| `/products` | Products listing |
| `/products?category=surgical-instruments` | Filtered products |
| `/product/sterile-surgical-gloves-latex` | Product detail |
| `/about` | About page |
| `/contact` | Contact form |

---

## 🔧 Common Fixes

```bash
# Port already in use
npm run dev -- -p 3001

# Module not found
rm -rf node_modules package-lock.json && npm install

# Build fails
rm -rf .next && npm run build

# Clear everything
rm -rf node_modules .next package-lock.json
npm install && npm run build
```

---

## 📦 Deployment

```bash
# Vercel (easiest)
npm i -g vercel
vercel

# Build for any host
npm run build
npm start
```

---

## 💡 Quick Tips

| Tip | Detail |
|-----|--------|
| **Images** | Use `<Image src="/images/..." />` from `next/image` |
| **Links** | Use `<Link href="/...">` from `next/link` |
| **Client Components** | Add `"use client"` at top if using hooks |
| **Server Components** | Default - don't add anything |
| **Environment Vars** | Create `.env.local` file |
| **Path Aliases** | Use `@/components/...` instead of `../../` |

---

## 🎯 Testing Checklist

```
□ Home page loads
□ Hero carousel works
□ Click Products
□ Filter by category
□ Search products
□ Click a product
□ Check About page
□ Test Contact form
□ Try mobile menu
□ Test 404 (go to /invalid)
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **START_HERE.md** | ⭐ Begin here |
| **README_NEXTJS.md** | Full guide |
| **CONVERSION_SUMMARY.md** | Technical details |
| **PROJECT_STRUCTURE.md** | File tree |
| **QUICK_REFERENCE.md** | This file |

---

## 🆘 Need Help?

1. Check `START_HERE.md`
2. Check `README_NEXTJS.md`
3. Visit https://nextjs.org/docs
4. Check https://github.com/vercel/next.js/discussions

---

## ✅ Status

- ✅ All pages converted
- ✅ All components working
- ✅ All assets copied
- ✅ UI/UX identical
- ✅ Ready to deploy

---

## 🔗 Quick Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Vercel Deploy](https://vercel.com)

---

**Framework**: Next.js 15  
**Status**: ✅ Production Ready  
**Date**: June 7, 2026
