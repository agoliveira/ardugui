import {
  Plug, Info, LayoutGrid, Cable, Cpu, Radio, ToggleLeft, Fan, Gauge,
  LineChart, Navigation, ShieldAlert, MonitorSmartphone,
  ArrowRightLeft, Terminal, Database, Wrench,
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
  { id: 'backups', label: 'Backups', icon: Database },
  { id: 'cli', label: 'CLI', icon: Terminal },
  { id: 'expert', label: 'Expert', icon: Wrench },
];

export function Sidebar({ activePage, visiblePages, onPageChange, isConnected }: SidebarProps) {
  const navItems = allNavItems
    .filter((item) => visiblePages.includes(item.id))
    .map((item) =>
      item.id === 'connect' && isConnected
        ? { ...item, label: 'Information', icon: Info }
        : item
    );

  return (
    <nav className="flex w-[var(--spacing-sidebar)] flex-col border-r border-border bg-sidebar">
      {/* Nav items -- tight, VS Code style */}
      <div className="flex flex-1 flex-col gap-0 overflow-y-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onPageChange(item.id)}
              className={`
                group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-left
                text-[12.5px] font-medium transition-all duration-75
                border-l-2
                ${isActive
                  ? 'border-accent bg-sidebar-active text-foreground font-semibold'
                  : 'border-transparent text-subtle hover:bg-sidebar-hover hover:text-muted'
                }
              `}>
              <Icon size={15} strokeWidth={isActive ? 2.25 : 1.75}
                className={`shrink-0 ${isActive ? 'text-accent' : 'text-subtle group-hover:text-muted'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
