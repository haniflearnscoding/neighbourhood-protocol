/**
 * scene2.js — The Witness
 * Manages camera viewfinder UI: steady (success) or retreating (failure).
 */

let timecodeInterval = null;

/**
 * Activate camera REC indicators.
 */
export function activateCameraUI() {
  const rec       = document.getElementById('camera-rec');
  const timecode  = document.getElementById('camera-timecode');

  if (rec)      rec.classList.add('is-recording');
  if (timecode) {
    timecode.classList.add('is-recording');
    startTimecode(timecode);
  }
}

/**
 * Play success state: camera remains steady.
 * @param {Function} onComplete — callback after brief pause
 */
export function cameraSuccess(onComplete) {
  const frame = document.getElementById('camera-frame');
  if (frame) {
    frame.classList.add('steady');
  }
  // Short pause to let user register success before overlay
  setTimeout(onComplete, 1200);
}

/**
 * Play failure state: camera shakes then retreats.
 * @param {Function} onComplete — callback after animation ends
 */
export function cameraFailure(onComplete) {
  const frame    = document.getElementById('camera-frame');
  const rec      = document.getElementById('camera-rec');
  const timecode = document.getElementById('camera-timecode');

  if (!frame) { onComplete(); return; }

  // Stop REC indicators
  if (rec)      rec.classList.remove('is-recording');
  if (timecode) timecode.classList.remove('is-recording');
  stopTimecode();

  // Shake first
  frame.classList.add('shaking');
  frame.addEventListener('animationend', () => {
    frame.classList.remove('shaking');
    // Then retreat
    frame.classList.add('retreating');
    setTimeout(onComplete, 1400);
  }, { once: true });
}

/**
 * Reset camera UI for retry/exit.
 */
export function deactivateCameraUI() {
  const frame    = document.getElementById('camera-frame');
  const rec      = document.getElementById('camera-rec');
  const timecode = document.getElementById('camera-timecode');

  if (frame) frame.classList.remove('steady', 'retreating', 'shaking');
  if (rec) rec.classList.remove('is-recording');
  if (timecode) timecode.classList.remove('is-recording');
  stopTimecode();
}

// ── Timecode helpers ────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function startTimecode(el) {
  let seconds = 0;
  timecodeInterval = setInterval(() => {
    seconds++;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, 1000);
}

function stopTimecode() {
  if (timecodeInterval) {
    clearInterval(timecodeInterval);
    timecodeInterval = null;
  }
}
