// hl-hero.js — the Hyperlocal thumbnail plays like a GIF: muted, looping,
// inline. People who ask their system for less motion get the still poster
// instead, and the clip pauses whenever it's scrolled out of view.

(function () {
  const video = document.querySelector('.hl-hero__video');
  if (!video) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    video.removeAttribute('autoplay');
    video.pause();
    return;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {}); // blocked autoplay just leaves the poster
        else video.pause();
      });
    }, { threshold: 0.1 }).observe(video);
  }
})();
