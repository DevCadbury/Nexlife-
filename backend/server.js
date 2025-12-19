import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import inquiriesRouter from "./routes/inquiries.js";
import subscribersRouter from "./routes/subscribers.js";
import exportsRouter from "./routes/exports.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter, { seedSuperAdmin } from "./routes/auth.js";
import staffRouter from "./routes/staff.js";
import galleryRouter from "./routes/gallery.js";
import productsGalleryRouter from "./routes/products-gallery.js";
import certificationsRouter from "./routes/certifications.js";
import inboundRouter from "./routes/inbound.js";
import logsRouter from "./routes/logs.js";
import templatesRouter from "./routes/templates.js";
import { startInboundImapPoller } from "./inbound-imap.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// duplicate imports removed
import { getCollections, getConnectionStatus } from "./db.js";
import { sendEmail, validateEmail, emailTemplates } from "./config/email.js";
// duplicate imports removed

dotenv.config();

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available (recommended)
  cloudinary.config({
    cloud_name: "dqnhpmoej",
    api_key: "159867665417568",
    api_secret: "UjVH-Wj-XwiiKyYdeewjRxnDIzA",
  });
} else {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqnhpmoej",
    api_key: process.env.CLOUDINARY_API_KEY || "159867665417568",
    api_secret:
      process.env.CLOUDINARY_API_SECRET || "UjVH-Wj-XwiiKyYdeewjRxnDIzA",
  });
}

console.log(
  "Cloudinary configured with cloud_name:",
  cloudinary.config().cloud_name
);

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'https://nexlife-admin.vercel.app',
        'https://www.nexlifeinternational.com',
        'https://nexlifeinternational.com',
        'https://nexlife.vercel.app/',
        'http://localhost:3000', // For local development
        'http://localhost:3001', // For local development
        'http://localhost:4000', // For local development
        'http://localhost:4001'  // For local development
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "X-Requested-With",
    ],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Handle payload too large errors
app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    console.error("Payload too large error:", {
      url: req.url,
      method: req.method,
      contentLength: req.get("content-length"),
      contentType: req.get("content-type"),
    });
    return res.status(413).json({
      error: "Request entity too large",
      message:
        "The request body exceeds the maximum allowed size. Please reduce the size of your request.",
    });
  }
  next(error);
});

const DASH_PASSWORD = process.env.DASH_PASSWORD || "Nexlife@2025";
const AUTH_COOKIE = "nexlife_dash_auth";

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [k, v] = part.split("=");
    if (k && v) acc[k.trim()] = decodeURIComponent(v);
    return acc;
  }, {});
}

function requireDashboardAuth(req, res, next) {
  const cookies = parseCookies(req);
  if (
    cookies[AUTH_COOKIE] === "1" ||
    (cookies["nxl_jwt"] && cookies["nxl_jwt"].length > 10)
  )
    return next();
  res.redirect("/login");
}

// ===== MongoDB setup =====
// Use centralized DB utils
async function getAllLikes() {
  const { likes } = await getCollections();
  const docs = await likes.find({}).toArray();
  const map = {};
  for (const d of docs) map[d.id] = d.count || 0;
  return map;
}

