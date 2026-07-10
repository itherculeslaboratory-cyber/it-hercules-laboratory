---
id: V3-B5-DESIGN-VIDEO-v1
title: ver3 動画量産パイプライン設計書 v1（B5 — 台本→TTS→画像→字幕→合成→投稿スタック→1日1本）
date: 2026-07-10
status: reviewed
phase: B5
depends_on:
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-tts-video-stack-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
  - docs/planning/ver3/b3/ver3-ワークスペース設計-v1.md
  - docs/planning/ver3/b4/ver3-設計書-AI用-v1.md
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
requirement_ids:
  [V3-VID-01, V3-VID-02, V3-VID-03, V3-VID-07, V3-VID-08, V3-VID-13, V3-VID-14,
   V3-VID-15, V3-VID-16, V3-VID-18, V3-VID-19, V3-VID-27, V3-VID-28,
   V3-VID-ROUTE-A, V3-VID-ROUTE-C, V3-VID-STORE,
   V3-AIP-75, V3-AIP-96, V3-CST-03, V3-SEC-35, V3-SEC-52]
---

# ver3 動画量産パイプライン設計書 v1（B5）

> **読者**: 将来の実装 AI エージェント（AIファースト・日本語正本）。
> **これは設計であり実装ではない**。本書に「動く」ものは存在しない。実装は Phase C の第2波ゲート通過後（`b3/ver3-開発計画-v1.md` §3.2: C-W2-1〜4 は C3 完了時点で充足見込み、起案は C4 以降の別計画）。
> **契約の載せ先**: 全イベントは B4 エンベロープ正本（`b4/ver3-設計書-AI用-v1.md` §1）、全部品は C-USB manifest スキーマ（同 §4）、R2 キー空間（同 §2）に載る。本書は video ドメイン固有の追加契約のみ定義する。
> **撤回不能条項**（`ver3-最終要件定義書-v1.md:690`）: 「**分割点で人間が手を入れて手垢がつく。それが魂になる**」——分割点 OK/NG と公開ボタンの人間ゲートは効率上の妥協ではなく本質価値。将来の自動化率向上でも除去しない。
> 撤回台帳: R-1（誇張演出）・R-3（自動対話方式）・R-6（無断 cron）に触れる設計は本書に存在しない。スケジュール定義は全てユーザー承認済み night-task 定義（B4 §10）経由。

---

## 1. エンドツーエンド設計図

### 1.1 全体 ASCII（各段 = 1 C-USB 部品・段間 = ファイル + イベント）

出典: `b2/research-tts-video-stack-v1.md` §5 推奨スタック、V3-VID-01/02/27。

```text
[入力ソース]                                [人間ゲート]  ▼= OK/NG+修整指示（§2）
 観測データ / 開発ログ / wiki（3系統 §4）
 過去成功例 RAG（video.model.json + OK台本 index）
        │
        ▼
┌────────────────────┐
│ ① video-script     │ 台本生成（Hook3秒/本題/例/まとめ・V3-VID-28）
│  LLM(中層) 1台本1呼 │ 出力: script.json（1カット1要素）
└────────────────────┘
        ▼ G-S ── 台本ゲート
┌────────────────────┐
│ ② video-tts        │ VOICEVOX 互換 HTTP API = C-USB 境界
│  /audio_query →     │ 1発話 = 1呼び出し = 1 wav（バッチ禁止 V3-VID-27）
│  /synthesis         │ 出力: cuts/<n>.wav + timing.json（モーラ時刻）
└────────────────────┘
        ▼ G-A ── 音声ゲート
┌────────────────────┐
│ ③ video-image      │ 再利用優先: open_clip cosine ≥ 0.75 → 既存 png 再利用
│  open_clip + ComfyUI│ 未満のみ ComfyUI API JSON POST /prompt（8GB VRAM・1カット1枚）
└────────────────────┘ 出力: cuts/<n>.png + reuse_log.json
        ▼ G-I ── 画像ゲート
┌────────────────────┐
│ ④ video-subtitle   │ script.json + timing.json → ASS 生成（Python 標準libのみ）
│                     │ スタイル固定: 太字白文字黒縁・下部・1行22字・2行まで(V3-VID-14)
└────────────────────┘ 出力: cuts/<n>.ass
        ▼（字幕は合成ゲートでまとめて見る）
┌────────────────────┐
│ ⑤ video-compose    │ ffmpeg 一発/カット: 画像 loop + 立ち絵 overlay + ass 焼き込み
│  ffmpeg + 薄いPython│ + wav mux → 1カット1mp4 → concat demuxer で結合
└────────────────────┘ 出力: final.mp4 + final_hash
        ▼ G-C ── 合成プレビューゲート（批評家 AI → 人間の順）
┌────────────────────┐
│ ⑥ video-thumbnail  │ Pillow テンプレ合成（タイトル文字+キービジュアル）
│ ⑦ video-meta       │ PF 別タイトル/タグ/説明欄（文字数制限・チャプター V3-VID-14）
└────────────────────┘ 出力: thumb.png + meta.json（VOICEVOX クレジット文字列含む）
        ▼
┌────────────────────┐
│ ⑧ video-stack      │ 投稿スタック（承認済み在庫。§3 在庫モデル）
└────────────────────┘ イベント: ihl.vid.stacked.v1
        ▼ 1日1本 FIFO
┌────────────────────┐
│ ⑨ video-publish    │ YouTube Data API videos.insert(privacyStatus=private) のみ自動
│    -youtube         │ イベント: ihl.vid.uploaded.v1
└────────────────────┘
        ▼ G-P ── 公開ゲート（初期人間ゲート・R1。公開切替クリックは人間）
        │            イベント: ihl.vid.published.v1
        ▼
┌────────────────────┐
│ ⑩ video-export     │ TikTok/X 半自動: ファイル+meta.json を所定フォルダへ出力、
│    -manual          │ 投稿操作は人間（B2 根拠13/14: 未監査ロック・無料枠制約）
└────────────────────┘
        ▼
  ルーティング表更新: ihl.vid.route_updated.v1（§5 保存戦略）
        ▼
  （第2波 KPI 還流）metrics 取得はユーザー能動操作時のみ（V3-SEC-52）
        ▼
  Evaluator: 全ゲートの OK/NG+理由 → feedback.csv → クラスタリング
             → video.model.json 更新 → ①の RAG 入力へ還流（§2.3）
```

