/**
 * scene2.js — The Witness
 * Handles the intermediate "filming" view before success.
 */

export function activateFilmingView(onRecord) {
  const choices = document.getElementById('scene2-choices');
  const prompt  = document.querySelector('#screen-scene2 .scene-prompt');
  const footer  = document.getElementById('scene2-overlay-footer');
  const cop             = document.getElementById('scene2-cop');
  const cameraVignette  = document.getElementById('scene2-camera-vignette');
  const cameraFrame     = document.getElementById('scene2-camera-frame');

  // Hide choices UI
  if (choices) choices.style.display = 'none';
  if (prompt)  prompt.style.display  = 'none';

  // Swap ICE overlay: hide old, show cop variant
  ['scene2-user-calm', 'scene2-user-shocked', 'scene2-ice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-visible');
  });
  if (cop) cop.classList.add('is-visible');

  // Fade in both camera overlays — vignette darkens edges, frame shows UI
  if (cameraVignette) cameraVignette.classList.add('is-visible');
  if (cameraFrame)    cameraFrame.classList.add('is-visible');

  // Show "Click to record" button
  footer.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'btn btn--dark';
  btn.textContent = 'Click to record';
  footer.appendChild(btn);
  footer.style.display = 'flex';

  btn.addEventListener('click', () => {
    footer.style.display = 'none';
    footer.innerHTML = '';
    onRecord();
  }, { once: true });
}
