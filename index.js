/* =========================
   Config
========================= */
const GHUSER = "ManuK001";
const API_BASE = `https://api.github.com/users/${GHUSER}/repos`;
const PER_PAGE = 100; // GitHub max per page

/* =========================
   Mobile nav (hamburger)
========================= */
const hamburger = document.getElementById("hamburger");
const menu = document.querySelector(".menu");

if (hamburger && menu) {
  hamburger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

/* =========================
   Footer year
========================= */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   Repo fetching + state
========================= */
let allRepos = [];
let filteredRepos = [];
let currentFilter = "all";
let searchQuery = "";

/* Fetch up to ~300 repos (3 pages x 100). Adjust pages if needed. */
async function fetchRepos() {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  const pages = [1, 2, 3];
  const results = [];

  for (const p of pages) {
    const url = `${API_BASE}?per_page=${PER_PAGE}&page=${p}&sort=updated`;
    const res = await fetch(url, { headers });

    if (!res.ok) break;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) break;

    results.push(...json);

    // If this page returned less than PER_PAGE, there are no more pages.
    if (json.length < PER_PAGE) break;
  }

  return results;
}

/* =========================
   Categorization helpers
========================= */
function b(text, tokens) {
  return tokens.some((t) => text.includes(t));
}

function categorize(repo) {
  const name = (repo?.name || "").toLowerCase();
  const desc = (repo?.description || "").toLowerCase();
  const topics = (repo?.topics || []).map((t) => String(t).toLowerCase());

