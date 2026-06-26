# Wave D（photo）詳細設計 v1 DRAFT

> ステータス: PW-1 詳細設計 DRAFT  
> 対象: `C-4`（P1）  
> 要件正本: `01-要件/05-観測.md`（`SC-05-PHOTO-01`, `OBS-SOL-06`, `UI-REBUILD-OBS-09..11`）  
> 関連 schema: `photo_capture_mode_selected.event.schema.yaml`

---

## 1. 目的

- 写真入力を「カメラ撮影」と「ファイル選択」の dual mode で固定し、確認画面へ同一データ契約で受け渡す。
- 色補正しない原則と撮影条件テキスト併記を必須化する。

## 2. FR トレース

| ID | 反映内容 |
|---|---|
| UI-REBUILD-OBS-09 | 写真撮影 primary ボタン |
| UI-REBUILD-OBS-10 | 一括取得との視覚分離 |
| UI-REBUILD-OBS-11 | 撮影中/完了/失敗の状態表示 |
| OBS-SOL-06 | 色補正なし・撮影条件併記 |

## 3. API 契約

### 3.1 画像アップロード（共通）

`POST /api/v1/observation/photo/upload`

```json
{
  "session_id": "sess_photo_01",
  "capture_mode": "camera",
  "file_name": "capture.jpg",
  "mime_type": "image/jpeg",
  "shooting_condition": "自然光・午前10時・補助灯なし"
}
```

```json
{
  "status": "uploaded",
  "photo_ref": "img_01",
  "thumbnail_ref": "thumb_01",
  "no_color_correction": true
}
```

### 3.2 モード選択

`POST /api/v1/observation/photo/mode`

```json
{
  "session_id": "sess_photo_01",
  "capture_mode": "file_select",
  "actor_id": "usr_01"
}
```

```json
{
  "status": "selected",
  "event_id": "evt_pcmode_01"
}
```

## 4. UI チャンク / data-testid

| chunk | 役割 | data-testid |
|---|---|---|
| mode_switch | camera/file 切替 | `obs-photo-mode-camera`, `obs-photo-mode-file` |
| capture_action | 撮影または選択 | `obs-photo-capture`, `obs-photo-file-select` |
| preview_panel | プレビュー表示 | `obs-photo-preview` |
| condition_input | 撮影条件入力 | `obs-shooting-condition-input` |
| status_strip | 成功/失敗表示 | `obs-status-strip` |

## 5. R2 / event_store（INSERT ONLY）

- `ihl/observation/events/photo_capture_mode_selected.jsonl`
- `ihl/observation/events/photo_uploaded.jsonl`
- `ihl/observation/artifacts/raw/{capture_id}.jpg`
- `ihl/observation/artifacts/thumbnail/{capture_id}.jpg`

> 再撮影は更新ではなく新規 `photo_uploaded` 追記で扱う。

## 6. ver1 / ver2 境界

- ver1 IN: camera/file dual mode、撮影条件入力、確認画面連携。
- ver2 OUT: 連写補正、自動切り抜き、撮影ガイド AI オーバーレイ。

## 7. E2E クロスリファレンス

- `SC-05-PHOTO-01`
- `SC-05-SOL-02`
- `SC-05-NEG-03`
- `02-設計/E2E/sub/SC-05-PHOTO-CAPTURE-SELECT-v1-DRAFT.md`（PW-5 予定）

## 8. 相互参照

- `02-設計/features/05-観測/sub/WaveC-input-dd-詳細設計-v1-DRAFT.md`
- `02-設計/features/05-観測/sub/WaveE-devR2-詳細設計-v1-DRAFT.md`
