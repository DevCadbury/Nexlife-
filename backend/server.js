import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  if (cookies[AUTH_COOKIE] === "1") return next();
  res.redirect("/login");
}

// ===== MongoDB setup =====
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri, { maxPoolSize: 5 });
let likesCollection;

async function initDb() {
  if (!mongoUri) throw new Error("Missing MONGODB_URI env");
  if (likesCollection) return likesCollection;
  const client = await mongoClient.connect();
  const db = client.db(process.env.MONGODB_DB || "nexlife");
  likesCollection = db.collection("likes");
  await likesCollection.createIndex({ id: 1 }, { unique: true });
  return likesCollection;
}

async function getAllLikes() {
  await initDb();
  const docs = await likesCollection.find({}).toArray();
  const map = {};
  for (const d of docs) map[d.id] = d.count || 0;
  return map;
}

async function incrementLikeDb(id) {
  await initDb();
  const result = await likesCollection.findOneAndUpdate(
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
      <label for="password">Password</label>
      <input id="password" name="password" type="password" placeholder="Enter password" autofocus required />
      <div class="err">${showError ? "Invalid password" : ""}</div>
      <button type="submit">Sign in</button>
    </div>
    <div class="muted">Contact Developer • <a class="wa" href="https://wa.me/919973297390" target="_blank" rel="noopener noreferrer">WhatsApp +91 9973297390</a></div>
  </form>
</body>
</html>`);
});

app.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (password === DASH_PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      `${AUTH_COOKIE}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        60 * 60 * 12
      }`
    );
    return res.redirect("/");
  }
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

// Nodemailer contact endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER;
    await transporter.sendMail({
      from: `Nexlife Website <${process.env.SMTP_USER}>`,
      to: toAddress,
      replyTo: email,
      subject: `[Website] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(
        /\n/g,
        "<br/>"
      )}</p>`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Mail error", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
