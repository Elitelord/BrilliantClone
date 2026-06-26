import { useEffect, useRef, useState } from 'react';
import type { MatchPairsConfig, MatchTile, ValidationResult } from '../../types/content';
import type { MatchPairsState } from '../../types/interaction';
import AnomalyPyramidMini from './AnomalyPyramidMini';

interface Props {
  config: MatchPairsConfig;
  onChange: (s: MatchPairsState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
}

// slot id -> ordered list of tile ids placed in that slot.
type Placements = Record<string, string[]>;

export default function MatchPairs({ config, onChange, disabled, result }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // multiPerTile: one tile can live in several slots at once (e.g. a scenario that
  // is both a push factor AND forced migration). multiPerSlot: a slot holds many
  // tiles but each tile lives in exactly one slot. `bucket` = render slots as
  // multi-chip drop zones (true for either multi mode).
  const multiTile = !!config.multiPerTile;
  const multiSlot = !!config.multiPerSlot;
  const bucket = multiTile || multiSlot;
  // multiPerTile: optional cap on how many categories one tile may occupy.
  const maxPerTile = multiTile ? config.maxPerTile : undefined;

  const [placements, setPlacements] = useState<Placements>(() =>
    Object.fromEntries(config.slots.map((s) => [s.id, [] as string[]])),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ tileId: string; x: number; y: number } | null>(null);
  const downRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const dragTileRef = useRef<string | null>(null);
  // Which slot a chip drag started from (null = dragged from the tray). Only used
  // in multiPerTile mode, where a tile can be in multiple slots so removal/move
  // must target the specific slot the chip was dragged from.
  const dragFromSlotRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current({ placements });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (p: Placements) => {
    setPlacements(p);
    onChangeRef.current({ placements: p });
  };

  const tileById = (id: string) => config.tiles.find((t) => t.id === id);
  const slotOfTile = (tileId: string) =>
    Object.keys(placements).find((sid) => placements[sid]?.includes(tileId));
  const slotsOfTile = (tileId: string) =>
    Object.keys(placements).filter((sid) => placements[sid]?.includes(tileId));
  // In multiPerTile mode tiles can go into several categories, so they stay in the
  // tray permanently; otherwise a placed tile leaves the tray.
  const unplacedTiles = multiTile ? config.tiles : config.tiles.filter((t) => !slotOfTile(t.id));

  const placeTile = (tileId: string, slotId: string) => {
    if (multiTile) {
      // Add to this category without disturbing the tile's other categories.
      if (placements[slotId]?.includes(tileId)) return;
      if (maxPerTile != null && slotsOfTile(tileId).length >= maxPerTile) return;
      emit({ ...placements, [slotId]: [...(placements[slotId] ?? []), tileId] });
      return;
    }
    const p: Placements = Object.fromEntries(
      Object.entries(placements).map(([sid, arr]) => [sid, arr.filter((id) => id !== tileId)]),
    );
    // Single-match mode keeps one tile per slot: any occupant is bumped back to the tray.
    if (!bucket) p[slotId] = [];
    p[slotId] = [...p[slotId], tileId];
    emit(p);
  };

  const removeTile = (tileId: string) => {
    const cur = slotOfTile(tileId);
    if (!cur) return;
    emit({ ...placements, [cur]: placements[cur].filter((id) => id !== tileId) });
  };

  const removeTileFromSlot = (tileId: string, slotId: string) => {
    if (!placements[slotId]?.includes(tileId)) return;
    emit({ ...placements, [slotId]: placements[slotId].filter((id) => id !== tileId) });
  };

  // Multi-category move/add in a single emit (avoids clobbering when a chip is
  // dragged from one slot to another).
  const moveTileBetweenSlots = (tileId: string, fromSlot: string | null, toSlot: string) => {
    if (fromSlot === toSlot) return;
    // Adding a fresh membership (drag from tray) past the cap is rejected; a move
    // between slots keeps the count the same, so it is always allowed.
    if (
      !fromSlot &&
      maxPerTile != null &&
      !placements[toSlot]?.includes(tileId) &&
      slotsOfTile(tileId).length >= maxPerTile
    ) {
      return;
    }
    const next: Placements = { ...placements };
    if (fromSlot) next[fromSlot] = (next[fromSlot] ?? []).filter((id) => id !== tileId);
    if (!next[toSlot]?.includes(tileId)) next[toSlot] = [...(next[toSlot] ?? []), tileId];
    emit(next);
  };

  const onDown = (tileId: string, fromSlot?: string) => (e: React.PointerEvent) => {
    if (disabled) return;
    downRef.current = { x: e.clientX, y: e.clientY, moved: false };
    dragTileRef.current = tileId;
    dragFromSlotRef.current = fromSlot ?? null;
    setDrag({ tileId, x: e.clientX, y: e.clientY });
  };

  // Track the active drag on the window so pointer moves/drops register anywhere on
  // screen — not just while the cursor stays over the tile's original element.
  useEffect(() => {
    if (!drag) return;

    const onWindowMove = (e: PointerEvent) => {
      const down = downRef.current;
      if (down && (Math.abs(e.clientX - down.x) > 5 || Math.abs(e.clientY - down.y) > 5)) down.moved = true;
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    };

    const onWindowUp = (e: PointerEvent) => {
      const tileId = dragTileRef.current;
      const fromSlot = dragFromSlotRef.current;
      const moved = downRef.current?.moved ?? false;
      setDrag(null);
      downRef.current = null;
      dragTileRef.current = null;
      dragFromSlotRef.current = null;
      if (!tileId) return;

      // A tap (no drag): handle it as a tap, ignoring what is under the pointer.
      // (A placed tile sits inside its own slot, so a "drop" lookup would otherwise
      // just re-place it where it already is — making it impossible to move.)
      if (!moved) {
        if (multiTile) {
          // Tap a chip -> remove from that one category. Tap a tray tile -> select.
          if (fromSlot) {
            removeTileFromSlot(tileId, fromSlot);
            setSelected(null);
          } else {
            setSelected((s) => (s === tileId ? null : tileId));
          }
        } else if (slotOfTile(tileId)) {
          removeTile(tileId); // tap a placed tile -> back to the tray for re-sorting
          setSelected(null);
        } else {
          setSelected((s) => (s === tileId ? null : tileId)); // tap a tray tile -> select
        }
        return;
      }

      // A drag: drop into whatever slot is under the pointer, else send to tray.
      const slotEl = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest(
        '[data-slot]',
      ) as HTMLElement | null;
      if (slotEl) {
        const target = slotEl.getAttribute('data-slot')!;
        if (multiTile) moveTileBetweenSlots(tileId, fromSlot, target);
        else placeTile(tileId, target);
        setSelected(null);
        return;
      }
      // Dropped outside any slot.
      if (multiTile) {
        if (fromSlot) removeTileFromSlot(tileId, fromSlot);
      } else {
        removeTile(tileId);
      }
    };

    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
    return () => {
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null]);

  const onSlotClick = (slotId: string) => () => {
    if (disabled || !selected) return;
    placeTile(selected, slotId);
    // In multi-category mode keep the tile selected so it can be tapped into
    // additional categories; tap the tray tile again to deselect.
    if (!multiTile) setSelected(null);
  };

  const showResult = !!result;
  const okForTile = (tileId: string): boolean | null => {
    if (!showResult || !result?.detail) return null;
    return result.detail[tileId] ?? null;
  };
  // Whole-slot tint in single-match mode (one tile -> color the drop zone).
  const okForSlot = (slotId: string): boolean | null => {
    const tileId = placements[slotId]?.[0];
    if (!tileId) return null;
    return okForTile(tileId);
  };

  const TileVisual = ({ tile, className }: { tile: MatchTile; className?: string }) => {
    if (tile.anomalyId) {
      return (
        <AnomalyPyramidMini
          shapeId={tile.anomalyId}
          width={tile.hideLabel ? 72 : 64}
          height={tile.hideLabel ? 58 : 52}
        />
      );
    }
    if (tile.image) {
      return <img src={tile.image} alt={tile.label} draggable={false} className={className ?? 'h-12 w-12 shrink-0 object-contain'} />;
    }
    if (tile.icon) {
      return <span className={className ?? 'text-3xl leading-none'} aria-hidden>{tile.icon}</span>;
    }
    return null;
  };

  const SlotVisual = ({ slot, className }: { slot: { label: string; image?: string; icon?: string }; className?: string }) => {
    if (slot.image) {
      return <img src={slot.image} alt={slot.label} draggable={false} className={className ?? 'h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20'} />;
    }
    if (slot.icon) {
      return <span className={className ?? 'text-4xl leading-none shrink-0'} aria-hidden>{slot.icon}</span>;
    }
    return null;
  };

  // A single placed tile rendered as a draggable chip (used in bucket mode).
  const Chip = ({ tileId, slotId }: { tileId: string; slotId?: string }) => {
    const tile = tileById(tileId);
    if (!tile) return null;
    const ok = okForTile(tileId);
    return (
      <button
        type="button"
        disabled={disabled}
        onPointerDown={onDown(tile.id, slotId)}
        onClick={(e) => e.stopPropagation()}
        className={`flex touch-none cursor-grab items-center gap-1.5 rounded-lg border-2 bg-white px-2 py-1 active:cursor-grabbing ${
          ok === true
            ? 'border-emerald-400 bg-emerald-50'
            : ok === false
              ? 'border-amber-400 bg-amber-50'
              : 'border-slate-200'
        }`}
        style={{ opacity: drag?.tileId === tile.id ? 0.3 : 1 }}
      >
        <TileVisual tile={tile} className="h-7 w-7 shrink-0 object-contain" />
        {!tile.hideLabel && tile.label && (
          <span className="text-xs font-semibold text-slate-600">{tile.label}</span>
        )}
      </button>
    );
  };

  const dragTile = drag ? tileById(drag.tileId) : null;

  return (
    <div className="w-full select-none">
      {config.instruction && (
        <p className="mb-3 text-center text-sm text-slate-500">{config.instruction}</p>
      )}

      {/* tray of draggable tiles */}
      <div className="mb-4 flex min-h-[84px] flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-50 p-3">
        {unplacedTiles.length === 0 ? (
          <span className="text-sm font-medium text-slate-400">All placed — press Check.</span>
        ) : (
          unplacedTiles.map((t) => {
            const placedIn = multiTile ? slotsOfTile(t.id).length : 0;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                onPointerDown={onDown(t.id)}
                className={`relative flex touch-none cursor-grab flex-col items-center rounded-xl border-2 bg-white px-2 py-2 transition active:cursor-grabbing disabled:opacity-60 ${
                  t.hideLabel ? 'w-20' : t.anomalyId ? 'w-24' : 'min-w-[7.5rem] max-w-[9.5rem]'
                } ${
                  selected === t.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'
                }`}
                style={{ opacity: drag?.tileId === t.id ? 0.3 : 1 }}
              >
                {placedIn > 0 && (
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${
                      maxPerTile != null && placedIn >= maxPerTile ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}
                  >
                    {maxPerTile != null ? `${placedIn}/${maxPerTile}` : placedIn}
                  </span>
                )}
                <TileVisual tile={t} />
                {!t.hideLabel && t.label && (
                  <span className="mt-1 text-center text-xs font-semibold leading-tight text-slate-600">{t.label}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* slots, each with a drop zone */}
      <div className="space-y-2 sm:space-y-3">
        {config.slots.map((slot) => {
          const tiles = placements[slot.id] ?? [];
          const singleTileId = tiles[0];
          const singleTile = singleTileId ? tileById(singleTileId) : null;
          const ok = okForSlot(slot.id);
          return (
            <div
              key={slot.id}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:gap-3 sm:p-3"
            >
              <SlotVisual slot={slot} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold leading-tight text-slate-700">{slot.label}</div>
                {slot.sublabel && <div className="text-[11px] text-slate-400">{slot.sublabel}</div>}
              </div>
              {bucket ? (
                <div
                  data-slot={slot.id}
                  onClick={onSlotClick(slot.id)}
                  className={`flex min-h-[88px] w-44 shrink-0 flex-wrap content-center items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-2 transition sm:w-80 ${
                    tiles.length > 0
                      ? 'border-slate-300 bg-white'
                      : selected
                        ? 'border-brand-300 bg-brand-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {tiles.length > 0 ? (
                    tiles.map((id) => <Chip key={id} tileId={id} slotId={slot.id} />)
                  ) : (
                    <span className="px-1 text-center text-[11px] text-slate-400">Drop here</span>
                  )}
                </div>
              ) : (
                <div
                  data-slot={slot.id}
                  onClick={onSlotClick(slot.id)}
                  className={`relative flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition sm:h-20 sm:w-40 ${
                    ok === true
                      ? 'border-emerald-400 bg-emerald-50'
                      : ok === false
                        ? 'border-amber-400 bg-amber-50'
                        : singleTile
                          ? 'border-slate-300 bg-white'
                          : selected
                            ? 'border-brand-300 bg-brand-50'
                            : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {singleTile ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onPointerDown={onDown(singleTile.id)}
                      className="absolute inset-0 flex touch-none cursor-grab flex-row items-center justify-center gap-2 active:cursor-grabbing"
                      style={{ opacity: drag?.tileId === singleTile.id ? 0.3 : 1 }}
                    >
                      <TileVisual tile={singleTile} className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
                      {!singleTile.hideLabel && singleTile.label && (
                        <span className="text-xs font-semibold text-slate-600">{singleTile.label}</span>
                      )}
                    </button>
                  ) : (
                    <span className="px-1 text-center text-[11px] text-slate-400">Drop here</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* floating drag preview */}
      {drag && dragTile && (
        <div
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border-2 border-brand-400 bg-white p-2 shadow-xl"
          style={{ left: drag.x, top: drag.y }}
        >
          <TileVisual tile={dragTile} className="h-14 w-14 shrink-0 object-contain" />
          {!dragTile.hideLabel && dragTile.label && (
            <span className="text-[11px] font-semibold text-slate-600">{dragTile.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
