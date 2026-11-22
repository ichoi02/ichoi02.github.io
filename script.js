/* Photo carousel, resume dropdown, collapsible project list, and scroll-entry reveals. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* Cycle through the intro photos with arrows, dots, keys, or a swipe. */
function initCarousel(root) {
  const frame = root.querySelector('.carousel-frame');
  const photos = [...frame.querySelectorAll('img')];
  const dotsBox = root.querySelector('.carousel-dots');
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

    // Sync the dots
    dots.forEach((dot, i) => dot.setAttribute('aria-current', i === current));
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


/* Show the first three projects with the next one fading out, and open the rest from a View more button. */
function initProjects(list, toggle) {
  const rows = [...list.children];
  const shown = 3;

  // Leave the list open when there is nothing to hide
  if (rows.length <= shown) return;
  toggle.hidden = false;

  /* Clip the list a little below the top of the first hidden project. */
  function measure() {
    const peek = parseFloat(getComputedStyle(list).getPropertyValue('--peek'));
    const top = rows[shown].getBoundingClientRect().top - list.getBoundingClientRect().top;
    list.style.setProperty('--collapsed-height', `${top + peek}px`);
  }

  /* Collapse or expand the list, keeping clipped rows out of the tab order. */
  function setExpanded(expanded) {
    list.classList.toggle('is-collapsed', !expanded);
    rows.slice(shown).forEach((row) => { row.inert = !expanded; });
    toggle.setAttribute('aria-expanded', expanded);
    toggle.querySelector('span').textContent = expanded ? 'View less' : 'View more';
  }

  // Start collapsed and re-measure whenever the list reflows
  measure();
  setExpanded(false);
  new ResizeObserver(measure).observe(list);

  // Toggle on click; after collapsing, bring the button back into view
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    setExpanded(expanded);
    if (!expanded) toggle.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  });
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


/* Fade blocks in as they enter the viewport. */
function initReveals() {
  const items = document.querySelectorAll('.reveal');

  // Show everything right away if the observer is unavailable
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Reveal each block once, the first time it scrolls into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => observer.observe(el));
}


initCarousel(document.querySelector('.carousel'));
initResume(document.querySelector('.resume-toggle'));
initProjects(document.querySelector('#project-list'), document.querySelector('.more-toggle'));
initReveals();
