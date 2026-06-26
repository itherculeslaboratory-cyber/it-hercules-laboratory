"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";
import { StructuredRow } from "@/components/observation/StructuredRow";
import {
  DEFAULT_OBSERVATION_DRAFT,
  applyIngestTelemetryToEnvSnapshot,
  clearEnvSnapshotFromDraft,
  envSnapshotHumidity,
  envSnapshotSourceLabel,
  envSnapshotTemperature,
  formatEnvTelemetryFetchError,
  isEnvTelemetryNotFoundError,
  resolveDeviceDisplayLabel,
  type ObservationEditSection,
  type ObservationDraft,
  type ObservationDraftPhotoFile,
  type ObservationDeviceDeclaration,
  type StructuredRowData,
  normalizeObservationEdit,
  normalizeStructuredRowMethod,
  prefillNextObservationFromTemplate,
  readDraft,
  reindexRowSyncMap,
  removeDraftRowAt,
  resolveBindingEnvDeviceId,
  resolveDraftForInput,
  writeDraft,
} from "@/lib/observation-draft";
import {
  photoConditionIotUnsupportedMessage,
  photoConditionSupportsIot,
  resolvePhotoConditionMethodChoices,
  resolveRowReading,
  sanitizePhotoConditionRow,
  type DeviceSyncResponse,
} from "@/lib/device-reading-resolve";

const ITEM_OPTIONS = [
  { id: "body-length", label: "体長" },
  { id: "chest-width", label: "胸幅" },
  { id: "horn-length", label: "角長" },
  { id: "photo", label: "写真" },
];

interface MeasurementDictionaryItem {
  measurement_name: string;
  label_ja: string;
  value_type: "numeric" | "text";
  unit_candidates: string[];
  method_candidates: Array<"manual_entry" | "iot_switchbot">;
  unit_default: string;
}

interface NamingTemplateItem {
  template_id: string;
  template_name: string;
  pattern: string;
  series: string;
}

interface ObservationTemplateItem {
  template_id: string;
  title: string;
  target_species?: string;
  phase_default?: string;
  sex_default?: string;
  rows?: ObservationDraft["rows"];
  photo_conditions?: ObservationDraft["photoConditions"];
  default_follow_up_interval?: { unit?: string; value?: number };
  follow_up_intervals_by_stage?: Record<string, { interval?: { unit?: string; value?: number } }>;
}

interface PlacementItem {
  placement_id: string;
  label?: string | null;
}

interface DeviceItem {
  device_id: string;
  display_name: string;
  name?: string;
  kind: string;
  status: string;
  source?: "switchbot" | "local";
  last_reading: string;
}

interface IndividualOption {
  individual_id: string;
  display_name: string;
  species?: string;
  sex?: string;
}

interface IngestLatestResponse {
  device_id: string;
  temperature_c?: number | null;
  humidity_pct?: number | null;
  light_level?: number | null;
  captured_at?: string | null;
  source?: string;
}

const DEFAULT_ITEM_CHOICES = ["体長", "胸幅", "角長", "体重", "温度", "湿度", "CO2濃度", "産卵数", "備考"];
const DEFAULT_UNIT_CHOICES = ["mm", "g", "°C", "%", "ppm", "個", ""];
const PHOTO_CONDITION_ITEM_CHOICES = [
  "アスペクト比",
  "色補正",
  "撮影角度",
  "照明",
  "照度レベル",
  "背景",
  "距離",
  "温度",
  "湿度",
  "CO2濃度",
];
const PHOTO_CONDITION_UNIT_CHOICES = ["", "level", "°", "cm", "m"];
const ADD_ITEM_SENTINEL = "__add_item__";
const ADD_ROW_SENTINEL = "__add_row__";
const ADD_UNIT_SENTINEL = "__add_unit__";
const PHOTO_ADD_ITEM_SENTINEL = "__photo_add_item__";
const PHOTO_ADD_ROW_SENTINEL = "__photo_add_row__";
const PHOTO_ADD_UNIT_SENTINEL = "__photo_add_unit__";

const PHASE_OPTIONS = [
  { key: "larva_l1", label: "初令", stageName: "larva", larvaSubtype: "L1", phaseLabel: "初令" },
  { key: "larva_l2", label: "2令", stageName: "larva", larvaSubtype: "L2", phaseLabel: "2令" },
  { key: "larva_l3_early", label: "3令初期", stageName: "larva", larvaSubtype: "L3", phaseLabel: "3令初期" },
  { key: "larva_l3_late", label: "3令後期", stageName: "larva", larvaSubtype: "L3", phaseLabel: "3令後期" },
  { key: "prepupa", label: "前蛹", stageName: "larva", larvaSubtype: "L3", phaseLabel: "前蛹" },
  { key: "pupa", label: "蛹", stageName: "pupa", larvaSubtype: "", phaseLabel: "蛹" },
  { key: "adult", label: "生体", stageName: "adult", larvaSubtype: "", phaseLabel: "生体" },
] as const;

function normalizeMethod(method: string): StructuredRowData["method"] {
  return normalizeStructuredRowMethod(method);
}

function normalizeDraft(draft: ObservationDraft): ObservationDraft {
  const phase = PHASE_OPTIONS.find((item) => item.key === draft.phaseKey) ?? PHASE_OPTIONS[PHASE_OPTIONS.length - 1];
  const rows =
    draft.rows.length > 0
      ? draft.rows.map((row) => ({
          ...row,
          method: normalizeMethod(row.method),
          deviceId: row.deviceId ?? "",
        }))
      : DEFAULT_OBSERVATION_DRAFT.rows;
  const normalized: ObservationDraft = {
    ...draft,
    rows,
    stage: draft.stage || phase.stageName,
    phaseLabel: draft.phaseLabel || phase.phaseLabel,
    larvaSubtype: draft.larvaSubtype || phase.larvaSubtype,
    customItemChoices: draft.customItemChoices ?? [],
    customUnitChoices: draft.customUnitChoices ?? [],
    sireId: draft.sireId ?? "",
    damId: draft.damId ?? "",
    photoCaptureDeviceId: draft.photoCaptureDeviceId ?? "",
    photoCaptureEnvSnapshot: draft.photoCaptureEnvSnapshot ?? null,
    photoPreviewUrl: draft.photoPreviewUrl ?? draft.photoPreview ?? "",
    photoFile: draft.photoFile ?? null,
    photoConditionCustomItemChoices: draft.photoConditionCustomItemChoices ?? [],
    photoConditionCustomUnitChoices: draft.photoConditionCustomUnitChoices ?? [],
    photoConditions: draft.photoConditions?.length
      ? draft.photoConditions.map((row) =>
          sanitizePhotoConditionRow({
            ...row,
            method: normalizeMethod(row.method),
            deviceId: row.deviceId ?? "",
          }),
        )
      : DEFAULT_OBSERVATION_DRAFT.photoConditions,
    placementId: draft.placementId ?? "",
    devices: draft.devices ?? [],
    includeEnvSnapshot: draft.includeEnvSnapshot ?? draft.periodicEnabled ?? false,
    envSnapshot: draft.envSnapshot ?? DEFAULT_OBSERVATION_DRAFT.envSnapshot,
    envTemperature: envSnapshotTemperature(draft.envSnapshot ?? DEFAULT_OBSERVATION_DRAFT.envSnapshot) || draft.envTemperature,
    envHumidity: envSnapshotHumidity(draft.envSnapshot ?? DEFAULT_OBSERVATION_DRAFT.envSnapshot) || draft.envHumidity,
    priorCaptureId: draft.priorCaptureId ?? "",
    entryMode: draft.entryMode ?? "",
    nextObservationAt: draft.nextObservationAt ?? "",
    nextObservationSource: draft.nextObservationSource ?? "user",
    skipNextObservation: draft.skipNextObservation ?? false,
  };
  return normalized.hasPhoto ? clearEnvSnapshotFromDraft(normalized) : normalized;
}

