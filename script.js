document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  // Product section signal background animation (waveform on #signal-canvas)
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
                  if (x === 0) {
                      sCtx.moveTo(x, y);
                  } else {
                      sCtx.lineTo(x, y);
                  }
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
              const textX = Math.random() * sWidth;
              const textY = Math.random() * sHeight;
              sCtx.fillText(`DETECTING SIGNAL... ${Math.floor(Math.random() * 100)}%`, textX, textY);
          }

          requestAnimationFrame(drawSignal);
      }

      drawSignal();
  }

  // Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
  }

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth'
              });
          }
      });
  });

  // Intersection Observer for Fade-in Animation
  const observerOptions = {
      threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(section);
  });
});

(function () {
// Radar animation for Home hero only
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
const sweepSpeed = 0.02; // radians per frame
const rings = 5;
const blips = []; // {ang, rPct, life, maxLife}

function resize() {
  surfaces.forEach(surface => {
    const { canvas } = surface;
    const rect = canvas.parentElement.getBoundingClientRect();
    surface.cw = Math.max(1, Math.floor(rect.width));
    surface.ch = Math.max(1, Math.floor(rect.height));
    canvas.width = surface.cw * devicePixelRatio;
    canvas.height = surface.ch * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    surface.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    // center radar consistently in each surface
    surface.center.x = rect.width * 0.5;
    surface.center.y = rect.height * 0.5;
    surface.radius = Math.min(rect.width * 0.45, rect.height * 0.45);
  });
}

function drawGrid(surface) {
  const { ctx, cw, ch, center, radius } = surface;

  // full-rect subtle grid
  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,90,0.12)';
  ctx.lineWidth = 1;
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

  // circular radar grid
  ctx.save();
  ctx.translate(center.x, center.y);
  const grd = ctx.createRadialGradient(0,0,radius*0.05, 0,0,radius);
  grd.addColorStop(0, 'rgba(0,255,90,0.18)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,255,90,0.22)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= rings; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, (radius / rings) * i, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0,255,90,0.14)';
  ctx.lineWidth = 1;
  const spokes = 16;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
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
  ctx.arc(0, 0, radius, sweepAngle - sweepWidth/2, sweepAngle + sweepWidth/2);
  ctx.closePath();
  ctx.fill();

  // bright leading edge
  ctx.strokeStyle = 'rgba(0,255,140,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, sweepAngle - 0.005, sweepAngle + 0.005);
  ctx.stroke();
  ctx.restore();

  sweepAngle += sweepSpeed;
}

function maybeAddBlip() {
  // add occasional blip (random)
  if (Math.random() < 0.02) {
    blips.push({
      ang: Math.random() * Math.PI * 2,
      rPct: 0.2 + Math.random() * 0.75,
      life: 0,
      maxLife: 60 + Math.floor(Math.random() * 120)
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
    const alpha = 0.9 * (1 - t);
    // glow
    ctx.beginPath();
    const glow = ctx.createRadialGradient(x,y,0, x,y,18);
    glow.addColorStop(0, `rgba(0,255,120,${alpha * 0.85})`);
    glow.addColorStop(1, 'rgba(0,255,120,0)');
    ctx.fillStyle = glow;
    ctx.arc(x,y,18,0,Math.PI*2);
    ctx.fill();
    // core
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - t)})`;
    ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fill();

    b.life++;
    if (b.life > b.maxLife) blips.splice(i,1);
  }
  ctx.restore();
}

function animate() {
  surfaces.forEach(surface => {
    const { ctx, cw, ch } = surface;
    ctx.clearRect(0,0,cw,ch);

    // subtle dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,cw,ch);

    drawGrid(surface);
    drawBlips(surface);
    drawSweep(surface);
  });

  maybeAddBlip();
  requestAnimationFrame(animate);
}

// init
function init() {
  resize();
  window.addEventListener('resize', resize);
  animate();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
// ⚡ Faster mobile card interaction
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



// ⚡ Instant card response — clean state management
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
