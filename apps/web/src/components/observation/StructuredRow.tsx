"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { StructuredRowData, StructuredRowGroup, StructuredRowMethod, EnvSnapshotSource } from "@/lib/observation-draft";
import { envSnapshotSourceLabel } from "@/lib/observation-draft";

export interface StructuredRowDeviceOption {
  device_id: string;
  display_name: string;
  name?: string;
  kind: string;
}

const ADD_ITEM_SENTINEL = "__add_item__";
const ADD_ROW_SENTINEL = "__add_row__";
const ADD_UNIT_SENTINEL = "__add_unit__";

const ENV_SNAPSHOT_USER_METHOD_LABELS: Record<string, string> = {
  manual_entry: "手入力",
  device_fetch: "機器から取得",
};

export interface StructuredRowProps {
  group: StructuredRowGroup;
  row: StructuredRowData;
  index: number;
  itemChoices: string[];
  unitChoices: string[];
  methodChoices?: StructuredRowMethod[];
  /** env_snapshot — internal source tag (read-only badge, not user-selectable). */
  sourceTag?: EnvSnapshotSource | "";
  locked?: boolean;
  showMethod?: boolean;
  showDevicePicker?: boolean;
  devices?: StructuredRowDeviceOption[];
  devicesError?: string;
  syncing?: boolean;
  syncError?: string;
  onChange: (patch: Partial<StructuredRowData>) => void;
  onDelete?: () => void;
  onSyncDevice?: () => void;
  onRequestAddItem?: () => void;
  onRequestAddRow?: () => void;
  onRequestAddUnit?: () => void;
  canDelete?: boolean;
  testIdPrefix?: string;
}

function methodLabel(method: StructuredRowMethod, group: StructuredRowGroup): string {
  if (group === "env_snapshot") {
    return ENV_SNAPSHOT_USER_METHOD_LABELS[method] ?? method;
  }
  return method === "iot_switchbot" ? "IoT取得" : "手入力";
}

function envSnapshotShowsSourceBadge(
  group: StructuredRowGroup,
  sourceTag: EnvSnapshotSource | "" | undefined,
  rowLocked: boolean,
): boolean {
  return group === "env_snapshot" && (rowLocked || sourceTag === "ingest_snapshot" || sourceTag === "registry_poll");
}

