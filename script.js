// ====== CONFIG ======
const GITHUB_USER = "Jeremiejeybeya"; // <-- mets ton pseudo si différent
const AUTO_LIMIT = 6;                 // nb de projets auto (en plus des vitrines)

// ====== UI ======
document.getElementById("year").textContent = new Date().getFullYear();

function projectCard(p) {
  const tags = (p.tags ?? []).map(t => `<span class="badge">${t}</span>`).join("");
  const image = p.image
    ? `<div class="card-cover"><img src="${p.image}" alt="${p.name} cover" loading="lazy"/></div>`
    : "";
  const demoBtn = p.demo ? `<a class="btn secondary" href="${p.demo}" target="_blank" rel="noopener">Demo</a>` : "";
  const codeBtn = `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">Code</a>`;

  return `
    <article class="card">
      ${image}
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description ?? "Aucune description"}</p>
        <div class="meta">${tags}</div>
        <div class="actions">${demoBtn}${codeBtn}</div>
      </div>
    </article>
  `;
}

// ====== DATA LOADERS ======
async function loadManualProjects() {
  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function loadGithubRepos(username, limit = 6) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const repos = await res.json();
    if (!Array.isArray(repos)) return [];

    return repos
      .filter(r => !r.fork && !r.archived) // on garde les vrais repos actifs
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, limit)
      .map(r => ({
        name: r.name,
        description: r.description || "Aucune description",
        // Topics si dispo, sinon langage principal en tag
        tags: (Array.isArray(r.topics) && r.topics.length) ? r.topics : (r.language ? [r.language] : []),
        demo: r.homepage && r.homepage.trim() ? r.homepage : null, // mets l’URL dans About > Website
        repo: r.html_url
        // pas d'image côté GitHub API par défaut (tu peux en mettre via projects.json pour les vitrines)
      }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

function dedupeByRepo(projects) {
  const seen = new Set();
  return projects.filter(p => {
    const key = (p.repo || p.name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ====== BOOT ======
async function loadProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = "<p>Chargement des projets…</p>";

  const [manual, auto] = await Promise.all([
    loadManualProjects(),
    loadGithubRepos(GITHUB_USER, AUTO_LIMIT)
  ]);

  // vitrines d'abord, puis auto, sans doublons
  const merged = dedupeByRepo([...manual, ...auto]);

  grid.innerHTML = merged.length
    ? merged.map(projectCard).join("")
    : "<p>Aucun projet pour le moment.</p>";
}

loadProjects();
