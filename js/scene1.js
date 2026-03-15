/**
 * scene1.js — The Lookout
 * Warn Leo path: show phone illustration + SEND button.
 */

export function activatePhoneUI(onSend) {
  const img     = document.getElementById('scene1-img');
  const footer  = document.getElementById('scene1-overlay-footer');
  const choices = document.getElementById('scene1-choices');
  const prompt  = document.querySelector('#screen-scene1 .scene-prompt');
  const narrative = document.querySelector('#screen-scene1 .scene-narrative');

  // Hide choice UI
  if (choices)   choices.style.display   = 'none';
  if (prompt)    prompt.style.display    = 'none';
  if (narrative) narrative.style.display = 'none';

  // Crossfade to phone illustration
  img.classList.add('is-swapping');
  setTimeout(() => {
    img.src = 'assets/images/xd/Scene 1 - Warning2.png';
    img.classList.remove('is-swapping');
  }, 600);

  // SEND button in footer
  footer.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'btn btn--large';
  btn.textContent = 'SEND';
  footer.appendChild(btn);
  footer.style.display = 'flex';

  btn.addEventListener('click', () => {
    footer.style.display = 'none';
    footer.innerHTML = '';
    onSend();
  }, { once: true });
}

export function deactivatePhoneUI() {
  const footer    = document.getElementById('scene1-overlay-footer');
  const choices   = document.getElementById('scene1-choices');
  const prompt    = document.querySelector('#screen-scene1 .scene-prompt');
  const narrative = document.querySelector('#screen-scene1 .scene-narrative');
  if (footer)    { footer.style.display = 'none'; footer.innerHTML = ''; }
  if (choices)   choices.style.display   = '';
  if (prompt)    prompt.style.display    = '';
  if (narrative) narrative.style.display = '';
}
