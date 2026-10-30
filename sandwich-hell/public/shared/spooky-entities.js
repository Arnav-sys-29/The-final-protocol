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

  // Gothic Audio Synthesizer for Spectral Entities (Chilling Whispers, Crypt Gasps & Hollow Rattles)
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
    playGhostWail() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Chilling dissonant spectral banshee wail
        osc.type = 'sine';
        subOsc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.45);
        subOsc.frequency.setValueAtTime(175, now);
        subOsc.frequency.exponentialRampToValueAtTime(70, now + 0.45);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.5);
        subOsc.stop(now + 0.5);
      } catch (e) {}
    },
    playPumpkinRattle() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Guttural subterranean bone rattle
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    },
    playStartledHiss(isPumpkin) {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Sudden cold crypt inhalation
        osc.type = isPumpkin ? 'sawtooth' : 'sine';
        const baseFreq = isPumpkin ? 110 : 160;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + 0.2);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      } catch (e) {}
    }
  };

  // Gothic SVGs for Menacing Entities (No cute features, atmospheric somber colors)
  const SVG_TEMPLATES = {
    ghostNormal: `
      <svg width="78" height="92" viewBox="0 0 100 120" fill="none">
        <defs>
          <radialGradient id="wraithMist" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#8c8275" stop-opacity="0.55" />
            <stop offset="45%" stop-color="#3a323c" stop-opacity="0.45" />
            <stop offset="85%" stop-color="#19151c" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#0a080c" stop-opacity="0" />
          </radialGradient>
          <filter id="wraithShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.45   0 0 0 0 0.08   0 0 0 0 0.12  0 0 0 0.6 0"/>
            <feOffset dx="0" dy="4"/>
            <feBlend in="SourceGraphic" in2="shadow" mode="normal"/>
          </filter>
        </defs>
        <!-- Tattered Ethereal Shroud -->
        <path d="M50 6C30 6 16 26 14 54C12 76 8 92 14 104C16 108 22 98 28 106C34 114 40 96 46 108C52 118 58 98 66 110C74 120 78 96 84 108C88 94 86 76 84 54C82 26 70 6 50 6Z" fill="url(#wraithMist)" filter="url(#wraithShadow)"/>
        <!-- Gaunt Facial Shrouding -->
        <path d="M42 22C46 16 54 16 58 22C64 30 64 45 50 48C36 45 36 30 42 22Z" fill="#120f14" opacity="0.5"/>
        <!-- Hollow Black Eye Sockets -->
        <ellipse cx="37" cy="42" rx="5.5" ry="8" fill="#080609"/>
        <ellipse cx="63" cy="42" rx="5.5" ry="8" fill="#080609"/>
        <!-- Menacing Ember Pinprick Gaze -->
        <circle cx="38" cy="43" r="1.5" fill="#c45e22"/>
        <circle cx="62" cy="43" r="1.5" fill="#c45e22"/>
        <!-- Grim Grimacing Mouth -->
        <path d="M42 58C46 62 54 62 58 58" stroke="#080609" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="46" y1="58" x2="46" y2="62" stroke="#080609" stroke-width="1.5"/>
        <line x1="50" y1="59" x2="50" y2="63" stroke="#080609" stroke-width="1.5"/>
        <line x1="54" y1="58" x2="54" y2="62" stroke="#080609" stroke-width="1.5"/>
      </svg>
    `,
    ghostScared: `
      <svg width="84" height="98" viewBox="0 0 100 120" fill="none">
        <defs>
          <radialGradient id="wraithStartledMist" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#a49ba8" stop-opacity="0.65" />
            <stop offset="45%" stop-color="#5c1c24" stop-opacity="0.4" />
            <stop offset="85%" stop-color="#1d1620" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#0a080c" stop-opacity="0" />
          </radialGradient>
          <filter id="wraithBloodAura">
            <feGaussianBlur stdDeviation="3" result="glow"/>
            <feComposite in="SourceGraphic" in2="glow" operator="over"/>
          </filter>
        </defs>
        <!-- Distorted Writhing Shroud with Flared Spectral Tendrils -->
        <path d="M50 4C24 4 10 24 8 55C6 82 2 96 10 110C16 116 26 94 34 112C42 122 48 94 54 114C62 124 70 94 78 114C86 122 92 92 92 55C92 24 76 4 50 4Z" fill="url(#wraithStartledMist)" filter="url(#wraithBloodAura)"/>
        <!-- Tendrils reaching outward in alarm -->
        <path d="M12 52C2 46 2 34 8 28" stroke="#5c1c24" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M88 52C98 46 98 34 92 28" stroke="#5c1c24" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Deep Void Eye Cavities with Burning Coagulated Crimson Glow -->
        <ellipse cx="36" cy="40" rx="8" ry="11" fill="#060507"/>
        <ellipse cx="64" cy="40" rx="8" ry="11" fill="#060507"/>
        <circle cx="36" cy="40" r="2.5" fill="#9e2a36"/>
        <circle cx="64" cy="40" r="2.5" fill="#9e2a36"/>
        <!-- Agonized Unhinged Screaming Jaw -->
        <ellipse cx="50" cy="65" rx="8" ry="14" fill="#060507"/>
        <path d="M46 56L54 56" stroke="#5c1c24" stroke-width="1.5"/>
        <path d="M47 75L53 75" stroke="#5c1c24" stroke-width="1.5"/>
      </svg>
    `,
    pumpkinNormal: `
      <svg width="78" height="78" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="pkGothicNorm" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#4a2211"/>
            <stop offset="50%" stop-color="#2a140a"/>
            <stop offset="100%" stop-color="#120904"/>
          </radialGradient>
          <filter id="pkInnerEmber">
            <feGaussianBlur stdDeviation="2.5" result="ember"/>
            <feComposite in="SourceGraphic" in2="ember" operator="over"/>
          </filter>
        </defs>
        <!-- Withered Blackened Stem -->
        <path d="M50 16C47 8 52 2 58 1C55 5 53 10 51 16Z" fill="#1c1a17" stroke="#0e0d0b" stroke-width="1.5"/>
        <!-- Rotting Dark Rind Ribs -->
        <ellipse cx="50" cy="56" rx="42" ry="34" fill="url(#pkGothicNorm)" stroke="#1a0b05" stroke-width="2"/>
        <ellipse cx="50" cy="56" rx="28" ry="34" fill="url(#pkGothicNorm)" stroke="#1a0b05" stroke-width="1.5" stroke-dasharray="2 3"/>
        <!-- Sinister Slanted Eye Incisions -->
        <polygon points="28,44 42,46 34,36" fill="#0d0704" stroke="#73131c" stroke-width="1.5"/>
        <polygon points="72,44 58,46 66,36" fill="#0d0704" stroke="#73131c" stroke-width="1.5"/>
        <circle cx="34" cy="42" r="1.5" fill="#c45e22" filter="url(#pkInnerEmber)"/>
        <circle cx="66" cy="42" r="1.5" fill="#c45e22" filter="url(#pkInnerEmber)"/>
        <!-- Crude Triangular Nose Slit -->
        <polygon points="50,51 46,56 54,56" fill="#0d0704" stroke="#73131c" stroke-width="1"/>
        <!-- Jagged Needle-Toothed Grimace -->
        <path d="M26 66 L33 72 L38 67 L44 73 L50 67 L56 73 L62 67 L67 72 L74 66 L68 76 L60 72 L50 78 L40 72 L32 76 Z" fill="#0d0704" stroke="#993b12" stroke-width="1.2" filter="url(#pkInnerEmber)"/>
      </svg>
    `,
    pumpkinScared: `
      <svg width="82" height="82" viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="pkGothicScared" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#5a220f"/>
            <stop offset="55%" stop-color="#341306"/>
            <stop offset="100%" stop-color="#120602"/>
          </radialGradient>
          <filter id="pkFireFlash">
            <feGaussianBlur stdDeviation="3.5" result="glow"/>
            <feComposite in="SourceGraphic" in2="glow" operator="over"/>
          </filter>
        </defs>
        <!-- Twisted Charred Stem -->
        <path d="M48 15C42 6 49 2 56 1C53 5 50 10 49 15Z" fill="#141210" stroke="#0e0d0b" stroke-width="1.5"/>
        <!-- Cursed Decaying Rind with Hellfire Cracks -->
        <ellipse cx="50" cy="56" rx="43" ry="35" fill="url(#pkGothicScared)" stroke="#73131c" stroke-width="2.5"/>
        <path d="M22 50 Q30 55 35 52" stroke="#5c1c24" stroke-width="1.5"/>
        <path d="M78 50 Q70 55 65 52" stroke="#5c1c24" stroke-width="1.5"/>
        <!-- Flaring Malevolent Eyes -->
        <polygon points="26,42 43,47 33,34" fill="#0a0402" stroke="#c45e22" stroke-width="2"/>
        <polygon points="74,42 57,47 67,34" fill="#0a0402" stroke="#c45e22" stroke-width="2"/>
        <circle cx="34" cy="41" r="3" fill="#c45e22" filter="url(#pkFireFlash)"/>
        <circle cx="66" cy="41" r="3" fill="#c45e22" filter="url(#pkFireFlash)"/>
        <!-- Widened Fanged Cursed Maw -->
        <ellipse cx="50" cy="71" rx="14" ry="14" fill="#0a0402" stroke="#73131c" stroke-width="2.5"/>
        <path d="M40 64 L42 69 L45 64 L48 70 L51 64 L54 70 L57 64 L60 69" stroke="#c45e22" stroke-width="1.5"/>
        <path d="M42 78 L45 73 L48 78 L51 73 L54 78 L57 73" stroke="#c45e22" stroke-width="1.5"/>
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
        SpookyAudio.playGhostWail();
      } else {
        SpookyAudio.playPumpkinRattle();
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
          SpookyAudio.playStartledHiss(this.type === 'pumpkin');
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
    const count = 26;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      // Gothic Somber Particles: Charcoal, Coagulated Blood, Smoldering Ember & Ash
      let color;
      if (type === 'pumpkin') {
        const r = Math.random();
        color = r < 0.45 ? '#c45e22' : (r < 0.75 ? '#73131c' : '#2a140a');
      } else {
        const r = Math.random();
        color = r < 0.45 ? '#8c8275' : (r < 0.75 ? '#5c1c24' : '#1d1921');
      }

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.018,
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
