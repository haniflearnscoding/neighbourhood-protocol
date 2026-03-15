import { Engine, STATES, activateScreen, showOverlay } from './engine.js';
import { activatePhoneUI, deactivatePhoneUI }           from './scene1.js';
import { activateCameraUI, cameraSuccess, cameraFailure, deactivateCameraUI } from './scene2.js';
import { NARRATIVE }                                     from '../data/narrative.js';

const engine = new Engine();

window.addEventListener('DOMContentLoaded', () => {
  activateScreen('screen-intro');
  engine.state = STATES.INTRO;
  bindIntro();
  bindScene1();
  bindScene2();
  bindScene3();
  engine.on('transition', ({ from, to }) => handleTransition(from, to));
});

function handleTransition(from, to) {
  switch (to) {

    case STATES.SCENE_1:
      deactivatePhoneUI();
      activateScreen('screen-scene1');
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

    case STATES.SCENE_1_FAILURE:
      showOverlay(
        'screen-scene1', 'scene1-frame', 'scene1-overlay-footer', 'scene1-choices',
        'failure', NARRATIVE.scene1.failure, 'RETRY',
        () => { deactivatePhoneUI(); engine.transition(STATES.SCENE_1); }
      );
      break;

    case STATES.SCENE_2:
      deactivateCameraUI();
      activateScreen('screen-scene2');
      activateCameraUI();
      break;

    case STATES.SCENE_2_SUCCESS:
      setScene2ChoicesVisible(false);
      cameraSuccess(() => showOverlay(
        'screen-scene2', 'scene2-frame', 'scene2-overlay-footer', 'scene2-choices',
        'success', NARRATIVE.scene2.success, 'NEXT SCENE',
        () => engine.transition(STATES.SCENE_3)
      ));
      break;

    case STATES.SCENE_2_FAILURE:
      setScene2ChoicesVisible(false);
      cameraFailure(() => showOverlay(
        'screen-scene2', 'scene2-frame', 'scene2-overlay-footer', 'scene2-choices',
        'failure', NARRATIVE.scene2.failure, 'RETRY',
        () => { deactivateCameraUI(); engine.transition(STATES.SCENE_2); }
      ));
      break;

    case STATES.SCENE_3:
      activateScreen('screen-scene3');
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

function truckArrival() {
  const img      = document.getElementById('scene1-img');
  const narrative = document.querySelector('#screen-scene1 .scene-narrative');
  const prompt    = document.querySelector('#screen-scene1 .scene-prompt');
  const choices   = document.querySelector('#screen-scene1 .choice-pair');

  // Reset: notruck image, narrative + buttons hidden
  img.src = 'assets/images/scene1-notruck.png';
  [narrative, prompt, choices].forEach(el => el.classList.add('is-hidden'));

  // After 2.5s: fade out image, swap to truck
  setTimeout(() => {
    img.classList.add('is-swapping');
    setTimeout(() => {
      img.src = 'assets/images/xd/Scene 1 - Choice.png';
      img.classList.remove('is-swapping');
      // Reveal narrative first
      setTimeout(() => {
        narrative.classList.remove('is-hidden');
        prompt.classList.remove('is-hidden');
        // Then reveal buttons
        setTimeout(() => choices.classList.remove('is-hidden'), 800);
      }, 400);
    }, 600);
  }, 2500);
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
  document.getElementById('btn-keep-recording')
    .addEventListener('click', () => engine.transition(STATES.SCENE_2_SUCCESS));
  document.getElementById('btn-go-inside')
    .addEventListener('click', () => engine.transition(STATES.SCENE_2_FAILURE));
}

function setScene2ChoicesVisible(visible) {
  const choices = document.getElementById('scene2-choices');
  const prompt  = document.querySelector('#screen-scene2 .scene-prompt');
  if (choices) choices.style.display = visible ? '' : 'none';
  if (prompt)  prompt.style.display  = visible ? '' : 'none';
}

function bindScene3() {
  document.getElementById('btn-bring-groceries')
    .addEventListener('click', () => engine.transition(STATES.SCENE_3_SUCCESS));
  document.getElementById('btn-stay-away')
    .addEventListener('click', () => engine.transition(STATES.SCENE_3_FAILURE));
}

// Restore scene 2 choices on re-entry
engine.on('transition', ({ to }) => {
  if (to === STATES.SCENE_2) setTimeout(() => setScene2ChoicesVisible(true), 400);
});

// End screen restart
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-restart')
    .addEventListener('click', () => engine.transition(STATES.SCENE_1));
});
