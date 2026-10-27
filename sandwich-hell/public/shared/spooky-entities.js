/**
 * The Legendary Sandwich From Hell — Interactive Floating Ghosts & Pumpkins
 * Generated via Stitch Design System "Abyssal Gastronomy".
 * Features:
 * - Real-time proximity evasion physics (flees when cursor approaches within 140px)
 * - Startled face expressions with glowing eyes and open mouths
 * - Ectoplasm & Hellfire particle bursts upon clicking/banishing
 * - Toroidal boundary wrapping around screen edges
 */

(function(window, document) {
  'use strict';

  const CONFIG = {
    proximityRadius: 140,     // Proximity flee trigger radius (px)
    fleeSpeed: 9.0,           // Maximum flee velocity acceleration
    naturalSpeed: 0.95,       // Ambient drifting speed
    damping: 0.94,            // Velocity dampening factor
    spawnCount: 10,           // Number of active entities
    audioEnabled: true
  };

  let entities = [];
  let mousePos = { x: -9999, y: -9999, active: false };

  // Audio Synthesizer for Entity Gasps & Banishments
  const SpookyAudio = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    playGhostSqueak() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1420, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.28);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch (e) {}
    },
    playPumpkinCrackle() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}
    },
    playStartledGasp(isPumpkin) {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isPumpkin ? 'triangle' : 'sine';
        const baseFreq = isPumpkin ? 300 : 620;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }
  };

  // SVGs for Entities
  const SVG_TEMPLATES = {
    ghostNormal: `
      <svg width="74" height="86" viewBox="0 0 100 115" fill="none">
        <defs>
          <radialGradient id="ghNormGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="60%" stop-color="#d8b4fe" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0.25" />
          </radialGradient>
          <filter id="ghGlow">
            <feGaussianBlur stdDeviation="3.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>
        <path d="M50 8C26 8 12 28 12 55C12 78 10 92 18 102C23 108 30 96 38 102C46 108 54 96 62 102C70 108 77 96 82 102C90 92 88 78 88 55C88 28 74 8 50 8Z" fill="url(#ghNormGrad)" filter="url(#ghGlow)"/>
        <circle cx="28" cy="56" r="4.5" fill="#ec4899" opacity="0.4"/>
        <circle cx="72" cy="56" r="4.5" fill="#ec4899" opacity="0.4"/>
        <ellipse cx="36" cy="46" rx="4.5" ry="6.5" fill="#180e29"/>
        <ellipse cx="64" cy="46" rx="4.5" ry="6.5" fill="#180e29"/>
        <circle cx="38" cy="44" r="2" fill="#ffffff"/>
        <circle cx="66" cy="44" r="2" fill="#ffffff"/>
        <path d="M44 56C47 60 53 60 56 56" stroke="#180e29" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
    ghostScared: `
      <svg width="78" height="90" viewBox="0 0 100 115" fill="none">
        <defs>
          <radialGradient id="ghScaredGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="60%" stop-color="#bbf7d0" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#22c55e" stop-opacity="0.35" />
          </radialGradient>
          <filter id="scaredGlow">
            <feGaussianBlur stdDeviation="4.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>
        <path d="M50 6C24 6 8 26 8 55C8 82 5 95 16 106C22 112 32 94 40 106C48 114 52 94 60 106C68 114 78 94 84 106C95 95 92 82 92 55C92 26 76 6 50 6Z" fill="url(#ghScaredGrad)" filter="url(#scaredGlow)"/>
        <path d="M12 55C3 50 2 40 8 36" stroke="#bbf7d0" stroke-width="4" stroke-linecap="round"/>
        <path d="M88 55C97 50 98 40 92 36" stroke="#bbf7d0" stroke-width="4" stroke-linecap="round"/>
        <circle cx="34" cy="42" r="8" fill="#120c1e"/>
        <circle cx="66" cy="42" r="8" fill="#120c1e"/>
        <circle cx="34" cy="42" r="3.5" fill="#22c55e"/>
        <circle cx="66" cy="42" r="3.5" fill="#22c55e"/>
        <circle cx="36" cy="40" r="1.5" fill="#ffffff"/>
        <circle cx="68" cy="40" r="1.5" fill="#ffffff"/>
        <ellipse cx="50" cy="62" rx="7.5" ry="12" fill="#120c1e"/>
        <ellipse cx="50" cy="62" rx="5" ry="8" fill="#ef4444" opacity="0.85"/>
        <path d="M78 28C81 33 79 38 76 38C73 38 72 34 78 28Z" fill="#38bdf8"/>
      </svg>
    `,
    pumpkinNormal: `
      <svg width="74" height="74" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="pkNormGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#fb923c"/>
            <stop offset="65%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </radialGradient>
          <filter id="pkGlow">
            <feGaussianBlur stdDeviation="3" result="glow"/>
            <feComposite in="SourceGraphic" in2="glow" operator="over"/>
          </filter>
        </defs>
        <path d="M50 18C48 9 54 4 60 2C57 7 54 12 51 18Z" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
        <ellipse cx="50" cy="56" rx="42" ry="34" fill="url(#pkNormGrad)" stroke="#431407" stroke-width="2"/>
        <ellipse cx="50" cy="56" rx="30" ry="34" fill="url(#pkNormGrad)" stroke="#431407" stroke-width="1.5"/>
        <polygon points="32,46 42,48 37,38" fill="#fef08a" filter="url(#pkGlow)"/>
        <polygon points="68,46 58,48 63,38" fill="#fef08a" filter="url(#pkGlow)"/>
        <polygon points="50,54 46,59 54,59" fill="#fef08a" filter="url(#pkGlow)"/>
        <path d="M26 66 L34 73 L42 67 L50 74 L58 67 L66 73 L74 66 L68 76 L58 72 L50 78 L42 72 L32 76 Z" fill="#fef08a" filter="url(#pkGlow)"/>
      </svg>
    `,
    pumpkinScared: `
      <svg width="78" height="78" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="pkScaredGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#f97316"/>
            <stop offset="65%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#451a03"/>
          </radialGradient>
          <filter id="pkFireFlash">
            <feGaussianBlur stdDeviation="5" result="glow"/>
            <feComposite in="SourceGraphic" in2="glow" operator="over"/>
          </filter>
        </defs>
        <path d="M48 16C42 7 50 3 58 1C54 6 51 11 49 16Z" fill="#84cc16" stroke="#365314" stroke-width="1.5"/>
        <ellipse cx="50" cy="56" rx="43" ry="35" fill="url(#pkScaredGrad)" stroke="#ef4444" stroke-width="2.5"/>
        <circle cx="34" cy="44" r="8" fill="#fef08a" filter="url(#pkFireFlash)"/>
        <circle cx="66" cy="44" r="8" fill="#fef08a" filter="url(#pkFireFlash)"/>
        <circle cx="34" cy="44" r="4" fill="#dc2626"/>
        <circle cx="66" cy="44" r="4" fill="#dc2626"/>
        <ellipse cx="50" cy="70" rx="11" ry="15" fill="#210000" stroke="#fef08a" stroke-width="3" filter="url(#pkFireFlash)"/>
      </svg>
    `
  };

  // Particles for click poofs
  const particles = [];

  class SpookyEntity {
    constructor(type, x, y, container) {
      this.type = type; // 'ghost' | 'pumpkin'
      this.width = type === 'ghost' ? 74 : 74;
      this.height = type === 'ghost' ? 86 : 74;
      this.container = container;

      this.x = x !== undefined ? x : Math.random() * (window.innerWidth - this.width);
      this.y = y !== undefined ? y : 100 + Math.random() * (window.innerHeight - this.height - 150);

      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * CONFIG.naturalSpeed;
      this.vy = Math.sin(angle) * CONFIG.naturalSpeed;

      this.isStartled = false;
      this.startleCooldown = 0;
      this.dead = false;
      this.pulsePhase = Math.random() * 10;
      this.wobbleSpeed = Math.random() * 0.05 + 0.02;

      this.createDOM();
    }

    createDOM() {
      this.el = document.createElement('div');
      this.el.className = 'interactive-spooky-entity';
      this.el.style.position = 'absolute';
      this.el.style.width = `${this.width}px`;
      this.el.style.height = `${this.height}px`;
      this.el.style.cursor = 'pointer';
      this.el.style.zIndex = '5';
      this.el.style.willChange = 'transform';
      this.el.style.pointerEvents = 'auto';

      const normSvg = this.type === 'ghost' ? SVG_TEMPLATES.ghostNormal : SVG_TEMPLATES.pumpkinNormal;
      const scaredSvg = this.type === 'ghost' ? SVG_TEMPLATES.ghostScared : SVG_TEMPLATES.pumpkinScared;

      this.el.innerHTML = `
        <div class="entity-state-normal" style="width:100%; height:100%;">${normSvg}</div>
        <div class="entity-state-scared" style="width:100%; height:100%; display:none;">${scaredSvg}</div>
      `;

      this.el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.banish();
      });

      this.container.appendChild(this.el);
      this.updateDOM();
    }

    banish() {
      if (this.dead) return;
      this.dead = true;

      if (this.type === 'ghost') {
        SpookyAudio.playGhostSqueak();
      } else {
        SpookyAudio.playPumpkinCrackle();
      }

      // Spawn burst particles
      const rect = this.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnBurst(cx, cy, this.type);

      this.el.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
      this.el.style.transform = `scale(1.5) rotate(20deg)`;
      this.el.style.opacity = '0';

      setTimeout(() => {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
        // Respawn after short delay
        setTimeout(() => {
          if (entities.length < CONFIG.spawnCount) {
            const newType = Math.random() > 0.5 ? 'ghost' : 'pumpkin';
            entities.push(new SpookyEntity(newType, undefined, undefined, this.container));
          }
        }, 1500);
      }, 250);
    }

    update() {
      if (this.dead) return;

      this.pulsePhase += this.wobbleSpeed;
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // Distance to cursor
      const dx = cx - mousePos.x;
      const dy = cy - mousePos.y;
      const dist = Math.hypot(dx, dy);

      const radius = CONFIG.proximityRadius;

      if (mousePos.active && dist < radius && dist > 1) {
        // Startled state
        const wasScared = this.isStartled;
        this.isStartled = true;
        this.startleCooldown = 30;

        if (!wasScared) {
          SpookyAudio.playStartledGasp(this.type === 'pumpkin');
        }

        // Flee vector in opposite direction of mouse
        const fleeForce = (1 - dist / radius) * CONFIG.fleeSpeed;
        const nx = dx / dist;
        const ny = dy / dist;

        this.vx += nx * fleeForce;
        this.vy += ny * fleeForce;

        // Cap speed
        const speed = Math.hypot(this.vx, this.vy);
        const maxFlee = CONFIG.fleeSpeed * 1.4;
        if (speed > maxFlee) {
          this.vx = (this.vx / speed) * maxFlee;
          this.vy = (this.vy / speed) * maxFlee;
        }
      } else {
        if (this.startleCooldown > 0) {
          this.startleCooldown--;
        } else {
          this.isStartled = false;
        }

        // Ambient gentle drift
        this.vx += Math.cos(this.pulsePhase) * 0.12;
        this.vy += Math.sin(this.pulsePhase * 0.8) * 0.08;
      }

      // Damping
      this.vx *= CONFIG.damping;
      this.vy *= CONFIG.damping;

      this.x += this.vx;
      this.y += this.vy;

      // Toroidal wrap around edges
      const w = window.innerWidth;
      const h = window.innerHeight;
      const margin = 80;

      if (this.x < -margin) this.x = w + margin - 20;
      else if (this.x > w + margin) this.x = -margin + 20;

      if (this.y < -margin) this.y = h + margin - 20;
      else if (this.y > h + margin) this.y = -margin + 20;

      this.updateDOM();
    }

    updateDOM() {
      if (!this.el) return;
      const normalEl = this.el.querySelector('.entity-state-normal');
      const scaredEl = this.el.querySelector('.entity-state-scared');

      if (this.isStartled) {
        normalEl.style.display = 'none';
        scaredEl.style.display = 'block';
      } else {
        normalEl.style.display = 'block';
        scaredEl.style.display = 'none';
      }

      const tilt = Math.max(-20, Math.min(20, this.vx * 3));
      this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0px) rotate(${tilt}deg)`;
    }
  }

  function spawnBurst(x, y, type) {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      const color = type === 'pumpkin'
        ? (Math.random() > 0.5 ? '#f97316' : '#facc15')
        : (Math.random() > 0.5 ? '#a855f7' : '#4ade80');

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02,
        size: Math.random() * 4 + 2,
        color
      });
    }
  }

  // Initialize System
  function initSpookyEntities() {
    if (document.getElementById('spooky-entities-layer')) return;

    const layer = document.createElement('div');
    layer.id = 'spooky-entities-layer';
    layer.style.position = 'fixed';
    layer.style.inset = '0';
    layer.style.zIndex = '5';
    layer.style.pointerEvents = 'none';
    layer.style.overflow = 'hidden';

    // Particle canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'spooky-particles-canvas';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    layer.appendChild(canvas);

    document.body.appendChild(layer);

    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse Tracking
    window.addEventListener('pointermove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      mousePos.active = true;
    });

    window.addEventListener('pointerleave', () => {
      mousePos.active = false;
      mousePos.x = -9999;
      mousePos.y = -9999;
    });

    // Spawn Initial Entities (Ghosts & Pumpkins)
    for (let i = 0; i < CONFIG.spawnCount; i++) {
      const type = i % 2 === 0 ? 'ghost' : 'pumpkin';
      const x = 50 + (i * ((window.innerWidth - 120) / CONFIG.spawnCount)) % (window.innerWidth - 100);
      const y = 80 + Math.random() * (window.innerHeight - 240);
      entities.push(new SpookyEntity(type, x, y, layer));
    }

    // Animation Loop
    function loop() {
      entities.forEach(ent => ent.update());

      // Draw Particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpookyEntities);
  } else {
    initSpookyEntities();
  }

})(window, document);
