// projects.js — reads data/projects.json and renders project cards
// Main projects render as the Work accordion (js/work-accordion.js drives it).

async function loadProjects() {
  const res = await fetch('data/projects.json');
  const data = await res.json();

  renderMainProjects(data.main);
  renderSecondaryProjects(data.secondary);
  window.dispatchEvent(new Event('projects:rendered'));
}

// Panel art is laid out on a 1312x580 canvas (the desktop panel in Figma);
// every layer is positioned in % of that canvas so it scales with the panel.
const PANEL_W = 1312;
const PANEL_H = 580;

function panelLayer(dir, layer, cls) {
  const style = `left:${(layer.x / PANEL_W) * 100}%;top:${(layer.y / PANEL_H) * 100}%;width:${(layer.w / PANEL_W) * 100}%`;
  return `<img class="${cls}" src="${dir}${layer.src}" alt="" style="${style}" draggable="false" />`;
}

function renderMainProjects(projects) {
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map((p, i) => {
    const art = p.panel;
    return `
    <article class="work-item" data-id="${p.id}">
      <h3 class="work-item__bar-heading">
        <button type="button" class="work-item__bar" id="work-bar-${p.id}" aria-expanded="false" aria-controls="work-panel-${p.id}"><span>${p.title}</span><span class="work-item__year">${p.year}</span></button>
      </h3>
      <div class="work-item__panel" id="work-panel-${p.id}" role="region" aria-labelledby="work-bar-${p.id}">
        <a class="work-panel work-panel--${art.tone}" href="${p.link}" tabindex="-1">
          <img class="work-panel__bg" src="${art.dir}${art.bg}" alt="" draggable="false" />
          <div class="work-panel__head">
            <p class="work-panel__name">${p.title}</p>
            <p class="work-panel__tags">${p.tags.join(' &middot; ')}</p>
            <p class="work-panel__headline"${p.headlineWidth ? ` style="--headline-w:${p.headlineWidth}px"` : ''}>${p.headline}</p>
          </div>
          <div class="work-panel__art" aria-hidden="true">
            ${art.main ? panelLayer(art.dir, art.main, 'work-panel__main') : ''}
            ${art.layers.map(l => panelLayer(art.dir, l, 'work-panel__piece')).join('')}
          </div>
        </a>
      </div>
    </article>`;
  }).join('');
}

function renderSecondaryProjects(projects) {
  const grid = document.getElementById('secondary-projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <a class="project-card-link" href="${p.link || 'project/'}" data-id="${p.id}">
      <article class="project-card project-card--secondary">
        <div class="project-card__image">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />`
            : '<div class="project-card__image-placeholder"></div>'
          }
        </div>
        ${p.tags.length ? `
        <ul class="project-card__tags">
          ${p.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
        </ul>` : ''}
        <div class="project-card__info">
          <h3 class="project-card__title">${p.title || '[Project title]'}</h3>
          <p class="project-card__description">${p.description || ''}</p>
        </div>
      </article>
    </a>
  `).join('');
}

loadProjects();
