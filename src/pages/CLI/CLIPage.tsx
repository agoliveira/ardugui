import { useMemo } from 'react';
import { Search, Download, Upload } from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useConnectionStore } from '@/store/connectionStore';

export function CLIPage() {
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);
  const searchQuery = useParameterStore((s) => s.searchQuery);
  const setSearchQuery = useParameterStore((s) => s.setSearchQuery);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const isConnected = useConnectionStore((s) => s.status === 'connected');

  // Filter and sort parameters
  const filteredParams = useMemo(() => {
    const entries = Array.from(parameters.values());
    if (!searchQuery.trim()) return entries.sort((a, b) => a.name.localeCompare(b.name));

    const query = searchQuery.toLowerCase();
    return entries
      .filter((p) => p.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [parameters, searchQuery]);

  const paramState = useParameterStore.getState();

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">CLI</h1>
          <p className="mt-0.5 text-base text-muted">
            Full parameter list.{' '}
            {parameters.size > 0 && (
              <span className="text-subtle">
                {filteredParams.length} of {parameters.size} parameters
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost h-8 text-[13px]">
            <Upload size={12} />
            Import .param
          </button>
          <button className="btn btn-ghost h-8 text-[13px]">
            <Download size={12} />
            Export .param
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search parameters... (e.g. ATC_RAT, BATT, GPS)"
          className="input-field w-full pl-9"
        />
      </div>

      {/* Parameter table */}
      {parameters.size === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-base text-muted">
              {isConnected
                ? 'Loading parameters...'
                : 'Connect to a flight controller to view parameters.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-surface-1">
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-subtle">
                  #
                </th>
                <th className="px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-subtle">
                  Parameter
                </th>
                <th className="px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-subtle">
                  Value
                </th>
                <th className="px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-subtle">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParams.map((param) => {
                const isDirty = dirtyParams.has(param.name);
                const effectiveValue = getEffectiveValue(paramState, param.name);

                return (
                  <tr
                    key={param.name}
                    className={`border-b border-border/50 transition-colors hover:bg-surface-1 ${
                      isDirty ? 'param-dirty' : ''
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-[15px] text-subtle">
                      {param.index}
                    </td>
                    <td className="px-4 py-2 font-mono text-base font-semibold text-foreground">
                      {param.name}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={effectiveValue ?? param.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setParamLocal(param.name, val);
                          }
                        }}
                        step="any"
                        className="input-field w-32 py-1 font-mono text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-[15px] text-subtle">
                      {param.type}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
