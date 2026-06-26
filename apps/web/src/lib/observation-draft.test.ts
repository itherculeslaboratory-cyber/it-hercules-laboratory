import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_OBSERVATION_DRAFT,
  applyIngestTelemetryToEnvSnapshot,
  buildEnvironmentSnapshotCommitBody,
  clearDraft,
  clearInMemoryPhotoCache,
  envSnapshotHumidity,
  envSnapshotSourceLabel,
  envSnapshotTemperature,
  formatEnvTelemetryFetchError,
  isEnvTelemetryNotFoundError,
  resolveDeviceDisplayLabel,
  sanitizeEnvSnapshotRows,
  isEnvSnapshotLocked,
  measurementRowSource,
  normalizeObservationEdit,
  readDraft,
  reindexRowSyncMap,
  removeDraftRowAt,
  resolveBindingEnvDeviceId,
  resolveDraftForInput,
  shouldIncludeEnvironmentSnapshot,
  slimDraftForSessionStorage,
  slimDraftForStorage,
  writeDraft,
  type ObservationDraft,
} from "./observation-draft";

function makeDraft(patch: Partial<ObservationDraft>): ObservationDraft {
  return {
    ...DEFAULT_OBSERVATION_DRAFT,
    species: "dynastes_hercules",
    targetId: "target_001",
    individualId: "ind_001",
    displayName: "王-2026-1",
    rows: [{ item: "体長", value: "132.4", unit: "mm", method: "manual_entry" }],
    ...patch,
  };
}

describe("resolveDraftForInput", () => {
  it("確認画面からの編集復帰では下書きを保持する", () => {
    const stored = makeDraft({ envTemperature: "25.5", envHumidity: "60" });

    const resolved = resolveDraftForInput(stored, {
      from: "confirm",
      edit: "photo",
    });

    expect(resolved.species).toBe("dynastes_hercules");
    expect(resolved.rows[0]?.value).toBe("132.4");
    expect(resolved.envTemperature).toBe("25.5");
    expect(resolved.envHumidity).toBe("60");
  });

  it("種コンテキスト付き初回遷移では query で初期化する", () => {
    const resolved = resolveDraftForInput(null, {
      species: "dynastes_tityus",
      scopeRoute: "biological",
      targetId: "target_A",
      individualId: "ind_A",
    });

    expect(resolved.species).toBe("dynastes_tityus");
    expect(resolved.targetId).toBe("target_A");
    expect(resolved.individualId).toBe("ind_A");
    expect(resolved.rows.length).toBeGreaterThan(0);
  });

  it("新しい species query では過去ドラフトを持ち越さない", () => {
    const stored = makeDraft({
      species: "dynastes_hercules",
      rows: [{ item: "体長", value: "150", unit: "mm", method: "manual_entry" }],
    });

    const resolved = resolveDraftForInput(stored, {
      species: "dynastes_tityus",
      targetId: "target_B",
    });

    expect(resolved.species).toBe("dynastes_tityus");
    expect(resolved.rows).toEqual(DEFAULT_OBSERVATION_DRAFT.rows);
  });
});

describe("normalizeObservationEdit", () => {
  it("env と periodic を env に正規化する", () => {
    expect(normalizeObservationEdit("env")).toBe("env");
    expect(normalizeObservationEdit("periodic")).toBe("env");
  });
});

describe("DEFAULT_OBSERVATION_DRAFT", () => {
  it("Phase6 ver1 の既定値を持つ", () => {
    expect(DEFAULT_OBSERVATION_DRAFT.phaseKey).toBe("adult");
    expect(DEFAULT_OBSERVATION_DRAFT.sex).toBe("unknown");
    expect(DEFAULT_OBSERVATION_DRAFT.photoConditions.length).toBeGreaterThan(0);
  });
});

describe("removeDraftRowAt", () => {
  it("指定行を削除し最低1行を残す", () => {
    const rows = [
      { item: "体長", value: "1", unit: "mm" },
      { item: "胸幅", value: "2", unit: "mm" },
      { item: "角長", value: "3", unit: "mm" },
    ];
    expect(removeDraftRowAt(rows, 1)).toEqual([
      { item: "体長", value: "1", unit: "mm" },
      { item: "角長", value: "3", unit: "mm" },
    ]);
    expect(removeDraftRowAt([rows[0]], 0)).toEqual([rows[0]]);
  });
});

describe("reindexRowSyncMap", () => {
  it("削除後に行インデックスを詰める", () => {
    expect(reindexRowSyncMap({ 0: true, 1: false, 2: true }, 1)).toEqual({
      0: true,
      1: true,
    });
  });
});

