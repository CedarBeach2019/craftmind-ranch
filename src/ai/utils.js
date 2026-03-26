/**
 * @module craftmind-ranch/ai/utils
 * @description Shared utilities for ranch AI modules.
 */

export function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v));
}

export function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
