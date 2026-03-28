/**
 * scene1.js — The Lookout (full scene controller)
 *
 * Flow:
 *  dark screen → reveal (bg + character) → truck arrives → frame shake
 *  → choices → ignore path (3 lines → failure) | warn path (2 lines → WARNING input → success)
 */
import { NARRATIVE } from '../data/narrative.js';

let _abort = null;

export function activateScene1(onSuccess, onFailure) {
  // Cancel any in-progress run (e.g. on retry)
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

  // ── Reset to initial dark state ───────────────────────
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
  footer.innerHTML     = '';

  // ── Helpers ───────────────────────────────────────────

  function abortErr() {
    return new DOMException('Scene aborted', 'AbortError');
  }

  function showLine(text) {
    narrative.textContent = text;
    narrative.classList.remove('is-hidden');
  }

  function hideLine() {
    narrative.classList.add('is-hidden');
  }

  // Wait for a click anywhere on the screen; shows tap hint while waiting.
  function waitClick() {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());

      screen.classList.add('is-clickable-scene');
      tapHint.classList.add('is-visible');

      const cleanup = () => {
        screen.classList.remove('is-clickable-scene');
        tapHint.classList.remove('is-visible');
      };

      const onAbort = () => { cleanup(); reject(abortErr()); };
      const onClick = () => { signal.removeEventListener('abort', onAbort); cleanup(); resolve(); };

      signal.addEventListener('abort', onAbort, { once: true });
      screen.addEventListener('click', onClick, { once: true, signal });
    });
  }

  // Wait ms milliseconds; cancellable via signal.
  function wait(ms) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());
      let t;
      const onAbort = () => { clearTimeout(t); reject(abortErr()); };
      signal.addEventListener('abort', onAbort, { once: true });
      t = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
    });
  }

  // Wait for either choice button; inner AbortController cleans up both listeners.
  function waitChoice() {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abortErr());
      const inner = new AbortController();

      signal.addEventListener('abort', () => { inner.abort(); reject(abortErr()); }, { once: true });

      btnWarn.addEventListener('click',   () => { inner.abort(); resolve('warn');   }, { once: true, signal: inner.signal });
      btnIgnore.addEventListener('click', () => { inner.abort(); resolve('ignore'); }, { once: true, signal: inner.signal });
    });
  }

  // ── Main async sequence ───────────────────────────────
  (async () => {
    try {

      // ── 1. DARK SCREEN ──────────────────────────────────
      showLine(S.darkLine);
      await waitClick();

      // ── 2. REVEAL: scene fades in ────────────────────────
      screen.classList.remove('is-dark');
      img.classList.remove('is-swapping');   // bg image fades in
      character.classList.add('is-visible'); // character fades in

      await wait(800); // let fade settle before showing next line

      showLine(S.atWindowLines[0]);
      await waitClick();

      showLine(S.atWindowLines[1]);
      await waitClick();

      // ── 3. TRUCK ARRIVES ────────────────────────────────
      hideLine();
      truck.classList.add('is-visible'); // CSS handles slide-in animation

      await wait(2100); // truck slide duration

      showLine(S.truckLines[0]);
      await waitClick();

      showLine(S.truckLines[1]);
      await waitClick();

      // ── 4. FRAME SHAKE ──────────────────────────────────
      hideLine();
      frame.classList.add('is-shaking');
      await new Promise(res =>
        frame.addEventListener('animationend', res, { once: true })
      );
      frame.classList.remove('is-shaking');

      showLine(S.suspiciousLines[0]);
      await waitClick();

      showLine(S.suspiciousLines[1]);
      await waitClick();

      // ── 5. CHOICES ──────────────────────────────────────
      hideLine();
      prompt.classList.remove('is-hidden');
      await wait(800);
      choices.classList.remove('is-hidden');

      const branch = await waitChoice();

      // Hide choices immediately; re-add is-hidden for clean overlay dismiss later
      choices.classList.add('is-hidden');
      choices.style.display = 'none';
      prompt.classList.add('is-hidden');

      // ── 6A. IGNORE PATH ─────────────────────────────────
      if (branch === 'ignore') {
        for (const line of S.ignoreLines) {
          showLine(line);
          await waitClick();
        }
        hideLine();
        onFailure();

      // ── 6B. WARN PATH ────────────────────────────────────
      } else {
        for (const line of S.warnLines) {
          showLine(line);
          await waitClick();
        }

        // Crossfade to phone illustration
        hideLine();
        img.classList.add('is-swapping');
        character.classList.remove('is-visible');
        truck.classList.remove('is-visible');
        await wait(600);
        img.src = 'assets/images/xd/Scene 1 - Warning2.png';
        img.classList.remove('is-swapping');
        await wait(400);

        // WARNING keyboard input
        await showWarningInput(signal, S.warningHint);
        onSuccess();
      }

    } catch (e) {
      if (e?.name !== 'AbortError') throw e;
      // Otherwise: aborted cleanly — do nothing
    }
  })();
}

// ── WARNING input ─────────────────────────────────────

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

    const input = document.createElement('input');
    input.type          = 'text';
    input.className     = 'warning-input';
    input.placeholder   = 'type here…';
    input.maxLength     = 10;
    input.autocomplete  = 'off';
    input.setAttribute('autocorrect',   'off');
    input.setAttribute('autocapitalize', 'off');
    input.spellcheck = false;

    wrap.appendChild(hintEl);
    wrap.appendChild(input);
    footer.appendChild(wrap);
    footer.style.display = 'flex';

    const cleanup = () => {
      footer.style.display = 'none';
      footer.innerHTML     = '';
    };

    const onAbort = () => { cleanup(); reject(new DOMException('Scene aborted', 'AbortError')); };
    signal.addEventListener('abort', onAbort, { once: true });

    input.addEventListener('input', () => {
      if (input.value.trim().toUpperCase() === 'WARNING') {
        signal.removeEventListener('abort', onAbort);
        cleanup();
        resolve();
      }
    });

    // Focus after brief delay so it doesn't compete with the click that triggered warn path
    setTimeout(() => { if (!signal.aborted) input.focus(); }, 150);
  });
}