describe("env snapshot helpers", () => {
  it("source ラベルはユーザー向け文言を返す", () => {
    expect(envSnapshotSourceLabel("ingest_snapshot")).toBe("機器から取得");
    expect(envSnapshotSourceLabel("registry_poll")).toBe("機器から取得");
    expect(envSnapshotSourceLabel("manual_entry")).toBe("手入力");
  });

  it("既定ドラフトに設置開始日がある", () => {
    expect(DEFAULT_OBSERVATION_DRAFT.placementStartedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("ingest 適用で locked + source=ingest_snapshot になる", () => {
    const next = applyIngestTelemetryToEnvSnapshot(DEFAULT_OBSERVATION_DRAFT.envSnapshot, "dev_1", {
      temperature_c: 25.2,
      humidity_pct: 61,
      captured_at: "2026-06-25T12:00:00Z",
    });
    expect(next.source).toBe("ingest_snapshot");
    expect(next.locked).toBe(true);
    expect(envSnapshotTemperature(next)).toBe("25.2");
    expect(envSnapshotHumidity(next)).toBe("61");
    expect(isEnvSnapshotLocked(next.source)).toBe(true);
  });

  it("commit body に environment_snapshot を組み立てる（写真なし + 同梱チェック）", () => {
    const draft = makeDraft({
      includeEnvSnapshot: true,
      envSnapshot: applyIngestTelemetryToEnvSnapshot(DEFAULT_OBSERVATION_DRAFT.envSnapshot, "dev_1", {
        temperature_c: 20,
        humidity_pct: 55,
        captured_at: "2026-06-25T12:00:00Z",
      }),
    });
    expect(buildEnvironmentSnapshotCommitBody(draft)).toMatchObject({
      temperature_c: "20",
      humidity_pct: "55",
      device_id: "dev_1",
      source: "ingest_snapshot",
    });
  });

  it("写真あり時は environment_snapshot を commit しない", () => {
    const draft = makeDraft({
      hasPhoto: true,
      includeEnvSnapshot: false,
      envSnapshot: applyIngestTelemetryToEnvSnapshot(DEFAULT_OBSERVATION_DRAFT.envSnapshot, "dev_2", {
        temperature_c: 22,
        humidity_pct: 58,
        captured_at: "2026-06-25T13:00:00Z",
      }),
    });
    expect(shouldIncludeEnvironmentSnapshot(draft)).toBe(false);
    expect(buildEnvironmentSnapshotCommitBody(draft)).toEqual({});
  });

  it("写真あり readDraft は env snapshot を除去する", () => {
    let storage: Record<string, string> = {};
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
    vi.stubGlobal("window", { sessionStorage: globalThis.sessionStorage });

    globalThis.sessionStorage.setItem(
      "ihl_obs_draft",
      JSON.stringify({
        ...DEFAULT_OBSERVATION_DRAFT,
        species: "dynastes_hercules",
        hasPhoto: true,
        envSnapshot: applyIngestTelemetryToEnvSnapshot(DEFAULT_OBSERVATION_DRAFT.envSnapshot, "dev_2", {
          temperature_c: 22,
          humidity_pct: 58,
        }),
        envTemperature: "22",
        envHumidity: "58",
      }),
    );

    const restored = readDraft();
    expect(restored?.envTemperature).toBe("");
    expect(restored?.envHumidity).toBe("");
    expect(envSnapshotTemperature(restored!.envSnapshot)).toBe("");
    expect(envSnapshotHumidity(restored!.envSnapshot)).toBe("");
  });

  it("binding 機器を env snapshot device より優先して解決する", () => {
    const draft = makeDraft({
      devices: [{ deviceId: "bind_dev", role: "temp_humidity", source: "registry_poll" }],
      envSnapshot: {
        ...DEFAULT_OBSERVATION_DRAFT.envSnapshot,
        deviceId: "other_dev",
      },
    });
    expect(resolveBindingEnvDeviceId(draft)).toBe("bind_dev");
  });

  it("計測行 source を写像する", () => {
    expect(measurementRowSource({ item: "体長", value: "1", unit: "mm", method: "manual_entry" })).toBe(
      "manual_entry",
    );
    expect(
      measurementRowSource({ item: "温度", value: "1", unit: "°C", method: "iot_switchbot", deviceId: "d1" }),
    ).toBe("registry_poll");
  });

  it("TELEMETRY_NOT_FOUND は友好メッセージに変換する", () => {
    expect(formatEnvTelemetryFetchError("TELEMETRY_NOT_FOUND")).toContain("手入力");
    expect(isEnvTelemetryNotFoundError("TELEMETRY_NOT_FOUND")).toBe(true);
  });

  it("機器表示名をレジストリから解決する", () => {
    const registry = [{ device_id: "dev_1", display_name: "リビング温湿度" }];
    expect(resolveDeviceDisplayLabel("dev_1", registry)).toBe("リビング温湿度");
    expect(resolveDeviceDisplayLabel("unknown", registry)).toBe("unknown");
  });

  it("env_snapshot から photo_condition 項目を除外する", () => {
    const rows = sanitizeEnvSnapshotRows([
      { item: "温度", value: "25", unit: "°C", method: "manual_entry" },
      { item: "アスペクト比", value: "4:3", unit: "", method: "manual_entry" },
      { item: "湿度", value: "60", unit: "%", method: "manual_entry" },
    ]);
    expect(rows.map((row) => row.item)).toEqual(["温度", "湿度"]);
    expect(rows[0]?.value).toBe("25");
  });
});

describe("slimDraftForSessionStorage", () => {
  const largeDataUrl = `data:image/jpeg;base64,${"A".repeat(200_000)}`;

  it("大きな base64 を sessionStorage 用から除去する", () => {
    const draft = makeDraft({
      hasPhoto: true,
      photoPreview: largeDataUrl,
      photoPreviewUrl: largeDataUrl,
      photoFile: {
        name: "test.jpg",
        type: "image/jpeg",
        size: 200_000,
        lastModified: 1,
        dataUrl: largeDataUrl,
      },
    });

    const slim = slimDraftForSessionStorage(draft);

    expect(slim.photoPreview).toBe("");
    expect(slim.photoPreviewUrl).toBe("");
    expect(slim.photoFile?.dataUrl).toBe("");
    expect(slim.photoDataInMemory).toBe(true);
    expect(JSON.stringify(slim).length).toBeLessThan(10_000);
    expect(JSON.stringify(slim)).not.toContain(largeDataUrl.slice(0, 100));
  });

  it("slimDraftForStorage は slimDraftForSessionStorage の別名", () => {
    const draft = makeDraft({ species: "alias_test" });
    expect(slimDraftForStorage(draft)).toEqual(slimDraftForSessionStorage(draft));
  });
});

describe("writeDraft / readDraft photo handling", () => {
  const largeDataUrl = `data:image/jpeg;base64,${"B".repeat(150_000)}`;
  let storage: Record<string, string>;

  beforeEach(() => {
    clearDraft();
    clearInMemoryPhotoCache();
    storage = {};
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
    vi.stubGlobal("window", { sessionStorage: globalThis.sessionStorage });
  });

  it("writeDraft は quota 超過でも例外を投げない", () => {
    const draft = makeDraft({
      hasPhoto: true,
      photoPreview: largeDataUrl,
      photoPreviewUrl: largeDataUrl,
      photoFile: {
        name: "big.jpg",
        type: "image/jpeg",
        size: 150_000,
        lastModified: 1,
        dataUrl: largeDataUrl,
      },
    });

    const originalSetItem = globalThis.sessionStorage.setItem.bind(globalThis.sessionStorage);
    let calls = 0;
    globalThis.sessionStorage.setItem = (key: string, value: string) => {
      calls += 1;
      if (calls === 1) {
        throw new DOMException("quota", "QuotaExceededError");
      }
      originalSetItem(key, value);
    };

    const result = writeDraft(draft);
    expect(result.ok).toBe(true);
    globalThis.sessionStorage.setItem = originalSetItem;
  });

  it("quota 超過が続く場合は warning を返す", () => {
    globalThis.sessionStorage.setItem = () => {
      throw new DOMException("quota", "QuotaExceededError");
    };

    const result = writeDraft(makeDraft({ species: "quota_fail" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.warning).toContain("容量不足");
    }
  });

  it("readDraft はメモリキャッシュから写真を復元する", () => {
    const draft = makeDraft({
      hasPhoto: true,
      photoPreview: largeDataUrl,
      photoPreviewUrl: largeDataUrl,
      photoFile: {
        name: "photo.jpg",
        type: "image/jpeg",
        size: 100,
        lastModified: 1,
        dataUrl: largeDataUrl,
      },
    });

    writeDraft(draft);
    const restored = readDraft();

    expect(restored?.hasPhoto).toBe(true);
    expect(restored?.photoPreview).toBe(largeDataUrl);
    expect(restored?.photoFile?.dataUrl).toBe(largeDataUrl);
  });

  it("メモリに無い写真は hasPhoto を保持しプレビューは空", () => {
    clearInMemoryPhotoCache();
    globalThis.sessionStorage.setItem(
      "ihl_obs_draft",
      JSON.stringify({
        ...DEFAULT_OBSERVATION_DRAFT,
        species: "dynastes_hercules",
        hasPhoto: true,
        photoDataInMemory: true,
      }),
    );

    const restored = readDraft();
    expect(restored?.hasPhoto).toBe(true);
    expect(restored?.photoPreview).toBe("");
    expect(restored?.photoFile?.dataUrl ?? "").toBe("");
  });
});
