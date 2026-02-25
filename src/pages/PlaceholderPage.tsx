import type { PageId } from '@/app/Layout';
import {
  Cable,
  Cpu,
  Radio,
  ToggleLeft,
  Fan,
  LineChart,
  Navigation,
  ShieldAlert,
  MonitorSmartphone,
  ArrowRightLeft,
  Construction,
} from 'lucide-react';

const pageInfo: Record<
  string,
  { label: string; description: string; icon: React.ElementType }
> = {
  ports: {
    label: 'Ports',
    description: 'Serial port protocol assignment and baud rate configuration.',
    icon: Cable,
  },
  configuration: {
    label: 'Configuration',
    description:
      'Frame type, motor protocol, battery monitoring, and board orientation.',
    icon: Cpu,
  },
  receiver: {
    label: 'Receiver',
    description:
      'RC input type, channel mapping, live preview, and failsafe values.',
    icon: Radio,
  },
  modes: {
    label: 'Modes',
    description:
      'Flight mode assignment with INAV-style range sliders.',
    icon: ToggleLeft,
  },
  motors: {
    label: 'Motors',
    description:
      'Motor layout diagram, spin direction, motor test, and servo assignment.',
    icon: Fan,
  },
  pid_tuning: {
    label: 'PID Tuning',
    description:
      'Rate and angle PID adjustment with real-time graphing.',
    icon: LineChart,
  },
  navigation: {
    label: 'Navigation',
    description:
      'RTL behavior, position hold, geofence, takeoff and landing parameters.',
    icon: Navigation,
  },
  failsafes: {
    label: 'Failsafes',
    description:
      'Radio, battery, GCS, and EKF failsafe configuration.',
    icon: ShieldAlert,
  },
  osd: {
    label: 'OSD',
    description:
      'Visual OSD layout editor with drag-and-drop, HD support, and presets.',
    icon: MonitorSmartphone,
  },
  transitions: {
    label: 'Transitions',
    description:
      'VTOL transition parameters, assist thresholds, and tilt rotor configuration.',
    icon: ArrowRightLeft,
  },
};

interface PlaceholderPageProps {
  pageId: PageId;
}

export function PlaceholderPage({ pageId }: PlaceholderPageProps) {
  const info = pageInfo[pageId];

  if (!info) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted">Unknown page: {pageId}</p>
      </div>
    );
  }

  const Icon = info.icon;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-1 border border-border">
          <Icon size={28} className="text-subtle" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{info.label}</h2>
        <p className="mt-2 max-w-md text-base text-muted">{info.description}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-1 px-4 py-2 text-[15px] text-subtle">
          <Construction size={12} />
          Coming in a future phase
        </div>
      </div>
    </div>
  );
}
