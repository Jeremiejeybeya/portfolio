document.getElementById("year").textContent = new Date().getFullYear();

async function loadProjects() {
  try {
    const res = await fetch("projects.json");
    const projects = await res.json();
    const grid = document.getElementById("projects-grid");
    grid.innerHTML = projects.map(p => `
      <article class="card">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="meta">
          ${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}
        </div>
        <a class="btn secondary" href="${p.demo}" target="_blank" rel="noopener">Demo</a>
        <a class="btn" href="${p.repo}" target="_blank" rel="noopener">Code</a>
      </article>
    `).join("");
  } catch (e) {
    console.error(e);
  }
}
loadProjects();
