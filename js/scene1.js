/**
 * scene1.js — The Lookout
 * Manages phone-thread interaction for "Warn Leo" path.
 */

import { NARRATIVE } from '../data/narrative.js';

const { phone } = NARRATIVE.scene1;

let msgIndex = 0;
let phoneReady = false;

/**
 * Activate the phone UI, begin advancing messages on tap/click.
 * @param {Function} onSend — called when user taps SEND
 */
export function activatePhoneUI(onSend) {
  const phoneUI    = document.getElementById('phone-ui');
  const thread     = document.getElementById('phone-thread');
  const sendArea   = document.getElementById('phone-send-area');
  const sendBtn    = document.getElementById('phone-send-btn');
  const tapHint    = document.getElementById('phone-tap-hint');

  // Reset state
  thread.innerHTML = '';
  sendArea.classList.remove('is-active');
  msgIndex = 0;
  phoneReady = false;

  // Show phone
  phoneUI.classList.add('is-active');

  // Brief pause then show first message
  setTimeout(() => {
    advanceMessage(thread, sendArea, tapHint);
    phoneReady = true;
  }, 600);

  // Click anywhere on phone to advance
  const handleTap = () => {
    if (!phoneReady) return;
    if (msgIndex < phone.messages.length) {
      advanceMessage(thread, sendArea, tapHint);
    }
  };
  phoneUI.addEventListener('click', handleTap);

  // SEND triggers success
  sendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    phoneUI.removeEventListener('click', handleTap);
    onSend();
  }, { once: true });
}

function advanceMessage(thread, sendArea, tapHint) {
  if (msgIndex >= phone.messages.length) {
    // All messages shown — activate send
    sendArea.classList.add('is-active');
    if (tapHint) tapHint.style.display = 'none';
    return;
  }

  const msg = document.createElement('div');
  msg.className = 'phone-msg phone-msg--out';
  msg.textContent = phone.messages[msgIndex];
  thread.appendChild(msg);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => msg.classList.add('is-visible'));
  });

  // Scroll to bottom
  thread.scrollTop = thread.scrollHeight;

  msgIndex++;

  // If last message, prompt send
  if (msgIndex >= phone.messages.length) {
    sendArea.classList.add('is-active');
    if (tapHint) tapHint.style.display = 'none';
  }
}

/**
 * Hide and reset the phone UI (called on scene exit/retry).
 */
export function deactivatePhoneUI() {
  const phoneUI = document.getElementById('phone-ui');
  const thread  = document.getElementById('phone-thread');
  const sendArea = document.getElementById('phone-send-area');

  if (phoneUI) phoneUI.classList.remove('is-active');
  if (thread) thread.innerHTML = '';
  if (sendArea) sendArea.classList.remove('is-active');
  msgIndex = 0;
  phoneReady = false;
}
