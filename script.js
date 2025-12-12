document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  // Product section SIGNAL CANVAS ANIMATION
  const signalCanvas = document.getElementById('signal-canvas');
  if (signalCanvas) {
      const sCtx = signalCanvas.getContext('2d');
      let sWidth, sHeight;
      const waves = [];
      const numWaves = 5;

      function resizeSignal() {
          const parent = signalCanvas.parentElement;
          if (parent) {
              sWidth = signalCanvas.width = parent.clientWidth;
              sHeight = signalCanvas.height = parent.clientHeight;
          } else {
              sWidth = signalCanvas.width = window.innerWidth;
              sHeight = signalCanvas.height = window.innerHeight;
          }
      }

      window.addEventListener('resize', resizeSignal);
      resizeSignal();

      for (let i = 0; i < numWaves; i++) {
          waves.push({
              y: sHeight / 2,
              length: 0.01 + Math.random() * 0.02,
              amplitude: 50 + Math.random() * 100,
              frequency: 0.02 + Math.random() * 0.04,
              speed: 0.1 + Math.random() * 0.2,
              offset: Math.random() * Math.PI * 2
          });
      }

      function drawSignalGrid() {
          sCtx.strokeStyle = 'rgba(57, 255, 20, 0.1)';
          sCtx.lineWidth = 1;
          const gridSize = 50;

          for (let x = 0; x < sWidth; x += gridSize) {
              sCtx.beginPath();
              sCtx.moveTo(x, 0);
              sCtx.lineTo(x, sHeight);
              sCtx.stroke();
          }

          for (let y = 0; y < sHeight; y += gridSize) {
              sCtx.beginPath();
              sCtx.moveTo(0, y);
              sCtx.lineTo(sWidth, y);
              sCtx.stroke();
          }
      }

      function drawSignal() {
          sCtx.clearRect(0, 0, sWidth, sHeight);
          drawSignalGrid();

          waves.forEach((wave, index) => {
              sCtx.beginPath();
              sCtx.strokeStyle = index === 0 ? '#39ff14' : `rgba(57, 255, 20, ${0.5 - index * 0.1})`;
              sCtx.lineWidth = index === 0 ? 3 : 1;

              for (let x = 0; x < sWidth; x++) {
                  const y = wave.y + Math.sin(x * wave.length + wave.offset) * wave.amplitude * Math.sin(Date.now() * 0.001);
                  if (x === 0) sCtx.moveTo(x, y);
                  else sCtx.lineTo(x, y);
              }

              sCtx.stroke();
              wave.offset += wave.speed;
          });

          const scanY = (Date.now() * 0.5) % sHeight;
          sCtx.beginPath();
          sCtx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
          sCtx.lineWidth = 2;
          sCtx.moveTo(0, scanY);
          sCtx.lineTo(sWidth, scanY);
          sCtx.stroke();

          sCtx.fillStyle = '#39ff14';
          sCtx.font = '14px monospace';
          if (Math.random() > 0.95) {
              sCtx.fillText(`DETECTING SIGNAL... ${Math.floor(Math.random() * 100)}%`,
                Math.random() * sWidth,
                Math.random() * sHeight
              );
          }

          requestAnimationFrame(drawSignal);
      }

      drawSignal();
  }

  // Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
  });

  // Fade-in Observer
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
          }
      });
  });

  document.querySelectorAll('.section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(section);
  });

  // ---------------------------------------------------------
  //  FLOWCHART MODAL VIEWER (FINAL WORKING VERSION)
  // ---------------------------------------------------------
    const modal = document.getElementById("img-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".close-modal");
    let lastActiveElement = null;

    let flowImg = null;
    let isAnimating = false;

    function createFlowingImage(src) {
      const img = document.createElement('img');
      img.className = 'flowing-image hidden';
      img.src = src;
      img.alt = '';
      document.body.appendChild(img);
      return img;
    }

    function openModal(src, altText, triggerEl) {
      if (isAnimating) return; // prevent overlapping opens
      isAnimating = true;
      lastActiveElement = triggerEl || document.activeElement;
      const rect = triggerEl.getBoundingClientRect();
      // create flow image
      flowImg = createFlowingImage(src);
      // initial position/size same as the trigger card's rect
      flowImg.style.left = rect.left + 'px';
      flowImg.style.top = rect.top + 'px';
      flowImg.style.width = rect.width + 'px';
      flowImg.style.height = rect.height + 'px';
      flowImg.classList.remove('hidden');

      // compute target size (modal image max sizes)
      const targetW = Math.min(window.innerWidth * 0.9, 1200);
      const targetH = Math.min(window.innerHeight * 0.85, 900);
      const targetLeft = (window.innerWidth - targetW) / 2;
      const targetTop = (window.innerHeight - targetH) / 2;

      // force layout then animate
      requestAnimationFrame(() => {
        flowImg.style.left = targetLeft + 'px';
        flowImg.style.top = targetTop + 'px';
        flowImg.style.width = targetW + 'px';
        flowImg.style.height = targetH + 'px';
      });

      // when animation completes, show modal overlay & set modal img
      const onTransitionEnd = (e) => {
        if (e.propertyName === 'width' || e.propertyName === 'left') {
          flowImg.removeEventListener('transitionend', onTransitionEnd);
          modal.style.display = 'flex';
          modalImg.src = src;
          modalImg.alt = altText || 'Diagram';
          document.body.style.overflow = 'hidden';
          if (modal) modal.setAttribute('aria-hidden', 'false');
          if (closeBtn) closeBtn.focus();
          // keep flow image hidden while modal opened, but keep it for reverse animation
          flowImg.classList.add('hidden');
          isAnimating = false;
        }
      };

      flowImg.addEventListener('transitionend', onTransitionEnd);
    }

    function closeModal() {
      if (isAnimating) return; // block while animating
      isAnimating = true;
      modal.style.display = 'none';
      // reverse animate the flow image back to the trigger
      if (!flowImg) {
        // if it was removed, just cleanup and restore
        modalImg.src = '';
        modalImg.alt = '';
        document.body.style.overflow = '';
        if (modal) modal.setAttribute('aria-hidden', 'true');
        if (lastActiveElement && lastActiveElement.focus) lastActiveElement.focus();
        isAnimating = false;
        return;
      }
      // ensure flowImg visible for reverse animation
      flowImg.classList.remove('hidden');
      // set it to match modal image current rect (centered)
      const rect = {
        left: parseFloat(flowImg.style.left) || (window.innerWidth - flowImg.offsetWidth) / 2,
        top: parseFloat(flowImg.style.top) || (window.innerHeight - flowImg.offsetHeight) / 2,
        width: parseFloat(flowImg.style.width) || flowImg.offsetWidth,
        height: parseFloat(flowImg.style.height) || flowImg.offsetHeight,
      };
      flowImg.style.left = rect.left + 'px';
      flowImg.style.top = rect.top + 'px';
      flowImg.style.width = rect.width + 'px';
      flowImg.style.height = rect.height + 'px';

      // find the trigger rect again; if not available, just fade out
      let targetRect = null;
      if (lastActiveElement && typeof lastActiveElement.getBoundingClientRect === 'function') {
        targetRect = lastActiveElement.getBoundingClientRect();
      }

      if (!targetRect) {
        // just fade out
        flowImg.style.opacity = '0';
        setTimeout(() => {
          flowImg.remove();
          flowImg = null;
          modalImg.src = '';
          modalImg.alt = '';
          document.body.style.overflow = '';
          if (modal) modal.setAttribute('aria-hidden', 'true');
          if (lastActiveElement && lastActiveElement.focus) lastActiveElement.focus();
          isAnimating = false;
        }, 250);
        return;
      }

      // animate back to targetRect
      requestAnimationFrame(() => {
        flowImg.style.left = targetRect.left + 'px';
        flowImg.style.top = targetRect.top + 'px';
        flowImg.style.width = targetRect.width + 'px';
        flowImg.style.height = targetRect.height + 'px';
        flowImg.style.opacity = '1';
      });

      // cleanup after transition
      const onReverseEnd = () => {
        flowImg.removeEventListener('transitionend', onReverseEnd);
        flowImg.remove();
        flowImg = null;
        modalImg.src = '';
        modalImg.alt = '';
        document.body.style.overflow = '';
        if (modal) modal.setAttribute('aria-hidden', 'true');
        if (lastActiveElement && lastActiveElement.focus) lastActiveElement.focus();
        isAnimating = false;
      };
      flowImg.addEventListener('transitionend', onReverseEnd);
    }

    document.querySelectorAll(".diagram-btn").forEach(btn => {
        // accessible role and keyboard activation
        btn.setAttribute('role', 'button');
        btn.tabIndex = 0;
      const clickHandler = (e) => {
        const imgSrc = btn.getAttribute("data-img");
        // try to use title text from h3 inside the card for alt text
        const h3 = btn.querySelector('h3');
        const altText = h3 ? h3.textContent.trim() : '';
        openModal(imgSrc, altText, btn);
      };

      // support mouse click, touch, and keyboard activation
      btn.addEventListener("click", clickHandler);
      btn.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler(e);
        }
      });
      btn.addEventListener("touchstart", (e) => {
        // prevent double firing with click on some devices
        e.preventDefault();
        clickHandler(e);
      }, { passive: false });
    });

    if (closeBtn) {
      closeBtn.setAttribute('role', 'button');
      closeBtn.setAttribute('aria-label', 'Close image');
      closeBtn.tabIndex = 0;
      closeBtn.addEventListener("click", closeModal);
      closeBtn.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeModal();
        }
      });
    }

    // close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // close on ESC
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });

}); // end DOMContentLoaded



