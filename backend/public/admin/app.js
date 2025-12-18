const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const fmt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

async function fetchJSON(url, opts) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function safeFetchJSON(url, opts, fallback) {
  try {
    return await fetchJSON(url, opts);
  } catch (_) {
    return fallback;
  }
}

function setActive(tab) {
  $$("#sidebar button").forEach((b) => b.classList.remove("bg-slate-800"));
  const btn = $(`#sidebar button[data-tab="${tab}"]`);
  if (btn) btn.classList.add("bg-slate-800");
  // Top bar highlight
  $$("#topnav button").forEach((b) =>
    b.classList.remove("ring-1", "ring-indigo-500")
  );
  const topBtn = $(`#topnav button[data-tab="${tab}"]`);
  if (topBtn) topBtn.classList.add("ring-1", "ring-indigo-500");
  $("#tabTitle").textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
}

async function viewDashboard() {
  setActive("dashboard");
  const html = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div id="statLikes" class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"></div>
      <div id="statNew" class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"></div>
      <div id="statReplied" class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"></div>
      <div id="statSubs" class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div class="lg:col-span-2 rounded-xl border border-slate-800 p-4 bg-slate-900/50">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Submissions</h2>
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
      </div>
    </div>
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50 mt-6">
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
    </div>`;
  $("#content").innerHTML = html;

  $("#exportContacts").addEventListener(
    "click",
    () => (location.href = "/api/export/contacts.csv")
  );
  $("#exportLogs").addEventListener(
    "click",
    () => (location.href = "/api/export/logs.csv")
  );
  $("#range").addEventListener("change", (e) => loadChart(e.target.value));

  try {
    await loadStats();
  } catch (_) {}
  try {
    await loadChart(7);
  } catch (_) {}
  setInterval(loadStats, 15000);
  // Navbar user info
  try {
    const me = await fetchJSON("/api/auth/me");
    document.getElementById("userInfo").textContent =
      me.user.name + " • " + me.user.role;
  } catch (e) {
    document.getElementById("userInfo").textContent = "";
  }
}

async function loadStats() {
  const subs = await safeFetchJSON(
    "/api/subscribers",
    {},
    { total: 0, items: [] }
  );
  const list = await safeFetchJSON(
    "/api/inquiries?limit=100",
    {},
    { total: 0, items: [] }
  );
  $("#totalInquiries").textContent = list.total;
  const newCount = list.items.filter((i) => i.status === "new").length;
  const replied = list.items.filter((i) => i.status === "replied").length;
  $(
    "#statSubs"
  ).innerHTML = `<div class="text-slate-400 text-sm">Subscribers</div><div class="text-2xl font-extrabold mt-1">${subs.total}</div>`;
  $(
    "#statNew"
  ).innerHTML = `<div class="text-slate-400 text-sm">New Submissions</div><div class="text-2xl font-extrabold mt-1">${newCount}</div>`;
  $(
    "#statReplied"
  ).innerHTML = `<div class="text-slate-400 text-sm">Replied</div><div class="text-2xl font-extrabold mt-1">${replied}</div>`;
  // Like totals optional; skip heavy call, show derived from inquiries for now
  $("#inqBody").innerHTML = list.items
    .slice(0, 10)
    .map((i) => {
      const statusClass =
        i.status === "new"
          ? "bg-amber-500/20 text-amber-300"
          : i.status === "replied"
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-slate-700 text-slate-200";
      return `<tr class="border-t border-slate-800">
      <td class="p-2">${i.name || ""}</td>
      <td class="p-2 text-cyan-300">${i.email || ""}</td>
      <td class="p-2">${(i.subject || "").slice(0, 60)}</td>
      <td class="p-2"><span class="px-2 py-0.5 rounded text-xs ${statusClass}">${
        i.status
      }</span></td>
      <td class="p-2">${
        i.createdAt ? fmt.format(new Date(i.createdAt)) : ""
      }</td>
      <td class="p-2">
        <button class="text-xs text-indigo-400 hover:text-indigo-300" onclick="markRead('${
          i._id
        }')">Mark read</button>
        <button class="ml-2 text-xs text-emerald-400 hover:text-emerald-300" onclick="replyInquiry('${
          i._id
        }', '${String(i.email || "").replace(/'/g, "&#39;")}')">Reply</button>
      </td>
    </tr>`;
    })
    .join("");
}

async function loadChart(range) {
  const data = await fetchJSON("/api/analytics/submissions?range=" + range);
  const labels = data.series.map((p) => p._id);
  const counts = data.series.map((p) => p.count);
  const news = data.series.map((p) => p.new);
  if (window._chart) window._chart.destroy();
  const ctx = $("#submissionsChart");
  window._chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Total", data: counts, borderColor: "#6366f1", tension: 0.3 },
        { label: "New", data: news, borderColor: "#22d3ee", tension: 0.3 },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#cbd5e1" } } },
      scales: {
        x: { ticks: { color: "#94a3b8" } },
        y: { ticks: { color: "#94a3b8" } },
      },
    },
  });
}

window.markRead = async function (id) {
  await fetchJSON("/api/inquiries/" + id + "/status", {
    method: "PATCH",
    body: JSON.stringify({ status: "read" }),
  });
  loadStats();
};

window.replyInquiry = async function (id, email) {
  const subject = prompt("Subject for reply to " + email + ":");
  if (!subject) return;
  const message = prompt("Message:");
  if (!message) return;
  await fetchJSON("/api/inquiries/" + id + "/reply", {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
  loadStats();
};

async function viewInquiries() {
  setActive("inquiries");
  const data = await safeFetchJSON(
    "/api/inquiries?limit=200",
    {},
    { total: 0, items: [] }
  );
  $("#content").innerHTML = `
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Inquiries (${data.total})</h2>
        <div class="flex gap-2">
          <select id="statusFilter" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm">
            <option value="">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
          <input id="q" placeholder="Search..." class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm" />
          <button id="applyFilter" class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold">Apply</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead><tr class="text-left text-slate-400">
            <th class="p-2">Name</th><th class="p-2">Email</th><th class="p-2">Phone</th><th class="p-2">Subject</th><th class="p-2">Status</th><th class="p-2">Received</th><th class="p-2">Actions</th>
          </tr></thead>
          <tbody id="inqBodyFull"></tbody>
        </table>
      </div>
    </div>

    <dialog id="inqModal" class="backdrop:bg-black/50 rounded-lg w-full max-w-2xl p-0">
      <form method="dialog" class="bg-slate-900 text-slate-100 rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between"><div class="font-semibold">Inquiry</div><button id="closeModal" class="text-slate-400">✕</button></div>
        <div class="p-4 space-y-2" id="inqDetail"></div>
        <div class="p-4 border-t border-slate-800 space-y-2">
          <div class="text-sm text-slate-300">Reply</div>
          <input id="replySubj" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm" placeholder="Subject" />
          <textarea id="replyMsg" rows="5" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm" placeholder="Message"></textarea>
          <div class="flex justify-end">
            <button id="sendReply" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold">Send</button>
          </div>
        </div>
      </form>
    </dialog>`;

  function render(items) {
    const tbody = document.getElementById("inqBodyFull");
    tbody.innerHTML = items
      .map((i) => {
        const statusClass =
          i.status === "new"
            ? "bg-amber-500/20 text-amber-300"
            : i.status === "replied"
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-slate-700 text-slate-200";
        return `<tr class="border-t border-slate-800">
        <td class="p-2">${i.name || ""}</td>
        <td class="p-2 text-cyan-300">${i.email || ""}</td>
        <td class="p-2">${i.phone || ""}</td>
        <td class="p-2">${(i.subject || "").slice(0, 60)}</td>
        <td class="p-2"><span class="px-2 py-0.5 rounded text-xs ${statusClass}">${
          i.status
        }</span></td>
        <td class="p-2">${
          i.createdAt ? fmt.format(new Date(i.createdAt)) : ""
        }</td>
        <td class="p-2">
          <button class="view text-xs text-cyan-300" data-id="${
            i._id
          }">View</button>
          <button class="ml-2 mark text-xs text-indigo-300" data-id="${
            i._id
          }" data-status="read">Mark read</button>
        </td>
      </tr>`;
      })
      .join("");
    tbody.querySelectorAll(".mark").forEach((b) =>
      b.addEventListener("click", async () => {
        await fetchJSON("/api/inquiries/" + b.dataset.id + "/status", {
          method: "PATCH",
          body: JSON.stringify({ status: b.dataset.status }),
        });
        refresh();
      })
    );
    tbody.querySelectorAll(".view").forEach((b) =>
      b.addEventListener("click", async () => {
        const item = items.find((x) => x._id === b.dataset.id);
        const d = document.getElementById("inqDetail");
        d.innerHTML = `
        <div><span class="text-slate-400 text-sm">Name</span><div>${
          item.name || ""
        }</div></div>
        <div><span class="text-slate-400 text-sm">Email</span><div class="text-cyan-300">${
          item.email || ""
        }</div></div>
        <div><span class="text-slate-400 text-sm">Phone</span><div>${
          item.phone || ""
        }</div></div>
        <div><span class="text-slate-400 text-sm">Message</span><div class="whitespace-pre-wrap">${
          item.message || ""
        }</div></div>
        <div class="text-slate-400 text-sm">Received: ${
          item.createdAt ? fmt.format(new Date(item.createdAt)) : ""
        }</div>`;
        const modal = document.getElementById("inqModal");
        modal.showModal();
        document.getElementById("closeModal").onclick = () => modal.close();
        document.getElementById("sendReply").onclick = async (e) => {
          e.preventDefault();
          const subject = document.getElementById("replySubj").value.trim();
          const message = document.getElementById("replyMsg").value.trim();
          if (!subject || !message)
            return alert("Subject and message required");
          await fetchJSON("/api/inquiries/" + item._id + "/reply", {
            method: "POST",
            body: JSON.stringify({ subject, message }),
          });
          await fetchJSON("/api/inquiries/" + item._id + "/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "replied" }),
          });
          modal.close();
          refresh();
        };
      })
    );
  }
  function refresh() {
    const s = document.getElementById("statusFilter").value;
    const q = document.getElementById("q").value.trim().toLowerCase();
    const items = data.items.filter(
      (i) =>
        (!s || i.status === s) &&
        (!q ||
          (i.name || "").toLowerCase().includes(q) ||
          (i.email || "").toLowerCase().includes(q) ||
          (i.subject || "").toLowerCase().includes(q) ||
          (i.message || "").toLowerCase().includes(q))
    );
    render(items);
  }
  document.getElementById("applyFilter").addEventListener("click", refresh);
  render(data.items);
}

async function viewSubscribers() {
  setActive("subscribers");
  const subs = await safeFetchJSON(
    "/api/subscribers",
    {},
    { total: 0, items: [] }
  );
  const saved = JSON.parse(localStorage.getItem("campTemplates") || "[]");
  $("#content").innerHTML = `
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
      <h2 class="font-semibold mb-3">Subscribers (${subs.total})</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm"><thead><tr class="text-left text-slate-400"><th class="p-2">Email</th><th class="p-2">Created</th></tr></thead><tbody>
          ${subs.items
            .map(
              (s) =>
                `<tr class="border-t border-slate-800"><td class="p-2">${
                  s.email
                }</td><td class="p-2">${
                  s.createdAt ? fmt.format(new Date(s.createdAt)) : ""
                }</td></tr>`
            )
            .join("")}
        </tbody></table>
      </div>
      <div class="mt-4 flex gap-2">
        <input id="newEmail" placeholder="email@example.com" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        <button id="addSub" class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold">Add</button>
        <button id="exportContacts" class="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-sm font-semibold">Export CSV</button>
      </div>
    </div>
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50 mt-6">
      <h2 class="font-semibold mb-3">Campaign Templates</h2>
      <div class="flex gap-2 mb-2">
        <input id="tplName" placeholder="Template name" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        <button id="saveTpl" class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold">Save</button>
      </div>
      <div class="flex gap-2 mb-3">
        <select id="tplSelect" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-sm"></select>
        <button id="loadTpl" class="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-sm">Load</button>
        <button id="deleteTpl" class="rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-sm">Delete</button>
      </div>
      <input id="campSubj" placeholder="Subject" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm mb-2" />
      <textarea id="campMsg" placeholder="Message" rows="6" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"></textarea>
      <div class="flex items-center gap-2 mt-3">
        <button id="sendCamp" class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold">Send to all subscribers</button>
      </div>
    </div>`;
  $("#addSub").addEventListener("click", async () => {
    const email = $("#newEmail").value.trim();
    if (!email) return alert("Email required");
    await fetchJSON("/api/subscribers", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    viewSubscribers();
  });
  $("#exportContacts").addEventListener(
    "click",
    () => (location.href = "/api/export/contacts.csv")
  );
  function refreshTplSelect() {
    const s = $("#tplSelect");
    s.innerHTML = saved
      .map((t, i) => `<option value="${i}">${t.name}</option>`)
      .join("");
  }
  refreshTplSelect();
  $("#saveTpl").addEventListener("click", () => {
    const name = $("#tplName").value.trim() || `Template ${saved.length + 1}`;
    saved.push({
      name,
      subject: $("#campSubj").value,
      message: $("#campMsg").value,
    });
    localStorage.setItem("campTemplates", JSON.stringify(saved));
    refreshTplSelect();
    alert("Template saved");
  });
  $("#loadTpl").addEventListener("click", () => {
    const idx = Number($("#tplSelect").value || 0);
    const t = saved[idx];
    if (t) {
      $("#campSubj").value = t.subject;
      $("#campMsg").value = t.message;
    }
  });
  $("#deleteTpl").addEventListener("click", () => {
    const idx = Number($("#tplSelect").value || 0);
    if (saved[idx]) {
      saved.splice(idx, 1);
      localStorage.setItem("campTemplates", JSON.stringify(saved));
      refreshTplSelect();
    }
  });
}

async function viewCampaigns() {
  setActive("campaigns");
  $("#content").innerHTML = `
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
      <h2 class="font-semibold mb-3">Send Campaign</h2>
      <input id="campSubj" placeholder="Subject" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm mb-2" />
      <textarea id="campMsg" placeholder="Message" rows="6" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"></textarea>
      <button id="sendCamp" class="mt-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold">Send to all subscribers</button>
    </div>`;
  $("#sendCamp").addEventListener("click", async () => {
    const subject = $("#campSubj").value.trim();
    const message = $("#campMsg").value.trim();
    if (!subject || !message) return alert("Subject and message required");
    const res = await fetchJSON("/api/subscribers/campaign", {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    });
    alert("Campaign sent: " + res.sent + " sent, " + res.failed + " failed");
  });
}

async function viewStaff() {
  setActive("staff");
  const data = await safeFetchJSON("/api/staff", {}, { items: [], total: 0 });
  $(
    "#content"
  ).innerHTML = `<div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
    <h2 class="font-semibold mb-3">Staff (${
      data.total || data.items?.length || 0
    })</h2>
    <div class="overflow-x-auto"><table class="min-w-full text-sm"><thead><tr class="text-left text-slate-400"><th class="p-2">Name</th><th class="p-2">Email</th><th class="p-2">Role</th></tr></thead><tbody>
      ${(data.items || [])
        .map(
          (u) =>
            `<tr class="border-t border-slate-800"><td class="p-2">${
              u.name || ""
            }</td><td class="p-2">${u.email}</td><td class="p-2">${
              u.role
            }</td></tr>`
        )
        .join("")}
    </tbody></table></div>
  </div>`;
}

async function viewLogs() {
  setActive("logs");
  try {
    const res = await fetch("/api/export/logs.csv", { credentials: "include" });
    const text = await res.text();
    const rows = text.split(/\r?\n/).slice(0, 50).join("\n");
    $("#content").innerHTML = `
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Logs (preview)</h2>
          <a class="text-cyan-400" href="/api/export/logs.csv">Download logs.csv</a>
        </div>
        <pre class="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 border border-slate-800 rounded p-3">${rows}</pre>
      </div>`;
  } catch (_) {
    $(
      "#content"
    ).innerHTML = `<div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><h2 class="font-semibold mb-2">Logs</h2><p class="text-slate-400 text-sm">No logs available.</p><a class="text-cyan-400" href="/api/export/logs.csv">Download logs.csv</a></div>`;
  }
}

async function viewExport() {
  setActive("export");
  $(
    "#content"
  ).innerHTML = `<div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
    <h2 class="font-semibold mb-3">Export</h2>
    <div class="space-x-2">
      <a class="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-sm font-semibold" href="/api/export/contacts.csv">Contacts CSV</a>
      <a class="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-semibold" href="/api/export/logs.csv">Logs CSV</a>
    </div>
  </div>`;
}

// Analytics page (skeleton with fallback)
async function viewAnalytics() {
  setActive("analytics");
  const overview = await safeFetchJSON(
    "/api/analytics/overview",
    {},
    {
      submissions: 0,
      replies: 0,
      totalCampaigns: 0,
      totalImages: 0,
      totalLikes: 0,
    }
  );
  $("#content").innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Submissions</div><div class="text-2xl font-extrabold">${overview.submissions}</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Replies</div><div class="text-2xl font-extrabold">${overview.replies}</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Campaigns</div><div class="text-2xl font-extrabold">${overview.totalCampaigns}</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Images</div><div class="text-2xl font-extrabold">${overview.totalImages}</div></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><div class="text-slate-400 text-sm">Total Likes</div><div class="text-2xl font-extrabold">${overview.totalLikes}</div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><h2 class="font-semibold mb-2">Submissions over time</h2><canvas id="anSub"></canvas></div>
      <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50"><h2 class="font-semibold mb-2">Status breakdown</h2><canvas id="anPie"></canvas></div>
    </div>`;
  try {
    const sub = await fetchJSON("/api/analytics/submissions?range=30");
    const labels = sub.series.map((p) => p._id);
    const counts = sub.series.map((p) => p.count);
    const news = sub.series.map((p) => p.new);
    new Chart($("#anSub"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total",
            data: counts,
            borderColor: "#6366f1",
            tension: 0.3,
          },
          { label: "New", data: news, borderColor: "#22d3ee", tension: 0.3 },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#cbd5e1" } } },
        scales: {
          x: { ticks: { color: "#94a3b8" } },
          y: { ticks: { color: "#94a3b8" } },
        },
      },
    });
    new Chart($("#anPie"), {
      type: "doughnut",
      data: {
        labels: ["New", "Read", "Replied"],
        datasets: [
          {
            data: [
              sub.series.reduce((a, b) => a + b.new, 0),
              sub.series.reduce((a, b) => a + b.read, 0),
              sub.series.reduce((a, b) => a + b.replied, 0),
            ],
            backgroundColor: ["#22d3ee", "#64748b", "#10b981"],
          },
        ],
      },
      options: { plugins: { legend: { labels: { color: "#cbd5e1" } } } },
    });
  } catch (_) {}
}

