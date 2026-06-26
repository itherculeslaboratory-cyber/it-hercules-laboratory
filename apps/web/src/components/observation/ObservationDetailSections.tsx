"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { photoAbsentMessage, type PhotoAbsentReason } from "@/lib/observation-photo";
import { formatValueOriginLabel, valueOriginTone } from "@/lib/value-origin";

export interface MeasurementRow {
  measurement_id?: string;
  name: string;
  label?: string;
  value: string | number | null;
  unit?: string | null;
  method?: string | null;
  value_origin?: string | null;
  device_id?: string | null;
  source?: string | null;
}

export interface PhotoConditionRow {
  item: string;
  value?: string | null;
  unit?: string | null;
  method?: string | null;
  device_id?: string | null;
}

export interface DeviceRow {
  device_id: string;
  role?: string;
  source?: string;
  linked_measurement_names?: string[];
}

export interface EnvironmentSnapshot {
  temperature_c?: string | number | null;
  humidity_pct?: string | number | null;
  device_id?: string | null;
  source?: string | null;
  captured_at?: string | null;
}

export interface SimilarHitRow {
  capture_id: string;
  score: number;
  image_url?: string | null;
  display_name?: string | null;
  metadata?: Record<string, unknown>;
}

interface ObservationDetailSectionsProps {
  captureId: string;
  displayName?: string;
  capture: Record<string, unknown>;
  measurements: MeasurementRow[];
  photoConditions: PhotoConditionRow[];
  devices: DeviceRow[];
  environmentSnapshot: EnvironmentSnapshot | null;
  similar: SimilarHitRow[];
  imageUrl?: string | null;
  photoAbsentReason?: PhotoAbsentReason;
}

const VISIBLE_MEASUREMENT_ROWS = 10;

function formatValue(value: string | number | null | undefined, unit?: string | null) {
  if (value == null || value === "") return "—";
  const unitText = unit ? String(unit) : "";
  return `${value}${unitText}`;
}

function formatObservedAt(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", { hour12: false });
}

