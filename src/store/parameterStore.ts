import { create } from 'zustand';

export type ParamType =
  | 'UINT8'
  | 'INT8'
  | 'UINT16'
  | 'INT16'
  | 'UINT32'
  | 'INT32'
  | 'FLOAT';

export interface ParameterEntry {
  name: string;
  value: number;
  type: ParamType;
  index: number;
}

export interface ParameterState {
  /** All parameters received from the FC, keyed by name */
  parameters: Map<string, ParameterEntry>;

  /** Parameters modified in the UI but not yet written to FC */
  dirtyParams: Map<string, number>;

  /** Whether parameters have been fully loaded */
  loaded: boolean;

  /** Search/filter query for CLI tab */
  searchQuery: string;

  // Actions
  setParameter: (entry: ParameterEntry) => void;
  setParameters: (entries: ParameterEntry[]) => void;
  setParamLocal: (name: string, value: number) => void;
  clearDirty: (name: string) => void;
  clearAllDirty: () => void;
  revertAll: () => void;
  setLoaded: (loaded: boolean) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useParameterStore = create<ParameterState>((set) => ({
  parameters: new Map(),
  dirtyParams: new Map(),
  loaded: false,
  searchQuery: '',

  setParameter: (entry) =>
    set((state) => {
      const params = new Map(state.parameters);
      params.set(entry.name, entry);
      return { parameters: params };
    }),

  setParameters: (entries) =>
    set(() => {
      const params = new Map<string, ParameterEntry>();
      for (const entry of entries) {
        params.set(entry.name, entry);
      }
      return { parameters: params, loaded: true };
    }),

  setParamLocal: (name, value) =>
    set((state) => {
      const dirty = new Map(state.dirtyParams);
      const original = state.parameters.get(name);
      if (original && original.value === value) {
        dirty.delete(name);
      } else {
        dirty.set(name, value);
      }
      return { dirtyParams: dirty };
    }),

  clearDirty: (name) =>
    set((state) => {
      const dirty = new Map(state.dirtyParams);
      dirty.delete(name);
      return { dirtyParams: dirty };
    }),

  clearAllDirty: () => set({ dirtyParams: new Map() }),

  revertAll: () => set({ dirtyParams: new Map() }),

  setLoaded: (loaded) => set({ loaded }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  reset: () =>
    set({
      parameters: new Map(),
      dirtyParams: new Map(),
      loaded: false,
      searchQuery: '',
    }),
}));

/**
 * Get the effective value of a parameter (dirty value if modified, otherwise FC value).
 */
export function getEffectiveValue(
  state: ParameterState,
  name: string
): number | undefined {
  if (state.dirtyParams.has(name)) {
    return state.dirtyParams.get(name);
  }
  return state.parameters.get(name)?.value;
}
