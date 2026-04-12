/**
 * engine.js — State machine for Neighbourhood Protocol
 */

export const STATES = {
  INTRO:           'INTRO',
  SCENE_1:         'SCENE_1',
  SCENE_1_PHONE:   'SCENE_1_PHONE',
  SCENE_1_SUCCESS: 'SCENE_1_SUCCESS',
  SCENE_1_FAILURE: 'SCENE_1_FAILURE',
  SCENE_2:         'SCENE_2',
  SCENE_2_SUCCESS: 'SCENE_2_SUCCESS',
  SCENE_2_FAILURE: 'SCENE_2_FAILURE',
  SCENE_3:         'SCENE_3',
  SCENE_3_SUCCESS: 'SCENE_3_SUCCESS',
  SCENE_3_FAILURE: 'SCENE_3_FAILURE',
  END:             'END',
  CREDITS:         'CREDITS',
};

export class Engine {
  constructor() {
    this.state = STATES.INTRO;
    this.listeners = {};
  }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  _emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }
  transition(nextState) {
    const prev = this.state;
    this.state = nextState;
    this._emit('transition', { from: prev, to: nextState });
  }
}

export function activateScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('is-active', 'is-exiting');
  });
  const target = document.getElementById(screenId);
  if (target) requestAnimationFrame(() => target.classList.add('is-active'));
}

/**
 * Show overlay inside the scene frame; NEXT/RETRY button appears below frame.
 * @param {string} sceneId       — e.g. 'screen-scene1'
 * @param {string} frameId       — e.g. 'scene1-frame'
 * @param {string} footerId      — e.g. 'scene1-overlay-footer'
 * @param {string} choicesId     — e.g. 'scene1-choices'
 * @param {'success'|'failure'} type
 * @param {{ outcome, fact, source }} data
 * @param {string} buttonLabel
 * @param {Function} onAction
 */
export function showOverlay(sceneId, frameId, footerId, choicesId, type, data, buttonLabel, onAction) {
  const frame   = document.getElementById(frameId);
  const footer  = document.getElementById(footerId);
  const choices = document.getElementById(choicesId);

  // Hide choice buttons
  if (choices) choices.style.display = 'none';

  // Dim the entire screen
  const screen = document.getElementById(sceneId);
  if (screen) screen.style.filter = 'brightness(0.2)';

  // Remove any existing overlay
  const existing = document.getElementById('app-overlay');
  if (existing) existing.remove();

  // Build overlay on #app so it sits outside the dimmed screen
  const overlay = document.createElement('div');
  overlay.id = 'app-overlay';
  overlay.className = `evidence-overlay ${type}`;

  const btn = document.createElement('button');
  btn.className = 'btn btn--large evidence-overlay__action';
  btn.textContent = buttonLabel;

  overlay.innerHTML = `
    <p class="evidence-overlay__outcome">${data.outcome}</p>
    <div class="evidence-overlay__divider"></div>
    <p class="evidence-overlay__fact">${data.fact}</p>
    <p class="evidence-overlay__source">${data.source}</p>
  `;
  overlay.appendChild(btn);
  document.getElementById('app').appendChild(overlay);

  // Animate overlay in
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-visible')));

  btn.addEventListener('click', () => {
    overlay.remove();
    if (screen) screen.style.filter = '';
    if (choices) choices.style.display = '';
    footer.style.display = 'none';
    footer.innerHTML = '';
    onAction();
  }, { once: true });
}
