/**
 * scene3.js — The Groceries (full scene controller)
 */
import { NARRATIVE } from '../data/narrative.js';

let _abort = null;

export function activateScene3(onSuccess, onFailure) {
  if (_abort) _abort.abort();
  _abort = new AbortController();
  const { signal } = _abort;

  const S = NARRATIVE.scene3;

  // ── DOM refs ──────────────────────────────────────────
  const screen    = document.getElementById('screen-scene3');
  const img       = document.getElementById('scene3-img');
  const character = document.getElementById('scene3-character');
  const narrative = document.getElementById('scene3-narrative');
  const tapHint   = document.getElementById('scene3-tap-hint');
  const prompt    = document.querySelector('#screen-scene3 .scene-prompt');
  const choices   = document.getElementById('scene3-choices');
  const btnSave   = document.getElementById('btn-stay-away');
  const btnBuy    = document.getElementById('btn-bring-groceries');
  const footer    = document.getElementById('scene3-overlay-footer');

  // ── Reset ─────────────────────────────────────────────
  img.style.transition = 'none';
  img.classList.remove('is-swapping');
  img.src = 'assets/images/scene3/Scene 3 \u2013 5.png';
  requestAnimationFrame(() => { img.style.transition = ''; });

  character.classList.remove('is-visible');

  narrative.textContent = '';
  narrative.style.transition = 'none';
  narrative.classList.add('is-hidden');
  requestAnimationFrame(() => { narrative.style.transition = ''; });

  tapHint.classList.remove('is-visible');
  prompt.classList.add('is-hidden');

  choices.style.transition = 'none';
  choices.classList.add('is-hidden');
  choices.style.display = '';
  requestAnimationFrame(() => { choices.style.transition = ''; });

  footer.style.display = 'none';
  footer.innerHTML = '';

  // ── Helpers ───────────────────────────────────────────

  function abortErr() {
    return new DOMException('Scene aborted', 'AbortError');
  }

  function hideLine() {
    narrative.classList.add('is-hidden');
  }

  function wait(ms) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());
      let t;
      const onAbort = () => { clearTimeout(t); reject(abortErr()); };
      signal.addEventListener('abort', onAbort, { once: true });
      t = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
    });
  }

  function typewriteLine(text) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());

      let phase = 'typing';
      let charIndex = 0;
      let timer;

      narrative.textContent = '';
      narrative.classList.remove('is-hidden');

      const charDelay = (ch) => {
        if ('.!?…'.includes(ch)) return 150;
        if (ch === ',')           return 90;
        return 25;
      };

      const tick = () => {
        if (signal.aborted) return;
        if (charIndex < text.length) {
          narrative.textContent = text.slice(0, ++charIndex);
          timer = setTimeout(tick, charDelay(text[charIndex - 1]));
        } else {
          finishTyping();
        }
      };

      const finishTyping = () => {
        phase = 'waiting';
        narrative.textContent = text;
        tapHint.classList.add('is-visible');
        screen.classList.add('is-clickable-scene');
      };

      const handleClick = () => {
        if (phase === 'typing') {
          clearTimeout(timer);
          finishTyping();
          screen.addEventListener('click', handleClick, { once: true, signal });
        } else {
          screen.classList.remove('is-clickable-scene');
          tapHint.classList.remove('is-visible');
          resolve();
        }
      };

      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        screen.classList.remove('is-clickable-scene');
        tapHint.classList.remove('is-visible');
        reject(abortErr());
      }, { once: true });

      timer = setTimeout(tick, 0);
      screen.addEventListener('click', handleClick, { once: true, signal });
    });
  }

  function waitChoice() {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());
      const inner = new AbortController();
      signal.addEventListener('abort', () => { inner.abort(); reject(abortErr()); }, { once: true });
      btnSave.addEventListener('click', () => { inner.abort(); resolve('save'); }, { once: true, signal: inner.signal });
      btnBuy.addEventListener('click',  () => { inner.abort(); resolve('buy');  }, { once: true, signal: inner.signal });
    });
  }

  // ── Main sequence ─────────────────────────────────────
  (async () => {
    try {

      // ── 1. EXTERIOR ─────────────────────────────────────
      await wait(800);
      for (const line of S.exteriorLines) {
        await typewriteLine(line);
        hideLine();
      }

      // ── 2. SWAP TO AISLE ────────────────────────────────
      img.classList.add('is-swapping');
      await wait(500);
      img.src = 'assets/images/scene3/Scene 3 \u2013 38.png';
      img.classList.remove('is-swapping');
      character.classList.add('is-visible');
      await wait(600);

      // ── 3. AISLE DIALOGUE ───────────────────────────────
      for (const line of S.aisleLines) {
        await typewriteLine(line);
        hideLine();
      }

      // ── 4. CHOICES ──────────────────────────────────────
      prompt.classList.remove('is-hidden');
      await wait(800);
      choices.classList.remove('is-hidden');

      const branch = await waitChoice();
      choices.classList.add('is-hidden');
      prompt.classList.add('is-hidden');

      // ── 5A. SAVE PATH ────────────────────────────────────
      if (branch === 'save') {
        // Swap bg to 59 before line 1, then show character
        img.classList.add('is-swapping');
        await wait(400);
        img.src = 'assets/images/scene3/Scene 3 \u2013 59.png';
        img.classList.remove('is-swapping');
        await wait(400);

        await typewriteLine(S.saveLines[0]);
        hideLine();

        // Swap bg only — character stays
        img.classList.add('is-swapping');
        await wait(400);
        img.src = 'assets/images/scene3/Scene 3 \u2013 60.png';
        img.classList.remove('is-swapping');
        await wait(400);

        // Line 2 — character still visible
        await typewriteLine(S.saveLines[1]);
        hideLine();

        // Swap bg + remove character for line 3
        character.classList.remove('is-visible');
        img.classList.add('is-swapping');
        await wait(400);
        img.src = 'assets/images/scene3/Scene 3 \u2013 50.png';
        img.classList.remove('is-swapping');
        await wait(400);

        // Line 3 — no character
        await typewriteLine(S.saveLines[2]);
        hideLine();

        onFailure();

      // ── 5B. BUY PATH ─────────────────────────────────────
      } else {
        for (const line of S.buyLines) {
          await typewriteLine(line);
          hideLine();
        }

        await showCartProgress(signal, S.progressHint, img);

        for (const line of S.cartFullLines) {
          await typewriteLine(line);
          hideLine();
        }
        onSuccess();
      }

    } catch (e) {
      if (e?.name !== 'AbortError') throw e;
    }
  })();
}

