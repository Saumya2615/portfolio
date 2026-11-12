// aeo-where.js — "Where I started" on the AEO case study.
// Hovering a marked area (or its numbered badge) on the old dashboard
// shows the issue card for it, and washes out the rest of the screenshot.
//   - mouse: hover only
//   - keyboard: Tab through the numbered badges, the card shows on focus
//   - touch: tap a badge or area to show its card, tap anywhere else to close
// The first time the section scrolls into view the badges pulse once, one
// after another, so it's clear they're live. CSS does the animation.

(function () {
  document.querySelectorAll('[data-where]').forEach((root) => {
    const stage = root.querySelector('[data-where-stage]');
    if (!stage) return;

    // A and B are plain markers (their cards sit below the screenshot), so
    // only the areas with a card and the numbered buttons are interactive
    const areas = Array.from(stage.querySelectorAll('.where__area[data-primary]'));
    const badges = Array.from(stage.querySelectorAll('button.where__badge'));
    const cards = Array.from(stage.querySelectorAll('.where__card'));
    const byId = (list, attr, id) => list.find((el) => el.dataset[attr] === id);

    let current = null;
    let hideTimer = 0;

    function show(id) {
      clearTimeout(hideTimer);
      if (id === current) return;
      current = id;
      const badge = byId(badges, 'id', id);
      const areaKey = badge && badge.dataset.area;
      cards.forEach((c) => c.classList.toggle('is-on', c.dataset.card === id));
      badges.forEach((b) => b.classList.toggle('is-active', b.dataset.id === id));
      areas.forEach((a) => a.classList.toggle('is-active', a.dataset.area === areaKey));
    }

    function hide() {
      clearTimeout(hideTimer);
      current = null;
      cards.forEach((c) => c.classList.remove('is-on'));
      badges.forEach((b) => b.classList.remove('is-active'));
      areas.forEach((a) => a.classList.remove('is-active'));
    }

    // a short grace period so crossing from a badge to its area (or between
    // two touching areas) doesn't flash the card off and on
    function hideSoon() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 70);
    }

    const isMouse = (e) => e.pointerType === 'mouse';

    areas.forEach((area) => {
      area.addEventListener('pointerenter', (e) => { if (isMouse(e)) show(area.dataset.primary); });
      area.addEventListener('pointerleave', (e) => { if (isMouse(e)) hideSoon(); });
      area.addEventListener('click', (e) => { // touch / pen
        if (isMouse(e)) return;
        if (current === area.dataset.primary) hide(); else show(area.dataset.primary);
      });
    });

    badges.forEach((badge) => {
      badge.addEventListener('pointerenter', (e) => { if (isMouse(e)) show(badge.dataset.id); });
      badge.addEventListener('pointerleave', (e) => { if (isMouse(e)) hideSoon(); });
      badge.addEventListener('focus', () => show(badge.dataset.id));
      badge.addEventListener('blur', hide);
      badge.addEventListener('click', (e) => { // touch / pen
        if (isMouse(e) || e.detail === 0) return; // keyboard: focus already did it
        if (current === badge.dataset.id) hide(); else show(badge.dataset.id);
      });
    });

    document.addEventListener('pointerdown', (e) => {
      if (!isMouse(e) && !stage.contains(e.target)) hide();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

    // "Hover to see" doesn't make sense without a mouse
    const hint = root.querySelector('[data-where-hint]');
    if (hint && window.matchMedia('(hover: none)').matches) hint.textContent = 'Tap to see';

    // the intro: badges light up one after another, once
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && 'IntersectionObserver' in window) {
      const order = ['1', '2', '3', '4', '5', '6'];
      const seen = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        seen.disconnect();
        order.forEach((id, i) => {
          const badge = byId(badges, 'id', id);
          if (!badge) return;
          setTimeout(() => {
            badge.classList.add('is-pulse');
            badge.addEventListener('animationend', () => badge.classList.remove('is-pulse'), { once: true });
          }, 250 + i * 180);
        });
      }, { threshold: 0.4 });
      seen.observe(stage);
    }
  });
})();
