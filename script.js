/* ============================================================
   Ammu Cherlakadan — Photography Portfolio
   ============================================================ */

// ── Copyright notice in console ──────────────────────────────
console.log(
  '%c© Ammu Cherlakadan',
  'color:#C17D52;font-size:20px;font-weight:bold;font-family:Georgia,serif;'
);
console.log(
  '%cAll images on this portfolio are protected by copyright.\nUnauthorised copying, downloading, or reproduction is strictly prohibited.\nFor licensing enquiries: https://www.instagram.com/ammu_cherlakadan',
  'color:#6B3F2A;font-size:12px;font-family:Georgia,serif;line-height:1.6;'
);

// ── Nav: transparent → filled on scroll ─────────────────────
const nav = document.getElementById('nav');

function updateNav() {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Hero bg: slow zoom-in on load ───────────────────────────
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  // Small delay so transition is visible
  requestAnimationFrame(() => {
    setTimeout(() => heroBg.classList.add('loaded'), 100);
  });
}

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle  = document.getElementById('navToggle');
const navOverlay = document.getElementById('navOverlay');
const overlayLinks = document.querySelectorAll('.overlay-link');

function closeMenu() {
  navToggle.classList.remove('open');
  navOverlay.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  const isOpen = navOverlay.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

overlayLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ── Folder → tab mapping ──────────────────────────────────────
// To add a new category: add a new tab button in index.html
// and add a matching entry here. Images load automatically
// from the folder — no other changes needed.
const TAB_FOLDERS = {
  table:    { folder: 'images/The Table',    alt: 'Food & product photography by Ammu Cherlakadan' },
  lookbook: { folder: 'images/The Lookbook', alt: 'Fashion photography by Ammu Cherlakadan' },
  brand:    { folder: 'images/The Brand',    alt: 'Brand photography by Ammu Cherlakadan' },
  occasion: { folder: 'images/The Occasion', alt: 'Event photography by Ammu Cherlakadan' },
};

// ── Lightbox ──────────────────────────────────────────────────
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lbImages = [];   // flat array of { src, alt } for current tab
let lbIndex  = 0;
let lbLabel  = '';   // current tab category name

const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxLabel   = document.getElementById('lightboxLabel');

function openLightbox(images, index, label) {
  lbImages = images;
  lbIndex  = index;
  lbLabel  = label || '';
  showLightboxImage(lbIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  // Reset pinch zoom
  lbScale = 1;
  lightboxImg.style.transform = '';
}

function showLightboxImage(i) {
  const entry = lbImages[i];
  lightboxImg.classList.add('loading');
  lightboxImg.onload = () => lightboxImg.classList.remove('loading');
  lightboxImg.src = entry.src;
  lightboxImg.alt = entry.alt;
  // Counter + label
  if (lightboxCounter) lightboxCounter.textContent = `${i + 1} / ${lbImages.length}`;
  if (lightboxLabel)   lightboxLabel.textContent   = lbLabel;
  // Reset pinch zoom on image change
  lbScale = 1;
  lightboxImg.style.transform = '';
  // Show/hide arrows at ends
  lightboxPrev.style.opacity = i === 0 ? '0.2' : '';
  lightboxPrev.style.pointerEvents = i === 0 ? 'none' : '';
  lightboxNext.style.opacity = i === lbImages.length - 1 ? '0.2' : '';
  lightboxNext.style.pointerEvents = i === lbImages.length - 1 ? 'none' : '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lightboxPrev.addEventListener('click', () => {
  if (lbIndex > 0) { lbIndex--; showLightboxImage(lbIndex); }
});
lightboxNext.addEventListener('click', () => {
  if (lbIndex < lbImages.length - 1) { lbIndex++; showLightboxImage(lbIndex); }
});

// Keyboard: arrows + Escape
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft'  && lbIndex > 0)                  { lbIndex--; showLightboxImage(lbIndex); }
  if (e.key === 'ArrowRight' && lbIndex < lbImages.length - 1) { lbIndex++; showLightboxImage(lbIndex); }
});

// Touch swipe + pinch-to-zoom support for mobile
let touchStartX = 0;
let lbScale     = 1;
let pinchStartDist = 0;
let pinchStartScale = 1;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

lightbox.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
  } else if (e.touches.length === 2) {
    pinchStartDist  = getTouchDist(e.touches);
    pinchStartScale = lbScale;
  }
}, { passive: true });

lightbox.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();   // prevent page zoom while pinching
    const dist  = getTouchDist(e.touches);
    const ratio = dist / pinchStartDist;
    lbScale = Math.min(4, Math.max(1, pinchStartScale * ratio));
    lightboxImg.style.transform = lbScale > 1 ? `scale(${lbScale})` : '';
  }
}, { passive: false });