### 1.2 段別合格条件（機械検証可能な形）

| 段 | 部品 | 合格条件（この条件を破る negative TC を 1 本以上持つ） | 出典 |
|---|---|---|---|
| ① 台本 | `video-script` | script.json がスキーマ（§1.4）validate 通過。cuts[0] が hook 型・読み上げ想定 3 秒以内（テキスト長上限で機械判定）。全 cut に `source_event_ids`（provenance）あり。トークン消費が予算内（§6） | V3-VID-28 / V3-SEC-35 |
| ② TTS | `video-tts` | 1 発話 = 1 API 呼び出し（バッチ呼び出しコードパス不存在のアーキテクチャテスト）。wav 数 = cut 数。timing.json のモーラ時刻が単調増加 | V3-VID-27 / B2 §4 |
| ③ 画像 | `video-image` | cosine ≥ 0.75 ヒット時に ComfyUI を呼ばない（reuse_log で検証）。新規生成は 1 呼び出し 1 枚。埋め込みインデックスは追記のみ | V3-VID-03 / V3-VID-18 |
| ④ 字幕 | `video-subtitle` | ASS スタイルが凍結スタイル定義と一致。1 行 22 字・2 行までの折返し規則を機械検査 | V3-VID-14 |
| ⑤ 合成 | `video-compose` | 1 カット 1 ffmpeg 実行 → concat。final.mp4 の音声長と Σwav 長の差 < 100ms。出力先既存で run fail（`fail_if_output_exists`） | V3-VID-27 / B2 根拠16 |
| ⑥⑦ サムネ/メタ | `video-thumbnail` / `video-meta` | meta.json に VOICEVOX クレジット文字列が含まれる（欠落で validate fail）。PF 別文字数制限内 | B2 根拠1 / V3-VID-14 |
| ⑧ スタック | `video-stack` | G-C まで全ゲート OK のものだけ積める（未承認 stacked put → 422） | V3-VID-02 |
| ⑨ 投稿 | `video-publish-youtube` | privacyStatus=private 固定（public/unlisted 指定の insert コードパス不存在）。1 日 2 本目の自動 insert は拒否 | B2 根拠20 / R1 |
| ⑩ 半自動 | `video-export-manual` | 出力のみ。TikTok/X への HTTP POST コードパス不存在（アーキテクチャテスト） | B2 根拠13/14 |

### 1.3 C-USB 部品定義（B4 §4 manifest スキーマに準拠）

1 部品 = `components/<name>/{manifest.json, run.py, tests/, README.md}`。全部品の `contract.guarantees` に `[append_only, idempotent_by_run_id, fail_if_output_exists, errors_jsonl, run_info]` 必須（V3-OBS-08 継承）。

| component_id | runtime | wrapped_oss | C-USB 差替境界（契約） |
|---|---|---|---|
| `video-script` | python | —（LLM 呼び出しドライバ） | 入出力 = script.schema.json。モデルは 3 層ルーティング設定で差替（§6） |
| `video-tts` | external_http | VOICEVOX Engine | **VOICEVOX 互換 REST**（`/audio_query`→`/synthesis`）。AivisSpeech / COEIROINK が無改修差替可（B2 §1） |
| `video-image` | external_http + python | ComfyUI / open_clip | **ComfyUI API JSON**（`POST /prompt`）+ 埋め込み契約（384 とは別系列の open_clip 空間。§1.5 注記） |
| `video-subtitle` | python | —（標準ライブラリのみ） | ASS スタイル定義 YAML（凍結） |
| `video-compose` | python | ffmpeg | **ffmpeg フィルタグラフ文字列**をレシピファイルとして外出し（合成レシピ差替自由） |
| `video-thumbnail` | python | Pillow | サムネテンプレ JSON |
| `video-meta` | python | — | PF 別制約テーブル（YAML） |
| `video-stack` | python | — | review-stack 契約（B4 §10）+ stacked イベント |
| `video-publish-youtube` | python | google-api-python-client | YouTube Data API videos.insert のみ |
| `video-export-manual` | python | — | 出力フォルダ規約のみ |

