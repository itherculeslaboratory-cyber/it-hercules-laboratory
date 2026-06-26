# 観測 5 ステップ × モック RTM ギャップ表 v1

> **ステータス**: DRAFT — **HQ-08 ギャップあり確定**（ユーザー確認 2026-06-18）  
> **正本**: `機能一覧/要件定義/21-UI再構築・テーマ分離・E2E要件-v1-DRAFT.md` §6 · `02-設計/E2E/05-観測-E2E-v1-DRAFT.md`  
> **モック正本**: `02-設計/_ui-global/mockups/ihl-05-*.png`  
> **対応アクション**: Phase 1 RTM 作成時に不足 mock を列挙 · Phase 5（UI 設計）前に mock 補完 or 新規生成

---

## §1 — 観測 5 ステップ定義（UI 再構築要件 §6.1）

| Step | 画面 / ルート | 内容 | デュアルプライマリ |
|------|--------------|------|-------------------|
| **①②** | `05ctx` `/observation/context` | 種族（ObservationTarget）・発育段階選択 | — |
| **③** | `05i` `/observation/input` | 採取物・採取機器選択 | — |
| **④** | `05i` 同上 | タイミング・方法分岐 | **[一括取得]** と **[写真撮影]** 両方 primary（HQ-04 確定）|
| **⑤** | `obs.confirm` `/observation/input/confirm` | 写真・計測・定期取得の 3 チャンク確認 | 主ボタンは **[登録]** のみ |
| **⑥** | 登録完了（モーダル or 成功画面）| R2 INSERT 後の成功状態 + 次アクション | — |

> **注**: 旧モック群は「検索グリッド・詳細・テンプレ・IoT」中心。**§6 の 5 ステップ完走導線とは画面構成が一致しない**（ユーザー指摘「そろってない」）。

---

## §2 — ステップ × mock 充足マトリクス

| Step | 要件 ID（抜粋）| 必要な UI 状態 | 既存 mock | 充足 | ギャップ内容 |
|------|---------------|---------------|-----------|------|-------------|
| ①② | UI-REBUILD-OBS-01〜04 | ドメイン選択 · 分類ツリー · 亜種確定 · 適用 | `ihl-05-obs-context-picker.png` | **△** | コンテキストピッカーはあるが **発育段階（phase）選択** の明示状態が弱い · DHH 確定後の「適用」完了画面なし |
| ③ | UI-REBUILD-OBS-05〜07 | 採取アイテム checklist · 採取機器選択 · セッション保持 | `ihl-05-obs-input-row.png` · `-male` · `-female` | **△** | 旧 **種族 DD / フェーズ DD** レイアウト。**05ctx 引き継ぎ後の採取物・機器 UI** が §6 と不一致 |
| ④a | UI-REBUILD-OBS-08, 10, 11 | **[一括取得]** primary · フェッチ中 · フェッチ完了 · StatusStrip | — | **✗** | **デュアルプライマリ＋一括取得フロー用 mock なし** |
| ④b | UI-REBUILD-OBS-09, 10, 11, OBS-SOL-06 | **[写真撮影]** primary · 写真プレビュー · 撮影条件入力 | — | **✗** | **写真撮影経路 mock なし**（プレビュー・撮影条件テキスト併記なし）|
| ⑤ | UI-REBUILD-OBS-12〜14 | 3 チャンク（写真・計測・定期取得）· 修正導線 · [登録] 1 主ボタン | — | **✗** | **`obs.confirm` 画面 mock なし** |
| ⑥ | UI-REBUILD-OBS-15〜17 | 登録成功 · 次アクション（グリッド/ホーム）| — | **✗** | **登録完了・成功状態 mock なし** |

### スコープ外（5 ステップだが W3 補助導線 · HQ-05 確定）

| 画面 | 既存 mock | 5 ステップとの関係 |
|------|-----------|-------------------|
| `05a` 検索グリッド | `ihl-05-obs-search-grid.png` | 登録後の遷移先。Step ⑥ の「次アクション」先として必要だが **完走フロー中の Step ではない** |
| `05b` 詳細 | `ihl-05-obs-detail-similar.png` | 参照・類似探索。5 ステップ必須ではない |
| `05tl` / `05td` / Fork | `template-list` · `template-detail` · `template-fork` | テンプレ経路（**HQ-05 確定: W3 実装スコープ**）。SC-05-TPL-01 で E2E 検証 |
| IoT バナー | `ihl-05-obs-device-link.png` | 機器未登録時の補助。Step ③ の機器選択の一部 |

