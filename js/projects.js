// projects.js — reads data/projects.json and renders project cards
// Main projects render as the Work accordion (js/work-accordion.js drives it).

async function loadProjects() {
  const res = await fetch('data/projects.json');
  const data = await res.json();

  renderMainProjects(data.main);
  renderSecondaryProjects(data.secondary);
  window.dispatchEvent(new Event('projects:rendered'));
}

// Each panel's art is laid out on the Figma panel for its breakpoint (desktop
// 1312x580, tablet 704x440, phone 390x458); every layer is positioned in % of
// that canvas so it scales with the panel.
const CANVAS = { desktop: [1312, 580], tablet: [704, 440], mobile: [390, 458] };
let mainProjects = [];

function artKeyFor(art) {
  // the desktop art is used from 1024px up (scaled with the panel); the tablet
  // art is designed for 704px panels, so it only goes up to there
  // Phones (under 480px) get the mobile art; anything wider, down to a phone
  // held sideways, uses the tablet art, which just scales with the panel.
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 480px)').matches && art.tablet) return 'tablet';
  if (art.mobile) return 'mobile';
  return art.tablet ? 'tablet' : 'desktop';
}

// Pieces (everything except the product shot) animate in when their panel
// opens (css/work-motion.css, js/work-accordion.js): data-fx says how each
// one arrives, --i is its place in the sequence. A project names its fx by
// piece in `panel.fx` ({ "gemini": "drop" }); the default is a small rise.
function fxFor(art, layer) {
  const name = layer.src.replace(/^\d+-/, '').replace(/\.webp$/, '');
  return (art.fx && art.fx[name]) || 'rise';
}

function panelLayer(dir, layer, cls, key, fx, order) {
  const [w, h] = CANVAS[key];
  const pos = `left:${(layer.x / w) * 100}%;top:${(layer.y / h) * 100}%;width:${(layer.w / w) * 100}%`;
  const piece = fx ? ` data-fx="${fx}"` : '';
  const seq = order === undefined ? '' : `;--i:${order}`;
  return `<img class="${cls}"${piece} src="${dir}${layer.src}" alt="" style="${pos}${seq}" draggable="false" />`;
}

// The panel's background + art markup for whichever layout fits the screen
function panelArt(p) {
  const art = p.panel;
  const key = artKeyFor(art);
  const layout = art[key];
  const dir = art.dir + (layout.path || '');
  const [w, h] = CANVAS[key];
  return {
    bg: dir + layout.bg,
    html: `<div class="work-panel__art work-panel__art--${key}" style="aspect-ratio:${w} / ${h}" aria-hidden="true">
            ${layout.main ? panelLayer(dir, layout.main, 'work-panel__main', key) : ''}
            ${layout.layers.map((l, i) => panelLayer(dir, l, 'work-panel__piece', key, fxFor(art, l), i)).join('')}
          </div>`
  };
}

// Swap each panel's art when the screen crosses a breakpoint
function refreshPanelArt() {
  mainProjects.forEach((p) => {
    const panel = document.querySelector(`#work-panel-${p.id} .work-panel`);
    if (!panel) return;
    const a = panelArt(p);
    panel.querySelector('.work-panel__bg').src = a.bg;
    panel.querySelector('.work-panel__art').outerHTML = a.html;
  });
}

let shownKeys = '';
function swapArtIfNeeded() {
  const keys = mainProjects.map(p => artKeyFor(p.panel)).join();
  if (!shownKeys || keys === shownKeys) { shownKeys = keys; return; }
  shownKeys = keys;
  refreshPanelArt();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(swapArtIfNeeded, 80);
});

function renderMainProjects(projects) {
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;
  mainProjects = projects;
  shownKeys = projects.map(p => artKeyFor(p.panel)).join();

  grid.innerHTML = projects.map((p, i) => {
    const art = p.panel;
    const a = panelArt(p);
    const headlineStyle = [
      p.headlineWidth ? `--headline-w:${p.headlineWidth}px` : '',
      art.tablet && art.tablet.headlineWidth ? `--headline-w-tablet:${art.tablet.headlineWidth}px` : ''
    ].filter(Boolean).join(';');
    return `
    <article class="work-item" data-id="${p.id}"${art.gap ? ` style="--piece-gap:${art.gap}ms"` : ''}>
      <h3 class="work-item__bar-heading">
        <button type="button" class="work-item__bar" id="work-bar-${p.id}" aria-expanded="false" aria-controls="work-panel-${p.id}"><span>${p.title}</span><span class="work-item__year">${p.year}</span></button>
      </h3>
      <div class="work-item__panel" id="work-panel-${p.id}" role="region" aria-labelledby="work-bar-${p.id}">
        <a class="work-panel work-panel--${art.tone}" href="${p.link}" tabindex="-1">
          <img class="work-panel__bg" src="${a.bg}" alt="" draggable="false" />
          <div class="work-panel__head">
            <p class="work-panel__name">${p.title}</p>
            <p class="work-panel__tags">${p.tags.join(' &middot; ')}</p>
            <p class="work-panel__headline"${headlineStyle ? ` style="${headlineStyle}"` : ''}>${p.headline}</p>
          </div>
          ${a.html}
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
