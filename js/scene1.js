/**
 * scene1.js — The Lookout (full scene controller)
 */
import { NARRATIVE } from '../data/narrative.js';

let _abort = null;

export function activateScene1(onSuccess, onFailure) {
  if (_abort) _abort.abort();
  _abort = new AbortController();
  const { signal } = _abort;

  const S = NARRATIVE.scene1;

  // ── DOM refs ──────────────────────────────────────────
  const screen    = document.getElementById('screen-scene1');
  const frame     = document.getElementById('scene1-frame');
  const img       = document.getElementById('scene1-img');
  const character = document.getElementById('scene1-character');
  const truck     = document.getElementById('scene1-truck');
  const narrative = document.getElementById('scene1-narrative');
  const tapHint   = document.getElementById('scene1-tap-hint');
  const prompt    = document.querySelector('#screen-scene1 .scene-prompt');
  const choices   = document.getElementById('scene1-choices');
  const btnWarn   = document.getElementById('btn-warn-leo');
  const btnIgnore = document.getElementById('btn-ignore-truck');
  const footer    = document.getElementById('scene1-overlay-footer');

  // ── Reset ─────────────────────────────────────────────
  screen.classList.add('is-dark');

  img.style.transition = 'none';
  img.classList.add('is-swapping');
  truck.style.transition = 'none';
  truck.classList.remove('is-visible');
  character.classList.remove('is-visible');
  requestAnimationFrame(() => {
    img.style.transition   = '';
    truck.style.transition = '';
  });

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

  // Typewriter: types text char-by-char.
  // Click during typing → skips to end.
  // Click after typing complete → advances.
  function typewriteLine(text) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());

      let phase = 'typing'; // 'typing' | 'waiting'
      let charIndex = 0;
      let timer;

      narrative.textContent = '';
      narrative.classList.remove('is-hidden');

      const charDelay = (ch) => {
        if ('.!?…'.includes(ch)) return 190;
        if (ch === ',')           return 120;
        return 34;
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
          // Re-register: next click advances
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

  // Wait for either choice button.
  function waitChoice() {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());
      const inner = new AbortController();
      signal.addEventListener('abort', () => { inner.abort(); reject(abortErr()); }, { once: true });
      btnWarn.addEventListener('click',   () => { inner.abort(); resolve('warn');   }, { once: true, signal: inner.signal });
      btnIgnore.addEventListener('click', () => { inner.abort(); resolve('ignore'); }, { once: true, signal: inner.signal });
    });
  }

  // ── Main sequence ─────────────────────────────────────
  (async () => {
    try {

      // ── 1. DARK SCREEN ──────────────────────────────────
      await typewriteLine(S.darkLine);

      // ── 2. REVEAL ───────────────────────────────────────
      screen.classList.remove('is-dark');
      img.style.transition = 'opacity 1.4s ease'; // slow, dramatic reveal
      img.classList.remove('is-swapping');
      character.classList.add('is-visible');
      await wait(1600);
      img.style.transition = ''; // restore default

      await typewriteLine(S.atWindowLines[0]);
      hideLine();
      await typewriteLine(S.atWindowLines[1]);

      // ── 3. TRUCK ARRIVES ────────────────────────────────
      hideLine();
      truck.classList.add('is-visible');
      await wait(2100);

      await typewriteLine(S.truckLines[0]);
      hideLine();
      await typewriteLine(S.truckLines[1]);

      // ── 4. FRAME SHAKE ──────────────────────────────────
      hideLine();
      await new Promise(res => {
        gsap.timeline({ onComplete: res })
          // slow build — unease creeping in
          .to(frame, { x: -4,  y: 2,  rotation: -0.5, duration: 0.12, ease: 'power1.in'    })
          .to(frame, { x: 8,   y: -4, rotation: 1.4,  duration: 0.09, ease: 'power2.out'   })
          .to(frame, { x: -11, y: 5,  rotation: -2,   duration: 0.09, ease: 'power2.inOut' })
          // peak
          .to(frame, { x: 13,  y: -5, rotation: 2.2,  duration: 0.08, ease: 'power3.inOut' })
          .to(frame, { x: -10, y: 5,  rotation: -1.8, duration: 0.08, ease: 'power2.inOut' })
          // decay
          .to(frame, { x: 8,   y: -3, rotation: 1.3,  duration: 0.09, ease: 'power2.inOut' })
          .to(frame, { x: -5,  y: 2,  rotation: -0.8, duration: 0.08, ease: 'power2.inOut' })
          .to(frame, { x: 3,   y: -1, rotation: 0.4,  duration: 0.07, ease: 'power2.out'   })
          // elastic settle
          .to(frame, { x: 0,   y: 0,  rotation: 0,    duration: 0.6,  ease: 'elastic.out(1, 0.35)' })
          .call(() => gsap.set(frame, { clearProps: 'all' }));
      });

      await typewriteLine(S.suspiciousLines[0]);
      hideLine();
      await typewriteLine(S.suspiciousLines[1]);

      // ── 5. CHOICES ──────────────────────────────────────
      hideLine();
      prompt.classList.remove('is-hidden');
      await wait(800);
      choices.classList.remove('is-hidden');

      const branch = await waitChoice();
      choices.classList.add('is-hidden');
      choices.style.display = 'none';
      prompt.classList.add('is-hidden');

      // ── 6A. IGNORE PATH ─────────────────────────────────
      if (branch === 'ignore') {
        for (const line of S.ignoreLines) {
          await typewriteLine(line);
          hideLine();
        }
        onFailure();

      // ── 6B. WARN PATH ────────────────────────────────────
      } else {
        for (const line of S.warnLines) {
          await typewriteLine(line);
          hideLine();
        }

        // Crossfade to phone illustration
        img.classList.add('is-swapping');
        character.classList.remove('is-visible');
        truck.classList.remove('is-visible');
        await wait(800);
        img.src = 'assets/images/xd/Scene 1 - Warning2.png';
        img.classList.remove('is-swapping');
        await wait(700);

        await showWarningInput(signal, S.warningHint);
        onSuccess();
      }

    } catch (e) {
      if (e?.name !== 'AbortError') throw e;
    }
  })();
}

