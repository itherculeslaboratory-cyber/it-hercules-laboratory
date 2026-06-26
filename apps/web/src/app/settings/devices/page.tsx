"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface DeviceItem {
  device_id: string;
  display_name: string;
  name?: string;
  kind: string;
  status: string;
  source: "switchbot" | "local";
  last_reading: string;
}

interface CsvImportResponse {
  buckets_written?: number;
  buckets_skipped?: number;
  written?: number;
  skipped_duplicate?: number;
  skipped_invalid?: number;
  range_from?: string;
  range_to?: string;
  range?: { from?: string; to?: string };
}

function formatCsvImportSummary(res: CsvImportResponse): string {
  const written = res.written ?? res.buckets_written ?? 0;
  const skippedDuplicate = res.skipped_duplicate ?? res.buckets_skipped ?? 0;
  const skippedInvalid = res.skipped_invalid ?? 0;
  const rangeFrom = res.range?.from ?? res.range_from;
  const rangeTo = res.range?.to ?? res.range_to;
  const parts = [
    `書き込み ${written} バケット`,
    `重複スキップ ${skippedDuplicate}`,
    skippedInvalid > 0 ? `無効行スキップ ${skippedInvalid}` : null,
    rangeFrom ? `期間 ${rangeFrom} 〜 ${rangeTo ?? ""}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function CsvImportBlock({ deviceId }: { deviceId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const runImport = async () => {
    if (!selectedFile) {
      setErrorMessage("CSV ファイルを選択してください");
      return;
    }
    setImporting(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("device_id", deviceId);
      form.append("actor_id", "u_demo");
      const res = await api.postForm<CsvImportResponse>("/api/env/import/device-csv", form);
      setSuccessMessage(`取り込み完了: ${formatCsvImportSummary(res)}`);
    } catch (e) {
      setErrorMessage(e instanceof ApiError ? e.message : "CSV 取り込みに失敗しました");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-4 rounded-card border border-civ-border p-3" data-testid={`settings-device-csv-import-${deviceId}`}>
      <p className="text-sm text-civ-muted">CSVから履歴を取り込む</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <Button
          type="button"
          variant="secondary"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
          data-testid={`settings-device-csv-select-${deviceId}`}
        >
          CSVを選択
        </Button>
        <p className="text-sm text-civ-muted truncate" data-testid={`settings-device-csv-filename-${deviceId}`}>
          {selectedFile ? selectedFile.name : "未選択"}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={importing}
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
        data-testid={`settings-device-csv-input-${deviceId}`}
      />
      <div className="mt-3">
        <Button
          type="button"
          variant="primary"
          disabled={!selectedFile || importing}
          onClick={() => void runImport()}
          data-testid={`settings-device-csv-import-btn-${deviceId}`}
        >
          {importing ? "取り込み中..." : "取り込む"}
        </Button>
      </div>
      {importing ? (
        <p className="mt-2 text-sm text-civ-muted" role="status" aria-live="polite">
          CSV をアップロードしています...
        </p>
      ) : null}
      {successMessage ? (
        <p className="mt-2 text-sm text-civ-success" role="status" data-testid={`settings-device-csv-success-${deviceId}`}>
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-2 text-sm text-civ-danger" role="alert" data-testid={`settings-device-csv-error-${deviceId}`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default function SettingsDevicesPage() {
  const [items, setItems] = useState<DeviceItem[]>([]);
  const [switchbotConfigured, setSwitchbotConfigured] = useState(false);
  const [switchbotError, setSwitchbotError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingDeviceId, setSavingDeviceId] = useState("");
  const [saveMessage, setSaveMessage] = useState<Record<string, string>>({});
  const [editNames, setEditNames] = useState<Record<string, string>>({});

  const loadDevices = async () => {
    try {
      const response = await api.get<{
        items: DeviceItem[];
        switchbot?: { configured?: boolean; error?: string | null };
      }>("/api/v1/devices");
      setItems(response.items);
      setSwitchbotConfigured(Boolean(response.switchbot?.configured));
      setSwitchbotError(response.switchbot?.error ?? "");
      setEditNames(
        Object.fromEntries(
          response.items.map((item) => [item.device_id, item.display_name || item.name || item.device_id]),
        ),
      );
      setError("");
    } catch (e) {
      setItems([]);
      setSwitchbotConfigured(false);
      setSwitchbotError("");
      setError(e instanceof ApiError ? e.message : "機器一覧の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDevices();
  }, []);

  const saveDisplayName = async (deviceId: string) => {
    const displayName = (editNames[deviceId] ?? "").trim();
    if (!displayName) {
      setSaveMessage((prev) => ({ ...prev, [deviceId]: "管理用名称を入力してください" }));
      return;
    }
    setSavingDeviceId(deviceId);
    setSaveMessage((prev) => ({ ...prev, [deviceId]: "" }));
    try {
      await api.put(`/api/v1/devices/${encodeURIComponent(deviceId)}/display-name`, {
        display_name: displayName,
        actor_id: "u_demo",
      });
      setSaveMessage((prev) => ({ ...prev, [deviceId]: "管理用名称を保存しました" }));
      await loadDevices();
    } catch (e) {
      setSaveMessage((prev) => ({ ...prev, [deviceId]: e instanceof ApiError ? e.message : "保存に失敗しました" }));
    } finally {
      setSavingDeviceId("");
    }
  };

  return (
    <PageColumn>
      <Stack>
        <Link href="/settings" className="text-sm text-civ-muted">
          ← 設定に戻る
        </Link>
        <h1 className="text-2xl font-normal">機器管理</h1>
        {!switchbotConfigured ? (
          <StatePanel
            kind="empty"
            title="SwitchBot 連携は未設定です"
            description="API 環境変数 SWITCHBOT_TOKEN / SWITCHBOT_SECRET を設定すると、アカウント連携済み機器を自動取得できます。"
          />
        ) : null}
        {switchbotError ? <StatePanel kind="error" title="SwitchBot 取得エラー" description={switchbotError} /> : null}

        {loading ? <StatePanel kind="loading" title="機器一覧を読み込み中" /> : null}
        {!loading && error ? <StatePanel kind="error" title="読み込み失敗" description={error} /> : null}
        {!loading && !error && items.length === 0 ? (
          <StatePanel
            kind="empty"
            title="利用可能な機器はまだありません"
            description="SwitchBot 連携設定後に再読み込みしてください。"
          />
        ) : null}

        {!loading && !error
          ? items.map((device) => (
              <Card key={device.device_id} data-testid={`settings-device-item-${device.device_id}`}>
                <CardTitle className="text-base mb-0">{device.display_name || "名称未設定"}</CardTitle>
                <p className="mt-2 text-sm text-civ-muted">
                  {device.kind} · {device.source} · {device.status} · 最終: {device.last_reading || "—"}
                </p>
                <p className="mt-1 text-xs text-civ-muted">device_id: {device.device_id}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={editNames[device.device_id] ?? ""}
                    onChange={(e) =>
                      setEditNames((prev) => ({
                        ...prev,
                        [device.device_id]: e.target.value,
                      }))
                    }
                    placeholder="管理用名称"
                    data-testid={`settings-device-display-name-input-${device.device_id}`}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={savingDeviceId === device.device_id}
                    onClick={() => saveDisplayName(device.device_id)}
                    data-testid={`settings-device-display-name-save-${device.device_id}`}
                  >
                    {savingDeviceId === device.device_id ? "保存中..." : "名称を保存"}
                  </Button>
                </div>
                {saveMessage[device.device_id] ? (
                  <p className="mt-2 text-xs text-civ-muted">{saveMessage[device.device_id]}</p>
                ) : null}
                <CsvImportBlock deviceId={device.device_id} />
              </Card>
            ))
          : null}
      </Stack>
    </PageColumn>
  );
}