**オーケストレータ**: 直列 10 部品を回す薄い Python ランナー 1 本（夜間実行時は night-task 定義に載せる — B4 §10）。V3-VID-18 原文の n8n は**初期採用しない**——B2 選定スタック（`research-tts-video-stack-v1.md` §1）に n8n は含まれず、直列 1 本フローに GUI ワークフローエンジンは過剰（不変条項①コスト最小）。C-USB 境界が保たれるため、分岐フローが 3 本以上になった時点で n8n 導入を再裁定できる（後付け可能・撤回不要）。

### 1.4 script.json スキーマ（本書が新規定義する契約）

```json
{
  "$id": "ihl://schemas/video/script.schema.json",
  "type": "object",
  "required": ["script_id", "series", "template", "cuts", "provenance"],
  "properties": {
    "script_id": { "type": "string", "description": "ULID" },
    "series": { "enum": ["research", "system", "dev-struggle"], "description": "3系統(§4)" },
    "template": { "const": "hook-body-example-summary", "description": "V3-VID-28 固定構成" },
    "model_generation": { "type": "integer", "description": "参照した video.model.json の世代" },
    "cuts": {
      "type": "array", "minItems": 4,
      "items": {
        "type": "object",
        "required": ["cut_id", "role", "text", "speaker", "image_prompt", "source_event_ids"],
        "properties": {
          "cut_id": { "type": "string" },
          "role": { "enum": ["hook", "body", "example", "summary"] },
          "text": { "type": "string", "description": "1カット=1段落。hook は読み上げ3秒以内の字数上限" },
          "speaker": { "type": "string", "description": "VOICEVOX speaker id（キャラ確定は人間裁定 — B2 §7-2）" },
          "image_prompt": { "type": "string" },
          "source_event_ids": { "type": "array", "items": { "type": "string" },
            "description": "台本根拠の入力イベント/文書 ID。空配列禁止（V3-SEC-35: 取得元認証可能）" }
        }
      }
    },
    "provenance": { "description": "B4 §1 エンベロープ provenance と同型（model_version/run_id/input_hash 必須）" }
  }
}
```

### 1.5 video ドメインのイベント型（B4 §1 エンベロープに載る・全 append-only）

| type | data（要点） | 発行段 |
|---|---|---|
| `ihl.vid.script_drafted.v1` | {script_id, series, script_hash, model_generation} | ① |
| `ihl.vid.gate_decided.v1` | {run_id, stage: script\|voice\|image\|compose\|publish, decision: ok\|ng, reason, patch_instruction} | 各ゲート（§2） |
| `ihl.vid.asset_reused.v1` / `ihl.vid.asset_generated.v1` | {cut_id, asset_hash, cosine(再利用時), comfy_workflow_hash(生成時)} | ③ |
| `ihl.vid.video_assembled.v1` | {video_slug, cut_hashes[], final_hash, duration_sec} | ⑤ |
| `ihl.vid.stacked.v1` | {video_slug, final_hash, stack_position} | ⑧ |
| `ihl.vid.uploaded.v1` | {video_slug, platform: youtube, external_id, privacy: private} | ⑨ |
| `ihl.vid.published.v1` | {video_slug, external_id, decided_by（人間 actor）} | G-P |
| `ihl.vid.route_updated.v1` | {public_slug, version, external_url, reason} | §5 |
| `ihl.vid.metrics_observed.v1` | {external_id, views, retention, ctr, fetched_by（人間の能動操作 actor）} | 第2波 KPI 還流 |
| `ihl.vid.model_updated.v1` | {generation, cluster_summary_ref, source_feedback_range} | Evaluator（§2.3） |

注記（埋め込み 2 系列の明示）: 画像**再利用判定**は open_clip 埋め込み空間（B2 根拠11/19）を使う。これは観測系の凍結契約 `FROZEN(CL-08)`（DINOv2 384 — B4 §11）とは**別系列の派生インデックス**であり、`derived/video-assets/generation-N/` に置き、manifest に `embedding_model: open_clip@<ver>` を明記して混在を遮断する（次元不一致遮断ガードは CL-08 と同じ実装を流用）。閾値 0.75 は暫定値——実データで false-reuse 率を計測して校正する（B2 §7-5 の未解決問いを本書でも維持）。

---

## 2. 分割点人間ゲート（撤回不能条項）

### 2.1 ゲート一覧

出典: V3-VID-01/02（分割点 OK/NG・修整指示）、着手前提ゲート「公開ゲート(R1)」（`ver3-最終要件定義書-v1.md:718`）。

