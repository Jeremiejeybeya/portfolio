'use strict';

// ===== CONFIG À PERSONNALISER =====
const CONFIG = {
  githubUser: 'jey2020', // ← remplace par ton pseudo GitHub
  featured: [
    // Projets "mis en avant" (manuels)
    {
      name: 'Projet vitrine',
      description: 'Site vitrine responsive pour une association. HTML/CSS/JS. Délais: 2 semaines.',
      url: '#',
      tags: ['HTML', 'CSS', 'JS']
    },
    {
      name: 'API Node + CI',
      description: 'API Express, tests, et déploiement automatisé via GitHub Actions.',
      url: '#',
      tags: ['Node', 'Express', 'CI/CD']
    }
  ]
};

// ===== UTILITAIRES =====
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
function debounce(fn, wait=200){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}

// ===== RENDU PROJETS =====
function projectCard(p){
  const tagsHtml = (p.tags||[]).map(t=>`<span class="p-tag">${t}</span>`).join('');
  const metaHtml = p.stars!=null ? `<div class="p-meta"><span>★ ${p.stars}</span><span>MAJ: ${p.updated||''}</span></div>` : '';
  return `
    <article class="p-card">
      <h3><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3>
      <p class="p-desc">${p.description||''}</p>
      <div class="p-tags">${tagsHtml}</div>
      ${metaHtml}
    </article>`;
}

function renderProjects(list){
  const grid = $('#projectsGrid');
  grid.innerHTML = list.map(projectCard).join('');
}

// ===== RÉCUP DEPUI S GITHUB (repos récents) =====
async function fetchRecentRepos(user){
  if(!user) return [];
  const url = `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=9`;
  const r = await fetch(url);
  if(!r.ok) return [];
  const data = await r.json();
  return data.map(repo=>({
    name: repo.name,
    description: repo.description,
    url: repo.homepage || repo.html_url,
    tags: (repo.language ? [repo.language] : []),
    stars: repo.stargazers_count,
    updated: new Date(repo.updated_at).toLocaleDateString()
  }));
}

// ===== MAIN =====
(async function init(){
  // Année footer
  const yearEl = $('#year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Données
  const featured = CONFIG.featured || [];
  const recent = await fetchRecentRepos(CONFIG.githubUser);
  let all = [...featured, ...recent];

  // Recherche temps réel
  const search = $('#search');
  if(search){
    const apply = ()=>{
      const q = search.value.toLowerCase().trim();
      const filtered = !q ? all : all.filter(p=>
        (p.name||'').toLowerCase().includes(q) ||
        (p.description||'').toLowerCase().includes(q) ||
        (p.tags||[]).join(' ').toLowerCase().includes(q)
      );
      renderProjects(filtered);
    };
    search.addEventListener('input', debounce(apply, 150));
    window.addEventListener('keydown', (e)=>{
      if(e.key === '/' && document.activeElement !== search){
        e.preventDefault(); search.focus();
      }
    });
  }

  renderProjects(all);
})();