function SimilarThumbnail({ hit }: { hit: SimilarHitRow }) {
  if (hit.image_url) {
    return (
      <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-button border border-civ-border bg-civ-section">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hit.image_url}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="h-14 w-[4.5rem] shrink-0 rounded-button border border-dashed border-civ-border bg-civ-section flex items-center justify-center text-[10px] text-civ-muted text-center px-1"
      aria-hidden
    >
      写真なし
    </div>
  );
}

export function ObservationDetailSections({
  captureId,
  displayName,
  capture,
  measurements,
  photoConditions,
  devices,
  environmentSnapshot,
  similar,
  imageUrl,
  photoAbsentReason,
}: ObservationDetailSectionsProps) {
  const [measurementsExpanded, setMeasurementsExpanded] = useState(false);
  const hiddenMeasurementCount = Math.max(0, measurements.length - VISIBLE_MEASUREMENT_ROWS);
  const title = String(displayName ?? capture.species ?? captureId);
  const observedAt = formatObservedAt(
    capture.observed_at ?? capture.capture_timestamp ?? capture.created_at,
  );

  return (
    <article className="space-y-6" data-testid="obs-detail-page">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-normal m-0">{title}</h1>
          <p className="text-sm text-civ-muted mt-1">capture: {captureId}</p>
          <p className="text-xs text-civ-muted mt-1">
            {observedAt ? `観測日時: ${observedAt}` : null}
            {observedAt ? " · " : ""}
            属性: {String(capture.sex ?? "—")} · {String(capture.phase_label ?? capture.stage_name ?? "—")}
          </p>
          {typeof capture.individual_id === "string" && capture.individual_id ? (
            <p className="text-xs text-civ-muted mt-1">individual: {capture.individual_id}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {typeof capture.individual_id === "string" && capture.individual_id ? (
            <Link href={`/individuals/${capture.individual_id}`} className="no-underline">
              <Button variant="secondary" data-testid="obs-open-individual">
                親個体詳細へ
              </Button>
            </Link>
          ) : null}
          <Link href={`/board/paper?cite_capture=${captureId}`} className="no-underline">
            <Button variant="primary" data-testid="obs-detail-cite-btn">
              この個体を引用
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
        <div className="space-y-6 min-w-0">
          <Card className="p-0 overflow-hidden">
            {imageUrl ? (
              <div
                className="aspect-[4/3] bg-civ-section border-b border-civ-border"
                data-testid="obs-detail-photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`観測写真 ${captureId}`}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div
                className="aspect-[4/3] flex items-center justify-center bg-civ-section border-b border-dashed border-civ-border px-4 text-center text-sm text-civ-muted"
                data-testid="obs-detail-no-photo"
              >
                {photoAbsentMessage(photoAbsentReason)}
              </div>
            )}

            {photoConditions.length > 0 ? (
              <div className="p-6" data-testid="obs-detail-photo-conditions">
                <CardTitle className="text-base mb-1">撮影条件</CardTitle>
                <CardDescription>色補正なし · 自然光想定</CardDescription>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  {photoConditions.map((row) => (
                    <div key={`${row.item}-${row.value}`} className="min-w-0">
                      <dt className="text-civ-muted text-xs">{row.item}</dt>
                      <dd className="mt-0.5">
                        {row.value ?? "—"}
                        {row.unit ? ` ${row.unit}` : ""}
                        {row.method ? (
                          <span className="text-civ-muted text-xs ml-1">({row.method})</span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </Card>

          {measurements.length > 0 ? (
            <Card data-testid="obs-detail-measurements">
              <CardTitle>計測（{measurements.length} 行）</CardTitle>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[18%]" />
                    <col className="w-[28%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-civ-muted border-b border-civ-border">
                      <th className="py-2 pr-3 font-normal">項目</th>
                      <th className="py-2 pr-3 font-normal">値</th>
                      <th className="py-2 pr-3 font-normal">方法</th>
                      <th className="py-2 font-normal">由来</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((row, index) => {
                      if (index >= VISIBLE_MEASUREMENT_ROWS && !measurementsExpanded) {
                        return null;
                      }
                      return (
                        <tr
                          key={row.measurement_id ?? `${row.name}-${row.value}-${index}`}
                          className="border-b border-civ-border/60"
                        >
                          <td className="py-2.5 pr-3">{row.label ?? row.name}</td>
                          <td className="py-2.5 pr-3 tabular-nums">
                            {formatValue(row.value, row.unit)}
                          </td>
                          <td className="py-2.5 pr-3 text-civ-muted">{row.method ?? "—"}</td>
                          <td className="py-2.5">
                            <Badge tone={valueOriginTone(row.value_origin ?? row.source)}>
                              {formatValueOriginLabel(row.value_origin, row.source)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {hiddenMeasurementCount > 0 && !measurementsExpanded ? (
                      <tr>
                        <td colSpan={4} className="py-2">
                          <button
                            type="button"
                            className="cursor-pointer text-civ-info text-sm bg-transparent border-0 p-0"
                            onClick={() => setMeasurementsExpanded(true)}
                          >
                            残り {hiddenMeasurementCount} 行を表示
                          </button>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {environmentSnapshot ? (
            <Card data-testid="obs-detail-env-snapshot">
              <CardTitle>環境 snapshot</CardTitle>
              <CardDescription>時系列グラフは今後のバージョンで表示</CardDescription>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                {environmentSnapshot.temperature_c != null ? (
                  <>
                    <dt className="text-civ-muted">温度</dt>
                    <dd>{environmentSnapshot.temperature_c}°C</dd>
                  </>
                ) : null}
                {environmentSnapshot.humidity_pct != null ? (
                  <>
                    <dt className="text-civ-muted">湿度</dt>
                    <dd>{environmentSnapshot.humidity_pct}%</dd>
                  </>
                ) : null}
                {environmentSnapshot.source ? (
                  <>
                    <dt className="text-civ-muted">取得元</dt>
                    <dd>{environmentSnapshot.source}</dd>
                  </>
                ) : null}
                {environmentSnapshot.captured_at ? (
                  <>
                    <dt className="text-civ-muted">計測時刻</dt>
                    <dd>{environmentSnapshot.captured_at}</dd>
                  </>
                ) : null}
              </dl>
            </Card>
          ) : null}

          {devices.length > 0 ? (
            <Card data-testid="obs-detail-devices">
              <CardTitle>デバイス</CardTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {devices.map((device) => (
                  <li key={`${device.device_id}-${device.role}`}>
                    {device.role ?? "device"}: {device.device_id}
                    {device.source ? ` (${device.source})` : ""}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/api/v1/observation/${captureId}/reanalysis-manifest`}
              className="inline-flex rounded-button border border-civ-border px-3 py-2 text-xs no-underline text-civ-fg hover:border-civ-info"
              data-testid="obs-detail-manifest-link"
              target="_blank"
              rel="noreferrer"
            >
              reanalysis-manifest
            </Link>
          </div>
        </div>

        <aside className="min-w-0">
          <Card className="lg:sticky lg:top-6" data-testid="obs-detail-similar">
            <CardTitle>類似する個体</CardTitle>
            {similar.length === 0 ? (
              <p className="text-sm text-civ-muted mt-3">類似する個体がまだありません</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {similar.map((hit) => {
                  const scorePct = Math.round(hit.score * 100);
                  return (
                    <li key={hit.capture_id}>
                      <Link
                        href={`/observation/${hit.capture_id}`}
                        className="flex gap-3 no-underline text-civ-fg hover:bg-civ-section rounded-card p-2 -mx-2 transition-colors"
                        data-testid="obs-detail-similar-link"
                      >
                        <SimilarThumbnail hit={hit} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate m-0">
                            {hit.display_name ?? hit.capture_id}
                          </p>
                          <p className="text-xs text-civ-muted truncate m-0 mt-0.5">
                            {hit.capture_id}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className="h-1.5 flex-1 rounded-full bg-civ-section overflow-hidden"
                              role="presentation"
                            >
                              <div
                                className="h-full bg-civ-info"
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>
                            <span className="text-xs text-civ-info tabular-nums shrink-0">
                              {scorePct}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </article>
  );
}
