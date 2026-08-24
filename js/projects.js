// projects.js — reads data/projects.json and renders project cards
// Full styling applied in Step 7; this handles structure only.

async function loadProjects() {
  const res = await fetch('data/projects.json');
  const data = await res.json();

  renderMainProjects(data.main);
  renderSecondaryProjects(data.secondary);
}

function renderMainProjects(projects) {
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <article class="project-card project-card--main" data-id="${p.id}">
      <div class="project-card__image">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />`
          : '<div class="project-card__image-placeholder"></div>'
        }
      </div>
      <div class="project-card__info">
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__description">${p.description || ''}</p>
        <ul class="project-card__tags">
          ${p.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
        </ul>
      </div>
    </article>
  `).join('');
}

function renderSecondaryProjects(projects) {
  const grid = document.getElementById('secondary-projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <article class="project-card project-card--secondary" data-id="${p.id}">
      <div class="project-card__image">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />`
          : '<div class="project-card__image-placeholder"></div>'
        }
      </div>
      <div class="project-card__info">
        <h3 class="project-card__title">${p.title || '[Project title]'}</h3>
        <p class="project-card__description">${p.description || ''}</p>
        <ul class="project-card__tags">
          ${p.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
        </ul>
      </div>
    </article>
  `).join('');
}

loadProjects();