---

## §3 — 不足 mock 一覧（Phase 1 RTM / Phase 5 前に補完）

| 優先 | 提案ファイル名 | 画面 ID | 必須要素 | 対応 REQ / E2E |
|------|---------------|---------|----------|----------------|
| **P0** | `ihl-05-obs-input-dual-primary.png` | `05i` | [一括取得] + [写真撮影] **両方 primary** · 採取物 checklist · 機器選択 · StatusStrip 領域 | UI-REBUILD-OBS-08〜11 · SC-05-BULK-01 / SC-05-PHOTO-01 |
| **P0** | `ihl-05-obs-input-bulk-fetching.png` | `05i` | 一括取得クリック後「フェッチ中...」| UI-REBUILD-OBS-11 |
| **P0** | `ihl-05-obs-input-bulk-done.png` | `05i` | フェッチ完了 · 計測値自動入力 · 「確認へ」CTA | SC-05-BULK-01 |
| **P0** | `ihl-05-obs-input-photo-capture.png` | `05i` | 写真プレビュー · 撮影条件入力 · 色補正なし注記 | UI-REBUILD-OBS-09 · OBS-SOL-06 · SC-05-PHOTO-01 |
| **P0** | `ihl-05-obs-input-confirm.png` | `obs.confirm` | 3 チャンク（写真・計測・定期取得）· [登録] 1 主 · 修正導線 | UI-REBUILD-OBS-12〜14 · SC-05-CONFIRM-01 |
| **P0** | `ihl-05-obs-register-success.png` | `05done` | 「登録完了」· 観測グリッド/ホームへの次アクション | UI-REBUILD-OBS-15〜17 · SC-05-REG-01 |
| P1 | `ihl-05-obs-input-error-fetch.png` | `05i` | フェッチ API エラー · 手動入力フォールバック | SC-05-NEG-03 |
| P1 | `ihl-05-obs-ctx-stage-selected.png` | `05ctx` | 発育段階選択済み · DHH + stage チップ表示 | UI-REBUILD-OBS-02 |

**合計**: 現状 **5 ステップ完走に必須の P0 mock が 6 枚不足**（既存 10 枚は補助・旧フロー中心）。

---

## §4 — RTM（REQ × mock_ref）

| REQ ID | mock_ref（現状）| mock_ref（目標）| ステータス |
|--------|----------------|----------------|-----------|
| UI-REBUILD-OBS-01〜04 | `ihl-05-obs-context-picker.png`（△）| 同上 + `ihl-05-obs-ctx-stage-selected.png` | **GAP** |
| UI-REBUILD-OBS-05〜07 | `ihl-05-obs-input-row.png`（旧 DD 版）| `ihl-05-obs-input-dual-primary.png` | **GAP** |
| UI-REBUILD-OBS-08〜11 | — | `input-dual-primary` · `input-bulk-*` · `input-photo-capture` | **GAP** |
| UI-REBUILD-OBS-12〜14 | — | `ihl-05-obs-input-confirm.png` | **GAP** |
| UI-REBUILD-OBS-15〜17 | — | `ihl-05-obs-register-success.png` | **GAP** |
| UI-REBUILD-MOCK-06 | 53 枚に 5 ステップ含むか | **否 — HQ-08 確定** | **GAP** |

---

## §5 — 次アクション

1. **Phase 1 RTM** — 上表を `モック↔要件 RTM` に転記し、不足行に `mock_ref=TODO` を明示
2. **Phase 5 前** — P0 の 6 枚を `archive-mock.mjs` 経由で生成（`05i` 既存 3 枚は **置換ではなく追加** — 旧フロー参照用に残す）
3. **walkthrough.js** — `05confirm` · `05done` 画面 ID を追加
4. **ScreenDef** — `obs.confirm` の `mock_ref` を Phase 5 で埋める

---

*HQ-05 W3 テンプレ統合確定 · HQ-08 ギャップあり確定 · ユーザー確認 2026-06-18 · Phase 1 RTM 入力用*