| ゲート | 位置 | 人間が見るもの | OK 時 | NG 時 |
|---|---|---|---|---|
| **G-S 台本** | ①の後 | script.json の人間可読ビュー（hook/本題/例/まとめ + 根拠リンク） | ②へ | patch_instruction 付き NG → ①を再実行（再試行上限内 §6）。上限超過は打ち切り・翌週へ |
| **G-A 音声** | ②の後 | 結合試聴用 wav（読み間違い・イントネーション） | ③へ | 読み修正（読み仮名指定）→ ② 再実行。台本自体の問題なら G-S へ差し戻し |
| **G-I 画像** | ③の後 | カット別 png 一覧 + 再利用/新規の別 | ④⑤へ | NG カットのみ再生成（1 枚単位。バッチ再生成禁止） |
| **G-C 合成** | ⑤〜⑦の後 | final.mp4 プレビュー + サムネ + メタ。**批評家 AI の所見を先に添付**（条項⑤: 誇張表現・R-1 該当演出・クレジット欠落の機械+LLM チェック） | ⑧投稿スタックへ | 該当段へ差し戻し（字幕→④、合成→⑤、メタ→⑦） |
| **G-P 公開** | ⑨の後 | private アップロード済み動画の最終確認 | **人間が公開切替をクリック**（published イベントは人間 actor でのみ発行可能） | private のまま保留 or 取り下げ |

- 全ゲート判定は `ihl.vid.gate_decided.v1` として Truth に append。**OK/NG の理由と修整指示そのものが学習資産**（V3-AIP-75「失敗は成功より貴重な学習データ」）。
- G-P は「**初期**人間ゲート」（V3-VID-01）——将来の緩和は人間裁定で可能。G-S〜G-C の分割点手入れは**撤回不能条項**であり緩和対象ですらない。
- 完全無人ワンクリック全自動は不変条項④で禁止（V3-AIP-78）。

### 2.2 朝レビュースタック（B7）との接続

出典: B4 §10 review-stack スキーマ、V3-AIP-96（成果を朝レビュースタックに積み人間は OK/NG するだけ）、ワークスペース設計 §4.1（かんばん「対応待ち」カラム）。

- 各ゲート待ち項目は **review_item**（B4 §10 の形: `{item_id, produced_by_run_id, artifact_ref, summary_3lines, state}`）としてレビュースタックに積む。動画パイプラインは専用 UI を作らず、B7 の朝レビュー 1 枚に相乗りする（部品を増やさない）。
- 夜間運転との関係: 夜間に自動で進めてよいのは「**次のゲート待ちまで**」。夜間ランナーは G-S 待ちの台本ドラフト・G-I 待ちの画像候補を積み上げて停止する（night-task 定義の cost_cap 3 値必須 — B4 §10。欠落時実行拒否）。ゲートを夜間に自動通過する経路は存在しない。
- review_item の decision は動画ゲートの場合 `ihl.vid.gate_decided.v1` を発行する（夜間一般の `ihl.night.review_decided.v1` の video 特化版。patch_instruction フィールドを持つ点が差分）。

### 2.3 Evaluator ループ（V3-AIP-75 / V3-VID-28）

```text
ihl.vid.gate_decided.v1（OK/NG + reason + patch）… Truth に蓄積
        │  投影（決定論エクスポート）
        ▼
feedback.csv（stage, series, decision, reason_text, script_hash, …）
        │  reason_text を ruri-v3-70m（384・B2 wiki レポート §1）で embedding
        ▼
クラスタリング（NG 理由の頻出パターン抽出。決定論: 同一入力→同一クラスタ）
        │  LLM は「クラスタの言語化・ルール候補提案」のみ（提案者と別系列 — V3-AIP-04）
        ▼
video.model.json 世代更新（generation-N として append・上書きしない）
  { generation, style_rules[], ng_patterns[], ok_exemplar_refs[], updated_from }
        │
        ▼
①台本生成の RAG 入力: video.model.json 最新世代 + OK 台本の embedding index（過去成功例 RAG）
```

- `video.model.json` は `derived/video-model/generation-<N>/` に置き latest.json ポインタで参照（B4 §2 projection 層規約）。**生成文化 = データであり、fork 対象**（条項②）。
- 評価の優先順位は「**価値観>世界観>一貫性>正確性>数字**」（V3-VID-15）。メトリクス（§3.4）は feedback.csv の 1 列に過ぎず、**クラスタリングの目的関数にしない**（数字は参考値。§7.3 非過激化）。

---

## 3. 週1作業で毎日投稿 — スケジュール設計

### 3.1 運用モデル

出典: V3-VID-02（OK で投稿スタックに積み 1 日 1 本自動投稿）、§3.1 位置づけ「週 1 作業で毎日投稿」（`ver3-最終要件定義書-v1.md:688`）。

| 曜日リズム | 人間の作業 | 自動側 |
|---|---|---|
| **週 1 回のゲートセッション**（30〜60 分想定） | 溜まった G-S/G-A/G-I/G-C 項目を朝レビュースタックでまとめて OK/NG。目標: 7〜10 本を G-C 通過させ在庫化 | ゲート OK を受けて次段を逐次実行し、次のゲート待ちを積み直す |
| **毎日（数十秒）** | G-P: private 動画の公開切替クリック 1 回 | 投稿スタック FIFO から 1 日 1 本 videos.insert(private) を実行（quota: 100 回/日枠の 1%——B2 根拠12/20） |
| **夜間（任意・night-task 定義がある夜のみ）** | なし | 台本ドラフト生成・画像候補生成を**ゲート待ちまで**進める（§2.2。R-6: 無断 cron 禁止——schedule は `ops/schedules/night.json` にユーザーが承認登録したもののみ） |

