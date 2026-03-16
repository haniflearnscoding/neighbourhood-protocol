import { Engine, STATES, activateScreen, showOverlay } from './engine.js';
import { activatePhoneUI, deactivatePhoneUI }           from './scene1.js';
import { activateFilmingView }                           from './scene2.js';
import { NARRATIVE }                                     from '../data/narrative.js';

const engine = new Engine();

// AbortController for scene 1 click sequence — cancelled on retry
let scene1Abort = null;
let scene2Abort = null;

window.addEventListener('DOMContentLoaded', () => {
  bindIntro();
  bindScene1();
  bindScene2();
  bindScene3();
  engine.on('transition', ({ from, to }) => handleTransition(from, to));

  // Debug: append #scene2 / #scene3 to URL to skip to that scene
  const hash = window.location.hash;
  if (hash === '#scene2') {
    engine.transition(STATES.SCENE_2);
  } else if (hash === '#scene3') {
    engine.transition(STATES.SCENE_3);
  } else {
    activateScreen('screen-intro');
    engine.state = STATES.INTRO;
  }
});

function handleTransition(from, to) {
  switch (to) {

    case STATES.SCENE_1:
      deactivatePhoneUI();
      if (from === STATES.INTRO) {
        morphIntroToHeader();   // activates screen-scene1 internally
      } else {
        activateScreen('screen-scene1');
      }
      truckArrival();
      break;

    case STATES.SCENE_1_PHONE:
      activatePhoneUI(() => engine.transition(STATES.SCENE_1_SUCCESS));
      break;

    case STATES.SCENE_1_SUCCESS:
      showOverlay(
        'screen-scene1', 'scene1-frame', 'scene1-overlay-footer', 'scene1-choices',
        'success', NARRATIVE.scene1.success, 'NEXT SCENE',
        () => engine.transition(STATES.SCENE_2)
      );
      break;

    case STATES.INTRO:
      activateScreen('screen-intro');
      break;

    case STATES.SCENE_1_FAILURE:
      showOverlay(
        'screen-scene1', 'scene1-frame', 'scene1-overlay-footer', 'scene1-choices',
        'failure', NARRATIVE.scene1.failure, 'RETRY',
        () => { deactivatePhoneUI(); engine.transition(STATES.SCENE_1); }
      );
      break;

    case STATES.SCENE_2:
      activateScreen('screen-scene2');
      witnessArrival();
      break;

    case STATES.SCENE_2_SUCCESS:
      showOverlay(
        'screen-scene2', 'scene2-frame', 'scene2-overlay-footer', 'scene2-choices',
        'success', NARRATIVE.scene2.success, 'BACK TO START',
        () => engine.transition(STATES.INTRO)
      );
      break;

    case STATES.SCENE_2_FAILURE:
      showOverlay(
        'screen-scene2', 'scene2-frame', 'scene2-overlay-footer', 'scene2-choices',
        'failure', NARRATIVE.scene2.failure, 'RETRY',
        () => engine.transition(STATES.SCENE_2)
      );
      break;

    case STATES.SCENE_3:
      activateScreen('screen-scene3');
      groceryArrival();
      break;

    case STATES.SCENE_3_SUCCESS:
      showOverlay(
        'screen-scene3', 'scene3-frame', 'scene3-overlay-footer', 'scene3-choices',
        'success', NARRATIVE.scene3.success, 'NEXT SCENE',
        () => engine.transition(STATES.END)
      );
      break;

    case STATES.SCENE_3_FAILURE:
      showOverlay(
        'screen-scene3', 'scene3-frame', 'scene3-overlay-footer', 'scene3-choices',
        'failure', NARRATIVE.scene3.failure, 'RETRY',
        () => engine.transition(STATES.SCENE_3)
      );
      break;

    case STATES.END:
      activateScreen('screen-end');
      break;
  }
}

// ── Title morph: big intro → small scene header ───────────────────────────────