// ── WARNING input: type → SEND ────────────────────────

function showWarningInput(signal, hint) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Scene aborted', 'AbortError'));

    const footer = document.getElementById('scene1-overlay-footer');
    footer.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'warning-input-wrap';

    const hintEl = document.createElement('p');
    hintEl.className = 'warning-input-hint';
    hintEl.textContent = hint;

    const row = document.createElement('div');
    row.className = 'warning-input-row';

    const input = document.createElement('input');
    input.type      = 'text';
    input.className = 'warning-input';
    input.placeholder = 'type here…';
    input.maxLength = 12;
    input.autocomplete = 'off';
    input.setAttribute('autocorrect',    'off');
    input.setAttribute('autocapitalize', 'off');
    input.spellcheck = false;

    const sendBtn = document.createElement('button');
    sendBtn.className   = 'btn warning-send-btn';
    sendBtn.textContent = 'SEND';

    row.appendChild(input);
    row.appendChild(sendBtn);
    wrap.appendChild(hintEl);
    wrap.appendChild(row);
    footer.appendChild(wrap);
    footer.style.display = 'flex';

    const cleanup = () => {
      footer.style.display = 'none';
      footer.innerHTML     = '';
    };

    const onAbort = () => { cleanup(); reject(new DOMException('Scene aborted', 'AbortError')); };
    signal.addEventListener('abort', onAbort, { once: true });

    sendBtn.addEventListener('click', () => {
      if (input.value.trim().toUpperCase() === 'WARNING') {
        signal.removeEventListener('abort', onAbort);
        cleanup();
        resolve();
      } else {
        // Wrong input — shake the field
        input.classList.remove('is-wrong');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => input.classList.add('is-wrong'));
        });
        input.addEventListener('animationend', () => input.classList.remove('is-wrong'), { once: true });
        input.focus();
      }
    }, { signal });

    setTimeout(() => { if (!signal.aborted) input.focus(); }, 150);
  });
}