// ── Cart progress: 4 spacebar presses ────────────────

function showCartProgress(signal, hint, img) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Scene aborted', 'AbortError'));

    const footer = document.getElementById('scene3-overlay-footer');
    footer.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'cart-progress-wrap';

    const hintEl = document.createElement('p');
    hintEl.className = 'cart-progress-hint';
    hintEl.textContent = hint;

    const track = document.createElement('div');
    track.className = 'cart-progress-track';

    const fill = document.createElement('div');
    fill.className = 'cart-progress-fill';

    track.appendChild(fill);
    wrap.appendChild(hintEl);
    wrap.appendChild(track);
    footer.appendChild(wrap);
    footer.style.display = 'flex';

    let presses = 0;
    const TOTAL = 4;

    const cleanup = () => {
      footer.style.display = 'none';
      footer.innerHTML = '';
    };

    const onAbort = () => { cleanup(); reject(new DOMException('Scene aborted', 'AbortError')); };
    signal.addEventListener('abort', onAbort, { once: true });

    const onKey = (e) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (presses >= TOTAL) return;

      presses++;
      fill.style.width = (presses / TOTAL * 100) + '%';

      if (presses === 2) {
        img.classList.add('is-swapping');
        setTimeout(() => {
          img.src = 'assets/images/scene3/Scene 3 \u2013 53.png';
          img.classList.remove('is-swapping');
        }, 500);
      }

      if (presses === TOTAL) {
        img.classList.add('is-swapping');
        setTimeout(() => {
          img.src = 'assets/images/scene3/Scene 3 \u2013 55.png';
          img.classList.remove('is-swapping');
        }, 500);
        window.removeEventListener('keydown', onKey);
        signal.removeEventListener('abort', onAbort);
        setTimeout(() => {
          cleanup();
          resolve();
        }, 400); // let the bar finish animating
      }
    };

    window.addEventListener('keydown', onKey, { signal });
  });
}