export function StructuredRow({
  group,
  row,
  index,
  itemChoices,
  unitChoices,
  methodChoices = ["manual_entry", "iot_switchbot"],
  sourceTag = "",
  locked = false,
  showMethod = true,
  showDevicePicker = false,
  devices = [],
  devicesError = "",
  syncing = false,
  syncError = "",
  onChange,
  onDelete,
  onSyncDevice,
  onRequestAddItem,
  onRequestAddRow,
  onRequestAddUnit,
  canDelete = false,
  testIdPrefix = "obs-structured-row",
}: StructuredRowProps) {
  const rowLocked = locked || Boolean(row.locked);
  const prefix = `${testIdPrefix}-${group}-${index}`;

  const envMethodChoices: StructuredRowMethod[] =
    group === "env_snapshot" ? ["manual_entry", "device_fetch"] : methodChoices;
  const rawMethod: StructuredRowMethod =
    row.method === "ingest_snapshot" || row.method === "registry_poll" ? "device_fetch" : row.method;
  const effectiveMethod = envMethodChoices.includes(rawMethod) ? rawMethod : envMethodChoices[0];
  const showEnvSourceBadge = envSnapshotShowsSourceBadge(group, sourceTag, rowLocked);

  return (
    <div className="space-y-2" data-testid={`${prefix}-wrap`}>
      <div className="flex items-start gap-2">
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-4">
          <select
            value={row.item}
            disabled={rowLocked && group === "env_snapshot"}
            onChange={(e) => {
              const label = e.target.value;
              if (label === ADD_ROW_SENTINEL) {
                onRequestAddRow?.();
                return;
              }
              if (label === ADD_ITEM_SENTINEL) {
                onRequestAddItem?.();
                return;
              }
              onChange({ item: label });
            }}
            className="rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px] disabled:opacity-60"
            aria-label="項目選択"
            data-testid={`${prefix}-item`}
          >
            {itemChoices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
            {group !== "env_snapshot" && onRequestAddItem ? (
              <option value={ADD_ITEM_SENTINEL}>＋ 項目を追加</option>
            ) : null}
            {group !== "env_snapshot" && onRequestAddRow ? (
              <option value={ADD_ROW_SENTINEL}>＋ 行を追加</option>
            ) : null}
          </select>
          <Input
            value={row.value}
            readOnly={rowLocked}
            onChange={(e) => onChange({ value: e.target.value })}
            aria-label="値"
            data-testid={`${prefix}-value`}
            className={rowLocked ? "opacity-80" : undefined}
          />
          <select
            value={row.unit}
            disabled={rowLocked}
            onChange={(e) => {
              if (e.target.value === ADD_UNIT_SENTINEL) {
                onRequestAddUnit?.();
                return;
              }
              onChange({ unit: e.target.value });
            }}
            className="rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px] disabled:opacity-60"
            aria-label="単位選択"
            data-testid={`${prefix}-unit`}
          >
            {unitChoices.map((choice) => (
              <option key={choice || "none"} value={choice}>
                {choice || "（なし）"}
              </option>
            ))}
            {!rowLocked && onRequestAddUnit ? <option value={ADD_UNIT_SENTINEL}>＋ 単位を追加</option> : null}
          </select>
          {showMethod ? (
            showEnvSourceBadge ? (
              <span
                className="flex items-center rounded-button border border-civ-border bg-civ-section px-3 text-sm text-civ-muted min-h-[44px]"
                data-testid={`${prefix}-source-badge`}
                aria-label="取得元"
              >
                {envSnapshotSourceLabel(sourceTag || "ingest_snapshot")}
              </span>
            ) : (
              <select
                value={effectiveMethod}
                disabled={rowLocked && group === "env_snapshot"}
                onChange={(e) => {
                  const method = e.target.value as StructuredRowData["method"];
                  onChange({
                    method,
                    locked: false,
                    deviceId:
                      method === "iot_switchbot" ? row.deviceId ?? "" : group === "env_snapshot" ? row.deviceId : "",
                  });
                }}
                className="rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px] disabled:opacity-60"
                aria-label={group === "env_snapshot" ? "入力方法" : "計測方法"}
                data-testid={`${prefix}-method`}
              >
                {envMethodChoices.map((method) => (
                  <option key={method} value={method}>
                    {group === "env_snapshot"
                      ? ENV_SNAPSHOT_USER_METHOD_LABELS[method] ?? method
                      : methodLabel(method, group)}
                  </option>
                ))}
              </select>
            )
          ) : (
            <span className="flex items-center px-2 text-sm text-civ-muted min-h-[44px]">—</span>
          )}
        </div>
        {canDelete && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            aria-label={`行${index + 1}を削除`}
            data-testid={`${prefix}-delete`}
            className="shrink-0 px-2"
          >
            削除
          </Button>
        ) : null}
      </div>
      {showDevicePicker && row.method === "iot_switchbot" ? (
        <div className="rounded-card border border-civ-border p-3" data-testid={`${prefix}-device-block`}>
          <label className="text-sm text-civ-muted">
            機器
            <select
              value={row.deviceId ?? ""}
              onChange={(e) => {
                const nextDeviceId = e.target.value;
                onChange({ deviceId: nextDeviceId });
                if (nextDeviceId) {
                  onSyncDevice?.();
                }
              }}
              className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
              data-testid={`${prefix}-device-select`}
            >
              <option value="">機器を選択</option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.display_name || device.name || device.device_id}（{device.kind}）
                </option>
              ))}
            </select>
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSyncDevice?.()}
              disabled={syncing}
              data-testid={`${prefix}-device-sync`}
            >
              {syncing ? "取得中..." : "この行を取得"}
            </Button>
            {syncError ? <p className="text-xs text-civ-danger">{syncError}</p> : null}
          </div>
          {devicesError ? <p className="mt-2 text-xs text-civ-danger">{devicesError}</p> : null}
          {devices.length === 0 ? (
            <p className="mt-2 text-xs text-civ-muted">
              登録済みの機器がありません。{" "}
              <Link href="/settings/devices" className="text-civ-info">
                機器管理へ
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
