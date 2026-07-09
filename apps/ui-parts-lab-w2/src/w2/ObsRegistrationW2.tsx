import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  hot,
  ObsBreadcrumb,
  ObsDeepNav,
  ObsGenderToggle,
  ObsScreenWrap,
  ObsTargetChip,
} from "@ihl/ui-catalog/components/features/observation/obs-shared";
import { W2ShellOnly } from "./withW2Shell";
import {
  hydrateDraftFromContext,
  readObservationDraft,
  targetChipLabel,
  writeObservationDraft,
  type ObservationLabDraft,
} from "./observation-draft-lab";

const INPUT_ID = "ihl-05-obs-input-row";
const CONFIRM_ID = "ihl-05-obs-confirm";
const IOT_ID = "ihl-05-obs-device-link";

const PHASES = ["L1 幼虫", "L2 幼虫", "L3 幼虫", "前蛹", "蛹", "成虫"];

function ObsCard({ title, children, testId }: { title: string; children: ReactNode; testId?: string }) {
  return (
    <section className="obs-card" data-testid={testId} style={{ marginBottom: 16 }}>
      <h3 className="obs-context-section__label" style={{ marginTop: 0 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 3101 専用 — 05i 計測入力（ui/観測入力-v2.md · 主 CTA=確認へ） */
export function ObsInputRowContentAreaW2({ onAction, onNavigate, className, screenParams }: W2ComponentProps) {
  const [draft, setDraft] = useState<ObservationLabDraft>(() => hydrateDraftFromContext());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(hydrateDraftFromContext());
  }, []);

  const gender = draft.sex === "female" ? "female" : draft.sex === "male" ? "male" : "male";

  const updateDraft = useCallback((patch: Partial<ObservationLabDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      writeObservationDraft(next);
      return next;
    });
  }, []);

  const chipLabel = useMemo(
    () => targetChipLabel(draft.context, draft.phaseLabel),
    [draft.context, draft.phaseLabel],
  );

  const handleConfirm = () => {
    const hasValue = draft.rows.some((r) => r.value.trim());
    if (!hasValue) {
      setValidationError("計測値を 1 行以上入力してください");
      return;
    }
    setValidationError(null);
    writeObservationDraft(draft);
    hot(onAction, 6);
    onNavigate?.("05confirm");
  };

  const editSection = screenParams?.edit;

  return (
    <W2ShellOnly feature="obs">
      <ObsScreenWrap className={className} componentId={`${INPUT_ID}__ContentArea`}>
        <ObsBreadcrumb segments={["観測", "計測入力"]} />

        {validationError && (
          <div className="obs-card" role="alert" style={{ borderColor: "var(--civ-danger)", marginBottom: 16 }}>
            {validationError}
          </div>
        )}

        <ObsCard title="■ 観測対象 / コンテキスト" testId="obs-target-card">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <ObsTargetChip label={chipLabel} onClick={() => onNavigate?.("05ctx")} />
            <div className="obs-field" style={{ minWidth: 120 }}>
              <label htmlFor="obs-phase-w2">フェーズ（令）</label>
              <select
                id="obs-phase-w2"
                value={draft.phaseLabel}
                onChange={(e) => updateDraft({ phaseLabel: e.target.value })}
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <ObsGenderToggle
              value={gender}
              onChange={(v) => updateDraft({ sex: v })}
            />
            <span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>テンプレ: ヘラクレス標準 ✓</span>
          </div>
        </ObsCard>

        <ObsCard title="■ 環境・設置" testId="obs-env-placement-chunk">
          <div className="obs-input-row-fields">
            <div className="obs-field">
              <label htmlFor="obs-placement-w2">棚</label>
              <select
                id="obs-placement-w2"
                value={draft.placementId}
                onChange={(e) => updateDraft({ placementId: e.target.value })}
              >
                <option value="">棚未登録</option>
                <option value="shelf-a">幼虫棚 A</option>
                <option value="shelf-b">幼虫棚 B</option>
              </select>
            </div>
            <div className="obs-field">
              <label htmlFor="obs-placement-start-w2">設置開始日</label>
              <input
                id="obs-placement-start-w2"
                type="date"
                value={draft.placementStartedAt}
                onChange={(e) => updateDraft({ placementStartedAt: e.target.value })}
              />
            </div>
            <div className="obs-field">
              <label htmlFor="obs-device-w2">機器</label>
              <select
                id="obs-device-w2"
                value={draft.deviceId}
                onChange={(e) => updateDraft({ deviceId: e.target.value })}
              >
                <option value="">未選択</option>
                <option value="sb-living">SwitchBot リビング</option>
              </select>
            </div>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: "0.8125rem" }}>
            <input
              type="checkbox"
              checked={draft.includeEnvSnapshot}
              onChange={(e) => updateDraft({ includeEnvSnapshot: e.target.checked })}
            />
            環境スナップショット同梱（写真なし時）
          </label>
          {!draft.deviceId && (
            <button type="button" className="obs-btn-outline" style={{ marginTop: 8 }} onClick={() => onNavigate?.("13")}>
              機器管理へ
            </button>
          )}
        </ObsCard>

        <ObsCard title="■ 次回観測" testId="obs-next-obs-chunk">
          <div className="obs-input-row-fields">
            <div className="obs-field">
              <label htmlFor="obs-next-date-w2">次回観測日</label>
              <input
                id="obs-next-date-w2"
                type="date"
                disabled={draft.skipNextObservation}
                value={draft.nextObservationAt}
                onChange={(e) =>
                  updateDraft({ nextObservationAt: e.target.value, nextObservationSource: "user" })
                }
              />
            </div>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: "8px 0" }}>
            ℹ テンプレ: 2令→3令 3ヶ月（上書き可）
          </p>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.8125rem" }}>
            <input
              type="checkbox"
              checked={draft.skipNextObservation}
              onChange={(e) => updateDraft({ skipNextObservation: e.target.checked })}
            />
            今回は設定しない
          </label>
        </ObsCard>

        <ObsCard
          title="■ 観測個体データ"
          testId={editSection === "measurement" ? "obs-chunk-individual-data obs-edit-focus" : "obs-chunk-individual-data"}
        >
          <div className="obs-input-row-fields">
            <div className="obs-field">
              <label htmlFor="obs-item-w2">項目</label>
              <select
                id="obs-item-w2"
                value={draft.rows[0]?.item ?? "weight"}
                onChange={(e) => {
                  const rows = [...draft.rows];
                  rows[0] = { ...rows[0], item: e.target.value };
                  updateDraft({ rows });
                }}
              >
                <option value="weight">体重</option>
                <option value="length">体長</option>
                {gender === "male" && <option value="horn">角長</option>}
              </select>
            </div>
            <div className="obs-field">
              <label htmlFor="obs-value-w2">数値</label>
              <input
                id="obs-value-w2"
                type="text"
                placeholder="数値を入力"
                value={draft.rows[0]?.value ?? ""}
                onChange={(e) => {
                  const rows = [...draft.rows];
                  rows[0] = { ...rows[0], value: e.target.value };
                  updateDraft({ rows });
                }}
              />
            </div>
            <div className="obs-field">
              <label htmlFor="obs-unit-w2">単位</label>
              <select
                id="obs-unit-w2"
                value={draft.rows[0]?.unit ?? "g"}
                onChange={(e) => {
                  const rows = [...draft.rows];
                  rows[0] = { ...rows[0], unit: e.target.value };
                  updateDraft({ rows });
                }}
              >
                <option value="g">g</option>
                <option value="mm">mm</option>
              </select>
            </div>
            <div className="obs-field">
              <label htmlFor="obs-method-w2">計測方法</label>
              <select
                id="obs-method-w2"
                value={draft.rows[0]?.method ?? "manual_entry"}
                onChange={(e) => {
                  const rows = [...draft.rows];
                  rows[0] = { ...rows[0], method: e.target.value as "manual_entry" | "iot_switchbot" };
                  updateDraft({ rows });
                }}
              >
                <option value="manual_entry">手入力</option>
                <option value="iot_switchbot">IoT取得</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <button type="button" className="obs-btn-outline" onClick={() => hot(onAction, 7)}>
              行を追加
            </button>
            <button type="button" className="obs-btn-outline" onClick={() => onNavigate?.("05tl")}>
              テンプレから
            </button>
          </div>
        </ObsCard>

        <ObsCard title="■ 写真追加" testId="obs-chunk-photo-add">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="obs-btn-outline" onClick={() => updateDraft({ hasPhoto: true })}>
              写真を選択
            </button>
            <button type="button" className="obs-btn-outline" onClick={() => updateDraft({ hasPhoto: true })}>
              撮影する
            </button>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 8 }}>
            {draft.hasPhoto ? "写真 1 枚選択済み（lab mock）" : "写真は未選択"}
          </p>
        </ObsCard>

        <ObsDeepNav
          onAction={onAction}
          links={[
            { label: "対象ナビゲータ", hotspot: 0 },
            { label: "テンプレ一覧", hotspot: 3 },
          ]}
        />
      </ObsScreenWrap>
      <nav className="w2-hand-shell__footer" aria-label="観測導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("05ctx")}>
          対象を選ぶ
        </button>
        <button type="button" className="obs-btn-primary" style={{ marginLeft: "auto" }} onClick={handleConfirm}>
          確認へ
        </button>
      </nav>
    </W2ShellOnly>
  );
}

