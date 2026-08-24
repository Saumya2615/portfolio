// main.js — entry point
// Keyboard interactions, project rendering, and game logic will load from here.

// ── Active nav link on scroll ──
(function () {
  const sections = ['work', 'about', 'connect'];
  const links = document.querySelectorAll('.nav-links a');

  function setActive() {
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });

    links.forEach(link => {
      const href = link.getAttribute('href');
      const matches = href === `#${current}` || (current === 'connect' && href === '#connect');
      link.classList.toggle('active', matches);
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();
