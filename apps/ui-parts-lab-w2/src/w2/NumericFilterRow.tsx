import { useState, useRef, useEffect } from "react";
import {
  TRUST_FILTER_DIM_META,
  VECTOR_DIM_META,
  VECTOR_DIRECTION_LABEL,
  type NumericFilterDraftEntry,
  type TrustFilterKey,
  type VectorDimensionKey,
  type VectorDirection,
  type VectorDimMeta,
} from "./preference-profile-lab";

export type NumericRowKey = VectorDimensionKey | TrustFilterKey;

export function rowMeta(key: NumericRowKey): VectorDimMeta {
  if (key === "karma" || key === "market_good_count" || key === "market_bad_count") {
    return TRUST_FILTER_DIM_META[key];
  }
  return VECTOR_DIM_META[key];
}

function sliderRangeForRow(key: NumericRowKey, displayVal: number): { min: number; max: number } {
  const meta = rowMeta(key);
  const soft = meta.sliderSoftMax ?? meta.max ?? 100;
  const floor = displayVal > 0 ? displayVal : soft * 0.55;
  return {
    min: meta.min,
    max: Math.max(soft, floor, meta.min),
  };
}

function formatRowLabel(key: NumericRowKey): string {
  const meta = rowMeta(key);
  return meta.unit ? `${meta.label} ${meta.unit}` : meta.label;
}

function directionLabel(key: NumericRowKey, direction: VectorDirection): string {
  if (direction === "lte" && key === "price_yen") return "以下（予算）";
  return VECTOR_DIRECTION_LABEL[direction];
}

const DIRECTION_OPTIONS: VectorDirection[] = ["gte", "lte", "near"];

type DirectionControlProps = {
  rowKey: NumericRowKey;
  value: VectorDirection;
  onChange: (next: VectorDirection) => void;
};

/** Visible direction chip + disclosed menu — current state always readable (not native select). */
function DirectionControl({ rowKey, value, onChange }: DirectionControlProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const currentLabel = directionLabel(rowKey, value);

  return (
    <div
      ref={rootRef}
      className="obs-direction-control"
      data-testid={`obs-direction-${rowKey}`}
    >
      <button
        type="button"
        className="obs-direction-control__chip"
        aria-label={`${rowMeta(rowKey).label}の方向: ${currentLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="obs-direction-control__chip-label">{currentLabel}</span>
        <span className="obs-direction-control__chip-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="obs-direction-control__menu" role="listbox" aria-label="方向を選択">
          {DIRECTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              className={
                opt === value
                  ? "obs-direction-control__option obs-direction-control__option--active"
                  : "obs-direction-control__option"
              }
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {directionLabel(rowKey, opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type NumericFilterRowProps = {
  rowKey: NumericRowKey;
  entry: NumericFilterDraftEntry;
  learnedHint: string | null;
  onChange: (next: NumericFilterDraftEntry) => void;
};

/**
 * W2 shared primitive — one row for all numeric filter dimensions (05a · UI builder registry).
 * body_length_mm · horn_length_mm · price_yen · karma · market_good_count · market_bad_count
 */
export function NumericFilterRow({ rowKey, entry, learnedHint, onChange }: NumericFilterRowProps) {
  const meta = rowMeta(rowKey);
  const hasValue = entry.value !== null && Number.isFinite(entry.value);
  const softHint = meta.sliderSoftMax ?? meta.max ?? 50;
  const emptyHint = meta.min < 0 ? 0 : softHint * 0.55;
  const displayVal = hasValue ? entry.value! : emptyHint;
  const { min: sliderMin, max: sliderMax } = sliderRangeForRow(rowKey, hasValue ? displayVal : 0);
  const uncapped = meta.max === undefined;
  const inputId = `obs-filter-${rowKey}`;

  const commitValue = (raw: number) => {
    if (!Number.isFinite(raw)) return;
    const floor = meta.min;
    const capped = meta.max !== undefined ? Math.min(meta.max, Math.max(floor, raw)) : Math.max(floor, raw);
    onChange({ ...entry, value: capped });
  };

  return (
    <div className="obs-numeric-filter-row" data-testid={`obs-filter-row-${rowKey}`}>
      <div className="obs-numeric-filter-row__head">
        <label htmlFor={inputId} className="obs-numeric-filter-row__label">
          {formatRowLabel(rowKey)}
        </label>
        {learnedHint && <span className="obs-numeric-filter-row__hint">学習 {learnedHint}</span>}
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={meta.step}
        value={displayVal}
        aria-label={`${meta.label}の閾値（スライダー）`}
        onChange={(e) => commitValue(Number(e.target.value))}
        className="obs-numeric-filter-row__slider"
      />
      <div className="obs-numeric-filter-row__controls">
        <input
          id={inputId}
          type="number"
          min={meta.min}
          max={uncapped ? undefined : meta.max}
          step={meta.step}
          value={hasValue ? entry.value! : ""}
          aria-label={`${meta.label}の数値`}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              onChange({ ...entry, value: null });
              return;
            }
            commitValue(Number(raw));
          }}
          className="obs-numeric-filter-row__number"
        />
        <DirectionControl
          rowKey={rowKey}
          value={entry.direction}
          onChange={(direction) => onChange({ ...entry, direction })}
        />
      </div>
    </div>
  );
}