function morphIntroToHeader() {
  const introTitle   = document.querySelector('#screen-intro .intro__title');
  const toEl         = document.querySelector('#screen-scene1 .scene-header__title');

  // Measure both elements before any changes
  const fromRect     = introTitle.getBoundingClientRect();
  const toRect       = toEl.getBoundingClientRect();
  const fromFontSize = parseFloat(getComputedStyle(introTitle).fontSize);
  const toFontSize   = parseFloat(getComputedStyle(toEl).fontSize);

  const scale = fromFontSize / toFontSize;
  const dx = (fromRect.left + fromRect.width  / 2) - (toRect.left + toRect.width  / 2);
  const dy = (fromRect.top  + fromRect.height / 2) - (toRect.top  + toRect.height / 2);

  // Hide real titles — clone represents both during transition
  introTitle.style.opacity = '0';
  toEl.style.opacity       = '0';

  // Clone starts at the header position, transformed to look like the big intro title
  const clone = document.createElement('div');
  clone.textContent = 'NEIGHBOURHOOD PROTOCOL';
  Object.assign(clone.style, {
    position:        'fixed',
    top:             toRect.top    + 'px',
    left:            toRect.left   + 'px',
    width:           toRect.width  + 'px',
    height:          toRect.height + 'px',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontFamily:      'var(--font-header)',
    fontSize:        getComputedStyle(toEl).fontSize,
    color:           'var(--color-black)',
    letterSpacing:   '0.12em',
    whiteSpace:      'nowrap',
    zIndex:          '9999',
    pointerEvents:   'none',
    transform:       `translate(${dx}px, ${dy}px) scale(${scale})`,
    transformOrigin: 'center center',
  });
  document.body.appendChild(clone);

  // Step 1: animate title shrinking while still on the intro screen
  // Double-RAF: first frame commits the initial (big/displaced) state to the browser,
  // second frame starts the transition — otherwise they batch and nothing animates.
  requestAnimationFrame(() => {
    clone.getBoundingClientRect(); // force layout so initial transform is painted
    requestAnimationFrame(() => {
    clone.style.transition = 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
    clone.style.transform  = 'translate(0, 0) scale(1)';

    let done = false;
    const onShrinkComplete = () => {
      if (done) return;
      done = true;

      // Step 2: NOW switch pages — title is already in the header position
      activateScreen('screen-scene1');

      // Step 3: once the screen cross-fade finishes, swap clone for real header
      setTimeout(() => {
        toEl.style.opacity       = '';
        introTitle.style.opacity = '';
        clone.remove();
      }, 750); // matches --transition-slow (0.7s) + buffer
    };

    clone.addEventListener('transitionend', onShrinkComplete, { once: true });
    setTimeout(onShrinkComplete, 800); // safety fallback
    }); // inner RAF
  }); // outer RAF
}

// ── Scene 1: click-driven truck arrival ───────────────────────────────────────

function truckArrival() {
  // Cancel any in-progress sequence (e.g. from a retry)
  if (scene1Abort) scene1Abort.abort();
  scene1Abort = new AbortController();
  const { signal } = scene1Abort;

  const img       = document.getElementById('scene1-img');
  const character = document.getElementById('scene1-character');
  const truck     = document.getElementById('scene1-truck');
  const narrative = document.querySelector('#screen-scene1 .scene-narrative');
  const prompt    = document.querySelector('#screen-scene1 .scene-prompt');
  const choices   = document.querySelector('#screen-scene1 .choice-pair');
  const frame     = document.getElementById('scene1-frame');

  // Phase 0: empty street, overlays hidden
  character.classList.remove('is-visible');
  truck.classList.remove('is-visible');
  // Reset truck translate so it's ready to slide in again on retry
  truck.style.transition = 'none';
  requestAnimationFrame(() => { truck.style.transition = ''; });
  [narrative, prompt, choices].forEach(el => {
    el.style.transition = 'none';
    el.classList.add('is-hidden');
    requestAnimationFrame(() => el.style.transition = '');
  });

  // ── Phase 0 → 1: click → character fades in over background ──
  frame.classList.add('is-clickable');
  frame.addEventListener('click', function onPhase1() {
    frame.classList.remove('is-clickable');
    character.classList.add('is-visible');  // fade in character overlay

    // Wait for character to appear, then enable next click
    setTimeout(() => {
      if (signal.aborted) return;

      // ── Phase 1 → 2: click → truck rolls in ──
      frame.classList.add('is-clickable');
      frame.addEventListener('click', function onPhase2() {
        frame.classList.remove('is-clickable');

        // Truck overlay slides in from the right (background stays untouched)
        truck.classList.add('is-visible');

        // Show narrative after truck eases into position
        setTimeout(() => {
          if (signal.aborted) return;
          narrative.classList.remove('is-hidden');
          prompt.classList.remove('is-hidden');
          setTimeout(() => choices.classList.remove('is-hidden'), 800);
        }, 2100);
      }, { once: true, signal });
    }, 700); // let character finish fading in
  }, { once: true, signal });
}