export function ObsInputRowPrimaryActionW2({ onAction, onNavigate }: W2ComponentProps) {
  const handleConfirm = () => {
    const draft = readObservationDraft() ?? hydrateDraftFromContext();
    writeObservationDraft(draft);
    hot(onAction, 6);
    onNavigate?.("05confirm");
  };

  return (
    <div className="obs-actions-row" style={{ padding: "12px 16px" }}>
      <button type="button" className="obs-btn-primary" onClick={handleConfirm}>
        確認へ
      </button>
    </div>
  );
}

export function ObsInputRowStatePanelW2(_props: W2ComponentProps) {
  return null;
}

function itemLabel(item: string): string {
  const map: Record<string, string> = { weight: "体重", length: "体長", horn: "角長" };
  return map[item] ?? item;
}

/** 3101 専用 — 05confirm 登録前確認（observation-confirm.md · TRN v2） */
export function ObsConfirmContentAreaW2({ onAction, onNavigate, className }: W2ComponentProps) {
  const [draft, setDraft] = useState<ObservationLabDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft(readObservationDraft());
  }, []);

  const handleRegister = async () => {
    if (!draft) return;
    const hasValue = draft.rows.some((r) => r.value.trim());
    if (!hasValue) {
      setError("入力値が不足しています");
      return;
    }
    setSubmitting(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setToast("観測を登録しました（lab mock）");
    hot(onAction, 0);
    window.setTimeout(() => onNavigate?.("01"), 1200);
  };

  if (!draft) {
    return (
      <W2ShellOnly feature="obs">
        <ObsScreenWrap className={className} componentId={`${CONFIRM_ID}__ContentArea`}>
          <ObsBreadcrumb segments={["観測", "登録前の確認"]} />
          <div className="obs-card" data-testid="obs-error-boundary">
            <h2 className="obs-page-title" style={{ fontSize: "1.125rem" }}>
              確認データが見つかりません
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--civ-fg-muted)" }}>
              入力画面からやり直してください。
            </p>
            <button
              type="button"
              className="obs-btn-primary"
              style={{ marginTop: 16 }}
              data-testid="obs-retry-btn"
              onClick={() => onNavigate?.("05i")}
            >
              入力へ戻る
            </button>
          </div>
        </ObsScreenWrap>
      </W2ShellOnly>
    );
  }

  const ctx = draft.context;
  const sexLabel = draft.sex === "male" ? "雄" : draft.sex === "female" ? "雌" : "unknown";

  return (
    <W2ShellOnly feature="obs">
      <ObsScreenWrap className={className} componentId={`${CONFIRM_ID}__ContentArea`} data-testid="obs-confirm-page">
        <ObsBreadcrumb segments={["観測", "登録前の確認"]} />
        <h1 className="obs-page-title">登録前の確認</h1>
        <p style={{ margin: "0 0 16px", fontSize: "0.875rem", color: "var(--civ-fg-muted)" }}>
          3 チャンク（観測個体データ · 写真 · 撮影時環境）を確認してから登録します
        </p>

        {error && (
          <div
            className="obs-card"
            role="alert"
            data-testid="obs-error-boundary"
            style={{ borderColor: "var(--civ-danger)", marginBottom: 16 }}
          >
            <strong>登録エラー</strong>
            <p style={{ color: "var(--civ-danger)", margin: "8px 0" }}>{error}</p>
            <button type="button" className="obs-btn-outline" data-testid="obs-retry-btn" onClick={handleRegister}>
              再試行
            </button>
          </div>
        )}

        {toast && (
          <div className="obs-card" role="status" style={{ borderColor: "var(--civ-success)", marginBottom: 16 }}>
            {toast}
          </div>
        )}

        <ObsCard title="■ 観測個体データ" testId="obs-chunk-individual-data">
          <p style={{ margin: "0 0 8px", fontSize: "0.875rem" }}>
            {ctx?.displayJa ?? "対象未設定"} · {draft.phaseLabel} · 性別: {sexLabel}
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.875rem" }}>
            {draft.rows.map((r, i) => (
              <li key={i}>
                {itemLabel(r.item)}: {r.value} {r.unit} · {r.method === "manual_entry" ? "手入力" : "IoT"}
              </li>
            ))}
          </ul>
          {draft.includeEnvSnapshot && (
            <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", marginTop: 8 }}>
              ※ 環境スナップショット同梱
            </p>
          )}
          <button
            type="button"
            className="obs-btn-outline"
            style={{ marginTop: 8 }}
            data-testid="obs-edit-measurement"
            onClick={() => onNavigate?.("05i", { edit: "measurement" })}
          >
            計測値を編集
          </button>
        </ObsCard>

        <ObsCard title="■ 写真追加" testId="obs-chunk-photo">
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            {draft.hasPhoto ? "写真 1 枚（lab mock preview）" : "写真は未登録です"}
          </p>
          <button
            type="button"
            className="obs-btn-outline"
            style={{ marginTop: 8 }}
            data-testid="obs-edit-photo"
            onClick={() => onNavigate?.("05i", { edit: "photo" })}
          >
            写真を編集
          </button>
        </ObsCard>

        <ObsCard title="■ 環境・設置" testId="obs-chunk-periodic">
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            棚: {draft.placementId || "未設定"} · 設置開始: {draft.placementStartedAt || "—"}
          </p>
          <p style={{ fontSize: "0.875rem", margin: "8px 0 0" }}>
            機器: {draft.deviceId ? `${draft.deviceRole}:${draft.deviceId}` : "未宣言"}
          </p>
          <button
            type="button"
            className="obs-btn-outline"
            style={{ marginTop: 8 }}
            data-testid="obs-edit-periodic"
            onClick={() => onNavigate?.("05i", { edit: "env" })}
          >
            環境・設置を編集
          </button>
        </ObsCard>

        <ObsCard title="■ 次回観測" testId="obs-next-observation-summary">
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            {draft.skipNextObservation
              ? "今回は設定しない"
              : draft.nextObservationAt
                ? `予定日: ${draft.nextObservationAt}${draft.nextObservationSource === "template_default" ? "（テンプレ由来）" : ""}`
                : "未設定"}
          </p>
        </ObsCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <button
            type="button"
            className="obs-btn-primary"
            disabled={submitting}
            data-testid="obs-register-submit"
            onClick={handleRegister}
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
          <button type="button" className="obs-btn-outline" data-testid="obs-save-template-btn">
            この設定をテンプレートとして保存
          </button>
          <button type="button" className="w2-hand-shell__link" data-testid="obs-cancel-btn" onClick={() => onNavigate?.("05ctx")}>
            キャンセル
          </button>
        </div>
      </ObsScreenWrap>
      <nav className="w2-hand-shell__footer" aria-label="観測導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("05i")}>
          戻って編集
        </button>
      </nav>
    </W2ShellOnly>
  );
}