### 3.2 在庫モデル（投影値・Truth にカウンタ列を持たない）

```yaml
stock_projection:
  approved_stock: "Σ ihl.vid.stacked.v1 − Σ ihl.vid.uploaded.v1（video_slug 単位）"
  stock_days:     "approved_stock / 1.0（1日1本レート）"
  thresholds:
    warn:    "stock_days <= 3 → 朝レビュースタックに警告カード（次回ゲートセッションの前倒し提案）"
    deplete: "stock_days = 0 → その日の自動 insert をスキップ（欠番許容）"
  rule: "枯渇時に品質バーを下げて自動生成で埋める経路は作らない（誇張ゼロ・撤回不能条項の裏面）"
```

### 3.3 YouTube quota 制約内の運用（B2 調査値の引用）

| 制約 | B2 調査値（2026-07-10 時点） | 本設計の消費 |
|---|---|---|
| videos.insert | **100 回/日の専用枠**（B2 根拠12/20。従来の 1600 units/回から改定） | 1 回/日（+再試行 §6 上限 2） |
| その他エンドポイント | 合算 10,000 units/日 | メトリクス取得は能動操作時のみ・少数 |
| **未監査プロジェクトの private 固定** | audit 未通過プロジェクトからのアップロードは private 固定・**公開切替も不可**（B2 根拠20） | **実装前提ゲート**: audit 申請を実装着手時タスクに含める。通過までは「⑨を使わず final.mp4 を人間が手動アップロード」の縮退運転（パイプラインの他 9 部品は影響なし） |

再検証条項: B2 レポート §6-1〜8 の 8 点（quota 体系・VOICEVOX キャラ規約・X 無料枠・TikTok 監査・8GB VRAM 実測・libass 等）は**実装着手時に一括再検証**（frontmatter `revalidate_before_impl: true` を本書も継承する）。

### 3.4 KPI 還流（第2波・V3-VID-16）

- メトリクス取得は**ユーザーが Web/CLI を能動操作した時に API を叩く**方式のみ（V3-SEC-52 無人取得の法務ゲート。夜間の自動クロール禁止）。
- `ihl.vid.metrics_observed.v1` として観測データに合流し、Evaluator（§2.3）の参考列になる。数字を目的関数にしない制約は §7.3。

---

## 4. 3系統コンテンツ（V3-VID-07）

### 4.1 系統別テンプレと入力ソース

3 系統とも構成は共通テンプレ `hook-body-example-summary`（V3-VID-28）。差分は hook 型と入力ソースのみ（テンプレを増やさない）。

| 系統 (`series`) | 入力ソース（RAG 対象・全て自前データ = 著作権クリーン §7.1） | hook 型（3 秒） | 例 |
|---|---|---|---|
| **research**（ヘラクレス研究） | R2 観測イベント（`events/type=ihl.obs.*`）・個体/系譜データ・観測 wiki（`docs/knowledge/`） | 「今日の計測で分かったこと」型 | 「幼虫の体重が 3 日で 8g 増えた。理由はたぶんこれ」 |
| **system**（システム紹介） | 設計文書（constitution・ScreenDef・本書のような設計書）・要件レジストリ | 「なぜ○○は禁止なのか」型 | 「このシステム、データを一度も上書きしたことがありません」 |
| **dev-struggle**（開発難航エピソード） | git log・裁定ログ（`00-hq/decisions/`）・run ログ / errors.jsonl・撤回台帳 R-1〜R-9 | 失敗告白型 | 「AI に夜中回してたら一日で 20 ドル溶けた話」 |
| （実験枠）twin 二体版 | §8 参照。台本骨子の供給元が twin ドラフトになるだけで、G-S 以降は同一パイプライン | — | — |

- 台本の全 cut は `source_event_ids` で根拠に接地する（§1.4。V3-VID-19 の 1〜4 次変換 RAG と同じ思想: 取り込み→タグ付け→構造化→台本のタネ）。**接地なしの創作 cut は validate fail**——誇張ゼロ・R-1（動かないものを動くと演出）の構造的防止。
- 「生成方法自体も AI に考えさせる」（V3-VID-07 後段）は video.model.json の世代更新（§2.3）として実装される——プロンプトやルールの進化はデータ側で起き、コード変更を要しない。
- シリーズ管理（V3-VID-13: 自動エピソード分割・プレイリスト）は本書スコープ外の拡張。`series` + `video_slug` の命名規約だけ先に確保しておく（後付け可能）。
- **V3-VID-08 の残余は本書スコープ外**（V-C4 以降の拡張 — §9.2）: 本書 v1 が設計する展開先は YouTube 自動（⑨）+ TikTok/X 半自動（⑩）のみ。残余 PF（Instagram Reels / Facebook / LINE VOOM）への自動同時展開、およびショート→ロング→記事→技術宣言書→スレッドのハロー効果階層化戦略は扱わない。PF 別制約テーブル（`video-meta` の YAML — §1.3）と `video-export-manual` の出力フォルダ規約が拡張点であり、部品追加なしで PF を増やせる構造だけ v1 で確保する。

