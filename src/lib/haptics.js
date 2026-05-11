/**
 * Haptic feedback utility using the Vibration API.
 * All functions are no-ops if the API is unavailable (e.g. iOS, desktop).
 */

const canVibrate = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;

/** Urgent SOS pattern: three short-long-short bursts (like · · · — — — · · ·) */
export function vibratePanic() {
  if (!canVibrate()) return;
  // Short-short-short — Long-Long-Long — Short-Short-Short (SOS morse)
  navigator.vibrate([100, 80, 100, 80, 100, 200, 300, 80, 300, 80, 300, 200, 100, 80, 100, 80, 100]);
}

/** Ringing phone pattern: repeating double-pulse to simulate phone ringing */
export function vibrateRinging() {
  if (!canVibrate()) return;
  // Double buzz, pause, repeat (3 cycles)
  navigator.vibrate([200, 100, 200, 800, 200, 100, 200, 800, 200, 100, 200]);
}

/** Single short confirmation buzz */
export function vibrateConfirm() {
  if (!canVibrate()) return;
  navigator.vibrate(60);
}

/** Stop any ongoing vibration */
export function vibrateStop() {
  if (!canVibrate()) return;
  navigator.vibrate(0);
}