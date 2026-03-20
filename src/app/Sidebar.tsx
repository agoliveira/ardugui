import {
  Plug, Info, LayoutGrid, Cable, Cpu, Radio, ToggleLeft, Fan, Gauge,
  LineChart, Navigation, ShieldAlert, ShieldCheck, MonitorSmartphone,
  ArrowRightLeft, Terminal, Database, Wrench, Wand2, GitBranch, Download,
  Satellite, PlaneTakeoff, BatteryCharging, Zap,
} from 'lucide-react';
import type { PageId } from './Layout';

interface SidebarProps {
  activePage: PageId;
  visiblePages: string[];
  onPageChange: (page: PageId) => void;
  isConnected: boolean;
}

interface NavItem { id: PageId; label: string; icon: React.ElementType; accent?: boolean; }

const allNavItems: NavItem[] = [
  { id: 'connect', label: 'Connect', icon: Plug },
  { id: 'firmware', label: 'Firmware', icon: Download },
  { id: 'wizard', label: 'Setup Wizard', icon: Wand2, accent: true },
  { id: 'frame', label: 'Frame', icon: LayoutGrid },
  { id: 'motors', label: 'Motors', icon: Fan },
  { id: 'control_surfaces', label: 'Surfaces', icon: PlaneTakeoff },
  { id: 'wiring', label: 'Wiring', icon: GitBranch },
  { id: 'ports', label: 'Ports', icon: Cable },
  { id: 'receiver', label: 'Receiver', icon: Radio },
  { id: 'gps', label: 'GPS', icon: Satellite },
  { id: 'calibration', label: 'Calibration', icon: Gauge },
  { id: 'battery', label: 'Battery', icon: BatteryCharging },
  { id: 'esc', label: 'ESC', icon: Zap },
  { id: 'modes', label: 'Modes', icon: ToggleLeft },
  { id: 'failsafes', label: 'Failsafes', icon: ShieldAlert },
  { id: 'pid_tuning', label: 'PID Tuning', icon: LineChart },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'configuration', label: 'Configuration', icon: Cpu },
  { id: 'osd', label: 'OSD', icon: MonitorSmartphone },
  { id: 'transitions', label: 'Transitions', icon: ArrowRightLeft },
  { id: 'my_aircraft', label: 'My Aircraft', icon: Database },
  { id: 'preflight', label: 'Pre-flight', icon: ShieldCheck },
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
          const isAccent = item.accent && !isActive;
          return (
            <button key={item.id} onClick={() => onPageChange(item.id)}
              className={`
                group flex items-center gap-2.5 rounded px-2.5 py-1.5 text-left
                text-[12.5px] font-medium transition-all duration-75
                border-l-2
                ${isActive
                  ? 'border-accent bg-sidebar-active text-foreground font-semibold'
                  : isAccent
                    ? 'border-transparent text-accent hover:bg-accent/10 font-semibold'
                    : 'border-transparent text-subtle hover:bg-sidebar-hover hover:text-muted'
                }
              `}>
              <Icon size={15} strokeWidth={isActive || isAccent ? 2.25 : 1.75}
                className={`shrink-0 ${isActive ? 'text-accent' : isAccent ? 'text-accent' : 'text-subtle group-hover:text-muted'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
