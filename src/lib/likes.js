function normalizeBaseUrl(raw) {
  let url = (raw || "").trim();
  if (!url) return "";
  url = url.replace(/\s+/g, "");

  // Fix common typos like "http//" or "https//"
  if (/^http\/\//i.test(url)) url = url.replace(/^http\/\//i, "http://");
  if (/^https\/\//i.test(url)) url = url.replace(/^https\/\//i, "https://");

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  // Collapse duplicate protocols if present (e.g., http://http://host)
  url = url.replace(/^http:\/\/http:\/\//i, "http://");
  url = url.replace(/^https:\/\/https:\/\//i, "https://");

  // Remove trailing slashes
  url = url.replace(/\/+$/g, "");
  return url;
}

const RAW_BASE =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_BACKEND_URL
    : "";
const API_BASE = normalizeBaseUrl(RAW_BASE);

function joinUrl(base, path) {
  if (!base) return path; // relative
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchLikes() {
  try {
    const res = await fetch(joinUrl(API_BASE, "/api/likes"), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    localStorage.setItem("galleryLikeCounts", JSON.stringify(data));
    return data;
  } catch (e) {
    const saved = localStorage.getItem("galleryLikeCounts");
    return saved ? JSON.parse(saved) : {};
  }
}

export async function incrementLike(imageId) {
  try {
    const res = await fetch(joinUrl(API_BASE, `/api/likes/${imageId}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    localStorage.setItem("galleryLikeCounts", JSON.stringify(data));
    return data;
  } catch (e) {
    // Fallback to localStorage increment
    const saved = localStorage.getItem("galleryLikeCounts");
    const counts = saved ? JSON.parse(saved) : {};
    counts[imageId] = (counts[imageId] || 0) + 1;
    localStorage.setItem("galleryLikeCounts", JSON.stringify(counts));
    return counts;
  }
}
