import { useRef, useEffect, useState, useCallback } from 'react';
import { OsdFontRenderer } from '@/models/osdFont';
import type { OsdElement } from '@/models/osdElements';
import type { OsdElementPlacement } from '@/models/osdPresets';
import type { OsdResolution } from '@/models/osdPresets';
import { RESOLUTIONS } from '@/models/osdPresets';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CanvasElement extends OsdElementPlacement {
  element: OsdElement;
}

interface OSDCanvasProps {
  resolution: OsdResolution;
  elements: CanvasElement[];
  selectedId: string | null;
  showBackground: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SAFE_AREA_MARGIN = 1;
const GRID_COLOR = 'rgba(255, 255, 255, 0.04)';
const SAFE_AREA_COLOR = 'rgba(255, 200, 0, 0.2)';
const SAFE_AREA_LABEL_COLOR = 'rgba(255, 200, 0, 0.35)';
const SELECTED_COLOR = 'rgba(0, 180, 255, 0.5)';
const OVERLAP_COLOR = 'rgba(255, 60, 60, 0.5)';
const HOVER_COLOR = 'rgba(255, 255, 255, 0.12)';

// ─── Component ───────────────────────────────────────────────────────────────

export function OSDCanvas({
  resolution,
  elements,
  selectedId,
  showBackground,
  onSelect,
  onMove,
}: OSDCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<OsdFontRenderer | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    label: string;
    description: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
    origGridX: number;
    origGridY: number;
  } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 960, height: 540 });

  const res = RESOLUTIONS[resolution];

  const cellW = canvasSize.width / res.cols;
  const cellH = canvasSize.height / res.rows;

  // ─── Resize observer ────────────────────────────────────────────────────
  // Fit the canvas to the container using both width and height (contain fit).
  // The canvas maintains its aspect ratio and fills as much space as possible.

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const availW = Math.floor(entry.contentRect.width);
      const availH = Math.floor(entry.contentRect.height);
      if (availW <= 0 || availH <= 0) return;

      // Fit-contain: pick the dimension that constrains us
      let width = availW;
      let height = Math.floor(width / res.aspectRatio);

      if (height > availH) {
        // Height-constrained
        height = availH;
        width = Math.floor(height * res.aspectRatio);
      }

      setCanvasSize({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [res.aspectRatio]);

  // ─── Initialize font renderer (once) ───────────────────────────────────

  useEffect(() => {
    rendererRef.current = new OsdFontRenderer();
  }, []);

  // ─── Detect overlapping elements ────────────────────────────────────────

  const findOverlaps = useCallback((): Set<string> => {
    const occupied = new Map<string, string>();
    const overlapping = new Set<string>();

    for (const el of elements) {
      for (let cx = 0; cx < el.element.charWidth; cx++) {
        const key = `${el.x + cx},${el.y}`;
        const existing = occupied.get(key);
        if (existing) {
          overlapping.add(existing);
          overlapping.add(el.id);
        } else {
          occupied.set(key, el.id);
        }
      }
    }
    return overlapping;
  }, [elements]);

  // ─── Render ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    ctx.scale(dpr, dpr);

    // ── Background ──
    if (showBackground) {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
      skyGrad.addColorStop(0, '#1a2744');
      skyGrad.addColorStop(0.45, '#2c4a70');
      skyGrad.addColorStop(0.5, '#4a6840');
      skyGrad.addColorStop(1, '#2a3820');
      ctx.fillStyle = skyGrad;
    } else {
      ctx.fillStyle = '#0a0a0a';
    }
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // ── Grid lines ──
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let col = 0; col <= res.cols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * cellW, 0);
      ctx.lineTo(col * cellW, canvasSize.height);
      ctx.stroke();
    }
    for (let row = 0; row <= res.rows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * cellH);
      ctx.lineTo(canvasSize.width, row * cellH);
      ctx.stroke();
    }

    // ── Safe area guide ──
    const safeX = SAFE_AREA_MARGIN * cellW;
    const safeY = SAFE_AREA_MARGIN * cellH;
    const safeW = (res.cols - 2 * SAFE_AREA_MARGIN) * cellW;
    const safeH = (res.rows - 2 * SAFE_AREA_MARGIN) * cellH;

    ctx.strokeStyle = SAFE_AREA_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(safeX, safeY, safeW, safeH);
    ctx.setLineDash([]);

    // Label the safe area
    ctx.fillStyle = SAFE_AREA_LABEL_COLOR;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('safe area', safeX + safeW - 3, safeY + safeH - 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // ── Detect overlaps ──
    const overlaps = findOverlaps();

    // ── Render elements ──
    for (const el of elements) {
      const px = el.x * cellW;
      const py = el.y * cellH;
      const pw = el.element.charWidth * cellW;
      const ph = cellH;

      if (el.id === selectedId) {
        ctx.fillStyle = SELECTED_COLOR;
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#00b4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);
      } else if (overlaps.has(el.id)) {
        ctx.fillStyle = OVERLAP_COLOR;
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#ff3c3c';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, pw, ph);
      } else if (el.id === hoveredId) {
        ctx.fillStyle = HOVER_COLOR;
        ctx.fillRect(px, py, pw, ph);
      }

      renderer.renderString(ctx, el.element.preview, el.x, el.y, cellW, cellH);
    }
  }, [
    canvasSize,
    elements,
    selectedId,
    hoveredId,
    resolution,
    showBackground,
    cellW,
    cellH,
    res.cols,
    res.rows,
    findOverlaps,
  ]);

  // ─── Hit testing ────────────────────────────────────────────────────────

  const hitTest = useCallback(
    (clientX: number, clientY: number): CanvasElement | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const gridX = Math.floor(x / cellW);
      const gridY = Math.floor(y / cellH);

      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (
          gridX >= el.x &&
          gridX < el.x + el.element.charWidth &&
          gridY === el.y
        ) {
          return el;
        }
      }
      return null;
    },
    [elements, cellW, cellH]
  );

  // ─── Mouse handlers ────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const el = hitTest(e.clientX, e.clientY);
      onSelect(el?.id ?? null);

      if (el) {
        setDragging({
          id: el.id,
          startX: e.clientX,
          startY: e.clientY,
          origGridX: el.x,
          origGridY: el.y,
        });
        setTooltipInfo(null);
      }
    },
    [hitTest, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - dragging.startX;
        const dy = e.clientY - dragging.startY;
        const gridDx = Math.round(dx / cellW);
        const gridDy = Math.round(dy / cellH);
        const newX = Math.max(0, Math.min(res.cols - 1, dragging.origGridX + gridDx));
        const newY = Math.max(0, Math.min(res.rows - 1, dragging.origGridY + gridDy));
        onMove(dragging.id, newX, newY);
        setTooltipInfo(null);
      } else {
        const el = hitTest(e.clientX, e.clientY);
        setHoveredId(el?.id ?? null);

        if (el) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            setTooltipInfo({
              label: el.element.label,
              description: el.element.description,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
        } else {
          setTooltipInfo(null);
        }
      }
    },
    [dragging, hitTest, cellW, cellH, res.cols, res.rows, onMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setDragging(null);
    setTooltipInfo(null);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect(null);
    },
    [onSelect]
  );

  return (
    <div className="flex flex-col h-full gap-1">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center"
      >
        {/* Inner wrapper matches canvas size for correct tooltip positioning */}
        <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
          <canvas
            ref={canvasRef}
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              cursor: dragging ? 'grabbing' : hoveredId ? 'grab' : 'default',
              imageRendering: 'pixelated',
              borderRadius: 4,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
          />

          {/* Hover tooltip */}
          {tooltipInfo && !dragging && (
            <div
              className="absolute pointer-events-none px-2 py-1 rounded shadow-lg"
              style={{
                left: Math.min(tooltipInfo.x + 12, canvasSize.width - 180),
                top: tooltipInfo.y > canvasSize.height - 60
                  ? tooltipInfo.y - 40
                  : tooltipInfo.y + 16,
                backgroundColor: 'var(--color-surface-1)',
                border: '1px solid var(--color-border)',
                zIndex: 10,
                maxWidth: 200,
              }}
            >
              <div
                className="text-xs font-medium"
                style={{ color: 'var(--color-foreground)' }}
              >
                {tooltipInfo.label}
              </div>
              <div
                className="text-xs"
                style={{ color: 'var(--color-subtle)', fontSize: '10px' }}
              >
                {tooltipInfo.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
