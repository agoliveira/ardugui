import {
  Plug, LayoutGrid, Cable, Cpu, Radio, ToggleLeft, Fan, Gauge,
  LineChart, Navigation, ShieldAlert, MonitorSmartphone,
  ArrowRightLeft, Terminal,
} from 'lucide-react';
import type { PageId } from './Layout';

interface SidebarProps {
  activePage: PageId;
  visiblePages: string[];
  onPageChange: (page: PageId) => void;
  isConnected: boolean;
}

interface NavItem { id: PageId; label: string; icon: React.ElementType; }

const allNavItems: NavItem[] = [
  { id: 'connect', label: 'Connect', icon: Plug },
  { id: 'frame', label: 'Frame', icon: LayoutGrid },
  { id: 'ports', label: 'Ports', icon: Cable },
  { id: 'configuration', label: 'Configuration', icon: Cpu },
  { id: 'receiver', label: 'Receiver', icon: Radio },
  { id: 'modes', label: 'Modes', icon: ToggleLeft },
  { id: 'motors', label: 'Motors', icon: Fan },
  { id: 'calibration', label: 'Calibration', icon: Gauge },
  { id: 'pid_tuning', label: 'PID Tuning', icon: LineChart },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'failsafes', label: 'Failsafes', icon: ShieldAlert },
  { id: 'osd', label: 'OSD', icon: MonitorSmartphone },
  { id: 'transitions', label: 'Transitions', icon: ArrowRightLeft },
  { id: 'cli', label: 'CLI', icon: Terminal },
];

export function Sidebar({ activePage, visiblePages, onPageChange }: SidebarProps) {
  const navItems = allNavItems.filter((item) => visiblePages.includes(item.id));

  return (
    <nav className="flex w-[var(--spacing-sidebar)] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
          <span className="text-sm font-black text-black">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-wide text-foreground">ArduGUI</span>
        </div>
        <span className="ml-auto rounded bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-subtle">
          v0.1
        </span>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onPageChange(item.id)}
              className={`
                group flex items-center gap-3.5 rounded-xl px-4 py-3 text-left
                text-[15px] font-semibold transition-all duration-100
                ${isActive
                  ? 'bg-sidebar-active text-foreground border-l-4 border-accent pl-3 shadow-lg shadow-black/20'
                  : 'text-muted hover:bg-sidebar-hover hover:text-foreground'
                }
              `}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75}
                className={`shrink-0 ${isActive ? 'text-accent' : 'text-subtle group-hover:text-muted'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
