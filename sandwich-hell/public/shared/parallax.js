/**
 * The Legendary Sandwich From Hell — Spooky Atmosphere & Parallax Engine
 * Drives mouse-reactive parallax depth, floating ghosts, dripping blood particles,
 * and rotating occult summoning runes across all game screens.
 */

(function(window, document) {
  'use strict';

  // 1. Mouse Parallax Tracker
  let targetX = 0.5;
  let targetY = 0.5;
  let currentX = 0.5;
  let currentY = 0.5;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX / window.innerWidth;
    targetY = e.clientY / window.innerHeight;
  });

  // Smooth lerp loop for buttery parallax physics
  function updateParallax() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    document.documentElement.style.setProperty('--mouse-x', currentX.toFixed(4));
    document.documentElement.style.setProperty('--mouse-y', currentY.toFixed(4));

    requestAnimationFrame(updateParallax);
  }
  requestAnimationFrame(updateParallax);

  // 2. Inject Spooky Background Canvas (Ghosts, Blood Drops, Runes)
  function injectSpookyAtmosphere() {
    if (document.getElementById('spooky-atmosphere-canvas')) return;

    const container = document.createElement('div');
    container.id = 'spooky-atmosphere-canvas';
    container.className = 'spooky-atmosphere-wrapper';

    container.innerHTML = `
      <!-- Occult Rotating Pentagram Sigil -->
      <div class="occult-rune-layer" style="transform: translate(calc((var(--mouse-x) - 0.5) * -30px), calc((var(--mouse-y) - 0.5) * -30px));">
        <svg class="rune-svg animate-rune-spin" viewBox="0 0 500 500">
          <circle cx="250" cy="250" r="235" stroke="rgba(255, 26, 43, 0.2)" stroke-dasharray="8, 12" fill="none" stroke-width="1.5" />
          <circle cx="250" cy="250" r="190" stroke="rgba(147, 51, 234, 0.25)" fill="none" stroke-width="1" />
          <polygon points="250,50 367,411 60,188 440,188 133,411" stroke="rgba(255, 26, 43, 0.35)" fill="none" stroke-width="1.5" />
          <circle cx="250" cy="250" r="130" stroke="rgba(0, 255, 102, 0.25)" stroke-dasharray="14, 14" fill="none" stroke-width="1" />
        </svg>
      </div>

      <!-- Counter-rotating Necrotic Sigil -->
      <div class="occult-rune-layer small" style="transform: translate(calc((var(--mouse-x) - 0.5) * 40px), calc((var(--mouse-y) - 0.5) * 40px));">
        <svg class="rune-svg animate-rune-reverse" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="185" stroke="rgba(0, 255, 102, 0.2)" stroke-dasharray="4, 10" fill="none" stroke-width="1" />
          <polygon points="200,30 347,285 53,285" stroke="rgba(0, 255, 102, 0.25)" fill="none" stroke-width="1" />
          <polygon points="200,370 53,115 347,115" stroke="rgba(255, 26, 43, 0.2)" fill="none" stroke-width="1" />
        </svg>
      </div>

      <!-- Floating Ethereal Haunting Ghosts -->
      <div class="haunting-ghost ghost-1" style="transform: translate(calc((var(--mouse-x) - 0.5) * -60px), calc((var(--mouse-y) - 0.5) * -50px));">
        <div class="ghost-shape"></div>
      </div>
      <div class="haunting-ghost ghost-2" style="transform: translate(calc((var(--mouse-x) - 0.5) * 70px), calc((var(--mouse-y) - 0.5) * 60px));">
        <div class="ghost-shape red"></div>
      </div>
      <div class="haunting-ghost ghost-3" style="transform: translate(calc((var(--mouse-x) - 0.5) * -45px), calc((var(--mouse-y) - 0.5) * 75px));">
        <div class="ghost-shape green"></div>
      </div>

      <!-- Dripping Bloody Droplets -->
      <div class="blood-drip-container">
        <div class="blood-drip d1"></div>
        <div class="blood-drip d2"></div>
        <div class="blood-drip d3"></div>
        <div class="blood-drip d4"></div>
        <div class="blood-drip d5"></div>
      </div>
    `;

    document.body.prepend(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSpookyAtmosphere);
  } else {
    injectSpookyAtmosphere();
  }

})(window, document);
