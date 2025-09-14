import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Read the sitemap file
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// Replace all lastmod dates with current date
sitemapContent = sitemapContent.replace(/<lastmod>2024-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${currentDate}</lastmod>`);

// Write the updated sitemap back
fs.writeFileSync(sitemapPath, sitemapContent);

console.log(`✅ Sitemap updated with current date: ${currentDate}`);
console.log('📝 All lastmod dates have been updated to today\'s date');
