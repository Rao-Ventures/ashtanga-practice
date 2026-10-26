/* ═══════════════════════════════════════════════════════════════
   Rao Ventures — Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// Sanskrit fonts are only needed in the pose library and later sections.
const sanskritSections = document.querySelectorAll('.pose-dir-grid, #vinyasa-breath, #eight-limbs');
const loadSanskritFonts = () => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'fonts/sanskrit.css';
  document.head.appendChild(stylesheet);
};
if ('IntersectionObserver' in window) {
  const fontObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      fontObserver.disconnect();
      loadSanskritFonts();
    }
  }, { rootMargin: '600px 0px' });
  sanskritSections.forEach(section => fontObserver.observe(section));
} else {
  loadSanskritFonts();
}

// ── Navbar scroll effect ──────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load
}

// ── Mobile navigation toggle ──────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMobileMenu = document.getElementById('nav-mobile-menu');

if (navToggle && navMobileMenu) {
  const closeMobileMenu = () => {
    navMobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMobileMenu.setAttribute('aria-hidden', 'true');
    const spans = navToggle.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  };

  const openMobileMenu = () => {
    navMobileMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navMobileMenu.setAttribute('aria-hidden', 'false');
    const spans = navToggle.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    }
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMobileMenu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu when any link or CTA inside it is clicked
  navMobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close when tapping outside navbar
  document.addEventListener('click', (e) => {
    if (navMobileMenu.classList.contains('open') && !navMobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Auto-close when resized to desktop breakpoint (> 1024px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navMobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  }, { passive: true });
}

// ── Scroll reveal using IntersectionObserver ──────────────────────
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('reveal-pending');
          revealObserver.unobserve(entry.target);
        } else {
          entry.target.classList.add('reveal-pending');
        }
      });
    },
    {
      threshold: 0
    }
  );

  document.querySelectorAll('main .reveal').forEach(el => revealObserver.observe(el));
}

// ── Smooth scroll for anchor links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Subtle parallax on hero orbs ─────────────────────────────────
const heroOrbs = document.querySelectorAll('.hero-orb');
if (heroOrbs.length > 0 && !reducedMotion.matches && window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    heroOrbs.forEach((orb, i) => {
      const factor = (i + 1) * 8;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  }, { passive: true });
}

// ── Interactive Breath Ring Visualizer ──────────────────────────
const breathCircle = document.getElementById('breath-circle');
const breathPhaseText = document.getElementById('breath-phase-text');
const breathCountText = document.getElementById('breath-count-text');
const breathToggleBtn = document.getElementById('breath-toggle-btn');
const bpmButtons = document.querySelectorAll('.bpm-btn');

if (breathCircle && breathToggleBtn) {
  let isRunning = true;
  let bpm = 9; // 9 BPM default = ~6.67s total cycle (3.33s in, 3.33s out)
  let isInhale = true;
  let count = 1;
  let timerId = null;
  let isVisible = false;

  const sanskritCounts = [
    { num: 1, name: 'Ekam', devanagari: 'एकम्' },
    { num: 2, name: 'Dve', devanagari: 'द्वे' },
    { num: 3, name: 'Trīṇi', devanagari: 'त्रीणि' },
    { num: 4, name: 'Catvāri', devanagari: 'चत्वारि' },
    { num: 5, name: 'Pañca', devanagari: 'पञ्च' }
  ];

  const updateBreathCycle = () => {
    const halfCycleSec = (60 / bpm) / 2;
    breathCircle.style.transition = `transform ${halfCycleSec}s cubic-bezier(0.4, 0, 0.2, 1)`;

    if (isInhale) {
      breathCircle.classList.remove('exhale');
      breathCircle.classList.add('inhale');
      if (breathPhaseText) breathPhaseText.textContent = 'Inhale';
      const c = sanskritCounts[count - 1];
      if (breathCountText) breathCountText.textContent = `${c.name} (${c.devanagari}) • Breath ${count} of 5`;
    } else {
      breathCircle.classList.remove('inhale');
      breathCircle.classList.add('exhale');
      if (breathPhaseText) breathPhaseText.textContent = 'Exhale';
      const c = sanskritCounts[count - 1];
      if (breathCountText) breathCountText.textContent = `${c.name} • Release`;
      count = count >= 5 ? 1 : count + 1;
    }

    isInhale = !isInhale;
    timerId = setTimeout(updateBreathCycle, halfCycleSec * 1000);
  };

  const startBreath = () => {
    isRunning = true;
    breathToggleBtn.innerHTML = `<span>⏸ Pause Breath</span>`;
    if (isVisible && !document.hidden && timerId === null) updateBreathCycle();
  };

  const pauseBreath = () => {
    isRunning = false;
    clearTimeout(timerId);
    timerId = null;
    breathToggleBtn.innerHTML = `<span>▶ Resume Breath</span>`;
    if (breathPhaseText) breathPhaseText.textContent = 'Paused';
  };

  breathToggleBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseBreath();
    } else {
      startBreath();
    }
  });

  bpmButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bpmButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bpm = parseInt(btn.getAttribute('data-bpm') || '9', 10);
      if (isRunning && isVisible && !document.hidden) {
        clearTimeout(timerId);
        updateBreathCycle();
      }
    });
  });

  // Run the demo only while it is on screen and the tab is active.
  const syncBreath = () => {
    clearTimeout(timerId);
    timerId = null;
    if (isRunning && isVisible && !document.hidden) startBreath();
  };
  if ('IntersectionObserver' in window) {
    const breathObserver = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      syncBreath();
    });
    breathObserver.observe(breathCircle.closest('.breath-widget'));
  } else {
    isVisible = true;
    syncBreath();
  }
  document.addEventListener('visibilitychange', syncBreath);
}

// ── Chant Tab Switcher ───────────────────────────────────────────
const chantTabs = document.querySelectorAll('.chant-tab-btn');
const chantPanes = document.querySelectorAll('.chant-pane');

if (chantTabs.length > 0) {
  chantTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      chantTabs.forEach(t => t.classList.remove('active'));
      chantPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// ── App Screenshots Carousel Controller ──────────────────────────
const carouselTrack = document.getElementById('app-carousel-track');
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselDots = document.querySelectorAll('.app-carousel-dot');
const carouselSlides = document.querySelectorAll('.app-carousel-slide');

if (carouselTrack && carouselSlides.length > 0) {
  const getSlideScrollAmount = () => {
    const firstSlide = carouselSlides[0];
    if (!firstSlide) return 350;
    const style = window.getComputedStyle(carouselTrack);
    const gap = parseFloat(style.gap) || 32;
    return firstSlide.offsetWidth + gap;
  };

  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: -getSlideScrollAmount(), behavior: 'smooth' });
    });
  }

  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: getSlideScrollAmount(), behavior: 'smooth' });
    });
  }

  carouselDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-index') || '0', 10);
      const targetSlide = carouselSlides[targetIndex];
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  });

  // Track active slide with IntersectionObserver for accurate dot indicators
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const activeIndex = entry.target.getAttribute('data-index');
          carouselDots.forEach(dot => {
            const isMatch = dot.getAttribute('data-index') === activeIndex;
            dot.classList.toggle('active', isMatch);
            dot.setAttribute('aria-selected', isMatch ? 'true' : 'false');
          });
        }
      });
    },
    {
      root: carouselTrack,
      threshold: 0.55
    }
  );

  carouselSlides.forEach(slide => slideObserver.observe(slide));

  // Keyboard navigation
  carouselTrack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      carouselTrack.scrollBy({ left: -getSlideScrollAmount(), behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      carouselTrack.scrollBy({ left: getSlideScrollAmount(), behavior: 'smooth' });
    }
  });
}

// ── Vexo Analytics: Outbound App Store & Play Store Click Tracking ──
// Keep third-party downloads out of the first render. Early interactions load
// analytics immediately, and store clicks are queued until its API is ready.
const pendingDownloadEvents = [];
let analyticsStarted = false;
let analyticsTimer;
const flushDownloadEvents = () => {
  if (window.vexo && typeof window.vexo.customEvent === 'function') {
    pendingDownloadEvents.splice(0).forEach(event => {
      try {
        window.vexo.customEvent('download_click', event);
      } catch (_) {
        // Analytics must never interrupt an outbound link.
      }
    });
  }
};
const loadAnalytics = () => {
  if (analyticsStarted) return;
  analyticsStarted = true;
  clearTimeout(analyticsTimer);
  document.removeEventListener('pointerdown', loadAnalytics);
  document.removeEventListener('keydown', loadAnalytics);
  const script = document.createElement('script');
  script.src = 'https://www.vexo.co/analytics.js';
  script.async = true;
  script.addEventListener('load', flushDownloadEvents, { once: true });
  document.head.appendChild(script);
};
document.addEventListener('pointerdown', loadAnalytics, { once: true, passive: true });
document.addEventListener('keydown', loadAnalytics, { once: true });
const scheduleAnalytics = () => {
  if (!analyticsStarted) analyticsTimer = setTimeout(loadAnalytics, 3500);
};
if (document.readyState === 'complete') scheduleAnalytics();
else window.addEventListener('load', scheduleAnalytics, { once: true });

document.querySelectorAll('a[href*="apple.com"], a[href*="play.google.com"]').forEach(link => {
  link.addEventListener('click', () => {
    try {
      const isApple = link.href.includes('apple.com');
      const storeName = isApple ? 'App Store' : 'Google Play';
      pendingDownloadEvents.push({ store: storeName, target_url: link.href });
      loadAnalytics();
      flushDownloadEvents();
    } catch (_) {
      // Fail silently if analytics script is blocked or unavailable
    }
  });
});



