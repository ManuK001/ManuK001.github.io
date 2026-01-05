
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

function bindUI() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      applyFilters();
    });
  });
  const search = document.getElementById('search');
  search?.addEventListener('input', (e) => {
    searchQuery = e.target.value || '';
    applyFilters();
  });
}

(async function init() {
  bindUI();
  try {
    const repos = await fetchRepos();
    // Topics often require extra API calls; we use name/description heuristics to categorize.
    allRepos = repos.filter(r => !r.fork); // show originals by default
    const summary = summarize(allRepos);
    renderStats(summary);
    applyFilters();
  } catch (e) {
    const grid = document.getElementById('repo-grid');
    if (grid) grid.innerHTML = '<p>Unable to load repositories at the moment.</p>';
    console.error
