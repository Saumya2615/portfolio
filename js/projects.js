// projects.js — reads data/projects.json and renders project cards
// Full styling applied in Step 7; this handles structure only.

async function loadProjects() {
  const res = await fetch('data/projects.json');
  const data = await res.json();

  renderMainProjects(data.main);
  renderSecondaryProjects(data.secondary);
  window.dispatchEvent(new Event('projects:rendered'));
}

function renderMainProjects(projects) {
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <a class="project-card-link" href="${p.link || 'project/'}" data-id="${p.id}">
      <article class="project-card project-card--main">
        <div class="project-card__media">
          <img class="project-card__eyes" src="assets/images/work-eyes.svg" alt="" aria-hidden="true" />
          <div class="project-card__image">
            ${p.image
              ? `<img src="${p.image}" alt="${p.title}" loading="lazy" />`
              : '<div class="project-card__image-placeholder"></div>'
            }
          </div>
        </div>
        <div class="project-card__info">
          <div class="project-card__heading">
            <span class="dot dot--orange project-card__marker" aria-hidden="true"></span>
            <h3 class="project-card__title">${p.title}</h3>
            <p class="project-card__description">${p.description || ''}</p>
          </div>
          <ul class="project-card__tags">
            ${p.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
          </ul>
        </div>
      </article>
    </a>
  `).join('');
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
        <div class="project-card__info">
          <h3 class="project-card__title">${p.title || '[Project title]'}</h3>
          <p class="project-card__description">${p.description || ''}</p>
          <ul class="project-card__tags">
            ${p.tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
          </ul>
        </div>
      </article>
    </a>
  `).join('');
}

// ── "↵ open" keycap that follows the cursor over main project cards ──
// Pressing the real Enter key while hovering a card opens it. Mouse/
// trackpad only (no hover on touch). Shown on mousemove, not mouseover,
// so scrolling past cards without moving the mouse never pops it up.
function setupOpenKeycap() {
  const grid = document.getElementById('main-projects-grid');
  if (!grid || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const chip = document.createElement('div');
  chip.className = 'open-keycap';
  chip.setAttribute('aria-hidden', 'true');
  chip.innerHTML = '<kbd>↵</kbd> open';
  document.body.appendChild(chip);

  let hovered = null;
  const OFFSET = 18; // px from the cursor so it doesn't sit under the pointer

  grid.addEventListener('mousemove', (e) => {
    const link = e.target.closest('.project-card-link');
    hovered = link;
    if (!link) { chip.classList.remove('is-visible'); return; }
    chip.style.transform = `translate(${e.clientX + OFFSET}px, ${e.clientY + OFFSET}px)`;
    chip.classList.add('is-visible');
  });

  grid.addEventListener('mouseleave', () => {
    hovered = null;
    chip.classList.remove('is-visible');
  });

  // Hide while scrolling; the next mousemove brings it back in place.
  window.addEventListener('scroll', () => chip.classList.remove('is-visible'), { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
    if (!hovered || !chip.classList.contains('is-visible')) return;
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    const href = hovered.href;
    chip.classList.add('is-pressed');
    setTimeout(() => { window.location.href = href; }, 120); // let the press read first
  });
}

loadProjects();
setupOpenKeycap();
