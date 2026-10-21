/* ═══════════════════════════════════════════════════════════════
   Rao Ventures — Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

'use strict';

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
  navToggle.addEventListener('click', () => {
    const isOpen = navMobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navMobileMenu.setAttribute('aria-hidden', String(!isOpen));

    // Animate hamburger lines
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile menu when a link is clicked
  navMobileMenu.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      navMobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navMobileMenu.setAttribute('aria-hidden', 'true');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

// ── Scroll reveal using IntersectionObserver ──────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  }
);

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

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
if (heroOrbs.length > 0) {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    heroOrbs.forEach((orb, i) => {
      const factor = (i + 1) * 8;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  }, { passive: true });
}

// ── Interactive 5-Breath Visualizer ──────────────────────────────
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
    updateBreathCycle();
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
      if (isRunning) {
        clearTimeout(timerId);
        updateBreathCycle();
      }
    });
  });

  // Start breathing animation on load
  startBreath();
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