function bindIntro() {
  document.getElementById('btn-start')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1));
}

function bindScene1() {
  document.getElementById('btn-warn-leo')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1_PHONE));
  document.getElementById('btn-ignore-truck')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1_FAILURE));
}

function bindScene2() {
  document.getElementById('btn-film')
    .addEventListener('click', () =>
      activateFilmingView(() => engine.transition(STATES.SCENE_2_SUCCESS))
    );
  document.getElementById('btn-flee')
    .addEventListener('click', () => engine.transition(STATES.SCENE_2_FAILURE));
}

function witnessArrival() {
  if (scene2Abort) scene2Abort.abort();
  scene2Abort = new AbortController();
  const { signal } = scene2Abort;

  const img         = document.getElementById('scene2-img');
  const userCalm    = document.getElementById('scene2-user-calm');
  const userShocked = document.getElementById('scene2-user-shocked');
  const ice         = document.getElementById('scene2-ice');
  const narrative   = document.querySelector('#screen-scene2 .scene-narrative');
  const prompt      = document.querySelector('#screen-scene2 .scene-prompt');
  const choices     = document.getElementById('scene2-choices');
  const frame       = document.getElementById('scene2-frame');

  const cop            = document.getElementById('scene2-cop');
  const cameraVignette = document.getElementById('scene2-camera-vignette');
  const cameraFrame    = document.getElementById('scene2-camera-frame');

  // Reset — background only, all overlays hidden
  img.src = 'assets/images/all-scenes/Scene 2 \u2013 1.png';
  img.classList.remove('is-swapping');
  [userCalm, userShocked, ice, cop, cameraVignette, cameraFrame].forEach(el => el && el.classList.remove('is-visible'));
  [narrative, prompt, choices].forEach(el => {
    el.style.display = '';
    el.style.transition = 'none';
    el.classList.add('is-hidden');
    requestAnimationFrame(() => el.style.transition = '');
  });

  // Preload
  new Image().src = 'assets/images/all-scenes/Scene 2 \u2013 3.png';
  new Image().src = 'assets/images/all-scenes/Scene 2 \u2013 5.png';

  // ── Phase 0 → 1: click → witness arrives (calm) ──
  frame.classList.add('is-clickable');
  frame.addEventListener('click', function onPhase1() {
    frame.classList.remove('is-clickable');
    userCalm.classList.add('is-visible');

    // ── Phase 1 → 2: click → ICE arrives, witness reacts ──
    setTimeout(() => {
      if (signal.aborted) return;
      frame.classList.add('is-clickable');
      frame.addEventListener('click', function onPhase2() {
        frame.classList.remove('is-clickable');

        // Swap background instantly — overlays cover the cut
        img.src = 'assets/images/all-scenes/Scene 2 \u2013 3.png';

        // Swap character state and reveal ICE
        userCalm.classList.remove('is-visible');
        userShocked.classList.add('is-visible');
        ice.classList.add('is-visible');

        setTimeout(() => {
          if (signal.aborted) return;
          narrative.classList.remove('is-hidden');
          prompt.classList.remove('is-hidden');
          setTimeout(() => choices.classList.remove('is-hidden'), 800);
        }, 800);
      }, { once: true, signal });
    }, 700);
  }, { once: true, signal });
}

function groceryArrival() {
  const narrative = document.querySelector('#screen-scene3 .scene-narrative');
  const prompt    = document.querySelector('#screen-scene3 .scene-prompt');
  const choices   = document.getElementById('scene3-choices');

  [narrative, prompt, choices].forEach(el => {
    el.style.transition = 'none';
    el.classList.add('is-hidden');
    requestAnimationFrame(() => el.style.transition = '');
  });

  setTimeout(() => {
    narrative.classList.remove('is-hidden');
    prompt.classList.remove('is-hidden');
    setTimeout(() => choices.classList.remove('is-hidden'), 800);
  }, 1200);
}

function bindScene3() {
  document.getElementById('btn-bring-groceries')
    .addEventListener('click', () => engine.transition(STATES.SCENE_3_SUCCESS));
  document.getElementById('btn-stay-away')
    .addEventListener('click', () => engine.transition(STATES.SCENE_3_FAILURE));
}

// End screen restart
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-restart')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1));
});