const routes = {
  dashboard: viewDashboard,
  inquiries: viewInquiries,
  subscribers: viewSubscribers,
  campaigns: viewCampaigns,
  gallery: viewGallery,
  staff: viewStaff,
  logs: viewLogs,
  export: viewExport,
  analytics: viewAnalytics,
};

function go(tab) {
  if (!routes[tab]) tab = "dashboard";
  routes[tab]();
  const hash = "#" + tab;
  if (location.hash !== hash) location.hash = hash;
}

function bindNav() {
  $$("#sidebar button").forEach((b) =>
    b.addEventListener("click", () => go(b.dataset.tab))
  );
  $$("#topnav button").forEach((b) =>
    b.addEventListener("click", () => go(b.dataset.tab))
  );
}
bindNav();
document.addEventListener("DOMContentLoaded", bindNav);

window.addEventListener("hashchange", () => {
  const t = (location.hash || "#dashboard").slice(1);
  if (routes[t]) routes[t]();
});

go((location.hash || "#dashboard").slice(1));

async function viewGallery() {
  setActive("gallery");
  const data = await fetchJSON("/api/gallery");
  $("#content").innerHTML = `
    <div class="rounded-xl border border-slate-800 p-4 bg-slate-900/50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Gallery (${data.total})</h2>
        <form id="uploadForm" class="flex items-center gap-2">
          <input id="file" type="file" accept="image/*" class="text-sm" />
          <button class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold" type="submit">Upload</button>
        </form>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        ${data.items
          .map(
            (i) => `
          <div class="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
            <img src="${i.url}" alt="img" class="w-full h-40 object-cover" />
            <div class="p-2 flex items-center justify-between text-sm">
              <div class="text-slate-400">❤ ${i.likes || 0}</div>
              <button data-id="${
                i._id
              }" class="del rounded bg-red-600 hover:bg-red-500 px-2 py-1">Delete</button>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>`;
  document.querySelectorAll(".del").forEach((b) =>
    b.addEventListener("click", async () => {
      if (!confirm("Delete this image?")) return;
      await fetch("/api/gallery/" + b.getAttribute("data-id"), {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("jwt")
            ? "Bearer " + localStorage.getItem("jwt")
            : "",
        },
      });
      viewGallery();
    })
  );
  $("#uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = document.getElementById("file").files[0];
    if (!f) return alert("Choose a file");
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/gallery/upload", {
      method: "POST",
      body: fd,
      headers: {
        Authorization: localStorage.getItem("jwt")
          ? "Bearer " + localStorage.getItem("jwt")
          : "",
      },
    });
    if (!r.ok) return alert("Upload failed");
    viewGallery();
  });
}
