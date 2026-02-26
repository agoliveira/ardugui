import { ExternalLink } from 'lucide-react';
import type { BoardDef, BoardConnector } from '@/models/boardRegistry';

interface BoardDiagramProps {
  board: BoardDef;
}

// Color coding for connector types
function connectorColor(c: BoardConnector): string {
  if (c.serialPort?.includes('SERIAL0')) return '#60a5fa'; // USB - blue
  if (c.defaultProtocol === 'GPS') return '#ffcc66'; // GPS - marigold
  if (c.defaultProtocol === 'MAVLink') return '#34d399'; // Telemetry - green
  if (c.label.includes('POWER') || c.label.includes('BAT')) return '#f87171'; // Power - red
  if (c.label.includes('RC') || c.label.includes('RX')) return '#c084fc'; // RC - purple
  if (c.label.includes('OUT') || c.label.includes('S1')) return '#fb923c'; // PWM - orange
  if (c.label.includes('CAN')) return '#2dd4bf'; // CAN - teal
  return '#94a3b8'; // Default - gray
}

export function BoardDiagram({ board }: BoardDiagramProps) {
  const topConns = board.connectors.filter((c) => c.side === 'top').sort((a, b) => a.order - b.order);
  const bottomConns = board.connectors.filter((c) => c.side === 'bottom').sort((a, b) => a.order - b.order);
  const leftConns = board.connectors.filter((c) => c.side === 'left').sort((a, b) => a.order - b.order);
  const rightConns = board.connectors.filter((c) => c.side === 'right').sort((a, b) => a.order - b.order);

  // SVG dimensions
  const svgW = 600;
  const svgH = 320;
  const boardX = 120;
  const boardY = 80;
  const boardW = 360;
  const boardH = 160;
  const connR = 5; // connector circle radius
  const labelOffset = 20;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{board.name}</h3>
          <p className="text-base text-muted">{board.description} -- {board.mcu}</p>
        </div>
        <a
          href={board.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost h-7 gap-1 px-2.5 text-[13px]"
          title="Open ArduPilot Wiki"
        >
          <ExternalLink size={11} />
          Wiki
        </a>
      </div>

      {/* SVG Diagram */}
      <div className="bg-surface-0 px-4 py-4">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="mx-auto w-full max-w-[600px]"
          style={{ fontFamily: 'ui-monospace, monospace' }}
        >
          {/* Board body */}
          <rect
            x={boardX}
            y={boardY}
            width={boardW}
            height={boardH}
            rx={8}
            fill="#1a1816"
            stroke="#334155"
            strokeWidth={2}
          />

          {/* Board label */}
          <text
            x={boardX + boardW / 2}
            y={boardY + boardH / 2 - 8}
            textAnchor="middle"
            fill="#64748b"
            fontSize={14}
            fontWeight={600}
          >
            {board.name}
          </text>
          <text
            x={boardX + boardW / 2}
            y={boardY + boardH / 2 + 10}
            textAnchor="middle"
            fill="#475569"
            fontSize={10}
          >
            {board.manufacturer}
          </text>

          {/* Mounting holes */}
          {board.formFactor !== 'mini' && (
            <>
              <circle cx={boardX + 12} cy={boardY + 12} r={4} fill="none" stroke="#475569" strokeWidth={1} />
              <circle cx={boardX + boardW - 12} cy={boardY + 12} r={4} fill="none" stroke="#475569" strokeWidth={1} />
              <circle cx={boardX + 12} cy={boardY + boardH - 12} r={4} fill="none" stroke="#475569" strokeWidth={1} />
              <circle cx={boardX + boardW - 12} cy={boardY + boardH - 12} r={4} fill="none" stroke="#475569" strokeWidth={1} />
            </>
          )}

          {/* Top connectors */}
          {topConns.map((c, i) => {
            const spacing = boardW / (topConns.length + 1);
            const cx = boardX + spacing * (i + 1);
            const cy = boardY;
            const color = connectorColor(c);
            return (
              <g key={`top-${i}`}>
                {/* Line from board edge to label */}
                <line x1={cx} y1={cy} x2={cx} y2={cy - labelOffset + connR} stroke={color} strokeWidth={1.5} opacity={0.5} />
                {/* Connector dot */}
                <circle cx={cx} cy={cy} r={connR} fill={color} />
                {/* Label */}
                <text
                  x={cx}
                  y={cy - labelOffset - 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                  fontWeight={600}
                >
                  {c.label}
                </text>
                {c.serialPort && (
                  <text
                    x={cx}
                    y={cy - labelOffset - 16}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={7}
                  >
                    {c.serialPort}
                  </text>
                )}
              </g>
            );
          })}

          {/* Bottom connectors */}
          {bottomConns.map((c, i) => {
            const spacing = boardW / (bottomConns.length + 1);
            const cx = boardX + spacing * (i + 1);
            const cy = boardY + boardH;
            const color = connectorColor(c);
            return (
              <g key={`bot-${i}`}>
                <line x1={cx} y1={cy} x2={cx} y2={cy + labelOffset - connR} stroke={color} strokeWidth={1.5} opacity={0.5} />
                <circle cx={cx} cy={cy} r={connR} fill={color} />
                <text
                  x={cx}
                  y={cy + labelOffset + 8}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                  fontWeight={600}
                >
                  {c.label}
                </text>
                {c.serialPort && (
                  <text
                    x={cx}
                    y={cy + labelOffset + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={7}
                  >
                    {c.serialPort}
                  </text>
                )}
              </g>
            );
          })}

          {/* Left connectors */}
          {leftConns.map((c, i) => {
            const spacing = boardH / (leftConns.length + 1);
            const cx = boardX;
            const cy = boardY + spacing * (i + 1);
            const color = connectorColor(c);
            return (
              <g key={`left-${i}`}>
                <line x1={cx} y1={cy} x2={cx - labelOffset + connR} y2={cy} stroke={color} strokeWidth={1.5} opacity={0.5} />
                <circle cx={cx} cy={cy} r={connR} fill={color} />
                <text
                  x={cx - labelOffset - 4}
                  y={cy - 4}
                  textAnchor="end"
                  fill={color}
                  fontSize={9}
                  fontWeight={600}
                >
                  {c.label}
                </text>
                {c.serialPort && (
                  <text
                    x={cx - labelOffset - 4}
                    y={cy + 8}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize={7}
                  >
                    {c.serialPort}
                  </text>
                )}
              </g>
            );
          })}

          {/* Right connectors */}
          {rightConns.map((c, i) => {
            const spacing = boardH / (rightConns.length + 1);
            const cx = boardX + boardW;
            const cy = boardY + spacing * (i + 1);
            const color = connectorColor(c);
            return (
              <g key={`right-${i}`}>
                <line x1={cx} y1={cy} x2={cx + labelOffset - connR} y2={cy} stroke={color} strokeWidth={1.5} opacity={0.5} />
                <circle cx={cx} cy={cy} r={connR} fill={color} />
                <text
                  x={cx + labelOffset + 4}
                  y={cy - 4}
                  textAnchor="start"
                  fill={color}
                  fontSize={9}
                  fontWeight={600}
                >
                  {c.label}
                </text>
                {c.serialPort && (
                  <text
                    x={cx + labelOffset + 4}
                    y={cy + 8}
                    textAnchor="start"
                    fill="#64748b"
                    fontSize={7}
                  >
                    {c.serialPort}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* UART Mapping table */}
      <div className="border-t border-border px-5 py-3">
        <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-subtle">
          UART Mapping
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
          {Object.entries(board.uartMap).map(([serial, physical]) => (
            <div key={serial} className="flex items-center gap-2 text-[13px]">
              <span className="font-mono font-medium text-accent">{serial}</span>
              <span className="text-subtle">→</span>
              <span className="text-muted">{physical}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
