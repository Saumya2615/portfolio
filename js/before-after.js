// before-after.js — Old/New toggle slides on case study pages.
// The switch (and the "Old"/"New" words beside it) flips the slide
// between the two screenshots; CSS handles the crossfade, knob and
// frame colour via [data-state]. Keyboard: Tab to the switch, then
// Space or Enter (native <button>).

(function () {
  document.querySelectorAll('[data-before-after]').forEach((root) => {
    const toggle = root.querySelector('.before-after__switch');
    if (!toggle) return;

    function setState(state) {
      const isNew = state === 'new';
      root.dataset.state = isNew ? 'new' : 'old';
      toggle.setAttribute('aria-checked', String(isNew));
      toggle.setAttribute('aria-label', isNew ? 'Show the old design' : 'Show the new design');
    }

    function touch() {
      root.classList.add('is-touched'); // stops the "try me" pulse
    }

    toggle.addEventListener('click', () => {
      touch();
      setState(root.dataset.state === 'new' ? 'old' : 'new');
    });

    root.querySelectorAll('[data-set]').forEach((label) => {
      label.addEventListener('click', () => {
        touch();
        setState(label.dataset.set);
      });
    });

    setState('old'); // start on the "before"
  });
})();
