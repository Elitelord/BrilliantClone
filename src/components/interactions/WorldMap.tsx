import { useEffect, useMemo, useRef, useState } from 'react';
import { geoEqualEarth } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import PyramidMini from './PyramidMini';
import { STAGE_CHIP_STYLE, STAGE_NAMES, STAGE_PYRAMID_PROFILES, nirPercent } from '../../lib/dtm';
import { getMapCountries, type MapCountry } from '../../lib/worldCountries';
import type { ValidationResult, WorldMapAnswer, WorldMapConfig } from '../../types/content';
import type { WorldMapState } from '../../types/interaction';

interface Props {
  config: WorldMapConfig;
  onChange: (s: WorldMapState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
  answer?: WorldMapAnswer;
}

const GEO_URL = '/geo/world-110m.json';
const NEUTRAL_FILL = '#94a3b8';
const NEUTRAL_BORDER = '#64748b';

const MAP_W = 680;
const MAP_H = 340;
/** Zoom into the map canvas (scale from center). */
const MAP_SCALE = 1.55;

function clampPan(x: number, y: number): { x: number; y: number } {
  const maxX = (MAP_W * (MAP_SCALE - 1)) / 2;
  const maxY = (MAP_H * (MAP_SCALE - 1)) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}

/** Scale from canvas center, then apply pan offset. */
function mapTransform(offsetX: number, offsetY: number): string {
  const cx = MAP_W / 2;
  const cy = MAP_H / 2;
  return `translate(${cx + offsetX}, ${cy + offsetY}) scale(${MAP_SCALE}) translate(${-cx}, ${-cy})`;
}

const MAP_PROJECTION = geoEqualEarth().scale(145).center([10, 5]).translate([MAP_W / 2, MAP_H / 2]);

/** Pan offset that centers a lng/lat point in the zoomed viewport. */
function panToCoords(coords: [number, number]): { x: number; y: number } {
  const projected = MAP_PROJECTION(coords);
  if (!projected) return { x: 0, y: 0 };
  const [px, py] = projected;
  const cx = MAP_W / 2;
  const cy = MAP_H / 2;
  return clampPan(-MAP_SCALE * (px - cx), -MAP_SCALE * (py - cy));
}

function DataCard({
  country,
  compact,
  showStage,
  hidePyramidMini,
  hideBlurb,
}: {
  country: MapCountry;
  compact?: boolean;
  showStage?: boolean;
  hidePyramidMini?: boolean;
  hideBlurb?: boolean;
}) {
  const gap = country.birth - country.death;
  const nir = nirPercent(gap);
  const chip = STAGE_CHIP_STYLE[country.stage] ?? STAGE_CHIP_STYLE[4];

  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-2xl leading-none">{country.flag}</div>
          <div className="mt-1 text-base font-bold text-slate-800">{country.name}</div>
          {showStage && (
            <span
              className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: chip.bg, color: chip.text, borderColor: chip.border }}
            >
              Stage {country.stage} · {STAGE_NAMES[country.stage]}
            </span>
          )}
        </div>
        {!hidePyramidMini && (
          <PyramidMini
            widths={STAGE_PYRAMID_PROFILES[country.pyramidStage]}
            width={compact ? 72 : 88}
            height={compact ? 58 : 72}
          />
        )}
      </div>
      <div className={`mt-3 grid grid-cols-2 gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="rounded-lg bg-white px-2 py-1.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">CBR</div>
          <div className="font-bold text-blue-600">{country.birth.toFixed(1)}</div>
        </div>
        <div className="rounded-lg bg-white px-2 py-1.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">CDR</div>
          <div className="font-bold text-red-600">{country.death.toFixed(1)}</div>
        </div>
        <div className="rounded-lg bg-white px-2 py-1.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">NIR</div>
          <div className="font-bold text-slate-700">{nir >= 0 ? '+' : ''}{nir.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg bg-white px-2 py-1.5">
          <div className="text-[10px] font-semibold uppercase text-slate-400">TFR</div>
          <div className="font-bold text-slate-700">{country.tfr.toFixed(1)}</div>
        </div>
      </div>
      {!compact && !hideBlurb && (
        <p className="mt-3 text-sm leading-snug text-slate-600">{country.blurb}</p>
      )}
    </div>
  );
}

export default function WorldMap({ config, onChange, disabled, result, answer }: Props) {
  const mode = config.mode ?? 'explore';
  const isMulti = mode === 'pick-multi';
  const isPick = mode === 'pick' || isMulti;
  const hideStageColors =
    config.hideStageColors ?? (isPick || (disabled && !config.highlightId));
  const showDataCard =
    config.showDataCard ?? (mode === 'explore' && !disabled);
  const countries = getMapCountries(config.countryIds);
  const requiredCount = answer?.countryIds?.length ?? 0;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialId = disabled ? config.highlightId : undefined;
  const centerCountry = config.centerOnId ? countries.find((c) => c.id === config.centerOnId) : undefined;
  const initialPan = useMemo(
    () => (centerCountry ? panToCoords(centerCountry.coords) : { x: 0, y: 0 }),
    [centerCountry],
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pan, setPan] = useState(initialPan);
  const [panning, setPanning] = useState(false);
  const panDrag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const emitSingle = (id: string | undefined) => {
    onChangeRef.current({ selectedId: id, selectedIds: isMulti ? selectedIds : undefined, seen: !!id });
  };

  const emitMulti = (ids: string[]) => {
    onChangeRef.current({ selectedIds: ids, seen: ids.length > 0 });
  };

  useEffect(() => {
    if (isMulti) emitMulti([]);
    else emitSingle(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (disabled) {
      setSelectedId(config.highlightId);
    }
  }, [disabled, config.highlightId]);

  useEffect(() => {
    setPan(initialPan);
  }, [initialPan.x, initialPan.y]);

  const toggleMulti = (id: string) => {
    if (disabled) return;
    setSelectedIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else if (requiredCount > 0 && prev.length >= requiredCount) {
        return prev;
      } else {
        next = [...prev, id];
      };
      emitMulti(next);
      return next;
    });
  };

  const pickSingle = (id: string) => {
    if (disabled) return;
    setSelectedId(id);
    onChangeRef.current({ selectedId: id, seen: true });
  };

  const onMarkerClick = (id: string) => {
    if (disabled || suppressClickRef.current) return;
    if (isMulti) toggleMulti(id);
    else pickSingle(id);
  };

  const isSelected = (id: string) =>
    isMulti ? selectedIds.includes(id) : selectedId === id;

  const displayId = disabled ? config.highlightId ?? selectedId : selectedId;
  const displayCountry = displayId ? countries.find((c) => c.id === displayId) : undefined;
  const showResult = !!result && isPick && !disabled;
  const correctSet = new Set(answer?.countryIds ?? []);
  const canPan = !disabled;

  const clientToMapDelta = (clientX: number, clientY: number, startX: number, startY: number) => {
    const el = containerRef.current;
    if (!el) return { dx: 0, dy: 0 };
    const rect = el.getBoundingClientRect();
    const scaleX = MAP_W / rect.width;
    const scaleY = MAP_H / rect.height;
    return {
      dx: ((clientX - startX) * scaleX) / MAP_SCALE,
      dy: ((clientY - startY) * scaleY) / MAP_SCALE,
    };
  };

  const onPanPointerDown = (e: React.PointerEvent) => {
    if (!canPan || e.button !== 0) return;
    panDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: pan.x,
      baseY: pan.y,
      moved: false,
    };
    setPanning(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPanPointerMove = (e: React.PointerEvent) => {
    const drag = panDrag.current;
    if (!drag || !canPan) return;
    const { dx, dy } = clientToMapDelta(e.clientX, e.clientY, drag.startX, drag.startY);
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    setPan(clampPan(drag.baseX + dx, drag.baseY + dy));
  };

  const onPanPointerUp = (e: React.PointerEvent) => {
    if (panDrag.current?.moved) suppressClickRef.current = true;
    panDrag.current = null;
    setPanning(false);
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    if (suppressClickRef.current) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const markerRing = (country: MapCountry): string => {
    const selected = isSelected(country.id);
    const highlighted = config.highlightId === country.id && disabled;
    if (showResult && selected) {
      if (isMulti) {
        return correctSet.has(country.id) ? '#16a34a' : '#f59e0b';
      }
      return result!.correct ? '#16a34a' : '#f59e0b';
    }
    if (selected) return '#4f46e5';
    if (highlighted) return '#4f46e5';
    if (hideStageColors) return NEUTRAL_BORDER;
    return STAGE_CHIP_STYLE[country.stage]?.border ?? NEUTRAL_BORDER;
  };

  const markerFill = (country: MapCountry): string => {
    const selected = isSelected(country.id);
    if (showResult && selected) {
      if (isMulti) return correctSet.has(country.id) ? '#dcfce7' : '#fef3c7';
      return result!.correct ? '#dcfce7' : '#fef3c7';
    }
    if (selected) return hideStageColors ? '#e0e7ff' : (STAGE_CHIP_STYLE[country.stage]?.bg ?? NEUTRAL_FILL);
    if (hideStageColors) return NEUTRAL_FILL;
    return STAGE_CHIP_STYLE[country.stage]?.bg ?? NEUTRAL_FILL;
  };

  const mapHint = canPan
    ? isMulti
      ? requiredCount > 0
        ? `Drag the map to explore · tap ${requiredCount} pins (${selectedIds.length} selected)`
        : `Drag the map to explore · tap pins (${selectedIds.length} selected)`
      : isPick
        ? 'Drag the map to explore · tap a pin to select'
        : 'Drag the map to explore · tap a pin for its data'
    : null;

  const hasSideCard = showDataCard && !!displayCountry;

  return (
    <div className="w-full select-none">
      {config.caption && (
        <p className="mb-3 text-center text-sm text-slate-600">{config.caption}</p>
      )}

      <div className={hasSideCard ? 'lg:flex lg:items-start lg:gap-4' : undefined}>
        <div className={`min-w-0 ${hasSideCard ? 'lg:flex-1' : 'w-full'}`}>
          {mapHint && (
            <p className="mb-2 text-center text-xs font-medium text-slate-500">{mapHint}</p>
          )}

          <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-sky-50/40 touch-none ${
              panning ? 'cursor-grabbing' : canPan ? 'cursor-grab' : ''
            }`}
            style={{ maxHeight: 'min(240px, 42vh)' }}
            onPointerDown={onPanPointerDown}
            onPointerMove={onPanPointerMove}
            onPointerUp={onPanPointerUp}
            onPointerLeave={onPanPointerUp}
            onPointerCancel={onPanPointerUp}
          >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 145, center: [10, 5] }}
          width={MAP_W}
          height={MAP_H}
          style={{ width: '100%', height: 'auto', display: 'block', verticalAlign: 'top' }}
        >
          <g transform={mapTransform(pan.x, pan.y)}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeWidth={0.35}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#dbeafe' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {countries.map((country) => {
              const selected = isSelected(country.id);
              const r = selected || (disabled && config.highlightId === country.id) ? 8 : 6;
              return (
                <Marker key={country.id} coordinates={country.coords}>
                  <g
                    style={{ cursor: disabled ? 'default' : 'pointer' }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick(country.id);
                    }}
                    role="button"
                    aria-label={country.name}
                  >
                    <circle
                      r={r + 3}
                      fill="none"
                      stroke={markerRing(country)}
                      strokeWidth={selected ? 2.5 : 1.5}
                      opacity={selected || (disabled && config.highlightId === country.id) ? 1 : 0.9}
                    />
                    <circle r={r} fill={markerFill(country)} stroke="#fff" strokeWidth={1.5} />
                    {(selected || isPick) && !disabled && (
                      <text
                        textAnchor="middle"
                        y={-14}
                        fontSize={11}
                        fontWeight={700}
                        fill="#334155"
                        style={{ pointerEvents: 'none' }}
                      >
                        {country.flag}
                      </text>
                    )}
                  </g>
                </Marker>
              );
            })}
          </g>
        </ComposableMap>
          </div>

          {!disabled && mode === 'explore' && !hideStageColors && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {countries.map((c) => {
                const chip = STAGE_CHIP_STYLE[c.stage];
                return (
                  <span
                    key={c.id}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: chip.bg, color: chip.text, borderColor: chip.border }}
                  >
                    {c.flag} S{c.stage}
                  </span>
                );
              })}
            </div>
          )}

          {mode === 'pick' && selectedId && !disabled && !showDataCard && (
            <p className="mt-3 text-center text-sm font-semibold text-slate-700">
              Selected: {countries.find((c) => c.id === selectedId)?.flag}{' '}
              {countries.find((c) => c.id === selectedId)?.name}
            </p>
          )}

          {isMulti && selectedIds.length > 0 && !disabled && (
            <p className="mt-3 text-center text-sm text-slate-600">
              {selectedIds
                .map((id) => countries.find((c) => c.id === id))
                .filter(Boolean)
                .map((c) => `${c!.flag} ${c!.name}`)
                .join(' · ')}
            </p>
          )}
        </div>

        {hasSideCard && displayCountry && (
          <div className="mt-4 min-w-0 lg:mt-6 lg:w-72 lg:flex-shrink-0">
            <DataCard
              country={displayCountry}
              compact={isPick && !disabled}
              showStage={mode === 'explore' && !config.hidePyramidMini}
              hidePyramidMini={config.hidePyramidMini}
              hideBlurb={config.hideBlurb}
            />
          </div>
        )}
      </div>
    </div>
  );
}
