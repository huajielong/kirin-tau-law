/* ============================================
   KIRIN 9040 · 韬（τ）定律 — 产品展示页
   Lenis + GSAP + Canvas 滚动驱动动画
   Split-Screen: Left 1/3 Text | Right 2/3 Product
   ============================================ */

(function() {
  'use strict';

  // --- CONFIG ---
  const FRAME_COUNT = 91;
  const FRAME_SPEED = 1.5;
  const IMAGE_SCALE = 0.85;
  const FRAME_PATH = 'frames/frame_';
  const FRAME_EXT = '.webp';

  // --- DOM REFS ---
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const heroSection = document.getElementById('hero');
  const rightPanel = document.getElementById('right-panel');
  const canvas = document.getElementById('product-canvas');
  const ctx = canvas.getContext('2d');
  const scrollContainer = document.getElementById('scroll-container');
  const darkOverlay = document.getElementById('dark-overlay');
  const marqueeWrap = document.querySelector('.marquee-wrap');
  const marqueeText = document.querySelector('.marquee-text');
  const sections = document.querySelectorAll('.scroll-section');
  const statNumbers = document.querySelectorAll('.stat-number');

  // --- STATE ---
  let frames = [];
  let currentFrame = -1;
  let bgColor = '#000';
  let dpr = 1;
  let displayWidth = 0;
  let displayHeight = 0;
  let statsRange = null;

  // ============================================
  // 1. FRAME PRELOADER
  // ============================================
  function preloadFrames() {
    const totalFrames = FRAME_COUNT;
    const initialBatch = Math.min(10, totalFrames);
    let loaded = 0;

    function loadOne(i) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        const padded = String(i + 1).padStart(4, '0');
        img.src = FRAME_PATH + padded + FRAME_EXT;
      });
    }

    function updateBar(pct) {
      loaderBar.style.width = pct + '%';
      loaderPercent.textContent = pct + '%';
    }

    (async () => {
      // Phase 1: load first 10 frames synchronously
      const firstBatch = [];
      for (let i = 0; i < initialBatch; i++) {
        const img = await loadOne(i);
        firstBatch.push(img);
        loaded++;
        updateBar(Math.round((loaded / totalFrames) * 100));
      }
      frames = firstBatch;

      // Draw first frame immediately
      if (frames[0]) {
        bgColor = sampleBgColor(frames[0]) || '#000';
        resizeCanvas();
        drawFrame(0);
      }

      // Phase 2: load remaining frames in parallel
      const remaining = new Array(totalFrames - initialBatch);
      const promises = [];
      for (let i = initialBatch; i < totalFrames; i++) {
        const idx = i;
        promises.push(
          loadOne(i).then(img => {
            remaining[idx - initialBatch] = img;
            loaded++;
            updateBar(Math.round((loaded / totalFrames) * 100));
          })
        );
      }
      await Promise.all(promises);
      frames = [...frames, ...remaining];

      // All frames ready → hide loader, init experience
      loader.classList.add('loaded');
      initScrollDriven();
    })();
  }

  // ============================================
  // 2. CANVAS RENDERER
  // ============================================
  function resizeCanvas() {
    const rect = rightPanel.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    displayWidth = rect.width;
    displayHeight = rect.height;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sampleBgColor(img) {
    try {
      const tc = document.createElement('canvas');
      tc.width = img.naturalWidth;
      tc.height = img.naturalHeight;
      const tctx = tc.getContext('2d');
      tctx.drawImage(img, 0, 0);
      const data = tctx.getImageData(0, 0, 5, 5).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      if (count === 0) return '#000';
      return `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
    } catch (_) {
      return '#000';
    }
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img) return;

    const w = displayWidth;
    const h = displayHeight;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;
    const scale = Math.max(w / iw, h / ih) * IMAGE_SCALE;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ============================================
  // 3. SECTION ANIMATION SETUP
  // ============================================
  function setupSectionAnimations() {
    sections.forEach(section => {
      const type = section.dataset.animation;
      const children = section.querySelectorAll(
        '.section-label, .section-heading, .section-body, .section-note, ' +
        '.section-formula, .perf-tags, .stat-item, .cta-row, .cta-button'
      );

      const tl = gsap.timeline({ paused: true });

      switch (type) {
        case 'slide-left':
          tl.from(children, { x: -60, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out' });
          break;
        case 'fade-up':
          tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out' });
          break;
        case 'scale-up':
          tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'power2.out' });
          break;
        case 'stagger-up':
          tl.from(children, { y: 60, opacity: 0, stagger: 0.18, duration: 1, ease: 'power3.out' });
          break;
        case 'clip-reveal':
          tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.4, ease: 'power4.inOut' });
          break;
        case 'slide-right':
          tl.from(children, { x: 60, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out' });
          break;
      }

      section._timeline = tl;
    });
  }

  // ============================================
  // 4. SCROLL-DRIVEN ENGINE
  // ============================================
  function initScrollDriven() {
    // Set scroll height
    scrollContainer.style.height = '900vh';

    gsap.registerPlugin(ScrollTrigger);

    // Cache stats section range
    const statsEl = document.querySelector('.section-stats');
    if (statsEl) {
      statsRange = {
        enter: parseFloat(statsEl.dataset.enter) / 100,
        leave: parseFloat(statsEl.dataset.leave) / 100,
      };
    }

    // Setup animations
    setupSectionAnimations();

    // --- Lenis ---
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // --- Nav link click → smooth scroll to section ---
    const navLinks = document.querySelectorAll('.nav-link');
    const vh = window.innerHeight;
    const totalScroll = scrollContainer.getBoundingClientRect().height - vh;

    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        const targetSection = document.getElementById(targetId) ||
          document.querySelector(`.scroll-section[id="${targetId}"]`);
        if (targetSection) {
          const enter = parseFloat(targetSection.dataset.enter) / 100;
          const leave = parseFloat(targetSection.dataset.leave) / 100;
          // 跳到章节内部约 25% 处，此时自然进度已让文案充分可见
          const targetPct = enter + (leave - enter) * 0.25;
          const scrollY = targetPct * totalScroll;
          lenis.scrollTo(scrollY, { duration: 1.8, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        }
      });
    });

    // --- Marquee (GSAP ScrollTrigger) ---
    gsap.to(marqueeText, {
      xPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    // --- Main ScrollTrigger (orchestrates everything) ---
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: self => {
        const p = self.progress; // 0 → 1

        // ── Hero ──
        heroSection.style.opacity = Math.max(0, 1 - p * 14);
        heroSection.style.pointerEvents = p > 0.1 ? 'none' : 'auto';

        // ── Right panel circle-wipe reveal ──
        const wipeP = Math.min(1, Math.max(0, (p - 0.005) / 0.065));
        rightPanel.style.clipPath = `circle(${wipeP * 75}% at 50% 50%)`;
        rightPanel.style.opacity = Math.min(1, wipeP * 2);

        // ── Frame playback ──
        const accelerated = Math.min(p * FRAME_SPEED, 1);
        const idx = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (idx !== currentFrame) {
          currentFrame = idx;
          drawFrame(currentFrame);
        }

        // Re-sample background color every 20 frames
        if (currentFrame > 0 && currentFrame % 20 === 0 && frames[currentFrame]) {
          bgColor = sampleBgColor(frames[currentFrame]) || bgColor;
        }

        // ── Section visibility & animation ──
        sections.forEach(section => {
          const enter = parseFloat(section.dataset.enter) / 100;
          const leave = parseFloat(section.dataset.leave) / 100;
          const persist = section.dataset.persist === 'true';
          const tl = section._timeline;

          if (p >= enter && p <= leave) {
            const sp = (p - enter) / (leave - enter);
            section.style.opacity = 1;
            section.style.pointerEvents = 'auto';
            if (tl) tl.progress(sp);
          } else if (p > leave && persist) {
            section.style.opacity = 1;
            section.style.pointerEvents = 'auto';
            if (tl) tl.progress(1);
          } else if (p > leave) {
            // Fade out after leave (over 3% scroll)
            const fadeOut = Math.min(1, (p - leave) / 0.03);
            section.style.opacity = Math.max(0, 1 - fadeOut);
            section.style.pointerEvents = 'none';
            if (tl) tl.progress(1);
          } else {
            // p < enter → hidden
            section.style.opacity = 0;
            section.style.pointerEvents = 'none';
            if (tl) tl.progress(0);
          }
        });

        // ── Dark overlay (stats section) ──
        if (statsRange) {
          const fr = 0.03;
          let o = 0;
          if (p >= statsRange.enter - fr && p < statsRange.enter) {
            o = (p - (statsRange.enter - fr)) / fr;
          } else if (p >= statsRange.enter && p < statsRange.leave) {
            o = 0.9;
          } else if (p >= statsRange.leave && p <= statsRange.leave + fr) {
            o = 0.9 * (1 - (p - statsRange.leave) / fr);
          }
          darkOverlay.style.opacity = o;
        }

        // ── Marquee visibility ──
        marqueeWrap.style.opacity = (p > 0.12 && p < 0.88) ? 1 : 0;

        // ── Counter animation ──
        if (statsRange) {
          if (p >= statsRange.enter && p < statsRange.leave) {
            const cp = (p - statsRange.enter) / (statsRange.leave - statsRange.enter);
            const cv = Math.min(cp, 1);
            statNumbers.forEach(el => {
              const target = parseFloat(el.dataset.value);
              el.textContent = Math.round(cv * target).toLocaleString();
            });
          } else if (p >= statsRange.leave) {
            statNumbers.forEach(el => {
              el.textContent = parseFloat(el.dataset.value).toLocaleString();
            });
          } else {
            statNumbers.forEach(el => { el.textContent = '0'; });
          }
        }
      },
    });

    // ── Resize handler ──
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (frames[currentFrame]) {
          bgColor = sampleBgColor(frames[currentFrame]) || bgColor;
          drawFrame(currentFrame);
        }
        ScrollTrigger.refresh();
      }, 200);
    });

    // Refresh after layout settles
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }

  // ============================================
  // 5. BOOT
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadFrames);
  } else {
    preloadFrames();
  }

})();