---

## 5. 保存戦略（V3-VID-STORE / V3-VID-ROUTE-A）

### 5.1 何をどこに置くか

| 対象 | 置き場 | 規約 |
|---|---|---|
| **動画本体（final.mp4）** | **外部のみ**（YouTube。TikTok/X は半自動投稿先） | R2 に置かない（V3-VID-STORE）。ローカル作業ディレクトリの原本は保持任意（バックアップは `D:\バックアップ` 系運用） |
| 中間生成物（wav/png/ass/カット mp4） | ローカル `runs/<run_id>/`（append-only・上書きせず版を積む） | R2 には **ハッシュのみ**（`ihl.vid.video_assembled.v1` の cut_hashes[]。**V3-VID-STORE** と同じ裁定 — B2 §4 の当該行。同行の「V3-VID-27」表記は B2 側の ID 誤記（正: V3-VID-STORE、要件書:699/:1283。V3-VID-27 はバッチ生成禁止の別要件）。B2 レポート末尾に訂正 append 済み） |
| 再利用画像アセット + open_clip インデックス | ローカル + `derived/video-assets/generation-N/`（manifest のみ R2） | 追記のみ。§1.5 注記の別系列規約 |
| **ルーティング表・URL・version・履歴・紐付くスレッド** | **R2 Truth**（下記 5.2） | append-only。これが V3-VID-STORE の「システムが保持する全て」 |
| video.model.json / feedback.csv | R2 projection 層（`derived/video-model/`） | 世代 append + latest.json ポインタ |

### 5.2 公開 URL 固定（V3-VID-ROUTE-A）

```yaml
# R2 キー空間への video ドメイン追加（B4 §2 の bucket_layers に載る）
truth:
  video_routes: "events/type=ihl.vid.route_updated.v1/date=YYYY-MM-DD/<ULID>--<public_slug>.json"
projection:
  routing_table: "manifests/video-routes/latest.json"   # pointer log 方式（B4 §2 write_rules 準拠）

routing_rule:
  public_url: "https://it-hercules.uk/v/<public_slug>"   # 固定・永続。記事/リンクを作り替えない
  resolve: "public_slug → routing_table → 現行 external_url（YouTube 等）へ転送"
  replace: "『より分かりやすい動画』への差し替え = route_updated.v1 の append（version+1）。旧 version 行は残る＝原本削除しない"
  redundancy: "外部 KV 主 + 自 R2 ホットスタンバイの冗長構成は第2波の拡張（要件原文どおり）。v1 は R2 routing_table 単独で開始"
```

- 差し替えの「投票で自動差し替え」（V3-VID-ROUTE-A 後段）は投票基盤（V3-GOV-07 PT 投票）依存のため第2波後半。v1 の差し替えトリガは人間裁定のみ。

---

## 6. コスト設計（V3-VID-27 / V3-CST-03 — 『一日で20ドル』再発防止）

### 6.1 構造原則

1. **従量課金ゼロの段を最大化**: TTS/画像/字幕/合成/サムネは全てローカル OSS（VOICEVOX / ComfyUI / ffmpeg / Pillow — B2 §1）。従量課金が発生するのは ①台本 LLM と ⑨ YouTube API（無料 quota 内）のみ。**クラウド TTS・クラウド画像生成 API へのコードパスを作らない**（アーキテクチャテスト: `components/video-*` 内に外部従量 API エンドポイント参照が存在したら fail）。
2. **小関数分割・バッチ生成禁止**（V3-VID-27）: 1 枚/1 段落/1 カット単位。8GB VRAM でも回り、人間ゲートを挟める粒度が構造的に保たれる。
3. **3 層モデルルーティング**（V3-CST-03): タグ付け・RAG 検索クエリ生成 = 最下層（Haiku 級）/ 台本本文 = 中層 / 批評家 = 提案者と別モデル系列（V3-AIP-04）。探索的委譲は 1 階層・**孫エージェント禁止**。
4. **夜間実行は night-task スキーマ必須**（B4 §10): `cost_cap_tokens / cost_cap_usd / time_cap_minutes / max_rounds / zero_result_stop` 欠落時は実行拒否。上限到達で STOP マーカー、STOP 存在下の新ラウンド起動禁止。

### 6.2 上限値表（推奨値。⏳HG = 数値の最終確定は人間裁定・policy テーブル管理でハードコード禁止）

