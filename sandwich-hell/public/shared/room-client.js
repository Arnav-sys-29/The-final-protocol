/**
 * The Legendary Sandwich From Hell — Shared Room Client
 * Handles real-time Socket.IO synchronization, persistent session recovery across
 * multi-monitor page reloads, atomic chapter locking, and completion reporting.
 */
(function(window) {
  'use strict';

  // Storage keys
  const KEYS = {
    ROOM_CODE: 'sandwich_room_code',
    PLAYER_ID: 'sandwich_player_id',
    PLAYER_NAME: 'sandwich_player_name',
    CHAPTER: 'sandwich_chapter',
    IS_HOST: 'sandwich_is_host'
  };

  class RoomClient {
    constructor() {
      this.socket = null;
      this.state = null;
      this.player = null;
      this.listeners = {};
      this.initialized = false;
      this.connected = false;
      this.autoRedirect = true;
    }

    /**
     * Initialize connection and attempt session restoration
     */
    init(options = {}) {
      if (typeof window !== 'undefined' && window.location && window.location.search.includes('reset=1')) {
        this.leaveRoom();
      }
      if (this.initialized) return Promise.resolve(this);
      if (options.autoRedirect !== undefined) this.autoRedirect = options.autoRedirect;

      return new Promise((resolve, reject) => {
        // Ensure Socket.IO library is loaded
        if (typeof io === 'undefined') {
          const script = document.createElement('script');
          script.src = '/socket.io/socket.io.js';
          script.onload = () => this._connect(resolve, reject);
          script.onerror = () => reject(new Error('Failed to load /socket.io/socket.io.js'));
          document.head.appendChild(script);
        } else {
          this._connect(resolve, reject);
        }
      });
    }

    _connect(resolve, reject) {
      this.socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.initialized = true;
        this._emit('connect', { socketId: this.socket.id });

        // Auto-reconnect if session exists
        const roomCode = this.getRoomCode();
        const playerId = this.getPlayerId();
        if (roomCode && playerId) {
          this.socket.emit('sync_room', { roomCode, playerId });
        }

        resolve(this);
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        this._emit('disconnect');
      });

      this.socket.on('connect_error', (err) => {
        this._emit('connect_error', err);
      });

      // Server event bindings
      this.socket.on('room_created', (data) => {
        this._persistSession(data.roomCode, data.playerId, data.player.name, true);
        this.state = data.roomState;
        this.player = data.player;
        this._emit('room_created', data);
        this._emit('room_updated', { roomState: data.roomState });
      });

      this.socket.on('room_joined', (data) => {
        this._persistSession(data.roomCode, data.playerId, data.player.name, data.isHost);
        this.state = data.roomState;
        this.player = data.player;
        this._emit('room_joined', data);
        this._emit('room_updated', { roomState: data.roomState });
      });

      this.socket.on('sync_success', (data) => {
        this._persistSession(data.roomCode, data.playerId, data.player.name, data.isHost);
        this.state = data.roomState;
        this.player = data.player;
        this._emit('sync_success', data);
        this._emit('room_updated', { roomState: data.roomState });
      });

      this.socket.on('sync_failed', (data) => {
        this._emit('sync_failed', data);
      });

      this.socket.on('room_updated', (data) => {
        this.state = data.roomState;
        if (this.state && this.state.players) {
          const current = this.state.players.find(p => p.id === this.getPlayerId());
          if (current) this.player = current;
        }
        this._emit('room_updated', data);
      });

      this.socket.on('phase_changed', (data) => {
        this.state = data.roomState;
        this._emit('phase_changed', data);
        if (this.autoRedirect && data.nextUrl && window.location.pathname !== data.nextUrl) {
          window.location.href = data.nextUrl;
        }
      });

      this.socket.on('chapter_claimed', (data) => {
        this.state = data.roomState;
        this._emit('chapter_claimed', data);
        this._emit('room_updated', { roomState: data.roomState });
      });

      this.socket.on('claim_confirmed', (data) => {
        sessionStorage.setItem(KEYS.CHAPTER, data.chapter);
        localStorage.setItem(KEYS.CHAPTER, data.chapter);
        this._emit('claim_confirmed', data);
        if (this.autoRedirect && data.url && window.location.pathname !== data.url) {
          window.location.href = data.url;
        }
      });

      this.socket.on('claim_rejected', (data) => {
        this._emit('claim_rejected', data);
      });

      this.socket.on('chapter_completed', (data) => {
        this.state = data.roomState;
        this._emit('chapter_completed', data);
      });

      this.socket.on('all_chapters_completed', (data) => {
        this.state = data.roomState;
        this._emit('all_chapters_completed', data);
        if (this.autoRedirect && data.nextUrl && window.location.pathname !== data.nextUrl) {
          window.location.href = data.nextUrl;
        }
      });

      this.socket.on('cutscene_phase', (data) => {
        this._emit('cutscene_phase', data);
      });

      this.socket.on('boss_updated', (data) => {
        this.state = data.roomState;
        this._emit('boss_updated', data);
      });

      this.socket.on('boss_combat_update', (data) => {
        this.state = data.roomState;
        this._emit('boss_combat_update', data);
      });

      this.socket.on('boss_victory', (data) => {
        this.state = data.roomState;
        this._emit('boss_victory', data);
      });

      this.socket.on('boss_defeat', (data) => {
        this.state = data.roomState;
        this._emit('boss_defeat', data);
      });

      this.socket.on('boss_restarted', (data) => {
        this.state = data.roomState;
        this._emit('boss_restarted', data);
      });

      this.socket.on('boss_defeated', (data) => {
        this.state = data.roomState;
        this._emit('boss_defeated', data);
        if (this.autoRedirect && data.nextUrl && window.location.pathname !== data.nextUrl) {
          window.location.href = data.nextUrl;
        }
      });

      this.socket.on('play_prologue', (data) => {
        this.state = data.roomState;
        this._emit('play_prologue', data);
      });

      this.socket.on('cutscene_phase', (data) => {
        this.state = data.roomState;
        this._emit('cutscene_phase', data);
      });

      this.socket.on('error_message', (data) => {
        this._emit('error_message', data);
      });
    }

    _persistSession(roomCode, playerId, playerName, isHost) {
      if (roomCode) {
        sessionStorage.setItem(KEYS.ROOM_CODE, roomCode);
        localStorage.setItem(KEYS.ROOM_CODE, roomCode);
      }
      if (playerId) {
        sessionStorage.setItem(KEYS.PLAYER_ID, playerId);
        localStorage.setItem(KEYS.PLAYER_ID, playerId);
      }
      if (playerName) {
        sessionStorage.setItem(KEYS.PLAYER_NAME, playerName);
        localStorage.setItem(KEYS.PLAYER_NAME, playerName);
      }
      if (isHost !== undefined) {
        sessionStorage.setItem(KEYS.IS_HOST, isHost ? 'true' : 'false');
        localStorage.setItem(KEYS.IS_HOST, isHost ? 'true' : 'false');
      }
    }

    getRoomCode() {
      return sessionStorage.getItem(KEYS.ROOM_CODE) || localStorage.getItem(KEYS.ROOM_CODE) || null;
    }

    getPlayerId() {
      return sessionStorage.getItem(KEYS.PLAYER_ID) || localStorage.getItem(KEYS.PLAYER_ID) || null;
    }

    getPlayerName() {
      return sessionStorage.getItem(KEYS.PLAYER_NAME) || localStorage.getItem(KEYS.PLAYER_NAME) || 'Chef';
    }

    getChapter() {
      return sessionStorage.getItem(KEYS.CHAPTER) || localStorage.getItem(KEYS.CHAPTER) || null;
    }

    isHost() {
      return (sessionStorage.getItem(KEYS.IS_HOST) || localStorage.getItem(KEYS.IS_HOST)) === 'true';
    }

    leaveRoom() {
      sessionStorage.removeItem(KEYS.ROOM_CODE);
      sessionStorage.removeItem(KEYS.PLAYER_ID);
      sessionStorage.removeItem(KEYS.CHAPTER);
      sessionStorage.removeItem(KEYS.IS_HOST);
      sessionStorage.removeItem('sandwich_battle_ready');

      localStorage.removeItem(KEYS.ROOM_CODE);
      localStorage.removeItem(KEYS.PLAYER_ID);
      localStorage.removeItem(KEYS.CHAPTER);
      localStorage.removeItem(KEYS.IS_HOST);
      localStorage.removeItem('sandwich_battle_ready');
      this.state = null;
      this.player = null;
    }

    getState() {
      return this.state;
    }

    getPlayer() {
      return this.player;
    }

    create(playerName, customRoomCode = '') {
      const name = playerName || this.getPlayerName();
      this.socket.emit('create_room', { playerName: name, customRoomCode });
    }

    join(roomCode, playerName) {
      const code = (roomCode || this.getRoomCode() || '').toUpperCase();
      const name = playerName || this.getPlayerName();
      const playerId = this.getPlayerId();
      this.socket.emit('join_room', { roomCode: code, playerName: name, playerId });
    }

    startGame() {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      this.socket.emit('start_game', { roomCode, playerId });
    }

    advance(phase) {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      this.socket.emit('advance_phase', { roomCode, playerId, phase });
    }

    startPrologue() {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      this.socket.emit('start_prologue', { roomCode, playerId });
    }

    startCutscenePhase(phase) {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      this.socket.emit('start_cutscene_phase', { roomCode, playerId, phase });
    }

    claim(chapter) {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      this.socket.emit('claim_chapter', { roomCode, playerId, chapter });
    }

    complete(chapter) {
      const roomCode = this.getRoomCode() || 'DEMO01';
      const playerId = this.getPlayerId() || 'player_solo';
      const ch = chapter || this.getChapter() || 'hell';
      if (this.socket && this.socket.connected) {
        this.socket.emit('complete_chapter', { roomCode, playerId, chapter: ch });
      }
      // Guaranteed REST fallback
      fetch('/api/instant-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, chapter: ch })
      }).catch(() => {});
    }

    completeAll() {
      const roomCode = this.getRoomCode() || 'DEMO01';
      const playerId = this.getPlayerId() || 'player_solo';
      if (this.socket && this.socket.connected) {
        this.socket.emit('complete_all_chapters', { roomCode, playerId });
      }
      fetch('/api/instant-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, winAll: true })
      }).then(r => r.json()).then(data => {
        if (data.allCompleted) {
          setTimeout(() => { window.location.href = '/cutscene'; }, 600);
        }
      }).catch(() => {
        window.location.href = '/cutscene';
      });
    }

    startCutscenePhase(phase) {
      const roomCode = this.getRoomCode() || 'DEMO01';
      if (this.socket && this.socket.connected) {
        this.socket.emit('cutscene_phase', { roomCode, phase });
      }
    }

    patchBoss(chapter) {
      const roomCode = this.getRoomCode();
      const playerId = this.getPlayerId();
      const ch = chapter || this.getChapter();
      this.socket.emit('patch_boss_function', { roomCode, playerId, chapter: ch });
    }

    sendBossAction(success, timeout, questionId) {
      const roomCode = this.getRoomCode() || 'DEMO01';
      const playerId = this.getPlayerId() || 'player_solo';
      if (this.socket && this.socket.connected) {
        this.socket.emit('boss_action', { roomCode, playerId, success, timeout, questionId });
      } else {
        fetch('/api/boss-combat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode, playerId, success, timeout, questionId })
        }).catch(() => {});
      }
    }

    restartBoss() {
      const roomCode = this.getRoomCode() || 'DEMO01';
      if (this.socket && this.socket.connected) {
        this.socket.emit('restart_boss_battle', { roomCode });
      } else {
        fetch('/api/boss-restart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode })
        }).catch(() => {});
      }
    }

    on(event, callback) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    _emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => {
          try {
            cb(data);
          } catch (e) {
            console.error(`Error in Room listener for "${event}":`, e);
          }
        });
      }
    }
  }

  // Create global singleton
  window.Room = new RoomClient();

  // Auto-init on page load if browser environment
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      window.Room.init().catch(err => {
        console.warn('Room auto-init wait:', err.message);
      });
    });
  }
})(typeof window !== 'undefined' ? window : this);
