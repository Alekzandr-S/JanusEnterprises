// Mobile menu logic (fixed version — id matches the HTML)
const menuBtn = document.getElementById('hamburgerToggle');
// script.js (drop-in)
(function(){
  // Sanity: prove the script loaded
  console.log('[Janus] script.js loaded');

  const menuBtn  = document.getElementById('hamburgerToggle');
  const panel    = document.getElementById('mobilePanel');
  const closeBtn = document.getElementById('closeHamburger');
  const overlay  = document.getElementById('blurOverlay');

  // Guard: surface missing IDs
  if(!menuBtn || !panel || !closeBtn || !overlay){
    console.error('[Janus] Missing element(s):', {menuBtn, panel, closeBtn, overlay});
    return;
  }

  // Ensure starting state
  panel.classList.remove('active');
  overlay.classList.remove('active');
  panel.setAttribute('aria-hidden','true');
  menuBtn.setAttribute('aria-expanded','false');

  function openMenu(){
    panel.classList.add('active');
    overlay.classList.add('active');
    panel.setAttribute('aria-hidden','false');
    menuBtn.setAttribute('aria-expanded','true');
    console.log('[Janus] menu: open');
  }
  function closeMenu(){
    panel.classList.remove('active');
    overlay.classList.remove('active');
    panel.setAttribute('aria-hidden','true');
    menuBtn.setAttribute('aria-expanded','false');
    console.log('[Janus] menu: close');
  }

  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && panel.classList.contains('active')) closeMenu(); });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panel.style.transition = 'none';
  }
})();

// ===== Hero Carousel (no library) =====
(() => {
  const track   = document.getElementById('heroTrack');
  if (!track) return; // only run on pages that have the hero

  const slides  = Array.from(track.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const dotsBox = document.getElementById('heroDots');

  let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  if (index === -1) index = 0;

  // Build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    b.addEventListener('click', () => go(i, true));
    dotsBox.appendChild(b);
    return b;
  });

  function update() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === index ? 'true' : 'false'));
  }

  function go(i, user = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (user) restartAuto();
  }

  prevBtn?.addEventListener('click', () => go(index - 1, true));
  nextBtn?.addEventListener('click', () => go(index + 1, true));

  // Keyboard
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  go(index - 1, true);
    if (e.key === 'ArrowRight') go(index + 1, true);
  });

  // Swipe / drag
  let startX = 0, isDown = false;
  const surface = track; // listen on track for simplicity
  const onDown = (x) => { isDown = true; startX = x; };
  const onMove = (x) => { if (!isDown) return; };
  const onUp   = (x) => {
    if (!isDown) return;
    const dx = x - startX;
    isDown = false;
    if (Math.abs(dx) > 40) {
      if (dx < 0) go(index + 1, true); else go(index - 1, true);
    }
  };

  surface.addEventListener('pointerdown', (e) => { surface.setPointerCapture(e.pointerId); onDown(e.clientX); });
  surface.addEventListener('pointermove',  (e) => onMove(e.clientX));
  surface.addEventListener('pointerup',    (e) => onUp(e.clientX));
  surface.addEventListener('pointercancel',() => { isDown = false; });

  // Auto-play with pause on hover/focus
  let timer = null;
  const INTERVAL = 5500; // ms

  function startAuto() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAuto();
    timer = setInterval(() => go(index + 1, false), INTERVAL);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
  function restartAuto() { stopAuto(); startAuto(); }

  // Pause on hover/focus inside the section
  const root = document.querySelector('.hero-carousel');
  root?.addEventListener('mouseenter', stopAuto);
  root?.addEventListener('mouseleave', startAuto);
  root?.addEventListener('focusin', stopAuto);
  root?.addEventListener('focusout', startAuto);

  update();
  startAuto();
})();

// -------- Reveal on scroll (keeps your existing behavior) --------
const reveals = document.querySelectorAll('.reveal');

function handleScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerBottom) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// -------- Stagger setup: add to any container with data-stagger --------
// Example targets: .teaser-grid, .portfolio-grid, any row of cards
function applyStagger() {
  document.querySelectorAll('[data-stagger]').forEach(group => {
    const items = group.querySelectorAll('.reveal');
    items.forEach((el, i) => {
      // 90ms steps feel smooth; tweak if you like (e.g., 80 or 120)
      el.style.setProperty('--reveal-delay', `${i * 90}ms`);
    });
  });
}
applyStagger();

// Optional: re-run if you later inject more cards dynamically
// new MutationObserver(applyStagger).observe(document.body, { childList: true, subtree: true });