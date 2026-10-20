/* =====================================================================
 * music.js – background music for an invitation.
 *   Event music_url  → that song (a direct .mp3 link, looped)
 *   Template theme "music": "chimes" → a soft built-in bell melody (no file, no copyright)
 * Browsers only allow sound after a tap, so music starts when the guest taps
 * "Open invitation"; the ♪ button lets them pause / play at any time.
 * ===================================================================== */
import { el, icon } from './dom.js';

export function createMusic({ url, mode }) {
  if (!url && mode !== 'chimes') return null;
  const player = url ? filePlayer(url) : chimePlayer();
  let playing = false;

  const button = el('button', { class: 'music-toggle', type: 'button', 'aria-label': 'Play music' }, icon('music'));
  const update = () => {
    button.classList.toggle('is-playing', playing);
    button.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  };
  const start = () => {
    if (playing) return;
    playing = true;
    player.start().catch(() => { playing = false; update(); });
    update();
  };
  const stop = () => { playing = false; player.stop(); update(); };
  button.addEventListener('click', () => (playing ? stop() : start()));

  return { button, start };
}

function filePlayer(url) {
  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = 0.6;
  return { start: () => audio.play(), stop: () => audio.pause() };
}

/* A gentle looping bell melody made with the Web Audio API. */
function chimePlayer() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return { start: () => Promise.reject(new Error('no audio')), stop() {} };

  const MELODY = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25];   // C5 E5 G5 A5 G5 E5 D5 E5
  const BASS = [130.81, 174.61, 196.0, 130.81];                                       // C3 F3 G3 C3
  const STEP_MS = 480;
  let ctx, master, timer = null, step = 0;

  function bell(freq, time, gain, length) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(gain, time + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(env).connect(master);
    osc.start(time);
    osc.stop(time + length + 0.1);
  }

  function tick() {
    const time = ctx.currentTime + 0.05;
    bell(MELODY[step % MELODY.length], time, 0.09, 2.4);
    if (step % 8 === 0) bell(BASS[(step / 8) % BASS.length], time, 0.07, 4);
    step++;
  }

  return {
    start() {
      if (!ctx) {
        ctx = new AudioCtx();
        master = ctx.createGain();
        master.gain.value = 0.6;
        master.connect(ctx.destination);
      }
      if (!timer) { tick(); timer = setInterval(tick, STEP_MS); }
      return ctx.resume();
    },
    stop() {
      clearInterval(timer);
      timer = null;
      if (ctx) ctx.suspend();
    }
  };
}