export default function ObservationInputPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [editSection, setEditSection] = useState<ObservationEditSection | null>(null);
  const [dictionary, setDictionary] = useState<MeasurementDictionaryItem[]>([]);
  const [templates, setTemplates] = useState<NamingTemplateItem[]>([]);
  const [observationTemplates, setObservationTemplates] = useState<ObservationTemplateItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [newPlacementLabel, setNewPlacementLabel] = useState("");
  const [placementCreating, setPlacementCreating] = useState(false);
  const [placementError, setPlacementError] = useState("");
  const [individualOptions, setIndividualOptions] = useState<IndividualOption[]>([]);
  const [devicesError, setDevicesError] = useState("");
  const [addingItemAt, setAddingItemAt] = useState<number | null>(null);
  const [addingUnitAt, setAddingUnitAt] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [addingPhotoItemAt, setAddingPhotoItemAt] = useState<number | null>(null);
  const [addingPhotoUnitAt, setAddingPhotoUnitAt] = useState<number | null>(null);
  const [newPhotoItemName, setNewPhotoItemName] = useState("");
  const [newPhotoUnitName, setNewPhotoUnitName] = useState("");
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSeries, setNewTemplateSeries] = useState("");
  const [newTemplatePattern, setNewTemplatePattern] = useState("{series}-{year}-{seq}");
  const [draft, setDraft] = useState<ObservationDraft>(DEFAULT_OBSERVATION_DRAFT);
  const [rowSyncing, setRowSyncing] = useState<Record<number, boolean>>({});
  const [rowSyncError, setRowSyncError] = useState<Record<number, string>>({});
  const [photoRowSyncing, setPhotoRowSyncing] = useState<Record<number, boolean>>({});
  const [photoRowSyncError, setPhotoRowSyncError] = useState<Record<number, string>>({});
  const [bulkFetching, setBulkFetching] = useState(false);
  const [photoCaptureError, setPhotoCaptureError] = useState("");
  const [envSnapshotFetching, setEnvSnapshotFetching] = useState(false);
  const [envSnapshotError, setEnvSnapshotError] = useState("");
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDeviceId, setCameraDeviceId] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolved = resolveDraftForInput(readDraft(), {
      species: params.get("species") ?? "",
      scopeRoute: params.get("scope_route") ?? "biological",
      individualId: params.get("individual_id") ?? "",
      targetId: params.get("target_id") ?? "",
      from: params.get("from"),
      edit: params.get("edit"),
    });
    setEditSection(normalizeObservationEdit(params.get("edit")));
    setDraft(normalizeDraft(resolved));
    setHydrated(true);
  }, []);

  const loadTemplates = async (): Promise<NamingTemplateItem[]> => {
    try {
      const res = await api.get<{ status: string; items: NamingTemplateItem[] }>(
        "/api/v1/naming/templates?owner_user_id=u_demo",
      );
      setTemplates(res.items);
      return res.items;
    } catch {
      setTemplates([]);
      return [];
    }
  };

  const loadObservationTemplates = async (species: string) => {
    try {
      const query = new URLSearchParams();
      if (species.trim()) {
        query.set("species", species.trim());
      }
      const res = await api.get<{ items: ObservationTemplateItem[] }>(
        `/api/v1/observation/templates?${query.toString()}`,
      );
      setObservationTemplates(res.items);
    } catch {
      setObservationTemplates([]);
    }
  };

  const loadDevices = async () => {
    try {
      const res = await api.get<{ items: DeviceItem[] }>("/api/v1/devices");
      setDevices(res.items);
      setDevicesError("");
    } catch (e) {
      setDevices([]);
      setDevicesError(e instanceof ApiError ? e.message : "機器一覧の取得に失敗しました");
    }
  };

  const loadPlacements = async (): Promise<PlacementItem[]> => {
    try {
      const res = await api.get<{ items: PlacementItem[] }>("/api/env/placements?actor_id=u_demo");
      setPlacements(res.items);
      return res.items;
    } catch {
      setPlacements([]);
      return [];
    }
  };

  const createPlacement = async () => {
    const label = newPlacementLabel.trim();
    if (!label) {
      setPlacementError("棚の名前を入力してください");
      return;
    }
    setPlacementError("");
    setPlacementCreating(true);
    try {
      const res = await api.post<{ placement: PlacementItem }>("/api/env/placements", {
        actor_id: "u_demo",
        label,
      });
      const created = res.placement;
      const refreshed = await loadPlacements();
      const placementId = created.placement_id;
      const exists = refreshed.some((item) => item.placement_id === placementId);
      if (!exists && created.placement_id) {
        setPlacements((prev) => [...prev, created]);
      }
      setDraft((prev) => ({ ...prev, placementId }));
      setNewPlacementLabel("");
    } catch (e) {
      setPlacementError(e instanceof ApiError ? e.message : "棚の追加に失敗しました");
    } finally {
      setPlacementCreating(false);
    }
  };

  const removeMeasurementRow = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      rows: removeDraftRowAt(prev.rows, index),
    }));
    setRowSyncing((prev) => reindexRowSyncMap(prev, index));
    setRowSyncError((prev) => reindexRowSyncMap(prev, index));
    setAddingItemAt((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    setAddingUnitAt((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const removePhotoConditionRow = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      photoConditions: removeDraftRowAt(prev.photoConditions, index),
    }));
    setPhotoRowSyncing((prev) => reindexRowSyncMap(prev, index));
    setPhotoRowSyncError((prev) => reindexRowSyncMap(prev, index));
    setAddingPhotoItemAt((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    setAddingPhotoUnitAt((prev) => {
      if (prev === null) return null;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const loadIndividuals = async (query = "") => {
    try {
      const q = new URLSearchParams();
      q.set("owner_user_id", "u_demo");
      if (query.trim()) {
        q.set("query", query.trim());
      }
      const res = await api.get<{ status: string; items: IndividualOption[] }>(
        `/api/v1/individuals/search?${q.toString()}`,
      );
      setIndividualOptions(res.items);
    } catch {
      setIndividualOptions([]);
    }
  };

  useEffect(() => {
    api
      .get<{ status: string; items: MeasurementDictionaryItem[] }>("/api/v1/observation/measurement-dictionary?scope=solid")
      .then((res) => setDictionary(res.items))
      .catch(() => setDictionary([]));
    void loadTemplates();
    void loadObservationTemplates(draft.species || "");
    void loadDevices();
    void loadPlacements();
    void loadIndividuals();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void loadObservationTemplates(draft.species || "");
  }, [draft.species, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const timer = window.setTimeout(() => writeDraft(draft), 300);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated]);

  const updateRow = (index: number, patch: Partial<ObservationDraft["rows"][number]>) => {
    setDraft((prev) => {
      const nextRows = prev.rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      );
      return { ...prev, rows: nextRows };
    });
  };

  const updatePhotoCondition = (index: number, patch: Partial<ObservationDraft["photoConditions"][number]>) => {
    setDraft((prev) => {
      const nextRows = prev.photoConditions.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }
        const merged = sanitizePhotoConditionRow({ ...row, ...patch });
        if (patch.method === "iot_switchbot" && !photoConditionSupportsIot(merged.item)) {
          return sanitizePhotoConditionRow({ ...merged, method: "manual_entry", deviceId: "" });
        }
        return merged;
      });
      return { ...prev, photoConditions: nextRows };
    });
  };

  const persistDictionaryExtension = async (kind: "measurement_name" | "measurement_unit", value: string) => {
    try {
      await api.post("/api/v1/observation/dictionary-extensions", {
        extension_kind: kind,
        value,
        species: draft.species,
      });
    } catch {
      // 入力UXを阻害しないため、拡張イベント保存失敗は黙って継続する。
    }
  };

  const applyPhase = (phaseKey: ObservationDraft["phaseKey"]) => {
    const phase = PHASE_OPTIONS.find((item) => item.key === phaseKey) ?? PHASE_OPTIONS[PHASE_OPTIONS.length - 1];
    setDraft((prev) => ({
      ...prev,
      phaseKey,
      stage: phase.stageName,
      larvaSubtype: phase.larvaSubtype,
      phaseLabel: phase.phaseLabel,
    }));
  };

  const toggleItem = (item: string) => {
    setDraft((prev) => {
      const selected = prev.selectedItems.includes(item)
        ? prev.selectedItems.filter((current) => current !== item)
        : [...prev.selectedItems, item];
      return { ...prev, selectedItems: selected };
    });
  };

  const fetchSwitchBotStatus = async (deviceId: string) => {
    const safeId = encodeURIComponent(deviceId);
    return api.post<DeviceSyncResponse>(`/api/v1/devices/${safeId}/sync?actor_id=u_demo`, {});
  };

  const fetchIngestLatest = async (deviceId: string) => {
    const safeId = encodeURIComponent(deviceId);
    return api.get<IngestLatestResponse>(`/api/env/devices/${safeId}/latest?actor_id=u_demo`);
  };

  const photoConditionMethodChoices = (item: string) => resolvePhotoConditionMethodChoices(item);

  const fetchEnvSnapshotFromIngest = async (options?: { statusMessage?: string }) => {
    const deviceId = resolveBindingEnvDeviceId(draft);
    if (!deviceId) {
      setEnvSnapshotError("環境・設置で温湿度機器を選択してください");
      return;
    }
    setEnvSnapshotFetching(true);
    setEnvSnapshotError("");
    try {
      const latest = await fetchIngestLatest(deviceId);
      setDraft((prev) => {
        const nextSnapshot = applyIngestTelemetryToEnvSnapshot(prev.envSnapshot, deviceId, latest);
        return {
          ...prev,
          envSnapshot: nextSnapshot,
          envTemperature: envSnapshotTemperature(nextSnapshot),
          envHumidity: envSnapshotHumidity(nextSnapshot),
          statusStrip: options?.statusMessage ?? "環境値を機器から取得しました",
        };
      });
    } catch (error) {
      const rawMessage = error instanceof ApiError ? error.message : "環境値の取得に失敗しました";
      setEnvSnapshotError(formatEnvTelemetryFetchError(rawMessage));
      if (isEnvTelemetryNotFoundError(rawMessage)) {
        setDraft((prev) => ({
          ...prev,
          envSnapshot: {
            ...prev.envSnapshot,
            source: "manual_entry",
            locked: false,
            rows: prev.envSnapshot.rows.map((row) => ({
              ...row,
              method: "manual_entry",
              locked: false,
            })),
          },
        }));
      }
    } finally {
      setEnvSnapshotFetching(false);
    }
  };

  const updateEnvSnapshotRow = (index: number, patch: Partial<StructuredRowData>) => {
    setDraft((prev) => {
      const rows = prev.envSnapshot.rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      );
      const manualUnlock = patch.method === "manual_entry";
      const nextSnapshot = {
        ...prev.envSnapshot,
        rows,
        source: manualUnlock ? ("manual_entry" as const) : prev.envSnapshot.source,
        locked: manualUnlock ? false : prev.envSnapshot.locked,
      };
      return {
        ...prev,
        envSnapshot: nextSnapshot,
        envTemperature: envSnapshotTemperature({ ...nextSnapshot, rows }),
        envHumidity: envSnapshotHumidity({ ...nextSnapshot, rows }),
      };
    });
  };

  const syncRowFromDevice = async (index: number, options?: { silentSuccessStrip?: boolean }) => {
    const row = draft.rows[index];
    if (!row || row.method !== "iot_switchbot") {
      return false;
    }
    const deviceId = row.deviceId?.trim();
    if (!deviceId) {
      setRowSyncError((prev) => ({ ...prev, [index]: "機器を選択してください" }));
      return false;
    }
    setRowSyncing((prev) => ({ ...prev, [index]: true }));
    setRowSyncError((prev) => ({ ...prev, [index]: "" }));
    if (!options?.silentSuccessStrip) {
      setDraft((prev) => ({ ...prev, statusStrip: `行${index + 1}を取得中...` }));
    }
    try {
      const status = await fetchSwitchBotStatus(deviceId);
      const reading = resolveRowReading(row.item, status, "measurement");
      if (!reading) {
        throw new Error("SWITCHBOT_READING_EMPTY");
      }
      updateRow(index, {
        value: reading.value,
        unit: reading.unit,
      });
      if (!options?.silentSuccessStrip) {
        setDraft((prev) => ({ ...prev, statusStrip: `行${index + 1}の取得完了` }));
      }
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "SwitchBot 取得に失敗しました";
      setRowSyncError((prev) => ({ ...prev, [index]: message }));
      setDraft((prev) => ({ ...prev, statusStrip: `行${index + 1}の取得失敗` }));
      return false;
    } finally {
      setRowSyncing((prev) => ({ ...prev, [index]: false }));
    }
  };

  const runBulkFetch = async () => {
    const targets = draft.rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.method === "iot_switchbot");
    if (targets.length === 0) {
      setDraft((prev) => ({ ...prev, statusStrip: "IoT取得の行がありません" }));
      return;
    }
    setBulkFetching(true);
    setDraft((prev) => ({ ...prev, statusStrip: "SwitchBot 取得中..." }));
    const results = await Promise.all(targets.map(({ index }) => syncRowFromDevice(index, { silentSuccessStrip: true })));
    const successCount = results.filter(Boolean).length;
    const failCount = results.length - successCount;
    setDraft((prev) => ({
      ...prev,
      statusStrip: failCount > 0 ? `一括取得完了: 成功 ${successCount} / 失敗 ${failCount}` : `一括取得完了: ${successCount} 行`,
    }));
    setBulkFetching(false);
  };

  const syncPhotoConditionFromDevice = async (index: number) => {
    const row = draft.photoConditions[index];
    if (!row || row.method !== "iot_switchbot") {
      return false;
    }
    if (!photoConditionSupportsIot(row.item)) {
      setPhotoRowSyncError((prev) => ({
        ...prev,
        [index]: photoConditionIotUnsupportedMessage(row.item),
      }));
      return false;
    }
    const deviceId = row.deviceId?.trim();
    if (!deviceId) {
      setPhotoRowSyncError((prev) => ({ ...prev, [index]: "機器を選択してください" }));
      return false;
    }
    setPhotoRowSyncing((prev) => ({ ...prev, [index]: true }));
    setPhotoRowSyncError((prev) => ({ ...prev, [index]: "" }));
    try {
      const status = await fetchSwitchBotStatus(deviceId);
      const reading = resolveRowReading(row.item, status, "photo_condition");
      if (!reading) {
        throw new Error("SWITCHBOT_READING_EMPTY");
      }
      updatePhotoCondition(index, {
        value: reading.value,
        unit: reading.unit,
      });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "SwitchBot 取得に失敗しました";
      setPhotoRowSyncError((prev) => ({ ...prev, [index]: message }));
      return false;
    } finally {
      setPhotoRowSyncing((prev) => ({ ...prev, [index]: false }));
    }
  };

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("PHOTO_READ_FAILED"));
      reader.readAsDataURL(file);
    });

  const toDraftPhotoFile = async (file: File): Promise<ObservationDraftPhotoFile> => {
    const dataUrl = await toDataUrl(file);
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      dataUrl,
    };
  };

  const onPhotoSelected = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const draftPhotoFile = await toDraftPhotoFile(file);
      setDraft((prev) => {
        const next = clearEnvSnapshotFromDraft({
          ...prev,
          hasPhoto: true,
          photoPreview: draftPhotoFile.dataUrl,
          photoPreviewUrl: draftPhotoFile.dataUrl,
          photoFile: draftPhotoFile,
          statusStrip: "写真を取り込みました",
        });
        writeDraft(next);
        return next;
      });
    } catch {
      setDraft((prev) => ({ ...prev, statusStrip: "写真の読み込みに失敗しました" }));
      setPhotoCaptureError("写真の読み込みに失敗しました。再度お試しください。");
    }
  };

  const renderEnvSnapshotBlock = (options: {
    title: string;
    fetchLabel: string;
    testIdPrefix: string;
    statusOnFetch?: string;
  }) => {
    const bindingDeviceId = resolveBindingEnvDeviceId(draft);
    const bindingDeviceLabel = resolveDeviceDisplayLabel(bindingDeviceId, devices);
    return (
      <div data-testid={options.testIdPrefix}>
        <p className="text-sm text-civ-muted">{options.title}</p>
        {bindingDeviceId ? (
          <p className="mt-1 text-xs text-civ-muted" data-testid={`${options.testIdPrefix}-binding-device`}>
            取得元機器（環境・設置）: {bindingDeviceLabel}
          </p>
        ) : (
          <p className="mt-1 text-xs text-civ-muted">環境・設置チャンクで温湿度機器を選択すると取得できます</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void fetchEnvSnapshotFromIngest({ statusMessage: options.statusOnFetch })}
            disabled={envSnapshotFetching}
            data-testid={`${options.testIdPrefix}-fetch`}
          >
            {envSnapshotFetching ? "取得中..." : options.fetchLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                envSnapshot: {
                  ...prev.envSnapshot,
                  source: "manual_entry",
                  locked: false,
                  rows: prev.envSnapshot.rows.map((row) => ({
                    ...row,
                    method: "manual_entry",
                    locked: false,
                  })),
                },
              }))
            }
            data-testid={`${options.testIdPrefix}-manual`}
          >
            手入力に切替
          </Button>
        </div>
        {envSnapshotError ? <p className="mt-2 text-xs text-civ-danger">{envSnapshotError}</p> : null}
        {draft.envSnapshot.source ? (
          <p className="mt-2 text-xs text-civ-muted" data-testid={`${options.testIdPrefix}-source`}>
            取得元: {envSnapshotSourceLabel(draft.envSnapshot.source)}
            {draft.envSnapshot.capturedAt ? ` · ${draft.envSnapshot.capturedAt}` : ""}
          </p>
        ) : null}
        <div className="mt-3 space-y-2">
          {draft.envSnapshot.rows.map((row, index) => (
            <StructuredRow
              key={`${row.item}-${index}`}
              group="env_snapshot"
              row={row}
              index={index}
              itemChoices={["温度", "湿度"]}
              unitChoices={row.item === "温度" ? ["°C"] : ["%"]}
              sourceTag={draft.envSnapshot.source}
              locked={draft.envSnapshot.locked}
              showDevicePicker={false}
              onChange={(patch) => updateEnvSnapshotRow(index, patch)}
              testIdPrefix={`${options.testIdPrefix}-row`}
            />
          ))}
        </div>
      </div>
    );
  };

  const stopCameraStream = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  };

  const startCameraStream = async (nextDeviceId?: string) => {
    if (typeof window === "undefined" || !window.isSecureContext) {
      setCameraError("カメラ撮影は HTTPS または localhost でのみ利用できます。");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.enumerateDevices) {
      setCameraError("この端末ではカメラ API が利用できません。");
      return;
    }
    setCameraLoading(true);
    setCameraError("");
    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: nextDeviceId
          ? { deviceId: { exact: nextDeviceId } }
          : { facingMode: { ideal: "environment" } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      const video = cameraVideoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      const listed = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = listed.filter((device) => device.kind === "videoinput");
      setCameraDevices(videoInputs);
      const activeTrackId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? "";
      setCameraDeviceId(nextDeviceId || activeTrackId || videoInputs[0]?.deviceId || "");
    } catch (error) {
      setCameraError(
        error instanceof Error ? `カメラを開始できませんでした: ${error.message}` : "カメラを開始できませんでした",
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const openCameraModal = async () => {
    setDraft((prev) => ({ ...prev, photoMode: "camera" }));
    setCameraModalOpen(true);
    await startCameraStream();
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setCameraModalOpen(false);
    setCameraError("");
  };

  const captureFromCamera = async () => {
    const video = cameraVideoRef.current;
    if (!video) {
      setCameraError("カメラ映像が取得できていません。");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("画像キャプチャに失敗しました。");
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.95);
    });
    if (!blob) {
      setCameraError("画像キャプチャに失敗しました。");
      return;
    }
    const capturedFile = new File([blob], `observation-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    await onPhotoSelected(capturedFile);
    closeCameraModal();
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const moveToConfirm = () => {
    const next = {
      ...draft,
      statusStrip: draft.statusStrip === "待機中" ? "入力確認待ち" : draft.statusStrip,
    };
    setDraft(next);
    writeDraft(next);
    router.push("/observation/input/confirm");
  };

  const createTemplate = async () => {
    if (!newTemplateSeries.trim()) {
      setTemplateError("系列名（series）は必須です。");
      return;
    }
    setTemplateError("");
    setTemplateSaving(true);
    try {
      const created = await api.post<{ status: string; template_id: string }>(
        "/api/v1/naming/templates",
        {
          owner_user_id: "u_demo",
          template_name: newTemplateName.trim() || `${newTemplateSeries.trim()}テンプレ`,
          pattern: newTemplatePattern.trim() || "{series}-{year}-{seq}",
          series: newTemplateSeries.trim(),
          active: true,
        },
      );
      await loadTemplates();
      setDraft((prev) => ({ ...prev, brandTemplateId: created.template_id }));
      setNewTemplateName("");
      setNewTemplateSeries("");
      setNewTemplatePattern("{series}-{year}-{seq}");
    } catch (e) {
      setTemplateError(e instanceof ApiError ? e.message : "テンプレート作成に失敗しました。");
    } finally {
      setTemplateSaving(false);
    }
  };

  const applyObservationTemplate = (templateId: string) => {
    const selected = observationTemplates.find((template) => template.template_id === templateId);
    if (!selected) {
      setDraft((prev) => ({
        ...prev,
        measurementTemplateId: "",
        measurementTemplateTargetSpecies: "",
      }));
      return;
    }
    const phase = PHASE_OPTIONS.find((item) => item.key === selected.phase_default) ?? null;
    const phaseKeyForPrefill = phase?.key ?? draft.phaseKey;
    const nextPrefill = prefillNextObservationFromTemplate(selected, phaseKeyForPrefill);
    setDraft((prev) => ({
      ...prev,
      measurementTemplateId: selected.template_id,
      measurementTemplateTargetSpecies: selected.target_species ?? "",
      rows: selected.rows?.length
        ? selected.rows.map((row) => ({ ...row, method: normalizeMethod(row.method) }))
        : prev.rows,
      photoConditions: selected.photo_conditions?.length
        ? selected.photo_conditions.map((row) =>
            sanitizePhotoConditionRow({
              ...row,
              method: normalizeMethod(row.method),
              deviceId:
                (row as { deviceId?: string; device_id?: string }).deviceId ??
                (row as { device_id?: string }).device_id ??
                "",
            }),
          )
        : prev.photoConditions,
      sex: (selected.sex_default as ObservationDraft["sex"]) || prev.sex,
      phaseKey: phase?.key ?? prev.phaseKey,
      stage: phase?.stageName ?? prev.stage,
      larvaSubtype: phase?.larvaSubtype ?? prev.larvaSubtype,
      phaseLabel: phase?.phaseLabel ?? prev.phaseLabel,
      nextObservationAt: nextPrefill?.date ?? prev.nextObservationAt,
      nextObservationSource: nextPrefill?.source ?? prev.nextObservationSource,
    }));
  };

  const addItemChoice = async (rowIndex: number) => {
    const value = newItemName.trim();
    if (!value) {
      return;
    }
    setDraft((prev) => {
      const choices = prev.customItemChoices.includes(value) ? prev.customItemChoices : [...prev.customItemChoices, value];
      const rows = prev.rows.map((row, i) => (i === rowIndex ? { ...row, item: value } : row));
      return { ...prev, customItemChoices: choices, rows };
    });
    setNewItemName("");
    setAddingItemAt(null);
    await persistDictionaryExtension("measurement_name", value);
  };

  const addUnitChoice = async (rowIndex: number) => {
    const value = newUnitName.trim();
    if (!value) {
      return;
    }
    setDraft((prev) => {
      const choices = prev.customUnitChoices.includes(value) ? prev.customUnitChoices : [...prev.customUnitChoices, value];
      const rows = prev.rows.map((row, i) => (i === rowIndex ? { ...row, unit: value } : row));
      return { ...prev, customUnitChoices: choices, rows };
    });
    setNewUnitName("");
    setAddingUnitAt(null);
    await persistDictionaryExtension("measurement_unit", value);
  };

  const addPhotoConditionItemChoice = (rowIndex: number) => {
    const value = newPhotoItemName.trim();
    if (!value) {
      return;
    }
    setDraft((prev) => {
      const choices = prev.photoConditionCustomItemChoices.includes(value)
        ? prev.photoConditionCustomItemChoices
        : [...prev.photoConditionCustomItemChoices, value];
      const photoConditions = prev.photoConditions.map((row, i) =>
        i === rowIndex ? sanitizePhotoConditionRow({ ...row, item: value }) : row,
      );
      return { ...prev, photoConditionCustomItemChoices: choices, photoConditions };
    });
    setNewPhotoItemName("");
    setAddingPhotoItemAt(null);
  };

  const addPhotoConditionUnitChoice = (rowIndex: number) => {
    const value = newPhotoUnitName.trim();
    if (!value) {
      return;
    }
    setDraft((prev) => {
      const choices = prev.photoConditionCustomUnitChoices.includes(value)
        ? prev.photoConditionCustomUnitChoices
        : [...prev.photoConditionCustomUnitChoices, value];
      const photoConditions = prev.photoConditions.map((row, i) => (i === rowIndex ? { ...row, unit: value } : row));
      return { ...prev, photoConditionCustomUnitChoices: choices, photoConditions };
    });
    setNewPhotoUnitName("");
    setAddingPhotoUnitAt(null);
  };

  const hasContext = Boolean(draft.species.trim());
  const dictionaryByLabel = new Map(dictionary.map((item) => [item.label_ja, item]));
  const itemChoicesBase = dictionary.length > 0 ? dictionary.map((item) => item.label_ja) : DEFAULT_ITEM_CHOICES;
  const itemChoices = [...new Set([...itemChoicesBase, ...draft.customItemChoices])];
  const photoConditionItemChoices = [
    ...new Set([
      ...PHOTO_CONDITION_ITEM_CHOICES,
      ...draft.photoConditionCustomItemChoices,
      ...draft.photoConditions.map((row) => row.item),
    ]),
  ];
  const photoConditionUnitChoices = [
    ...new Set([
      ...PHOTO_CONDITION_UNIT_CHOICES,
      ...draft.photoConditionCustomUnitChoices,
      ...draft.photoConditions.map((row) => row.unit),
    ]),
  ];
  const selectedObservationTemplate = observationTemplates.find(
    (template) => template.template_id === draft.measurementTemplateId,
  );
  const templateSpeciesMatches =
    !!selectedObservationTemplate &&
    !!selectedObservationTemplate.target_species &&
    selectedObservationTemplate.target_species === draft.species;
  const hasIotMethodRows = draft.rows.some((row) => row.method === "iot_switchbot");
  const iotRowDeviceCount = draft.rows.filter(
    (row) => row.method === "iot_switchbot" && Boolean(row.deviceId?.trim()),
  ).length;

  if (!hasContext) {
    return (
      <PageColumn>
        <Card data-testid="obs-empty-state">
          <CardTitle>観測対象が未設定です</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">先に種族コンテキストを設定してください。</p>
          <Link href="/observation/context" className="no-underline">
            <Button className="mt-4" data-testid="obs-select-species-btn">
              種族を選ぶ
            </Button>
          </Link>
        </Card>
      </PageColumn>
    );
  }

  return (
    <PageColumn data-testid="obs-input-page">
      <Stack>
        <Link href="/observation/context" className="text-sm text-civ-muted">
          ← 文脈選択に戻る
        </Link>
        <h1 className="text-2xl font-normal">計測入力</h1>
        {editSection ? (
          <Card data-testid="obs-edit-return-banner">
            <CardTitle>確認画面から編集中</CardTitle>
            <p className="mt-2 text-sm text-civ-muted">
              {editSection === "photo"
                ? "写真チャンクを再編集します。入力値は保持されています。"
                : editSection === "measurement"
                  ? "計測チャンクを再編集します。入力値は保持されています。"
                  : "環境値チャンクを再編集します。入力値は保持されています。"}
            </p>
          </Card>
        ) : null}
        <Card>
          <CardTitle>観測対象</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">
            {draft.species} · route={draft.scopeRoute} · target={draft.targetId || "未指定"} · individual={draft.individualId || "未指定"}
          </p>
        </Card>

        <Card data-testid="obs-phase-sex-section">
          <CardTitle>発育フェーズ / 性別</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-civ-muted">
              フェーズ
              <select
                value={draft.phaseKey}
                onChange={(e) => applyPhase(e.target.value as ObservationDraft["phaseKey"])}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-phase-select"
              >
                {PHASE_OPTIONS.map((phase) => (
                  <option key={phase.key} value={phase.key}>
                    {phase.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-civ-muted">
              性別（任意）
              <select
                value={draft.sex}
                onChange={(e) => setDraft((prev) => ({ ...prev, sex: e.target.value as ObservationDraft["sex"] }))}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-sex-select"
              >
                <option value="unknown">不明</option>
                <option value="male">雄</option>
                <option value="female">雌</option>
                <option value="not_applicable">該当なし</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-civ-muted">
            保存値: stage_name={draft.stage || "adult"} / larva_subtype={draft.larvaSubtype || "—"} / phase_label={draft.phaseLabel}
          </p>
        </Card>

        <Card data-testid="obs-measurement-template-section">
          <CardTitle>計測テンプレート</CardTitle>
          <label className="mt-3 block text-sm text-civ-muted">
            種族に紐づくテンプレート
            <select
              value={draft.measurementTemplateId}
              onChange={(e) => applyObservationTemplate(e.target.value)}
              className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
              data-testid="obs-measurement-template-select"
            >
              <option value="">テンプレート未選択</option>
              {observationTemplates.map((item) => (
                <option key={item.template_id} value={item.template_id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {selectedObservationTemplate ? (
            <p className="mt-2 text-xs text-civ-muted" data-testid="obs-template-species-note">
              対象種族: {selectedObservationTemplate.target_species || "未設定"} / 現在: {draft.species}
              {" · "}
              {templateSpeciesMatches ? "この種族に一致するテンプレートです" : "種族不一致です。内容を確認して使用してください"}
            </p>
          ) : (
            <p className="mt-2 text-xs text-civ-muted">テンプレートは種族に紐づけて管理されます（OBS-TPL-19）。</p>
          )}
        </Card>

        <Card data-testid="obs-name-summary">
          <CardTitle>個体命名</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-civ-muted">
              ブランドテンプレート
              <select
                value={draft.brandTemplateId}
                onChange={(e) => setDraft((prev) => ({ ...prev, brandTemplateId: e.target.value }))}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-name-template-select"
              >
                <option value="">テンプレート未選択</option>
                {templates.map((item) => (
                  <option key={item.template_id} value={item.template_id}>
                    {item.template_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-civ-muted">
              表示名
              <Input
                value={draft.displayName}
                onChange={(e) => setDraft((prev) => ({ ...prev, displayName: e.target.value }))}
                placeholder="例: 王-2026-1"
                data-testid="obs-display-name-input"
              />
            </label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-civ-muted">
              ♂ 父（任意）
              <select
                value={draft.sireId}
                onChange={(e) => setDraft((prev) => ({ ...prev, sireId: e.target.value }))}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-sire-select"
              >
                <option value="">未設定</option>
                {individualOptions
                  .filter((row) => row.individual_id !== draft.individualId)
                  .map((row) => (
                    <option key={row.individual_id} value={row.individual_id}>
                      {row.display_name || row.individual_id}（{row.individual_id}）
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm text-civ-muted">
              ♀ 母（任意）
              <select
                value={draft.damId}
                onChange={(e) => setDraft((prev) => ({ ...prev, damId: e.target.value }))}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-dam-select"
              >
                <option value="">未設定</option>
                {individualOptions
                  .filter((row) => row.individual_id !== draft.individualId)
                  .map((row) => (
                    <option key={row.individual_id} value={row.individual_id}>
                      {row.display_name || row.individual_id}（{row.individual_id}）
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-civ-muted">
            親個体は観測登録時に lineage へ保存されます（CrossParent は detail 画面で後続対応）。
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const selectedTemplateId = draft.brandTemplateId;
                if (!selectedTemplateId) {
                  setTemplateError("先にブランドテンプレートを選択してください。");
                  return;
                }
                setTemplateError("");
                try {
                  const preview = await api.get<{ status: string; display_name: string }>(
                    `/api/v1/naming/preview?owner_user_id=u_demo&template_id=${encodeURIComponent(selectedTemplateId)}`,
                  );
                  setDraft((prev) => ({ ...prev, displayName: preview.display_name }));
                } catch (e) {
                  setTemplateError(e instanceof ApiError ? e.message : "自動命名に失敗しました。");
                }
              }}
            >
              テンプレから自動命名
            </Button>
          </div>
          <div className="mt-4 grid gap-3 rounded-card border border-civ-border p-3">
            <p className="text-sm text-civ-muted">テンプレートを追加（簡易）</p>
            <label className="text-sm text-civ-muted">
              系列名（series）
              <Input
                value={newTemplateSeries}
                onChange={(e) => setNewTemplateSeries(e.target.value)}
                placeholder="例: 王"
                data-testid="obs-name-template-series-input"
              />
            </label>
            <label className="text-sm text-civ-muted">
              テンプレ名（任意）
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="例: 王テンプレ"
                data-testid="obs-name-template-name-input"
              />
            </label>
            <label className="text-sm text-civ-muted">
              パターン
              <Input
                value={newTemplatePattern}
                onChange={(e) => setNewTemplatePattern(e.target.value)}
                placeholder="{series}-{year}-{seq}"
                data-testid="obs-name-template-pattern-input"
              />
            </label>
            {templateError ? <p className="text-sm text-civ-danger">{templateError}</p> : null}
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={createTemplate}
                disabled={templateSaving}
                data-testid="obs-name-template-create-btn"
              >
                {templateSaving ? "追加中..." : "テンプレートを追加"}
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="obs-env-placement-chunk">
          <CardTitle>環境・設置</CardTitle>
          <label className="mt-3 block text-sm text-civ-muted">
            設置場所（Placement）
            <select
              value={draft.placementId}
              onChange={(e) => setDraft((prev) => ({ ...prev, placementId: e.target.value }))}
              className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
              data-testid="obs-placement-select"
            >
              <option value="">{placements.length === 0 ? "棚を追加してください" : "未選択"}</option>
              {placements.map((placement) => (
                <option key={placement.placement_id} value={placement.placement_id}>
                  {placement.label || placement.placement_id}
                </option>
              ))}
            </select>
          </label>
          {placements.length === 0 ? (
            <p className="mt-2 text-xs text-civ-muted" data-testid="obs-placement-empty">
              登録済みの棚がありません。下のフォームから追加してください。
            </p>
          ) : null}
          <div className="mt-3 rounded-card border border-civ-border p-3" data-testid="obs-placement-create-inline">
            <p className="text-sm text-civ-muted">棚を追加</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                value={newPlacementLabel}
                onChange={(e) => setNewPlacementLabel(e.target.value)}
                placeholder="例: 幼虫棚 A"
                data-testid="obs-placement-label-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void createPlacement();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void createPlacement()}
                disabled={placementCreating}
                data-testid="obs-placement-create-btn"
              >
                {placementCreating ? "追加中..." : "棚を追加"}
              </Button>
            </div>
            {placementError ? <p className="mt-2 text-xs text-civ-danger">{placementError}</p> : null}
          </div>
          <label className="mt-3 block text-sm text-civ-muted">
            設置開始日
            <Input
              type="date"
              value={draft.placementStartedAt}
              onChange={(e) => setDraft((prev) => ({ ...prev, placementStartedAt: e.target.value }))}
              className="mt-1"
              data-testid="obs-placement-started-at"
            />
          </label>
          <p className="mt-1 text-xs text-civ-muted" data-testid="obs-placement-period-hint">
            設置終了日は入力しません。棚移動・機器変更の次回観測で区間が自動的に切り替わります。
          </p>
          <div className="mt-3 space-y-2">
            {(draft.devices.length > 0 ? draft.devices : [{ deviceId: "", role: "temp_humidity" as const, source: "registry_poll" as const }]).map(
              (decl, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-2">
                  <label className="text-sm text-civ-muted">
                    機器
                    <select
                      value={decl.deviceId}
                      onChange={(e) => {
                        const deviceId = e.target.value;
                        setDraft((prev) => {
                          const next = [...(prev.devices.length ? prev.devices : [{ deviceId: "", role: "temp_humidity" as const, source: "registry_poll" as const }])];
                          next[index] = { ...next[index], deviceId, source: "registry_poll" };
                          return { ...prev, devices: next.filter((d) => d.deviceId), deviceId: deviceId || prev.deviceId };
                        });
                      }}
                      className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                      data-testid={`obs-env-device-select-${index}`}
                    >
                      <option value="">未選択</option>
                      {devices.map((device) => (
                        <option key={device.device_id} value={device.device_id}>
                          {device.display_name || device.name || device.device_id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-civ-muted">
                    役割
                    <select
                      value={decl.role}
                      onChange={(e) => {
                        const role = e.target.value as ObservationDeviceDeclaration["role"];
                        setDraft((prev) => {
                          const next = [...(prev.devices.length ? prev.devices : [{ deviceId: "", role: "temp_humidity" as const, source: "registry_poll" as const }])];
                          next[index] = { ...next[index], role };
                          return { ...prev, devices: next.filter((d) => d.deviceId) };
                        });
                      }}
                      className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                      data-testid={`obs-env-device-role-${index}`}
                    >
                      <option value="temp_humidity">温湿度</option>
                      <option value="gyro">ジャイロ</option>
                      <option value="co2">CO2</option>
                      <option value="lux">照度</option>
                      <option value="custom">その他</option>
                    </select>
                  </label>
                </div>
              ),
            )}
          </div>
        </Card>

        <Card data-testid="obs-next-observation-chunk">
          <CardTitle>次回観測日</CardTitle>
          <label className="mt-3 block text-sm text-civ-muted">
            次回観測予定日
            <Input
              type="date"
              value={draft.nextObservationAt}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  nextObservationAt: e.target.value,
                  nextObservationSource: "user",
                }))
              }
              disabled={draft.skipNextObservation}
              data-testid="obs-next-observation-date"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm text-civ-muted">
            <input
              type="checkbox"
              checked={draft.skipNextObservation}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  skipNextObservation: e.target.checked,
                  nextObservationAt: e.target.checked ? "" : prev.nextObservationAt,
                }))
              }
              data-testid="obs-skip-next-observation"
            />
            次回観測日を設定しない
          </label>
          {draft.nextObservationSource === "template_default" && draft.nextObservationAt ? (
            <p className="mt-2 text-xs text-civ-muted">テンプレートの stage 間隔からプリフィルしました</p>
          ) : null}
        </Card>

        <Card>
          <CardTitle>採取アイテム</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {ITEM_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.label)}
                className={`rounded-button border px-3 py-2 text-sm ${
                  draft.selectedItems.includes(item.label)
                    ? "border-civ-info bg-civ-card text-civ-fg"
                    : "border-civ-border bg-civ-section text-civ-muted"
                }`}
                data-testid={`obs-measurement-check-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-civ-muted">
            採取機器
            <select
              value={draft.rows[0]?.method ?? "manual_entry"}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  rows: prev.rows.map((row) => ({
                    ...row,
                    method: e.target.value as "manual_entry" | "iot_switchbot",
                  })),
                }))
              }
              className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
              data-testid="obs-device-select"
            >
              <option value="manual_entry">手入力</option>
              <option value="iot_switchbot">IoT取得（SwitchBot）</option>
            </select>
          </label>
          <p className="mt-2 text-xs text-civ-muted">
            SwitchBot を使う場合は、計測行または定期取得チャンクで機器を選択してください。
          </p>
          <Link href="/settings/devices" className="mt-2 inline-block text-sm text-civ-info">
            機器管理へ
          </Link>
        </Card>

        <Card data-testid="obs-chunk-individual-data">
          <CardTitle>観測個体データ</CardTitle>
          <div className="mt-4 space-y-3" data-testid="obs-measurement-rows">
            {draft.rows.map((row, i) => (
              <StructuredRow
                key={`${row.item}-${i}`}
                group="measurement"
                row={row}
                index={i}
                itemChoices={itemChoices}
                unitChoices={[
                  ...(dictionaryByLabel.get(row.item)?.unit_candidates ?? DEFAULT_UNIT_CHOICES),
                  ...draft.customUnitChoices,
                ]}
                methodChoices={
                  (dictionaryByLabel.get(row.item)?.method_candidates ?? [
                    "manual_entry",
                    "iot_switchbot",
                  ]) as StructuredRowData["method"][]
                }
                showDevicePicker={row.method === "iot_switchbot"}
                devices={devices}
                devicesError={devicesError}
                syncing={rowSyncing[i]}
                syncError={rowSyncError[i]}
                canDelete={draft.rows.length > 1}
                onChange={(patch) => {
                  const label = patch.item;
                  if (label) {
                    const dict = dictionaryByLabel.get(label);
                    updateRow(i, {
                      ...patch,
                      unit: patch.unit ?? dict?.unit_default ?? row.unit,
                      method: patch.method ?? dict?.method_candidates?.[0] ?? row.method,
                    });
                    return;
                  }
                  updateRow(i, patch);
                }}
                onDelete={() => removeMeasurementRow(i)}
                onSyncDevice={() => void syncRowFromDevice(i)}
                onRequestAddItem={() => setAddingItemAt(i)}
                onRequestAddRow={() =>
                  setDraft((prev) => ({
                    ...prev,
                    rows: [
                      ...prev.rows,
                      { item: "体長", value: "", unit: "mm", method: "manual_entry", deviceId: "" },
                    ],
                  }))
                }
                onRequestAddUnit={() => setAddingUnitAt(i)}
                testIdPrefix="obs-measurement"
              />
            ))}
          </div>
          {addingItemAt !== null ? (
            <div className="mt-3 rounded-card border border-civ-border p-3" data-testid="obs-add-item-inline">
              <p className="text-sm text-civ-muted">新しい項目を追加</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="例: 頭角幅"
                />
                <Button type="button" variant="secondary" onClick={() => void addItemChoice(addingItemAt)}>
                  項目を追加
                </Button>
                <Button type="button" variant="ghost" onClick={() => setAddingItemAt(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          ) : null}
          {addingUnitAt !== null ? (
            <div className="mt-3 rounded-card border border-civ-border p-3" data-testid="obs-add-unit-inline">
              <p className="text-sm text-civ-muted">新しい単位を追加</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="例: mg"
                />
                <Button type="button" variant="secondary" onClick={() => void addUnitChoice(addingUnitAt)}>
                  単位を追加
                </Button>
                <Button type="button" variant="ghost" onClick={() => setAddingUnitAt(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  rows: [...prev.rows, { item: "体長", value: "", unit: "mm", method: "manual_entry", deviceId: "" }],
                }))
              }
              data-testid="obs-dd-add-custom"
            >
              行を追加
            </Button>
            <Button variant="primary" onClick={() => void runBulkFetch()} disabled={bulkFetching} data-testid="obs-bulk-fetch">
              {bulkFetching ? "一括取得中..." : "一括取得"}
            </Button>
          </div>
          {!draft.hasPhoto ? (
            <label className="mt-4 flex items-center gap-2 text-sm text-civ-muted">
              <input
                type="checkbox"
                checked={draft.includeEnvSnapshot || draft.periodicEnabled}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    includeEnvSnapshot: e.target.checked,
                    periodicEnabled: e.target.checked,
                  }))
                }
                data-testid="obs-env-snapshot-checkbox"
              />
              観測に環境スナップショットを同梱
            </label>
          ) : null}
          {!draft.hasPhoto && (draft.includeEnvSnapshot || draft.periodicEnabled) ? (
            <div className="mt-4 rounded-card border border-civ-border p-3">
              {renderEnvSnapshotBlock({
                title: "環境スナップショット",
                fetchLabel: "機器から取得",
                testIdPrefix: "obs-measurement-env-snapshot",
                statusOnFetch: "環境スナップショットを取得しました",
              })}
            </div>
          ) : null}
          <div className="mt-4 rounded-card border border-civ-border p-3 text-sm" data-testid="obs-status-strip">
            {draft.statusStrip}
          </div>
          {hasIotMethodRows ? (
            <p className="mt-2 text-xs text-civ-muted" data-testid="obs-device-selected-note">
              IoT 計測行で機器選択済み: {iotRowDeviceCount} 行
            </p>
          ) : null}
        </Card>

        <Card data-testid="obs-chunk-photo-add">
          <CardTitle>写真追加</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => void openCameraModal()}
              data-testid="obs-photo-capture"
            >
              撮影する
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDraft((prev) => ({ ...prev, photoMode: "file_select" }));
                fileInputRef.current?.click();
              }}
              data-testid="obs-photo-file-select"
            >
              写真を選択
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
            />
          </div>
          <p className="mt-2 text-xs text-civ-muted">
            カメラ撮影は HTTPS または localhost で利用できます（LAN IP の HTTP では利用不可の場合があります）。
          </p>
          {photoCaptureError ? <p className="mt-2 text-xs text-civ-danger">{photoCaptureError}</p> : null}
          {draft.hasPhoto ? (
            <div className="mt-4" data-testid="obs-photo-preview">
              <img
                src={draft.photoPreviewUrl || draft.photoPreview}
                alt="撮影プレビュー"
                className="max-h-52 w-full rounded-card border border-civ-border object-contain"
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-civ-muted">写真はまだ追加されていません</p>
          )}
        </Card>

        {draft.hasPhoto ? (
          <Card data-testid="obs-chunk-photo-env">
            <CardTitle>写真撮影時 環境データ</CardTitle>
            <p className="mt-4 text-sm text-civ-muted">撮影条件</p>
            <div className="mt-2 space-y-2" data-testid="obs-photo-condition-rows">
              {draft.photoConditions.map((condition, index) => (
                <StructuredRow
                  key={`${condition.item}-${index}`}
                  group="photo_condition"
                  row={condition}
                  index={index}
                  itemChoices={photoConditionItemChoices}
                  unitChoices={photoConditionUnitChoices}
                  methodChoices={photoConditionMethodChoices(condition.item)}
                  showDevicePicker={condition.method === "iot_switchbot"}
                  devices={devices}
                  syncing={photoRowSyncing[index]}
                  syncError={photoRowSyncError[index]}
                  canDelete={draft.photoConditions.length > 1}
                  onChange={(patch) =>
                    updatePhotoCondition(index, {
                      ...patch,
                      deviceId:
                        patch.method === "iot_switchbot"
                          ? patch.deviceId ?? condition.deviceId ?? draft.deviceId ?? ""
                          : patch.deviceId ?? "",
                    })
                  }
                  onDelete={() => removePhotoConditionRow(index)}
                  onSyncDevice={() => void syncPhotoConditionFromDevice(index)}
                  onRequestAddItem={() => setAddingPhotoItemAt(index)}
                  onRequestAddRow={() =>
                    setDraft((prev) => ({
                      ...prev,
                      photoConditions: [
                        ...prev.photoConditions,
                        { item: "照明", value: "", unit: "", method: "manual_entry", deviceId: "" },
                      ],
                    }))
                  }
                  onRequestAddUnit={() => setAddingPhotoUnitAt(index)}
                  testIdPrefix="obs-photo"
                />
              ))}
              {addingPhotoItemAt !== null ? (
                <div className="rounded-card border border-civ-border p-3" data-testid="obs-photo-add-item-inline">
                  <p className="text-sm text-civ-muted">撮影条件の項目を追加</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Input
                      value={newPhotoItemName}
                      onChange={(e) => setNewPhotoItemName(e.target.value)}
                      placeholder="例: 光源位置"
                    />
                    <Button type="button" variant="secondary" onClick={() => addPhotoConditionItemChoice(addingPhotoItemAt)}>
                      項目を追加
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setAddingPhotoItemAt(null)}>
                      閉じる
                    </Button>
                  </div>
                </div>
              ) : null}
              {addingPhotoUnitAt !== null ? (
                <div className="rounded-card border border-civ-border p-3" data-testid="obs-photo-add-unit-inline">
                  <p className="text-sm text-civ-muted">撮影条件の単位を追加</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Input
                      value={newPhotoUnitName}
                      onChange={(e) => setNewPhotoUnitName(e.target.value)}
                      placeholder="例: lux"
                    />
                    <Button type="button" variant="secondary" onClick={() => addPhotoConditionUnitChoice(addingPhotoUnitAt)}>
                      単位を追加
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setAddingPhotoUnitAt(null)}>
                      閉じる
                    </Button>
                  </div>
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    photoConditions: [
                      ...prev.photoConditions,
                      { item: "照明", value: "", unit: "", method: "manual_entry", deviceId: "" },
                    ],
                  }))
                }
                data-testid="obs-photo-condition-add"
              >
                ＋ 撮影条件を追加
              </Button>
            </div>
          </Card>
        ) : null}

        {cameraModalOpen ? (
          <Card data-testid="obs-camera-modal">
            <CardTitle>カメラで撮影</CardTitle>
            <p className="mt-2 text-sm text-civ-muted">使用する撮影デバイスを選び、プレビューから撮影します。</p>
            <label className="mt-3 block text-sm text-civ-muted">
              使用できる撮影デバイス
              <select
                value={cameraDeviceId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setCameraDeviceId(nextId);
                  void startCameraStream(nextId);
                }}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                data-testid="obs-camera-device-select"
              >
                <option value="">自動選択</option>
                {cameraDevices.map((device, index) => (
                  <option key={device.deviceId || `camera-${index}`} value={device.deviceId}>
                    {device.label || `カメラ ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            {cameraLoading ? <p className="mt-2 text-xs text-civ-muted">カメラを起動中...</p> : null}
            {cameraError ? <p className="mt-2 text-xs text-civ-danger">{cameraError}</p> : null}
            <div className="mt-3 rounded-card border border-civ-border bg-black p-2">
              <video ref={cameraVideoRef} className="h-72 w-full object-contain" autoPlay muted playsInline />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void captureFromCamera()} data-testid="obs-camera-capture-now">
                撮影する
              </Button>
              <Button type="button" variant="secondary" onClick={() => void startCameraStream(cameraDeviceId)}>
                プレビューを再読み込み
              </Button>
              <Button type="button" variant="ghost" onClick={closeCameraModal}>
                閉じる
              </Button>
            </div>
          </Card>
        ) : null}

        <div>
          <Button onClick={moveToConfirm} data-testid="obs-confirm-next">
            確認へ
          </Button>
        </div>
      </Stack>
    </PageColumn>
  );
}
