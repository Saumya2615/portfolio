// aeo-lit.js — the "Literature review" accordion on the AEO case study.
// Click the grey bar to open or close it. While it's closed the findings are
// inert, so the link inside can't be tabbed to.

(function () {
  document.querySelectorAll('[data-lit]').forEach((root) => {
    const button = root.querySelector('[data-lit-toggle]');
    const body = root.querySelector('[data-lit-body]');
    if (!button || !body) return;

    function set(open) {
      root.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.inert = !open;
    }

    set(false);
    button.addEventListener('click', () => set(!root.classList.contains('is-open')));
  });
})();
