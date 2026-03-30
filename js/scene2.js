/**
 * scene2.js — The Witness (full scene controller)
 */
import { NARRATIVE } from '../data/narrative.js';

let _abort = null;

export function activateScene2(onSuccess, onFailure) {
  if (_abort) _abort.abort();
  _abort = new AbortController();
  const { signal } = _abort;

  const S = NARRATIVE.scene2;

  // ── DOM refs ──────────────────────────────────────────
  const screen       = document.getElementById('screen-scene2');
  const frame        = document.getElementById('scene2-frame');
  const img          = document.getElementById('scene2-img');
  const userCalm     = document.getElementById('scene2-user-calm');
  const userShocked  = document.getElementById('scene2-user-shocked');
  const ice          = document.getElementById('scene2-ice');
  const cop          = document.getElementById('scene2-cop');
  const camVignette  = document.getElementById('scene2-camera-vignette');
  const camFrame     = document.getElementById('scene2-camera-frame');
  const narrative    = document.getElementById('scene2-narrative');
  const tapHint      = document.getElementById('scene2-tap-hint');
  const prompt       = document.querySelector('#screen-scene2 .scene-prompt');
  const choices      = document.getElementById('scene2-choices');
  const btnFlee      = document.getElementById('btn-flee');
  const btnFilm      = document.getElementById('btn-film');

  // ── Reset ─────────────────────────────────────────────
  img.src = 'assets/images/all-scenes/Scene 2 \u2013 1.png';
  img.classList.remove('is-swapping');
  [userCalm, userShocked, ice, cop, camVignette, camFrame].forEach(el => {
    el.classList.remove('is-visible');
  });
  camFrame.style.cssText = '';

  narrative.textContent = '';
  narrative.style.transition = 'none';
  narrative.classList.add('is-hidden');
  requestAnimationFrame(() => { narrative.style.transition = ''; });

  tapHint.classList.remove('is-visible');

  prompt.style.transition = 'none';
  prompt.classList.add('is-hidden');
  requestAnimationFrame(() => { prompt.style.transition = ''; });

  choices.style.transition = 'none';
  choices.classList.add('is-hidden');
  choices.style.display = '';
  requestAnimationFrame(() => { choices.style.transition = ''; });

  // Preload ICE-arrival background
  new Image().src = 'assets/images/all-scenes/Scene 2 \u2013 21.png';

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
      btnFlee.addEventListener('click', () => { inner.abort(); resolve('flee'); }, { once: true, signal: inner.signal });
      btnFilm.addEventListener('click', () => { inner.abort(); resolve('film'); }, { once: true, signal: inner.signal });
    });
  }

  // ── Main sequence ─────────────────────────────────────
  (async () => {
    try {

      // ── 1. CALM ARRIVAL ─────────────────────────────────
      // Brief pause — just the bus stop background, no character
      await wait(1200);
      userCalm.classList.add('is-visible');
      for (const line of S.arrivalLines) {
        await typewriteLine(line);
        hideLine();
      }

      // ── 2. NOTICES LADY READING ─────────────────────────
      await wait(600);
      await typewriteLine(S.lookUpLine);

      // ── 3. ICE AGENTS ARRIVE ────────────────────────────
      hideLine();
      userCalm.classList.remove('is-visible');
      img.classList.add('is-swapping');
      await wait(350);
      img.src = 'assets/images/all-scenes/Scene 2 \u2013 21.png';
      img.classList.remove('is-swapping');
      userShocked.classList.add('is-visible');
      ice.classList.add('is-visible');
      await wait(800);

      // Frame shake
      await new Promise(res => {
        gsap.timeline({ onComplete: res })
          .to(frame, { x: -3,  y: 2,  rotation: -0.4, duration: 0.1,  ease: 'power1.in'    })
          .to(frame, { x: 7,   y: -3, rotation: 1.2,  duration: 0.08, ease: 'power2.out'   })
          .to(frame, { x: -9,  y: 4,  rotation: -1.8, duration: 0.08, ease: 'power2.inOut' })
          .to(frame, { x: 11,  y: -4, rotation: 2.0,  duration: 0.07, ease: 'power3.inOut' })
          .to(frame, { x: -8,  y: 4,  rotation: -1.5, duration: 0.07, ease: 'power2.inOut' })
          .to(frame, { x: 6,   y: -2, rotation: 1.1,  duration: 0.08, ease: 'power2.inOut' })
          .to(frame, { x: -3,  y: 1,  rotation: -0.5, duration: 0.07, ease: 'power2.out'   })
          .to(frame, { x: 0,   y: 0,  rotation: 0,    duration: 0.55, ease: 'elastic.out(1, 0.35)' })
          .call(() => gsap.set(frame, { clearProps: 'all' }));
      });

      for (const line of S.arrestLines) {
        narrative.style.color = line.startsWith('Agent') ? 'rgb(255, 0, 0)' : '';
        await typewriteLine(line);
        hideLine();
      }
      narrative.style.color = '';

      // ── 4. WITNESS REACTS / AGENT CONFRONTS ─────────────
      for (const line of S.reactionLines) {
        await typewriteLine(line);
        hideLine();
      }

      // Cop replaces ICE overlay at the confrontation line
      ice.classList.remove('is-visible');
      cop.classList.add('is-visible');
      narrative.style.color = 'rgb(255, 0, 0)';
      await typewriteLine(S.confrontationLine);
      narrative.style.color = '';
      hideLine();
      await typewriteLine(S.decisionLine);

      // ── 5. CHOICES ───────────────────────────────────────
      hideLine();
      prompt.classList.remove('is-hidden');
      await wait(800);
      choices.classList.remove('is-hidden');

      const branch = await waitChoice();
      choices.classList.add('is-hidden');
      prompt.classList.add('is-hidden');

      // ── 6A. FLEE PATH ────────────────────────────────────
      if (branch === 'flee') {
        for (const line of S.fleeLines) {
          await typewriteLine(line);
          hideLine();
        }
        onFailure();

      // ── 6B. FILM PATH ────────────────────────────────────
      } else {
        // Camera overlays
        camVignette.classList.add('is-visible');
        Object.assign(camFrame.style, {
          position:  'fixed',
          inset:     'auto',
          width:     '900px',
          height:    'auto',
          transform: 'translate(-50%, -50%)',
          zIndex:    '100',
        });
        camFrame.classList.add('is-visible');
        screen.style.cursor = 'none';

        const onMove = (e) => {
          camFrame.style.left = e.clientX + 'px';
          camFrame.style.top  = e.clientY + 'px';
        };
        window.addEventListener('mousemove', onMove, { signal });

        const cleanupFrame = () => {
          window.removeEventListener('mousemove', onMove);
          camFrame.style.cssText = '';
          camFrame.classList.remove('is-visible');
          screen.style.cursor = '';
        };
        signal.addEventListener('abort', cleanupFrame, { once: true });

        for (const line of S.filmLines) {
          await typewriteLine(line);
          hideLine();
        }

        cleanupFrame();
        onSuccess();
      }

    } catch (e) {
      if (e?.name !== 'AbortError') throw e;
    }
  })();
}