export function ObsConfirmPrimaryActionW2(_props: W2ComponentProps) {
  return null;
}

export function ObsConfirmStatePanelW2(_props: W2ComponentProps) {
  return null;
}

/** 3101 専用 — 05iot 機器未登録 */
export function ObsDeviceLinkContentAreaW2({ onAction, onNavigate, className }: W2ComponentProps) {
  return (
    <W2ShellOnly feature="obs">
      <ObsScreenWrap className={className} componentId={`${IOT_ID}__ContentArea`}>
        <ObsBreadcrumb segments={["観測", "計測入力", "IoT"]} />
        <h1 className="obs-page-title">観測 計測入力</h1>
        <p style={{ margin: "0 0 16px", fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>
          IoT 計測方法を選択中 — 機器登録が必要です
        </p>

        <div className="obs-card">
          <div className="obs-input-row-fields">
            <div className="obs-field">
              <label htmlFor="iot-item-w2">項目</label>
              <select id="iot-item-w2" defaultValue="temp">
                <option value="temp">温度</option>
                <option value="humidity">湿度</option>
                <option value="light">照度レベル</option>
              </select>
            </div>
            <div className="obs-field">
              <label htmlFor="iot-value-w2">数値</label>
              <input id="iot-value-w2" type="text" defaultValue="—" readOnly aria-readonly />
            </div>
            <div className="obs-field">
              <label htmlFor="iot-unit-w2">単位</label>
              <select id="iot-unit-w2" defaultValue="c">
                <option value="c">℃</option>
              </select>
            </div>
            <div className="obs-field">
              <label htmlFor="iot-method-w2">計測方法</label>
              <select id="iot-method-w2" defaultValue="iot">
                <option value="iot">IoT取得</option>
              </select>
            </div>
          </div>

          <div className="obs-iot-banner">
            <span className="obs-iot-banner__icon" aria-hidden>
              ⚠
            </span>
            <div className="obs-iot-banner__text">
              <strong>機器が未登録です</strong>
              <p>IoTで計測するには機器の登録が必要です</p>
            </div>
            <button type="button" className="obs-btn-primary" onClick={() => hot(onAction, 0)}>
              機器管理へ
            </button>
          </div>
        </div>

        <ObsDeepNav onAction={onAction} links={[{ label: "計測入力へ戻る", hotspot: 1 }]} />
      </ObsScreenWrap>
      <nav className="w2-hand-shell__footer" aria-label="観測導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("05i")}>
          計測入力
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("13")}>
          機器管理
        </button>
      </nav>
    </W2ShellOnly>
  );
}

export function ObsDeviceLinkPrimaryActionW2(_props: W2ComponentProps) {
  return null;
}

export function ObsDeviceLinkStatePanelW2(_props: W2ComponentProps) {
  return null;
}
