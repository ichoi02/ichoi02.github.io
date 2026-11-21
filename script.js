/* Photo carousel, resume dropdown, project track arrows, and scroll-entry reveals. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* Cycle through the intro photos with arrows, dots, keys, or a swipe. */
function initCarousel(root) {
  const frame = root.querySelector('.carousel-frame');
  const photos = [...frame.querySelectorAll('img')];
  const dotsBox = root.querySelector('.carousel-dots');
  const captionText = root.querySelector('.carousel-caption-text');
  const count = root.querySelector('.carousel-count');
  let current = 0;

  // Build one dot per photo
  const dots = photos.map((photo, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${i + 1}`);
    dot.addEventListener('click', () => show(i));
    dotsBox.append(dot);
    return dot;
  });

  /* Show the photo at `index`, wrapping around at either end. */
  function show(index) {
    // Wrap the index and swap the visible photo
    current = (index + photos.length) % photos.length;
    photos.forEach((photo, i) => {
      photo.classList.toggle('is-active', i === current);
      photo.setAttribute('aria-hidden', i !== current);
    });

    // Sync the dots, caption and counter
    dots.forEach((dot, i) => dot.setAttribute('aria-current', i === current));
    captionText.textContent = photos[current].dataset.caption;
    count.textContent = `${current + 1} / ${photos.length}`;
  }

  // Arrow buttons and arrow keys
  root.querySelector('.carousel-btn--prev').addEventListener('click', () => show(current - 1));
  root.querySelector('.carousel-btn--next').addEventListener('click', () => show(current + 1));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Horizontal swipe on touch screens
  let startX = null;
  frame.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  frame.addEventListener('pointercancel', () => { startX = null; });
  frame.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
  });

  show(0);
}


/* Page the project cards with the arrow buttons and disable them at the ends. */
function initTrack(section) {
  const track = section.querySelector('.track');
  const nav = section.querySelector('.track-nav');
  const prev = section.querySelector('.track-btn--prev');
  const next = section.querySelector('.track-btn--next');

  /* Enable or disable each arrow based on scroll position. */
  function update() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll - 2;
    nav.hidden = maxScroll <= 2;
  }

  /* Scroll one view's width forward (1) or back (-1). */
  function page(direction) {
    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  // Wire the arrows and keep their state in sync
  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}


/* Show the resume pages in a panel under the intro instead of following the PDF link. */
function initResume(toggle) {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));

  // Point the download link at the same PDF as the button
  panel.querySelector('.resume-download').href = toggle.getAttribute('href');
  toggle.setAttribute('aria-expanded', 'false');

  /* Open or close the panel. */
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
  }

  // Toggle from the button, close from the panel's X
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    setOpen(panel.hidden);
  });
  panel.querySelector('.resume-close').addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
}


/* Fade blocks in as they enter the viewport; a .reveal-group reveals all its children at once. */
function initReveals() {
  const targets = document.querySelectorAll('.reveal:not(.reveal-group .reveal), .reveal-group');

  // Show everything right away if the observer is unavailable
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Reveal each target once, the first time it scrolls into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target.matches('.reveal-group');
      const items = group ? entry.target.querySelectorAll('.reveal') : [entry.target];
      items.forEach((el) => el.classList.add('is-visible'));
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => observer.observe(el));
}


initCarousel(document.querySelector('.carousel'));
initResume(document.querySelector('.resume-toggle'));
initTrack(document.querySelector('#projects'));
initReveals();
