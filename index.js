
const GHUSER = 'ManuK001';
const API_BASE = `https://api.github.com/users/${GHUSER}/repos`;
const PER_PAGE = 100; // GitHub max per page

// Mobile nav
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.menu');
hamburger?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Repo fetching & rendering
let allRepos = [];
let filteredRepos = [];
let currentFilter = 'all';
let searchQuery = '';

async function fetchRepos() {
  const headers = { 'Accept': 'application/vnd.github+json' };
  const pages = [1,2,3]; // supports ~300 repositories
  const results = [];
  for (const p of pages) {
    const url = `${API_BASE}?per_page=${PER_PAGE}&page=${p}&sort=updated`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) break;
    results.push(...json);
  }
  return results;
}

function categorize(repo) {
  const name = (repo.name || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const desc = (repo.description || '').toLowerCase();
  const text = `${name} ${desc} ${topics.join(' ')}`;
  const isAI = /\b(ai|ml|machine-learning|model|agent|vision|nlp|transformer|pytorch|tensorflow)\b/.test(text);
  const isIoT = /\b(iot|sensor|edge|raspberry|arduino|mqtt|esp32)\b/.test(text);
  const isDesign = /\b(design|ui|ux|flutter|react|next|css|html|figma)\b/.test(text);
  const isRobotics = /\b(robot|ros|ros2|gazebo|nav2|slam|lidar)\b/.test(text);
  const isAzure = /\b(azure|terraform|bicep|apim|keyvault|ai\s*foundry|cognitive|search)\b/.test(text);
  const cats = [];
  if (isAI) cats.push('ai');
  if (isIoT) cats.push('iot');
  if (isDesign) cats.push('design');
  if (isRobotics) cats.push('robotics');
  if (isAzure) cats.push('azure');
  if (cats.length === 0) cats.push('other');
  return cats;
}

function summarize(repos) {
  const summary = { ai:0, iot:0, design:0, robotics:0, azure:0, other:0 };
  repos.forEach(r => categorize(r).forEach(c => summary[c]++));
  return summary;
}

function renderStats(summary) {
  const statsEl = document.getElementById('hero-stats');
  if (!statsEl) return;
  const items = [
    { label: 'AI/ML', key: 'ai' },
    { label: 'IoT', key: 'iot' },
    { label: 'Design', key: 'design' },
    { label: 'Robotics', key: 'robotics' },
    { label: 'Azure/Cloud', key: 'azure' },
    { label: 'Other', key: 'other' }
  ];
  statsEl.innerHTML = items.map(i => `
    <div class="stat"><b>${summary[i.key]}</b><span>${i.label} repos</span></div>
  `).join('');
}

function repoCard(repo) {
  const url = repo.html_url;
  const name = repo.name;
  const desc = repo.description || '';
  const lang = repo.language || '';
  const stars = repo.stargazers_count || 0;
  const updated = new Date(repo.updated_at).toLocaleDateString();
  const tags = categorize(repo);
  const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join(' ');
  return `
    <article class="repo-card">
      <div class="repo-header">
        <a class="repo-name" href="${url}" target="_blank" rel="noopener">${name}</a>
        <span class="repo-meta">★ ${stars} ${lang ? ' • ' + lang : ''} • Updated ${updated}</span>
      </div>
      ${desc ? `<p class="repo-desc">${desc}</p>` : ''}
      <div class="tags">${tagsHtml}</div>
    </article>
  `;
}

function applyFilters() {
  filteredRepos = allRepos.filter(r => {
    const cats = categorize(r);
    const matchesCategory = currentFilter === 'all' || cats.includes(currentFilter);
    const text = `${r.name} ${r.description || ''}`.toLowerCase();
    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  renderRepos();
}

function renderRepos(limit=24) {
  const grid = document.getElementById('repo-grid');
  if (!grid) return;
  const items = filteredRepos.slice(0, limit).map(repoCard).join('');
  grid.innerHTML = items;
  const loadMore = document.getElementById('load-more');
  if (loadMore) {
    loadMore.classList.toggle('hidden', filteredRepos.length <= limit);
    const btn = document.getElementById('loadMoreBtn');
    if (btn) {
      btn.onclick = () => { renderRepos(filteredRepos.length); loadMore.classList.add('hidden'); };
    }
  }
}

function bindProjectUI() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // When used in Projects, chip has data-filter
      if (chip.dataset.filter) {
        document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        applyFilters();
      }
    });
  });
  const search = document.getElementById('search');
  search?.addEventListener('input', (e) => {
    searchQuery = e.target.value || '';
    applyFilters();
  });
}

// ---- Credentials ----
const CREDENTIALS = [
  { type:'cert', title:'Google Associate Cloud Engineer', issuer:'Google Cloud', period:'Dec 2022 – Dec 2025', credentialId:'4e7504ad5270…e44', verifyUrl:'', tags:['GCP','Cloud'] },
  { type:'cert', title:'Professional Machine Learning Engineer', issuer:'Google Cloud (Institute)', period:'Jan 2023 – Jun 2025', credentialId:'Provided by user', verifyUrl:'', tags:['GCP','ML'] },
  { type:'cert', title:'AZ-400: Azure DevOps Specialist', issuer:'Cloud Academy', period:'—', credentialId:'—', verifyUrl:'', tags:['Azure','DevOps'] },
  { type:'cert', title:'Microsoft Certified: Azure Fundamentals (AZ-900)', issuer:'Microsoft', period:'—', credentialId:'DAAB8A0E… • C4972477…', verifyUrl:'', tags:['Azure','Fundamentals'] },
  { type:'training', title:'AI Master Class', issuer:'Pantech Solutions', period:'Jan 2020', credentialId:'—', verifyUrl:'', tags:['AI','Training'] },
  { type:'training', title:'RPA Foundation & Orchestrator', issuer:'Futureskills Prime', period:'—', credentialId:'—', verifyUrl:'', tags:['RPA','Automation'] }
];