lightbox.addEventListener('touchend', e => {
  if (e.touches.length > 0) return;   // still fingers down (multi-touch release)
  const dx = e.changedTouches[0].clientX - touchStartX;
  // Only swipe when not zoomed in
  if (lbScale > 1.05) return;
  if (Math.abs(dx) < 40) return;   // ignore tiny taps
  if (dx < 0 && lbIndex < lbImages.length - 1) { lbIndex++; showLightboxImage(lbIndex); }
  if (dx > 0 && lbIndex > 0)                   { lbIndex--; showLightboxImage(lbIndex); }
}, { passive: true });

// ── Build masonry from pre-generated gallery-data.js ─────────
// gallery-data.js is generated by running:  node build.js
// It defines GALLERY_DATA = { table: [...], lookbook: [...], ... }
function buildMasonry(tabKey, masonryEl) {
  if (masonryEl.children.length > 0) return;   // already built

  const config = TAB_FOLDERS[tabKey];
  if (!config) return;

  const files = (typeof GALLERY_DATA !== 'undefined' && GALLERY_DATA[tabKey]) || [];

  // Human-readable label for lightbox meta bar
  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabKey}"]`);
  const tabLabelText = tabBtn ? (tabBtn.textContent.trim().split('\n')[0].trim()) : tabKey;

  // Build image list for lightbox
  const tabImageList = files.map(entry => ({
    src: `${config.folder}/${entry.file ?? entry}`,
    alt: config.alt,
  }));

  const fragment = document.createDocumentFragment();
  files.forEach((entry, idx) => {
    const filename = entry.file ?? entry;   // supports both {file,w,h} and plain string
    const item = document.createElement('div');
    item.className = 'masonry-item';
    const img = document.createElement('img');
    img.src       = `${config.folder}/${filename}`;
    img.alt       = config.alt;
    // First 3 images load eagerly — they're visible on page load
    img.loading   = idx < 3 ? 'eager' : 'lazy';
    img.draggable = false;
    if (entry.w && entry.h) { img.style.aspectRatio = `${entry.w} / ${entry.h}`; }
    img.onload  = img.onerror = () => item.classList.add('loaded');
    // Open lightbox on click (via the ::after overlay click on the item div)
    item.addEventListener('click', () => openLightbox(tabImageList, idx, tabLabelText));
    item.appendChild(img);
    fragment.appendChild(item);
  });
  masonryEl.appendChild(fragment);
}

// Build first visible tab immediately on load
(function initGallery() {
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) {
    const key = activePanel.id.replace('panel-', '');
    buildMasonry(key, activePanel.querySelector('.masonry'));
  }
})();

// ── Portfolio tabs ───────────────────────────────────────────
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    // Update buttons
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Show correct panel + lazy-load its images on first open
    tabPanels.forEach(panel => {
      const isTarget = panel.id === `panel-${target}`;
      panel.classList.toggle('active', isTarget);
      if (isTarget) {
        buildMasonry(target, panel.querySelector('.masonry'));
      }
    });
  });
});

// ── Tab count badges ──────────────────────────────────────────
// Appends "· 9" style badge to each tab button from GALLERY_DATA
if (typeof GALLERY_DATA !== 'undefined') {
  tabBtns.forEach(btn => {
    const key   = btn.dataset.tab;
    const count = GALLERY_DATA[key] && GALLERY_DATA[key].length;
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'tab-count';
      badge.textContent = count;
      btn.appendChild(badge);
    }
  });
}

// ── Scroll-to-top button ──────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Scroll reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── Image Protection ──────────────────────────────────────────

// Block right-click / long-press context menu on images & portfolio areas
document.addEventListener('contextmenu', function(e) {
  if (
    e.target.tagName === 'IMG' ||
    e.target.closest('.masonry-item, .masonry, .about-image, .hero-bg')
  ) {
    e.preventDefault();
    return false;
  }
});

// Block drag-to-desktop on images
document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});

// Block Ctrl/Cmd+S (save page), Ctrl/Cmd+U (view source), Ctrl/Cmd+P (print)
// and F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
document.addEventListener('keydown', function(e) {
  const key = e.key.toLowerCase();
  // Save / view-source / print
  if ((e.ctrlKey || e.metaKey) && ['s', 'u', 'p'].includes(key)) {
    e.preventDefault();
    return false;
  }
  // DevTools shortcuts
  if (e.key === 'F12') {
    e.preventDefault();
    return false;
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
    e.preventDefault();
    return false;
  }
});

// ── Smooth nav link scrolling (offset for fixed nav) ─────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const navHeight = nav.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});
