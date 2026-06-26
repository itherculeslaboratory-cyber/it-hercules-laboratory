"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";
import {
  type ObservationDraft,
  buildEnvironmentSnapshotCommitBody,
  envSnapshotHumidity,
  envSnapshotSourceLabel,
  envSnapshotTemperature,
  measurementRowSource,
  readDraft,
  shouldIncludeEnvironmentSnapshot,
  writeDraft,
  writeCommitRecord,
} from "@/lib/observation-draft";
import {
  computeObservationClientContentDigest,
  resolvePhotoDataUrl,
} from "@/lib/observation-digest";

export default function ObservationConfirmPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ObservationDraft | null>(null);
  const [nameHistory, setNameHistory] = useState<Array<{ action?: string; old_name?: string; new_name?: string; created_at?: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [templateSavePending, setTemplateSavePending] = useState(false);
  const [templateSaveResult, setTemplateSaveResult] = useState<string>("");
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  useEffect(() => {
    if (!draft) {
      return;
    }
    const phase = draft.phaseLabel || "生体";
    setTemplateName(`${draft.species || "観測"} ${phase} テンプレ`);
  }, [draft?.species, draft?.phaseLabel]);

  useEffect(() => {
    if (!draft?.individualId) {
      setNameHistory([]);
      return;
    }
    api
      .get<{ status: string; items: Array<{ action?: string; old_name?: string; new_name?: string; created_at?: string }> }>(
        `/api/v1/naming/history/${draft.individualId}`,
      )
      .then((res) => setNameHistory(res.items.slice(-5).reverse()))
      .catch(() => setNameHistory([]));
  }, [draft?.individualId]);

  const isReady = useMemo(() => {
    if (!draft) {
      return false;
    }
    return draft.rows.some((row) => row.item.trim() && row.value.trim());
  }, [draft]);

  const registerObservation = async () => {
    if (!draft || !isReady) {
      setError("入力値が不足しています。計測行を確認してください。");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const clientContentDigest = await computeObservationClientContentDigest(draft);
      const photoDataUrl = resolvePhotoDataUrl(draft);
      const commit = await api.post<{
        sessionId: string;
        r2Key: string;
        displayName?: string;
        nameEventId?: string;
        clientContentDigest?: string;
      }>("/api/solid-observation/commit", {
        species: draft.species,
        stage_name: draft.stage || "adult",
        larva_subtype: draft.larvaSubtype || undefined,
        phase_label: draft.phaseLabel || undefined,
        sex: draft.sex,
        scope_route: draft.scopeRoute,
        sire_id: draft.sireId || undefined,
        dam_id: draft.damId || undefined,
        owner_user_id: "u_demo",
        device_id: draft.deviceId || draft.devices[0]?.deviceId || undefined,
        devices: draft.devices.map((d) => ({
          device_id: d.deviceId,
          role: d.role,
          source: d.source,
        })),
        placement_id: draft.placementId || undefined,
        prior_capture_id: draft.priorCaptureId || undefined,
        entry_mode: draft.entryMode || undefined,
        next_observation_at: draft.skipNextObservation ? undefined : draft.nextObservationAt || undefined,
        next_observation_source: draft.nextObservationSource,
        skip_next_observation: draft.skipNextObservation,
        measurement_template_id: draft.measurementTemplateId || undefined,
        individual_id: draft.individualId || undefined,
        display_name: draft.displayName || undefined,
        brand_template_id: draft.brandTemplateId || undefined,
        rename_from: draft.renameFrom || undefined,
        include_env_measurements: shouldIncludeEnvironmentSnapshot(draft),
        rows: draft.rows.map((row) => ({
          item: row.item,
          value: row.value,
          unit: row.unit,
          method: row.method,
          device_id: row.deviceId || undefined,
          source: measurementRowSource(row),
        })),
        environment_snapshot: buildEnvironmentSnapshotCommitBody(draft),
        has_photo: draft.hasPhoto,
        photo_conditions: draft.photoConditions.map((row) => ({
          item: row.item,
          value: row.value,
          unit: row.unit,
          method: row.method,
          device_id: row.deviceId || undefined,
        })),
        photo_data_url: photoDataUrl,
        clientContentDigest: clientContentDigest || undefined,
      });
      const record = {
        sessionId: commit.sessionId,
        r2Key: commit.r2Key,
        species: draft.species,
        displayName: commit.displayName ?? draft.displayName ?? undefined,
        nameEventId: commit.nameEventId,
        createdAt: new Date().toISOString(),
      };
      writeCommitRecord(record);
      router.push("/observation/done");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const saveAsTemplate = async () => {
    if (!draft) {
      return;
    }
    const resolvedTemplateName = templateName.trim();
    if (!resolvedTemplateName) {
      setTemplateSaveResult("テンプレート名を入力してください");
      return;
    }
    setTemplateSavePending(true);
    setTemplateSaveResult("");
    try {
      const created = await api.post<{ template_id: string }>(
        "/api/v1/observation/templates",
        {
          title: resolvedTemplateName,
          template_name: resolvedTemplateName,
          target_species: draft.species,
          target_scope: draft.scopeRoute || "biological",
          phase_default: draft.phaseKey,
          sex_default: draft.sex,
          rows: draft.rows,
          photo_conditions: draft.photoConditions.map((row) => ({
            item: row.item,
            value: row.value,
            unit: row.unit,
            method: row.method,
            device_id: row.deviceId || undefined,
          })),
        },
      );
      setTemplateSaveResult(`テンプレートを保存しました（ID: ${created.template_id}）`);
    } catch (e) {
      setTemplateSaveResult(e instanceof ApiError ? e.message : "テンプレート保存に失敗しました");
    } finally {
      setTemplateSavePending(false);
    }
  };

  if (!draft) {
    return (
      <PageColumn>
        <Card data-testid="obs-error-boundary">
          <CardTitle>確認データが見つかりません</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">入力画面からやり直してください。</p>
          <Button className="mt-4" onClick={() => router.push("/observation/input")} data-testid="obs-retry-btn">
            入力へ戻る
          </Button>
        </Card>
      </PageColumn>
    );
  }

  const goBackToInput = (edit: "photo" | "measurement" | "env") => {
    writeDraft(draft);
    router.push(`/observation/input?from=confirm&edit=${edit}`);
  };

  return (
    <PageColumn data-testid="obs-confirm-page">
      <Stack>
        <header>
          <h1 className="text-2xl font-normal">登録前の確認</h1>
          <p className="mt-2 text-sm text-civ-muted">3 チャンク（観測個体データ · 写真 · 撮影時環境）を確認してから登録します</p>
        </header>

        <Card data-testid="obs-chunk-individual-data">
          <CardTitle>観測個体データ</CardTitle>
          <p className="mt-2 text-xs text-civ-muted">
            フェーズ: {draft.phaseLabel} / 性別: {draft.sex}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {draft.rows.map((row) => (
              <li key={`${row.item}-${row.unit}-${row.deviceId ?? ""}`}>
                {row.item}: {row.value || "—"} {row.unit}
                {" · "}
                source: {measurementRowSource(row)}
              </li>
            ))}
          </ul>
          {!draft.hasPhoto && shouldIncludeEnvironmentSnapshot(draft) ? (
            <p className="mt-2 text-sm text-civ-muted" data-testid="obs-confirm-measurement-env">
              環境スナップショット同梱 · 温度: {envSnapshotTemperature(draft.envSnapshot) || draft.envTemperature || "—"}℃ ·
              湿度: {envSnapshotHumidity(draft.envSnapshot) || draft.envHumidity || "—"}% · 取得元:{" "}
              {envSnapshotSourceLabel(draft.envSnapshot.source)}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => goBackToInput("measurement")}
            data-testid="obs-edit-measurement"
          >
            計測値を編集
          </Button>
        </Card>

        <Card data-testid="obs-chunk-photo">
          <CardTitle>写真追加</CardTitle>
          {draft.hasPhoto ? (
            <img
              src={draft.photoPreviewUrl || draft.photoPreview}
              alt="確認用写真"
              className="mt-3 max-h-56 w-full rounded-card object-contain"
            />
          ) : (
            <p className="mt-2 text-sm text-civ-muted">写真は未登録です</p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => goBackToInput("photo")}
            data-testid="obs-edit-photo"
          >
            写真を編集
          </Button>
        </Card>

        {draft.hasPhoto ? (
          <Card data-testid="obs-chunk-photo-env">
            <CardTitle>写真撮影時 環境データ</CardTitle>
            <p className="mt-2 text-sm text-civ-muted" data-testid="obs-confirm-photo-env">
              撮影条件:{" "}
              {draft.photoConditions.length > 0
                ? draft.photoConditions.map((row) => `${row.item}:${row.value || "—"}${row.unit || ""}`).join(" / ")
                : "未入力"}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => goBackToInput("photo")}
              data-testid="obs-edit-photo-env"
            >
              撮影時環境を編集
            </Button>
          </Card>
        ) : null}

        <Card data-testid="obs-name-history">
          <CardTitle>命名チャンク</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">
            individual: {draft.individualId || "未指定"} / display_name: {draft.displayName || "未設定"}
          </p>
          <p className="mt-1 text-xs text-civ-muted">
            父: {draft.sireId || "未設定"} / 母: {draft.damId || "未設定"}
          </p>
          {nameHistory.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {nameHistory.map((item, index) => (
                <li key={`${item.created_at ?? "na"}-${index}`}>
                  {item.action}: {item.old_name ?? "—"} → {item.new_name ?? "—"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-civ-muted">改名履歴はまだありません</p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => goBackToInput("measurement")}
          >
            命名を編集
          </Button>
        </Card>

        <Card data-testid="obs-chunk-periodic">
          <CardTitle>環境・設置サマリー</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">
            設置場所: {draft.placementId || "未選択"}
          </p>
          <p className="mt-1 text-sm text-civ-muted">
            設置開始日: {draft.placementStartedAt || "—"}
          </p>
          <p className="mt-1 text-sm text-civ-muted">
            機器:
            {" "}
            {draft.devices.length > 0
              ? draft.devices.map((d) => `${d.role}:${d.deviceId}`).join(" / ")
              : draft.deviceId || "未選択"}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => goBackToInput("env")}
            data-testid="obs-edit-periodic"
          >
            環境・設置を編集
          </Button>
        </Card>

        <Card data-testid="obs-next-observation-summary">
          <CardTitle>次回観測サマリー</CardTitle>
          <p className="mt-2 text-sm text-civ-muted">
            {draft.skipNextObservation
              ? "次回観測日は未設定です"
              : draft.nextObservationAt
                ? `次回観測予定: ${draft.nextObservationAt}（${draft.nextObservationSource === "template_default" ? "テンプレ由来" : "ユーザー指定"}）`
                : "次回観測日は未入力です"}
          </p>
          <Button type="button" variant="secondary" className="mt-3" onClick={() => goBackToInput("env")}>
            次回観測日を編集
          </Button>
        </Card>

        {error ? (
          <Card data-testid="obs-error-boundary">
            <CardTitle>登録エラー</CardTitle>
            <p className="mt-2 text-sm text-civ-danger">{error}</p>
            <Button
              type="button"
              className="mt-3"
              variant="secondary"
              onClick={registerObservation}
              data-testid="obs-retry-btn"
            >
              再試行
            </Button>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={registerObservation} disabled={submitting} data-testid="obs-register-submit">
            {submitting ? "登録中..." : "登録する"}
          </Button>
          <label className="min-w-[16rem] flex-1 text-sm text-civ-muted">
            テンプレート名
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="例: ヘラクレス 生体 テンプレ"
              data-testid="obs-template-name-input"
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={saveAsTemplate}
            disabled={templateSavePending}
            data-testid="obs-save-template-btn"
          >
            {templateSavePending ? "保存中..." : "この設定をテンプレートとして保存"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/observation")}
            data-testid="obs-cancel-btn"
          >
            キャンセル
          </Button>
        </div>
        {templateSaveResult ? (
          <p
            className={`text-sm ${templateSaveResult.includes("失敗") || templateSaveResult.includes("入力してください") ? "text-civ-danger" : "text-civ-muted"}`}
            data-testid="obs-template-save-result"
          >
            {templateSaveResult}
          </p>
        ) : null}
      </Stack>
    </PageColumn>
  );
}
