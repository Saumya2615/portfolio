// aeo-widgets.js — the "closer look at some widgets" slide on the AEO case study.
// Three tabs (Visibility funnel / Fix this leak / Response trend) in a
// WAI-ARIA tablist: click, or Left / Right / Home / End once a tab has
// focus. "View the 92 missing →" in the funnel opens the Fix this leak
// tab, and in Response trend a week's bar (hover, focus or tap) moves the
// highlight and the tooltip. CSS does the animation (css/aeo-widgets.css).

(function () {
  document.querySelectorAll('[data-widgets]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    // CSS only hides things for the entrance animations once JS is here
    root.setAttribute('data-ready', '');

    function select(name, focus) {
      tabs.forEach((tab) => {
        const on = tab.dataset.tab === name;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === name));
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab.dataset.tab));
      tab.addEventListener('keydown', (e) => {
        let next = -1;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next < 0) return;
        e.preventDefault();
        select(tabs[next].dataset.tab, true);
      });
    });

    root.querySelectorAll('[data-go-tab]').forEach((el) =>
      el.addEventListener('click', () => select(el.dataset.goTab)));

    // Funnel bars grow in the first time the slide scrolls into view
    if ('IntersectionObserver' in window) {
      const seen = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          root.classList.add('is-in');
          seen.disconnect();
        }
      }, { threshold: 0.25 });
      seen.observe(root);
    } else {
      root.classList.add('is-in');
    }

    // ── Response trend ──
    const trend = root.querySelector('[data-trend]');
    if (!trend) return;
    const plot = trend.querySelector('.rt__plot');
    const bars = Array.from(trend.querySelectorAll('.rt__bar'));
    const ticks = Array.from(trend.querySelectorAll('.rt__axis span'));
    const tooltip = trend.querySelector('.rt__tooltip');
    const label = trend.querySelector('.rt__tt-label');
    const values = {
      pos: trend.querySelector('[data-tt="pos"]'),
      neu: trend.querySelector('[data-tt="neu"]'),
      neg: trend.querySelector('[data-tt="neg"]'),
      nn: trend.querySelector('[data-tt="nn"]'),
    };

    bars.forEach((bar, i) => bar.style.setProperty('--bi', i)); // bars rise one after another

    let selected = bars.length - 1; // the latest run, as in the design

    // The tooltip only shows while a week is hovered / focused (or just tapped
    // on a touch screen). It fades in and out where that week's bar is, and
    // fades in again when the pointer moves on to the next week.
    let tipWeek = -1;
    function showTip(i) {
      const changed = i !== tipWeek;
      const bar = bars[i];
      if (changed) {
        plot.style.setProperty('--tip', bar.style.getPropertyValue('--bx'));
        label.textContent = bar.dataset.week;
        values.pos.textContent = bar.dataset.pos;
        values.neu.textContent = bar.dataset.neu;
        values.neg.textContent = bar.dataset.neg;
        values.nn.textContent = bar.dataset.nn;
      }
      if (changed && tooltip.classList.contains('is-on')) {
        tooltip.classList.remove('is-swap'); // restart the quick fade-in
        void tooltip.offsetWidth;
        tooltip.classList.add('is-swap');
      }
      tipWeek = i;
      tooltip.classList.add('is-on');
    }

    function hideTip() {
      tipWeek = -1;
      tooltip.classList.remove('is-on', 'is-swap');
    }

    // A click picks a week: grey highlight behind its bar, bold label below
    function pick(i) {
      selected = i;
      bars.forEach((b, j) => {
        const on = j === i;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
      ticks.forEach((t, j) => t.classList.toggle('is-selected', j === i));
      plot.style.setProperty('--sel', bars[i].style.getPropertyValue('--bx'));
    }

    // Each week owns the whole column around its bar (the gaps too), so the
    // tooltip doesn't flicker off every time the pointer crosses a gap.
    function weekAt(e) {
      const box = plot.getBoundingClientRect();
      const i = Math.floor(((e.clientX - box.left) / box.width) * bars.length);
      return Math.max(0, Math.min(bars.length - 1, i));
    }

    plot.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') showTip(weekAt(e));
    });
    plot.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') hideTip();
    });
    plot.addEventListener('click', (e) => {
      if (e.target.closest('.rt__bar')) return; // bars handle their own click
      const i = weekAt(e);
      pick(i);
      showTip(i); // on touch screens a tap is the only "hover" there is
    });
    // tapping anywhere else closes a tooltip a tap left open
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' && !plot.contains(e.target)) hideTip();
    });

    bars.forEach((bar, i) => {
      bar.addEventListener('focus', () => showTip(i));
      bar.addEventListener('blur', hideTip);
      bar.addEventListener('click', () => { // also Enter / Space
        pick(i);
        showTip(i);
      });
    });

    pick(selected);
  });
})();
