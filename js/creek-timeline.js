// creek-timeline.js — the Design / Product / ML / Dev tabs on the Creek.UI
// case study's timeline slide (css/creek-timeline.css). Click a tab, or
// move with the arrow keys / Home / End, to show that team's timeline.

(function () {
  document.querySelectorAll('.creek-timeline').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-hidden', String(!on));
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const last = tabs.length - 1;
        let next = -1;
        if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;
        if (next < 0) return;
        e.preventDefault();
        select(tabs[next], true);
      });
    });

    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0], false);
  });
})();
