/**
 * The Legendary Sandwich From Hell — Built-In Audio Synthesizer
 * Uses Web Audio API for zero-dependency, 100% offline cosmic sound effects.
 */

(function(window) {
  'use strict';

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.ambientGain = null;
    }

    _getAudioContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    unlock() {
      this._getAudioContext();
    }

    play(name) {
      if (!this.enabled) return;
      try {
        const ctx = this._getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        switch (name) {
          case 'click': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
            break;
          }

          case 'lock': {
            // Metallic chain lock / rune slam
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'square';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(140, now);
            osc2.frequency.setValueAtTime(280, now);
            osc1.frequency.exponentialRampToValueAtTime(45, now + 0.4);
            osc2.frequency.exponentialRampToValueAtTime(90, now + 0.35);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.5);
            osc2.stop(now + 0.5);
            break;
          }

          case 'reject': {
            // Dissonant eldritch refusal
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.setValueAtTime(104, now + 0.1); // Dissonant beating
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
          }

          case 'teleport': {
            // Ascending hyperspace sweep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(1760, now + 0.7);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.8);
            break;
          }

          case 'success': {
            // Resonant magical chime
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
            freqs.forEach((f, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, now + (i * 0.08));
              gain.gain.setValueAtTime(0.15, now + (i * 0.08));
              gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + (i * 0.08));
              osc.stop(now + 1.3);
            });
            break;
          }
        }
      } catch (err) {
        console.warn('Audio synthesis note:', err.message);
      }
    }
  }

  window.SoundFX = new SoundEngine();

  // Unlock audio context on any user interaction
  document.addEventListener('click', () => window.SoundFX.unlock(), { once: true });
  document.addEventListener('keydown', () => window.SoundFX.unlock(), { once: true });

})(typeof window !== 'undefined' ? window : this);
