/**
 * zoomStore.ts -- UI zoom level control.
 *
 * Uses Electron's webFrame.setZoomFactor() to scale the entire UI
 * uniformly -- text, icons, SVGs, borders, everything. Persisted
 * to localStorage. Keyboard shortcuts: Ctrl+Plus, Ctrl+Minus, Ctrl+0.
 */

import { create } from 'zustand';

const STORAGE_KEY = 'ardugui-zoom';
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.0;
const STEP = 0.1;
const DEFAULT_ZOOM = 1.0;

function getInitialZoom(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val) && val >= MIN_ZOOM && val <= MAX_ZOOM) return val;
    }
  } catch { /* ignore */ }
  return DEFAULT_ZOOM;
}

function applyZoom(factor: number) {
  try {
    window.electronAPI?.zoom.set(factor);
    localStorage.setItem(STORAGE_KEY, factor.toFixed(2));
  } catch { /* not in Electron or zoom unavailable */ }
}

interface ZoomState {
  factor: number;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  setZoom: (factor: number) => void;
}

export const useZoomStore = create<ZoomState>((set, get) => ({
  factor: getInitialZoom(),

  zoomIn: () => {
    const next = Math.min(MAX_ZOOM, Math.round((get().factor + STEP) * 10) / 10);
    applyZoom(next);
    set({ factor: next });
  },

  zoomOut: () => {
    const next = Math.max(MIN_ZOOM, Math.round((get().factor - STEP) * 10) / 10);
    applyZoom(next);
    set({ factor: next });
  },

  reset: () => {
    applyZoom(DEFAULT_ZOOM);
    set({ factor: DEFAULT_ZOOM });
  },

  setZoom: (factor: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(factor * 10) / 10));
    applyZoom(clamped);
    set({ factor: clamped });
  },
}));

// Apply saved zoom on load
applyZoom(getInitialZoom());

// Keyboard shortcuts: Ctrl+Plus, Ctrl+Minus, Ctrl+0
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const store = useZoomStore.getState();
    if (e.key === '=' || e.key === '+') { e.preventDefault(); store.zoomIn(); }
    else if (e.key === '-') { e.preventDefault(); store.zoomOut(); }
    else if (e.key === '0') { e.preventDefault(); store.reset(); }
  });
}
