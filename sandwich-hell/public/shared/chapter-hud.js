/**
 * Chapter Multiplayer HUD
 * Integrates Room Client state into any chapter page with zero disruption.
 */
(function() {
  'use strict';

  function initHud() {
    if (document.getElementById('room-hud-strip')) return;

    // Detect chapter from path
    const path = window.location.pathname;
    let chapter = 'hell';
    let label = '🧀 Hell Cheese';
    let icon = '🧀';
    if (path.includes('alien')) {
      chapter = 'alien';
      label = '🥬 Cosmic Vegetables';
      icon = '🥬';
    } else if (path.includes('ocean')) {
      chapter = 'ocean';
      label = '🌶️ Abyssal Sauce';
      icon = '🌶️';
    } else if (path.includes('market')) {
      chapter = 'market';
      label = '🍞 Eldritch Bread';
      icon = '🍞';
    }

    const roomCode = (window.Room && window.Room.getRoomCode()) || localStorage.getItem('sandwich_room_code') || 'DEMO01';
    const chefName = (window.Room && window.Room.getPlayerName()) || localStorage.getItem('sandwich_player_name') || 'Chef';

    const strip = document.createElement('header');
    strip.id = 'room-hud-strip';
    strip.innerHTML = `
      <div class="hud-left">
        <span class="hud-pill rune">🔮 ROOM: <strong id="hud-room-code">${roomCode}</strong></span>
        <span class="hud-pill chef">👨‍🍳 <span id="hud-chef-name">${chefName}</span></span>
      </div>
      <div class="hud-center">
        <span class="hud-pill status" id="hud-ingredient-pill">${label}: <strong id="hud-chapter-status">In Progress</strong></span>
      </div>
      <div class="hud-right">
        <button class="hud-btn win" id="hud-instant-win" title="Instantly complete this level (Dev Option)">⚡ Instant Win</button>
        <button class="hud-btn win" id="hud-win-all" title="Instantly complete all 4 levels (Dev Option)">⚡ Win All</button>
        <button class="hud-btn" id="hud-how-to-play" title="How to play this level">❓ How to Play</button>
        <a href="/pick" class="hud-btn" title="Choose level">📜 Choose Level</a>
      </div>
    `;

    document.body.prepend(strip);
    document.body.classList.add('has-room-hud');

    // Tutorial definitions per chapter
    const TUTORIALS = {
      hell: {
        icon: '🧀',
        title: 'Hell Cheese · Code Debugging',
        subtitle: 'Fix broken code scrolls to melt the cursed cheese!',
        points: [
          '<strong>Your Mission:</strong> Inspect the corrupted C, C++, or Java code scroll and find the syntax or logic bug.',
          '<strong>Editor:</strong> Choose your programming language (C, C++, or Java) using the language selector.',
          '<strong>Submit:</strong> Edit the code in the right panel and click <em>"Run & Test"</em> to verify against test cases.',
          '<strong>Winning:</strong> Solve the challenges to secure the Infernal Cheese for the legendary sandwich!'
        ],
        tip: '💡 Tip: Check for missing semicolons, assignment vs equality (= vs ==), wrong variable names, and return values.'
      },
      alien: {
        icon: '🥬',
        title: 'Cosmic Vegetables · Algorithmic Cultivation',
        subtitle: 'Master loops and list algorithms to cultivate alien crops!',
        points: [
          '<strong>Your Mission:</strong> Write the algorithmic code to water, grow, and harvest strange cosmic vegetation.',
          '<strong>Editor:</strong> Review the problem statement on the left. Type your solution into the in-browser code editor.',
          '<strong>Submit:</strong> Click <em>"Run Test Cases"</em> to test your code against visible and secret test inputs.',
          '<strong>Winning:</strong> Pass the test cases across the vegetable trials to secure the Cosmic Vegetables!'
        ],
        tip: '💡 Tip: Pay close attention to loop indices, boundary conditions, and list manipulations.'
      },
      ocean: {
        icon: '🌶️',
        title: 'Abyssal Sauce · Potion Brewing',
        subtitle: 'Mix arcane sauces with precise condition checks and switch-cases!',
        points: [
          '<strong>Your Mission:</strong> Calibrate the sauce cauldron recipes by fulfilling conditional logic and function requirements.',
          '<strong>Editor:</strong> Inspect the required brew conditions and write your logic inside the terminal cauldron.',
          '<strong>Submit:</strong> Click <em>"Brew & Evaluate"</em> to evaluate your code with the AST potion grader.',
          '<strong>Winning:</strong> Successfully brew the recipes to collect the Abyssal Sauce for the sandwich!'
        ],
        tip: '💡 Tip: Check switch-case branches and ensure break statements prevent fall-through where required.'
      },
      market: {
        icon: '🍞',
        title: 'Eldritch Bread · Recipe Queue',
        subtitle: 'Order mystical bakery queues to bake the eldritch crust!',
        points: [
          '<strong>Your Mission:</strong> Solve data structure and queueing challenges to satisfy marketplace bakers.',
          '<strong>Editor:</strong> Select a challenge from the rack. Read the expected standard input and output formats.',
          '<strong>Submit:</strong> Enter your code in C, C++, or Java and click <em>"Submit Solution"</em> to run against test cases.',
          '<strong>Winning:</strong> Solve the bakery trials to pull the warm Eldritch Bread from the oven!'
        ],
        tip: '💡 Tip: Make sure your output format matches the sample output exactly without extra spaces or formatting.'
      }
    };

    function showTutorialModal(force = false) {
      const existing = document.getElementById('hud-tutorial-modal');
      if (existing) existing.remove();

      const tut = TUTORIALS[chapter] || TUTORIALS.hell;

      const modal = document.createElement('div');
      modal.id = 'hud-tutorial-modal';
      modal.className = 'hud-modal-overlay';
      modal.innerHTML = `
        <div class="hud-tutorial-card">
          <div class="hud-tutorial-header">
            <span style="font-size: 40px; line-height: 1;">${tut.icon}</span>
            <div>
              <h2>${tut.title}</h2>
              <div class="hud-tutorial-sub">${tut.subtitle}</div>
            </div>
          </div>
          <ul class="hud-tutorial-list">
            ${tut.points.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
          <div class="hud-tutorial-tip">${tut.tip}</div>
          <button class="hud-tutorial-btn-start" id="btn-close-tutorial">
            🍳 I'M READY TO COOK! START LEVEL
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btn-close-tutorial').onclick = () => {
        sessionStorage.setItem('sandwich_tut_' + chapter, 'seen');
        modal.remove();
      };
    }

    const howToPlayBtn = document.getElementById('hud-how-to-play');
    if (howToPlayBtn) {
      howToPlayBtn.addEventListener('click', () => showTutorialModal(true));
    }

    const instantWinBtn = document.getElementById('hud-instant-win');
    if (instantWinBtn) {
      instantWinBtn.addEventListener('click', () => {
        if (window.onChapterInstantWin) {
          window.onChapterInstantWin();
        } else if (window.Room) {
          window.Room.complete(chapter);
        }
        showWinModal(false);
      });
    }

    const winAllBtn = document.getElementById('hud-win-all');
    if (winAllBtn) {
      winAllBtn.addEventListener('click', async () => {
        const rc = (window.Room && window.Room.getRoomCode()) || localStorage.getItem('sandwich_room_code') || '';
        try {
          await fetch('/api/instant-win', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomCode: rc, winAll: true })
          });
        } catch (e) {
          console.warn('Direct instant-win fetch failed:', e);
        }
        if (window.Room) {
          ['hell', 'alien', 'ocean', 'market'].forEach(ch => window.Room.complete(ch));
          window.Room.advance('cutscene');
        }
        showWinModal(true);
      });
    }

    // Auto-open tutorial on first visit to this level
    if (!sessionStorage.getItem('sandwich_tut_' + chapter)) {
      setTimeout(() => showTutorialModal(false), 300);
    }

    function showWinModal(isAll = false) {
      const existing = document.getElementById('hud-win-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'hud-win-modal';
      modal.className = 'hud-modal-overlay';
      modal.innerHTML = `
        <div class="hud-modal-card">
          <div class="hud-modal-icon">${isAll ? '🌟' : icon}</div>
          <h2>${isAll ? 'ALL 4 INGREDIENTS COLLECTED!' : label.toUpperCase() + ' COLLECTED!'}</h2>
          <p>${isAll ? 'All four ingredients are ready! Get ready to face the final boss!' : 'Great job! You collected this ingredient for the sandwich.'}</p>
          <div class="hud-modal-actions">
            ${isAll ? `
              <button class="hud-btn win" id="modal-go-finale">⚔️ Go to Cutscene & Boss →</button>
            ` : `
              <button class="hud-btn win" id="modal-go-pick">📜 Choose Next Level →</button>
            `}
            <button class="hud-btn hud-modal-close" id="modal-close">Stay on Page</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('modal-close').onclick = () => modal.remove();
      const goPick = document.getElementById('modal-go-pick');
      if (goPick) goPick.onclick = () => window.location.href = '/pick';
      const goFinale = document.getElementById('modal-go-finale');
      if (goFinale) goFinale.onclick = () => window.location.href = '/cutscene';
    }

    // Room events subscription
    if (window.Room) {
      function updateState(state) {
        if (!state) return;
        const codeEl = document.getElementById('hud-room-code');
        if (codeEl && state.code) codeEl.textContent = state.code;

        const pName = window.Room.getPlayerName();
        const nameEl = document.getElementById('hud-chef-name');
        if (nameEl && pName) nameEl.textContent = pName;

        if (state.chapters && state.chapters[chapter]) {
          const chData = state.chapters[chapter];
          const statusEl = document.getElementById('hud-chapter-status');
          const pill = document.getElementById('hud-ingredient-pill');
          if (chData.completed) {
            if (statusEl) statusEl.textContent = 'SECURED!';
            if (pill) pill.classList.add('secured');
          }
        }
      }

      window.Room.on('room_updated', (data) => updateState(data.roomState));
      window.Room.on('chapter_completed', (data) => updateState(data.roomState));
      window.Room.on('all_chapters_completed', (data) => {
        updateState(data.roomState);
        showWinModal(true);
        setTimeout(() => {
          window.location.href = data.nextUrl || '/finale';
        }, 1500);
      });

      if (window.Room.getState()) {
        updateState(window.Room.getState());
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHud);
  } else {
    initHud();
  }
})();