// ---------------------------------------------------------
// RADAR ANIMATION (unchanged)
// ---------------------------------------------------------
(function () {
const canvases = [
  document.getElementById('radar-canvas')
].filter(Boolean);

if (!canvases.length) return;

const surfaces = canvases.map(canvas => ({
  canvas,
  ctx: canvas.getContext('2d', { alpha: true }),
  cw: 0,
  ch: 0,
  center: { x: 0, y: 0 },
  radius: 0
}));

let sweepAngle = 0;
const sweepSpeed = 0.02;
const rings = 5;
const blips = [];

function resize() {
  surfaces.forEach(surface => {
    const rect = surface.canvas.parentElement.getBoundingClientRect();
    surface.cw = rect.width;
    surface.ch = rect.height;
    surface.canvas.width = rect.width * devicePixelRatio;
    surface.canvas.height = rect.height * devicePixelRatio;
    surface.canvas.style.width = rect.width + 'px';
    surface.canvas.style.height = rect.height + 'px';
    surface.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    surface.center.x = rect.width / 2;
    surface.center.y = rect.height / 2;
    surface.radius = Math.min(rect.width, rect.height) * 0.45;
  });
}

function drawGrid(surface) {
  const { ctx, cw, ch, center, radius } = surface;

  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,90,0.12)';
  const gridSize = 46;

  for (let x = 0; x < cw; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ch);
    ctx.stroke();
  }

  for (let y = 0; y < ch; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cw, y);
    ctx.stroke();
  }

  ctx.restore();

  ctx.save();
  ctx.translate(center.x, center.y);

  const grd = ctx.createRadialGradient(0,0,radius*0.05, 0,0,radius);
  grd.addColorStop(0, 'rgba(0,255,90,0.18)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0,0,radius,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,255,90,0.22)';
  for (let i = 1; i <= rings; i++) {
    ctx.beginPath();
    ctx.arc(0,0,(radius / rings) * i,0,Math.PI*2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSweep(surface) {
  const { ctx, center, radius } = surface;
  ctx.save();
  ctx.translate(center.x, center.y);

  const sweepWidth = Math.PI / 14;
  const grad = ctx.createRadialGradient(0,0,0, 0,0,radius);
  grad.addColorStop(0, 'rgba(0,255,90,0.22)');
  grad.addColorStop(1, 'rgba(0,255,90,0.03)');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.arc(0,0,radius,sweepAngle - sweepWidth/2, sweepAngle + sweepWidth/2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,255,140,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0,0,radius,sweepAngle - 0.005, sweepAngle + 0.005);
  ctx.stroke();

  ctx.restore();
  sweepAngle += sweepSpeed;
}

function maybeAddBlip() {
  if (Math.random() < 0.02) {
    blips.push({
      ang: Math.random() * Math.PI * 2,
      rPct: 0.2 + Math.random() * 0.75,
      life: 0,
      maxLife: 60 + Math.random() * 120
    });
  }
}

function drawBlips(surface) {
  const { ctx, center, radius } = surface;
  ctx.save();
  ctx.translate(center.x, center.y);

  for (let i = blips.length - 1; i >= 0; i--) {
    const b = blips[i];
    const r = b.rPct * radius;
    const x = Math.cos(b.ang) * r;
    const y = Math.sin(b.ang) * r;

    const t = b.life / b.maxLife;
    const alpha = 1 - t;

    // glow
    const glow = ctx.createRadialGradient(x,y,0,x,y,18);
    glow.addColorStop(0, `rgba(0,255,120,${alpha})`);
    glow.addColorStop(1, "rgba(0,255,120,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x,y,18,0,Math.PI*2);
    ctx.fill();

    // core
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fill();

    b.life++;
    if (b.life > b.maxLife) blips.splice(i, 1);
  }

  ctx.restore();
}

function animate() {
  surfaces.forEach(surface => {
    const { ctx, cw, ch } = surface;

    ctx.clearRect(0,0,cw,ch);

    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0,0,cw,ch);

    drawGrid(surface);
    drawBlips(surface);
    drawSweep(surface);
  });

  maybeAddBlip();
  requestAnimationFrame(animate);
}

function init() {
  resize();
  window.addEventListener("resize", resize);
  animate();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})(); // end radar animation



// ---------------------------------------------------------
// MOBILE TOUCH CARD INTERACTION
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('touchstart', () => {
        cards.forEach(c => {
          if (c !== card) c.classList.remove('is-active');
        });
        card.classList.toggle('is-active');
      }, { passive: true });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth <= 768) {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      card.addEventListener("touchstart", () => {
        const active = card.classList.contains("is-active");
        cards.forEach(c => c.classList.remove("is-active"));
        if (!active) card.classList.add("is-active");
      }, { passive: true });
    });
  }
});