let credFilter = 'cert';

function renderCredentials() {
  const grid = document.getElementById('cred-grid');
  if (!grid) return;
  const list = CREDENTIALS.filter(c => c.type === credFilter);
  grid.innerHTML = list.map(c => `
    <article class="cred-card">
      <div class="cred-title">${c.title}</div>
      <div class="cred-meta">${c.issuer}${c.period ? ' • ' + c.period : ''}</div>
      ${c.credentialId && c.credentialId !== '—' ? `<div class="badge">ID: ${c.credentialId}</div>` : ''}
      <div class="tags">${(c.tags||[]).map(t => `<span class="tag">${t}</span>`).join(' ')}</div>
    </article>
  `).join('');
}

function bindCredentialUI() {
  document.querySelectorAll('[data-credfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-credfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      credFilter = btn.dataset.credfilter;
      renderCredentials();
    });
  });
}

(async function init() {
  // Projects
  bindProjectUI();
  try {
    const repos = await fetchRepos();
    allRepos = repos.filter(r => !r.fork);
    const summary = summarize(allRepos);
    renderStats(summary);
    applyFilters();
  } catch (e) {
    const grid = document.getElementById('repo-grid');
    if (grid) grid.innerHTML = '<p>Unable to load repositories at the moment.</p>';
    console.error(e);
  }
  // Credentials
  bindCredentialUI();
  renderCredentials();
})();

// ===============================
// YouTube + Microsoft Learn Threads
// ===============================

// 1) Put your featured VIDEO IDs here.
// Tip: a YouTube URL like https://www.youtube.com/watch?v=ABC123 has ID = ABC123
// Shorts look like https://www.youtube.com/shorts/XYZ789 -> ID = XYZ789
const FEATURED_YT_VIDEO_IDS = [
  // Replace these placeholders with real IDs from @Segmentsoflives
  "VIDEO_ID_1",
  "VIDEO_ID_2",
  "VIDEO_ID_3"
];

const FEATURED_YT_SHORT_IDS = [
  // Replace these placeholders with real short IDs from @Segmentsoflives/shorts
  "SHORT_ID_1",
  "SHORT_ID_2",
  "SHORT_ID_3"
];

// 2) Thumbnail “screenshots” grid will use maxres thumbnail if available, else it still works.
function ytThumbUrl(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function ytWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function ytEmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}`;
}

// 3) Optional: fetch title without API key using YouTube oEmbed.
// (Works for many sites; if it fails due to browser restrictions, we fall back gracefully.)
async function fetchYtTitle(id) {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(ytWatchUrl(id))}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();
    return data.title || "";
  } catch (e) {
    return "";
  }
}

async function renderYouTube() {
  const embedsEl = document.getElementById("yt-embeds");
  const thumbsEl = document.getElementById("yt-thumbs");
  if (!embedsEl || !thumbsEl) return;

  // Render embedded videos
  embedsEl.innerHTML = "";
  for (const id of FEATURED_YT_VIDEO_IDS) {
    const title = await fetchYtTitle(id);

    const card = document.createElement("div");
    card.className = "yt-embed";

    card.innerHTML = `
      <iframe
        src="${ytEmbedUrl(id)}"
        title="${(title || "YouTube video")}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
      <div class="yt-title">${title ? title : `YouTube Video: ${id}`}</div>
    `;
    embedsEl.appendChild(card);
  }

  // Render thumbnail “screenshots” (videos + shorts)
  const allThumbs = [
    ...FEATURED_YT_VIDEO_IDS.map(id => ({ id, label: "Video" })),
    ...FEATURED_YT_SHORT_IDS.map(id => ({ id, label: "Short" }))
  ];

  thumbsEl.innerHTML = "";
  for (const item of allThumbs) {
    const a = document.createElement("a");
    a.className = "yt-thumb";
    a.href = ytWatchUrl(item.id);
    a.target = "_blank";
    a.rel = "noopener";

    a.innerHTML = `
      <img src="${ytThumbUrl(item.id)}" alt="YouTube thumbnail ${item.id}" loading="lazy" />
      <span class="badge">${item.label}</span>
    `;
    thumbsEl.appendChild(a);
  }
}

// 4) Load last 20 “threads” from a JSON file you maintain.
// Create: /data/threads.json
// Format: [{ "title": "...", "url": "..." }, ...]
async function renderThreadsCodeBlock() {
  const codeEl = document.getElementById("threads-code");
  if (!codeEl) return;

  try {
    const res = await fetch("data/threads.json", { cache: "no-store" });
    if (!res.ok) throw new Error("threads.json not found");
    const threads = await res.json();

    // Create a nice code-block view
    // Example output lines:
    // 01. Title — URL
    const lines = threads.slice(0, 20).map((t, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `${n}. ${t.title} — ${t.url}`;
    });

    codeEl.textContent = lines.join("\n");
  } catch (e) {
    codeEl.textContent =
`Could not load data/threads.json yet.

Create a file at: /data/threads.json
Example:
[
  { "title": "How to configure X in Azure?", "url": "https://learn.microsoft.com/..." },
  { "title": "Troubleshooting Y issue", "url": "https://learn.microsoft.com/..." }
]`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderYouTube();
  renderThreadsCodeBlock();
});