| policy_key | 推奨上限 | 根拠 |
|---|---|---|
| `video.llm_tokens_per_script` | 40,000 tokens（入出力計・RAG 込み） | 1 分ショート台本 + 批評 1 往復の実測前提。超過で当該 run 打ち切り |
| `video.llm_retry_max` | **2**（同一段の NG patch 再実行を含む） | V3-CST-03 再試行上限必須。超過は翌週ゲートセッション送り（エスカレーション = 人間） |
| `video.llm_usd_per_day` | **$1.00** | 『一日で20ドル』の 1/20。到達で当日 LLM 呼び出し全停止 |
| `video.llm_usd_per_month` | **$20.00** | 月次総枠。夜間総枠（`ops/schedules/night.json`）と別会計にしない——同一財布で合算監視 |
| `video.night_cost_cap_usd` | $2.00/夜（night-task 定義の必須キー） | ワークスペース設計 §4.2 / 開発計画 R-01 |
| `video.gpu_minutes_per_night` | 120 分 | 8GB GPU 占有の生活影響上限（電気代 + 他用途との競合） |
| `video.new_images_per_video` | 10 枚 | 再利用優先（cosine ≥ 0.75）が効いていれば通常数枚で足りる。超過 = 再利用インデックス劣化のシグナル |
| `video.uploads_per_day` | 1 本（+再試行 2） | §3.3 quota の 1% 未満に固定 |

- 全キーは policy テーブル（V3-MKT-39 と同型: policy_key + timestamp 最新行が正）に置き、裁定確定は新行 append のみ。
- コスト実績は run_info（V3-OBS-08）に tokens_used / usd_used を必須記録し、ダッシュボード利用枠パネル（B4 §10 `5_usage_panel`）で常時可視化。**上限の 80% 到達で朝レビューに警告カード**（開発計画 R-01 の監視トリガと同一水準）。

---

## 7. 法務・同意ゲート

### 7.1 著作権・AI 学習規制（V3-SEC-35）

- **入力は自前データのみ**: 3 系統の入力ソース（§4.1）は全て自分の観測データ・自分の開発ログ・自分の wiki。第三者著作物を台本 RAG コーパスに入れない。全 cut の `source_event_ids` 必須（§1.4）が取得元の認証可能性を構造で担保する。
- 取り込んだデータは**推論・保存・タグ付け・台本化のみ**に使い、外部モデルの再学習に使わない（要件原文どおり）。
- BGM・フォント・立ち絵素材は**ライセンス台帳**（`components/video-compose/assets/LICENSES.md`）に出典・ライセンス種別を記載したもののみ使用可（台帳未記載アセットの参照は合成段 validate fail）。
- VOICEVOX: クレジット表記必須（B2 根拠1）。meta.json テンプレに固定クレジット文字列を埋め込み、欠落は validate fail（§1.2 ⑥⑦行）。採用キャラの個別規約確認 + クレジット文字列の凍結は実装着手時の再検証条項（B2 §6-2）・キャラ選定自体は人間裁定（B2 §7-2）。

### 7.2 視聴者ログ同意ゲート（V3-VID-ROUTE-C）

- soul_alignment 誘導（視聴者の思想・行動ログ = soul_profile を扱う機能）は**本書のパイプラインに含めない**。含める場合は「明示同意・最小取得・匿名化」の設計を先に確定し同意ゲートを通すことが着手前提（`ver3-最終要件定義書-v1.md:721`）。v1 が扱う視聴者データはプラットフォーム提供の集計メトリクス（再生数/維持率/CTR）のみで、個人単位の視聴者ログは取得しない。

### 7.3 非過激化（V3-VID-15 — 評価優先順位の構造化）

- 優先順位「**価値観 > 世界観 > 一貫性 > 正確性 > 数字**」を Evaluator に構造として固定する: (a) メトリクスはクラスタリングの目的関数・並び替えキーにしない（§2.3）、(b) 批評家 AI（G-C）のチェックリスト先頭は価値観適合（SoulProfile 参照は実験枠 V3-AIP-85 と連動——v1 では憲法 constitution.md 参照で代替）、(c) 「再生数が伸びた NG パターン」を ok_exemplar に昇格させる経路を作らない。
- R-1（誇張演出）: 「動かないものを動くと言う」台本表現は批評家チェックの機械項目（未実装機能名の言及検出）+ LLM 項目の両方で塞ぐ。

### 7.4 R-6（無断 cron 禁止）・V3-SEC-52

- 定期実行は全て `ops/schedules/night.json` にユーザーが承認登録した night-task のみ（§2.2）。コード内に独自 cron/スケジューラを持たない。
- 外部からの無人データ取得（メトリクス自動クロール等）は行わない。取得はユーザー能動操作起点のみ（§3.4）。

---

## 8. ツイン二体版（実験枠）との接続

出典: B4 §9 `twin-experiment.contract.yaml`（第4回までの裁定を反映済み）、R-3、V3-VID-10（保留）。

- **R-3 方式は使わない**: 単一 AI に「自然な会話を演じさせる」自動対話方式は撤回済み・復活禁止。二体版は**別エージェント × 2**（twin-self = 本人ログ RAG のみ / twin-sakura = システム運用ログ + 公開 wiki RAG のみ。プロンプト性格付け禁止 — V3-AIP-42）。
- **接続点は 1 箇所だけ**: twin の発話ドラフト（`ihl.twin.draft_generated.v1`）が①台本段の**入力（台本骨子）**になる。それ以降は G-S を含む本書パイプラインをそのまま通る——ゲート・コスト上限・法務ゲートに例外を作らない。専用の合成経路・専用の公開経路は存在しない。
- feature flag `experiment.twin_broadcast` 既定 off・per-user **opt-in**（B4 §9）。台帳・PII・意思決定への権限なし。UI に「Twin」語を出さない（V3-UIX-65）。
- **公開形態・頻度・声は V3-VID-10 保留のまま**: 本接続は sandbox 生成（G-S 待ちに積むところ）までが上限。掛け合い動画の公開は人間裁定必須。

