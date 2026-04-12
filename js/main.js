import { Engine, STATES, activateScreen, showOverlay } from './engine.js';
import { activateScene1 }                               from './scene1.js';
import { activateScene2 }                               from './scene2.js';
import { activateScene3 }                               from './scene3.js';
import { NARRATIVE }                                    from '../data/narrative.js';

const engine = new Engine();

window.addEventListener('DOMContentLoaded', () => {
  bindIntro();
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
      if (from === STATES.INTRO) {
        morphIntroToHeader();   // activates screen-scene1 internally
      } else {
        activateScreen('screen-scene1');
      }
      activateScene1(
        () => engine.transition(STATES.SCENE_1_SUCCESS),
        () => engine.transition(STATES.SCENE_1_FAILURE)
      );
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
        () => engine.transition(STATES.SCENE_1)
      );
      break;

    case STATES.SCENE_2:
      activateScreen('screen-scene2');
      activateScene2(
        () => engine.transition(STATES.SCENE_2_SUCCESS),
        () => engine.transition(STATES.SCENE_2_FAILURE)
      );
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
      activateScene3(
        () => engine.transition(STATES.SCENE_3_SUCCESS),
        () => engine.transition(STATES.SCENE_3_FAILURE)
      );
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

      // Transition clone from black → white in sync with the scene fade-in,
      // so it matches the dark header it's about to hand off to (avoids the
      // clone disappearing into the black bg then white text popping in).
      clone.style.transition = 'color 0.7s ease';
      clone.style.color      = 'var(--color-white)';

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

function bindIntro() {
  document.getElementById('btn-start')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1));
}


// End screen restart
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-restart')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1));
});