async function incrementLikeDb(id) {
  const { likes } = await getCollections();
  const result = await likes.findOneAndUpdate(
    { id: String(id) },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result?.value?.count || 0;
}

app.get("/login", (req, res) => {
  const showError = String(req.query.e || "") === "1";
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login • Nexlife Backend</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#0b1220,#030712);font-family:ui-sans-serif,system-ui;-webkit-font-smoothing:antialiased}
    .card{width:100%;max-width:440px;background:#0f172a;border:1px solid #334155;border-radius:14px;color:#e2e8f0;box-shadow:0 10px 30px rgba(0,0,0,.25)}
    .head{padding:20px 18px;border-bottom:1px solid #334155}
    .title{margin:0;font-weight:800;font-size:18px}
    .body{padding:20px 18px 22px;display:flex;flex-direction:column;gap:10px}
    label{display:block;margin:0 0 6px 2px;color:#94a3b8;font-size:13px}
    input{width:100%;padding:12px 12px;border-radius:10px;border:1px solid #334155;background:#0b1220;color:#e2e8f0;outline:none;box-sizing:border-box}
    input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.25)}
    button{margin-top:8px;width:100%;padding:12px;border-radius:10px;background:linear-gradient(90deg,#22d3ee,#6366f1);border:0;color:white;font-weight:700}
    .muted{padding:12px 18px;color:#94a3b8;font-size:12px}
    .err{color:#fca5a5;margin-top:4px;font-size:12px;min-height:14px}
    .wa{color:#a7f3d0;text-decoration:none}
    .wa:hover{color:#6ee7b7}
  </style>
</head>
<body>
  <form class="card" method="post" action="/login">
    <div class="head"><h1 class="title">Nexlife Backend Login</h1></div>
    <div class="body">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" placeholder="Enter email" required />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" placeholder="Enter password" required />
      <div class="err">${showError ? "Invalid password" : ""}</div>
      <button type="submit">Sign in</button>
    </div>
    <div class="muted">Contact Developer • <a class="wa" href="https://wa.me/919973297390" target="_blank" rel="noopener noreferrer">WhatsApp +91 9973297390</a></div>
  </form>
</body>
</html>`);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const base = req.protocol + "://" + req.get("host");
    const r = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (r.ok) {
      const data = await r.json();
      res.setHeader(
        "Set-Cookie",
        `nxl_jwt=${encodeURIComponent(
          data.token
        )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}`
      );
      res.setHeader(
        "Set-Cookie",
        `${AUTH_COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
          60 * 60 * 12
        }`
      );
      return res.redirect("/admin");
    }
  } catch (e) {}
  res.redirect("/login?e=1");
});

app.post("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  res.redirect("/login");
});

app.get("/", requireDashboardAuth, async (req, res) => {
  const likes = await getAllLikes();
  const total = Object.values(likes).reduce((a, b) => a + Number(b || 0), 0);
  const rows = Object.entries(likes)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(
      ([id, count]) =>
        `<tr>
          <td class="cell">${id}</td>
          <td class="cell">${count}</td>
        </tr>`
    )
    .join("");

  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nexlife Backend Dashboard</title>
  <style>
    :root { --bg:#0b1220; --panel:#0f172a; --muted:#94a3b8; --text:#e2e8f0; --brandA:#22d3ee; --brandB:#6366f1; --ring:#334155; --green:#22c55e; }
    *{box-sizing:border-box}
    body{margin:0;color:var(--text);background:linear-gradient(135deg,#030712,#0b1220);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;min-height:100vh}
    .hero{padding:48px 24px;position:relative;overflow:hidden;background:radial-gradient(1200px 600px at -10% -20%, rgba(34,211,238,.15), transparent),radial-gradient(800px 400px at 110% 0%, rgba(99,102,241,.18), transparent);border-bottom:1px solid #0b1220}
    .container{max-width:1080px;margin:0 auto;padding:0 16px}
    .title{font-size:28px;font-weight:800;letter-spacing:.2px}
    .subtitle{color:var(--muted);margin-top:6px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:24px}
    .card{background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.01));border:1px solid var(--ring);border-radius:14px;padding:16px;backdrop-filter:blur(6px);box-shadow:0 10px 30px rgba(0,0,0,.25)}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(34,197,94,.12);color:#86efac;border:1px solid rgba(34,197,94,.25);font-weight:600;font-size:12px}
    .links{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
    .link{color:var(--text);text-decoration:none;font-weight:600;font-size:14px;padding:10px 12px;border:1px solid var(--ring);border-radius:10px;background:#0b1220}
    .link:hover{border-color:var(--brandB);color:#c7d2fe}
    .likes{margin-top:24px}
    table{width:100%;border-collapse:collapse;overflow:hidden;border-radius:12px;border:1px solid var(--ring)}
    thead th{text-align:left;font-weight:700;color:#cbd5e1;padding:12px;background:linear-gradient(180deg,rgba(99,102,241,.20),rgba(99,102,241,.05));border-bottom:1px solid var(--ring)}
    .cell{padding:12px;border-bottom:1px solid var(--ring);color:var(--text)}
    tbody tr:hover{background:rgba(148,163,184,.06)}
    .stat{font-weight:800;font-size:22px}
    .muted{color:var(--muted);font-size:13px}
    .footer{text-align:center;padding:24px;color:var(--muted);font-size:12px}
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px}
  </style>
</head>
<body>
  <header class="hero">
    <div class="container">
      <div class="topbar">
        <div>
          <div class="badge">● Online <span style="opacity:.8">—</span> Nexlife Backend</div>
          <div class="title" style="margin-top:10px">Service Dashboard</div>
          <div class="subtitle">${new Date().toLocaleString()}</div>
        </div>
        <form method="post" action="/logout"><button class="link" style="border:0;cursor:pointer">Logout</button></form>
      </div>
      <div class="grid">
        <div class="card">
          <div class="muted">Total Likes</div>
          <div class="stat">${total}</div>
        </div>
        <div class="card">
          <div class="muted">Images Tracked</div>
          <div class="stat">${Object.keys(likes).length}</div>
        </div>
        <div class="card">
          <div class="muted">API Endpoints</div>
          <div class="links">
            <a class="link" href="/api/likes">GET /api/likes</a>
            <a class="link" href="#" onclick="alert('POST /api/likes/:id')">POST /api/likes/:id</a>
            <a class="link" href="#" onclick="alert('POST /api/contact')">POST /api/contact</a>
            <a class="link" href="#" onclick="alert('POST /api/newsletter')">POST /api/newsletter</a>
            <a class="link" href="#" onclick="alert('POST /api/inquiry')">POST /api/inquiry</a>
            <a class="link" href="#" onclick="alert('POST /api/test-email')">POST /api/test-email</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="container likes">
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
        <h2 style="margin:0;font-size:16px">Current Like Counts</h2>
        <button onclick="location.reload()" class="link" style="padding:8px 10px;">Refresh</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Image ID</th>
            <th>Likes</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows ||
            '<tr><td class="cell" colspan="2" style="text-align:center;color:#94a3b8">No data yet. Like an image to see it here.</td></tr>'
          }
        </tbody>
      </table>
    </div>
  </main>

  <div class="footer">© ${new Date().getFullYear()} Nexlife International • Backend v1</div>
</body>
</html>`);
});

// Seed super admin once server boots
seedSuperAdmin().catch(console.error);

// Modern Admin Dashboard UI at /admin
app.get("/admin", requireDashboardAuth, async (req, res) => {
  const likes = await getAllLikes();
  const totalLikes = Object.values(likes).reduce(
    (a, b) => a + Number(b || 0),
    0
  );
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nexlife CRM • Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>body{font-family:Inter,ui-sans-serif,system-ui}</style>
</head>
<body class="bg-slate-950 text-slate-100">
  <header class="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500"></div>
        <div>
          <div class="text-lg font-extrabold">Nexlife CRM</div>
          <div class="text-xs text-slate-400">Admin Dashboard</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button id="bell" title="New submissions" class="relative rounded-lg border border-slate-800 px-3 py-2 hover:border-indigo-500">
          <span class="text-sm">Notifications</span>
          <span id="badge" class="hidden absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"></span>
        </button>
        <form method="post" action="/logout"><button class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold">Logout</button></form>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Total Likes</div><div id="statLikes" class="text-2xl font-extrabold mt-1">${totalLikes}</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">New Submissions</div><div id="statNew" class="text-2xl font-extrabold mt-1">0</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Replied</div><div id="statReplied" class="text-2xl font-extrabold mt-1">0</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Subscribers</div><div id="statSubs" class="text-2xl font-extrabold mt-1">0</div></div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-xl border border-slate-800 p-4 bg-slate-900/50">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Submissions (Last 7 days)</h2>
          <select id="range" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm">
            <option value="7">7d</option>
            <option value="30">30d</option>
            <option value="60">60d</option>
          </select>
        </div>
        <canvas id="submissionsChart" height="120"></canvas>
      </div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
        <h2 class="font-semibold mb-3">Quick Actions</h2>
        <div class="space-y-2">
          <button id="exportContacts" class="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-sm font-semibold">Export Contacts CSV</button>
          <button id="exportLogs" class="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold">Export Logs CSV</button>
        </div>
        <form id="campaignForm" class="mt-4 space-y-2">
          <div class="text-sm text-slate-300">Send Campaign</div>
          <input id="campSubj" placeholder="Subject" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
          <textarea id="campMsg" placeholder="Message" rows="4" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"></textarea>
          <button class="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold" type="submit">Send to all subscribers</button>
        </form>
      </div>
    </section>

    <section class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Latest Inquiries</h2>
        <div class="text-sm text-slate-400"><span id="totalInquiries">0</span> total</div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400">
              <th class="p-2">Name</th>
              <th class="p-2">Email</th>
              <th class="p-2">Subject</th>
              <th class="p-2">Status</th>
              <th class="p-2">Received</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody id="inqBody"></tbody>
        </table>
      </div>
    </section>
  </main>

  <script>
    const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    async function fetchJSON(url, opts) {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }

    async function loadStats() {
      const [overview, subs] = await Promise.all([
        fetchJSON('/api/analytics/overview'),
        fetchJSON('/api/subscribers'),
      ]);
      document.getElementById('statSubs').textContent = subs.total;
      // derive new and replied from latest list
      const list = await fetchJSON('/api/inquiries?limit=100');
      document.getElementById('totalInquiries').textContent = list.total;
      const newCount = list.items.filter(i => i.status === 'new').length;
      const replied = list.items.filter(i => i.status === 'replied').length;
      document.getElementById('statNew').textContent = newCount;
      document.getElementById('statReplied').textContent = replied;
      const badge = document.getElementById('badge');
      if (newCount > 0) { badge.textContent = newCount; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); }
      renderInquiries(list.items);
    }

    function renderInquiries(items) {
      const tbody = document.getElementById('inqBody');
      tbody.innerHTML = items.slice(0, 10).map(function(i){
        var statusClass = i.status==='new' ? 'bg-amber-500/20 text-amber-300' : (i.status==='replied' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-200');
        var emailEsc = String(i.email||'').replace(/'/g, "&#39;");
        return '<tr class="border-t border-slate-800">'
          + '<td class="p-2">' + (i.name || '') + '</td>'
          + '<td class="p-2 text-cyan-300">' + (i.email || '') + '</td>'
          + '<td class="p-2">' + ((i.subject||'').slice(0,60)) + '</td>'
          + '<td class="p-2"><span class="px-2 py-0.5 rounded text-xs ' + statusClass + '">' + i.status + '</span></td>'
          + '<td class="p-2">' + (i.createdAt ? fmt.format(new Date(i.createdAt)) : '') + '</td>'
          + '<td class="p-2">'
          +   '<button class="text-xs text-indigo-400 hover:text-indigo-300" onclick="markRead(\'' + i._id + '\')">Mark read</button>'
          +   '<button class="ml-2 text-xs text-emerald-400 hover:text-emerald-300" onclick="replyInquiry(\'' + i._id + '\', \'" + emailEsc + "\')">Reply</button>'
          + '</td>'
          + '</tr>';
      }).join('');
    }

    async function markRead(id) {
      await fetchJSON('/api/inquiries/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status: 'read' }) });
      loadStats();
    }

    async function replyInquiry(id, email) {
      const subject = prompt('Subject for reply to ' + email + ':');
      if (!subject) return;
      const message = prompt('Message:');
      if (!message) return;
      await fetchJSON('/api/inquiries/' + id + '/reply', { method: 'POST', body: JSON.stringify({ subject, message }) });
      loadStats();
    }

    async function loadChart(range) {
      const data = await fetchJSON('/api/analytics/submissions?range=' + range);
      const labels = data.series.map(p => p._id);
      const counts = data.series.map(p => p.count);
      const news = data.series.map(p => p.new);
      if (window._chart) window._chart.destroy();
      const ctx = document.getElementById('submissionsChart');
      window._chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Total', data: counts, borderColor: '#6366f1', tension: .3 },
            { label: 'New', data: news, borderColor: '#22d3ee', tension: .3 },
          ]
        },
        options: { plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks:{ color:'#94a3b8' } }, y: { ticks:{ color:'#94a3b8' } } } }
      });
    }

    document.getElementById('range').addEventListener('change', (e) => loadChart(e.target.value));
    document.getElementById('exportContacts').addEventListener('click', () => location.href = '/api/export/contacts.csv');
    document.getElementById('exportLogs').addEventListener('click', () => location.href = '/api/export/logs.csv');
    document.getElementById('campaignForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const subject = document.getElementById('campSubj').value.trim();
      const message = document.getElementById('campMsg').value.trim();
      if (!subject || !message) return alert('Subject and message required');
      const res = await fetchJSON('/api/subscribers/campaign', { method: 'POST', body: JSON.stringify({ subject, message }) });
      alert('Campaign sent: ' + res.sent + ' sent, ' + res.failed + ' failed');
    });

    loadStats();
    loadChart(7);
    setInterval(loadStats, 15000);
  </script>
</body>
</html>`);
});

// Serve static admin app
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(
  "/admin",
  requireDashboardAuth,
  express.static(path.join(__dirname, "public", "admin"))
);

// API routes
app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);

app.get("/api/likes", async (req, res) => {
  const likes = await getAllLikes();
  res.json(likes);
});

app.post("/api/likes/:id", async (req, res) => {
  const id = String(req.params.id);
  await incrementLikeDb(id);
  const likes = await getAllLikes();
  res.json(likes);
});

// Enhanced contact endpoint with validation and better error handling
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message, phone, productName } = req.body || {};

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email", "message"],
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (name.length < 2) {
    return res
      .status(400)
      .json({ error: "Name must be at least 2 characters long" });
  }

  if (message.length < 10) {
    return res
      .status(400)
      .json({ error: "Message must be at least 10 characters long" });
  }

  try {
    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER;
    
    // Send notification email to admin
    const adminResult = await sendEmail(toAddress, "contact", {
      name,
      email,
      subject: subject || "New Contact Form Submission",
      message,
      phone,
      productName,
    });

    // Send confirmation email to customer with PDF attachment
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pdfPath = path.join(__dirname, 'public', 'admin', 'PRODUCT-CATALOGE.pdf');
    
    let confirmationResult;
    try {
      confirmationResult = await sendEmail(
        email, 
        "contactConfirmation", 
        {
          name,
          email,
          subject: subject || "General Inquiry",
          phone,
          productName,
        },
        {
          replyTo: toAddress,
          attachments: [
            {
              filename: 'Nexlife-Product-Catalogue.pdf',
              path: pdfPath,
              contentType: 'application/pdf'
            }
          ]
        }
      );
    } catch (pdfError) {
      console.error("Error sending confirmation with PDF:", pdfError);
      // Still send confirmation without PDF if attachment fails
      confirmationResult = await sendEmail(
        email, 
        "contactConfirmation", 
        {
          name,
          email,
          subject: subject || "General Inquiry",
          phone,
          productName,
        },
        {
          replyTo: toAddress,
        }
      );
    }

    if (adminResult.success) {
      res.json({
        success: true,
        message: "Message sent successfully. Check your email for confirmation.",
        messageId: adminResult.messageId,
        confirmationSent: confirmationResult?.success || false,
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to send message", details: adminResult.error });
    }
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Newsletter subscription endpoint
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER;
    const result = await sendEmail(toAddress, "newsletter", { email });

    if (result.success) {
      res.json({
        success: true,
        message: "Newsletter subscription successful",
      });
    } else {
      res.status(500).json({
        error: "Failed to process subscription",
        details: result.error,
      });
    }
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Product inquiry endpoint
app.post("/api/inquiry", async (req, res) => {
  // Backwards compatibility; delegate to new inquiries router
  req.url = "/";
  return inquiriesRouter.handle(req, res);
});

// Email test endpoint (for debugging)
app.post("/api/test-email", requireDashboardAuth, async (req, res) => {
  const { to, template = "contact" } = req.body || {};

  if (!to) {
    return res.status(400).json({ error: "Recipient email is required" });
  }

  if (!validateEmail(to)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const testData = {
      name: "Test User",
      email: to,
      subject: "Test Email from Nexlife Backend",
      message:
        "This is a test email to verify the email configuration is working correctly.",
      productName: "Test Product",
    };

    const result = await sendEmail(to, template, testData);

    if (result.success) {
      res.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId,
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to send test email", details: result.error });
    }
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve product catalogue PDF
app.get("/catalogue.pdf", (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pdfPath = path.join(__dirname, 'public', 'admin', 'PRODUCT-CATALOGE.pdf');
  
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.error("Catalogue PDF not found at:", pdfPath);
    return res.status(404).json({ error: "Catalogue not found" });
  }
  
  // Set proper headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Nexlife-Product-Catalogue.pdf"');
  
  // Send the file
  res.sendFile(pdfPath, (err) => {
    if (err) {
      console.error("Error serving catalogue:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error serving catalogue" });
      }
    }
  });
});

// Mount new routers
app.use("/api/auth", authRouter);
app.use("/api/staff", staffRouter);
app.use("/api/inquiries", inquiriesRouter);
app.use("/api/subscribers", subscribersRouter);
app.use("/api/export", exportsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/products-gallery", productsGalleryRouter);
app.use("/api/certifications", certificationsRouter);
app.use("/api/inbound", inboundRouter);
app.use("/api/logs", logsRouter);
app.use("/api/templates", templatesRouter);

// Start IMAP poller if IMAP_* env vars provided
startInboundImapPoller().catch((e) => console.error("IMAP poller failed", e));

// Health endpoint (DB connection status)
app.get("/api/health", (req, res) => {
  const db = getConnectionStatus();
  res.json({ ok: true, db });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

export default app;