---

## 9. Phase C 実装順（B3 開発計画との整合）

### 9.1 位置づけ

- 本パイプラインは**第2波コア**（V3-VID-01 は第2波唯一の Tier S）。第1波マイルストーン C0〜C6（開発計画 §3.1）には**含まれない**。
- 共通着手条件 C-W2-1〜4（観測 ITO 緑・R2 基盤稼働・類似検索梯子・不変条項適用 — `ver3-最終要件定義書-v1.md:673-680`）は **C3 完了時点で充足見込み**であり、**C4 以降に別計画として起案**する（開発計画 §3.2。本書はその起案時の設計正本）。
- 第1波が本書のために先に作っておくもの（依存の背骨）: イベントエンベロープ + R2 キー空間（C1）・レビュースタック + 夜間運転機構 V3-AIP-96（第1波・B7 設計）・policy テーブル（C4 経済系）。**本書側から第1波への追加要求はゼロ**（既存契約に載るだけ）。

### 9.2 実装サブマイルストーン【提案】

| # | 名称 | 作るもの | 完了条件（機械検証） |
|---|---|---|---|
| **V-C0** | 前提再検証 + 環境 | B2 §6 の再検証 8 点一括実施・VOICEVOX/ComfyUI/ffmpeg(libass) ローカル導入・YouTube API プロジェクト作成 + **audit 申請**（§3.3）・VOICEVOX キャラ人間裁定 | 再検証結果を B2 レポートに追記コミット・`ffmpeg -version` で libass 確認ログ・VOICEVOX `/audio_query` 疎通ログ |
| **V-C1** | 最小直列（画像なし・1 本作れる） | `video-script` / `video-tts` / `video-subtitle` / `video-compose` / `video-thumbnail` + ランナー + G-S/G-A/G-C ゲート（レビュースタック相乗り） | 静的立ち絵 + 単色背景で 1 本の final.mp4 が全ゲート人間 OK で完成。§1.2 ①②④⑤の negative TC 緑 |
| **V-C2** | 画像段 + 3系統 | `video-image`（open_clip 再利用 index + ComfyUI）+ G-I + 3 系統テンプレ・RAG 接地（source_event_ids） | cosine ≥ 0.75 再利用 TC 緑・8GB VRAM 実測ログ・3 系統各 1 本が G-C 通過 |
| **V-C3** | 投稿スタック + 保存戦略 | `video-stack` / `video-publish-youtube` / `video-export-manual` + ルーティング表（§5.2）+ 在庫投影（§3.2） | private insert 実機 1 本・G-P 人間公開 1 本・route_updated append 確認・未承認 stacked 拒否 TC 緑。**audit 未通過なら手動アップロード縮退で closed（⑨のみ保留）** |
| **V-C4** | Evaluator + 夜間量産 | feedback.csv 投影・クラスタリング・video.model.json 世代更新（§2.3）+ 台本量産 night-task 定義（cost_cap 3 値） | model_updated append 1 世代・夜間 run が STOP/上限規約 TC 緑・「週 1 ゲートセッション → 7 日連続投稿」を 1 サイクル実測 |
| （実験枠） | twin 接続 | §8。**V3-VID-10 の人間裁定が下りた後にのみ着手** | — |

- 縦型ショート再編集（TikTok/X 向け crop/scale レシピ）・シリーズ管理（V3-VID-13）・**V3-VID-08 残余（Reels/FB/LINE VOOM 展開 + ハロー効果階層化 — §4.1）**・KPI 還流の本格版（V3-VID-16）・冗長ルーティング（外部 KV 主）は V-C4 より後の拡張。ffmpeg レシピ外出し（§1.3）により合成レシピ追加だけで縦型対応できる構造は V-C1 で確保済み。

---

## 付録 A. 本書が確定させた設計判断（事後承認対象）

1. **n8n は初期採用しない**（§1.3）——B2 選定に含まれず直列 1 本に過剰。C-USB 境界維持により後付け可・撤回不要。
2. **画像再利用の open_clip 埋め込みは CL-08（384/DINOv2）と別系列の派生インデックス**として分離（§1.5 注記）。manifest の embedding_model 明記で混在遮断。
3. **audit 未通過期間は⑨のみ手動アップロード縮退**（§3.3/§9.2 V-C3）——パイプライン他 9 部品は影響を受けない。
4. **在庫枯渇時は欠番許容**（§3.2）——品質バーを下げて自動で埋める経路を作らない。
5. コスト上限値表（§6.2）は推奨値 + ⏳HG。policy テーブル管理・ハードコード禁止。

*改訂は append 追記または新版ファイルで行う。既存本文の書き換えは誤記修正に限る。実装着手時は B2 `research-tts-video-stack-v1.md` §6 の再検証 8 点を必須実施（`revalidate_before_impl: true` 継承）。*
