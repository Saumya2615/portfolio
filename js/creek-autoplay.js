// creek-autoplay.js — silent looping videos on the Creek.UI case study
// (slides 17 and 27). A <video data-autoplay> plays while at least half of
// it is on screen and pauses when it scrolls away, so it only runs while
// someone can see it. With "reduce motion" on, it stays on its poster and
// shows controls so it can still be played on purpose.

(function () {
  const videos = Array.from(document.querySelectorAll('video[data-autoplay]'));
  if (!videos.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    videos.forEach((v) => { v.controls = true; });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        const p = v.play();
        if (p && p.catch) p.catch(() => { v.controls = true; }); // blocked: let the visitor press play
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.5 });

  videos.forEach((v) => {
    v.muted = true; // autoplay is only allowed when silent
    io.observe(v);
  });
})();
