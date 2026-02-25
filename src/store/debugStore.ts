import { create } from 'zustand';

export interface DebugMessage {
  id: number;
  time: number;        // performance.now() ms
  msgId: number;
  msgName: string;
  direction: 'in' | 'out';
  length: number;
  summary: string;     // decoded one-liner
}

const MAX_MESSAGES = 2000;

let nextId = 0;

interface DebugState {
  enabled: boolean;
  messages: DebugMessage[];
  paused: boolean;
  filter: string;      // msg name filter

  // Actions
  toggle: () => void;
  setPaused: (p: boolean) => void;
  setFilter: (f: string) => void;
  log: (msg: Omit<DebugMessage, 'id' | 'time'>) => void;
  clear: () => void;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  enabled: false,
  messages: [],
  paused: false,
  filter: '',

  toggle: () => set((s) => ({ enabled: !s.enabled })),
  setPaused: (paused) => set({ paused }),
  setFilter: (filter) => set({ filter }),

  log: (msg) => {
    const state = get();
    if (!state.enabled || state.paused) return;
    const entry: DebugMessage = {
      ...msg,
      id: nextId++,
      time: performance.now(),
    };
    set((s) => ({
      messages:
        s.messages.length >= MAX_MESSAGES
          ? [...s.messages.slice(-MAX_MESSAGES + 1), entry]
          : [...s.messages, entry],
    }));
  },

  clear: () => set({ messages: [] }),
}));
