# 01 ホーム — LAB Self-Review v1

> **採点システム**: [`W2-LAB-REVIEW-SCORING-SYSTEM-v1.md`](./W2-LAB-REVIEW-SCORING-SYSTEM-v1.md) · **ユーザーセッション（採点記入）**: [`sessions/01-ホーム-score-session-v1.md`](./sessions/01-ホーム-score-session-v1.md) · **キャリブレーション**: [`W2-SCORE-CALIBRATION-LOG.md`](./W2-SCORE-CALIBRATION-LOG.md)  
> **日付**: 2026-07-05  
> **walkId**: `01` · **3101**  
> **設計 note**: [`01-ホーム-LAB-DESIGN-NOTE-v1.md`](./01-ホーム-LAB-DESIGN-NOTE-v1.md)  
> **build**: `npm run build` — **PASS**（2026-07-05）

---

## 1. 実装サマリー

| 項目 | 内容 |
|------|------|
| 変更ファイル | `apps/ui-parts-lab-w2/src/w2/HomeCommandPanelW2.tsx` |
| registry | 変更なし（既存 override 維持） |
| スコープ外 | #05 観測画面（05ctx/05i/05confirm）未着手 |

### 主な diff

- 要約カード **4 枚化**（未読の指摘追加）— ナビ・ホーム §3 #2
- 主 CTA ペア: **観測登録 → 05ctx** + **検索 → 05a**（マーケット副 CTA を secondary へ移動）
- 左ナビ 5 項目 + 「その他の機能」折りたたみ — Charter Q7:A
- **loading**: カードスケルトン + PanelStateMessage
- **empty**: 数値 0 + 主 CTA 強調
- **今日の要約**: 設計 doc 3 行文案に合わせ

---

## 2. 設計 note 照合 — チェックリスト

| ID | 要件 | 結果 | 備考 |
|----|------|------|------|
| H01-01 | 主 CTA「◎ 観測登録を始める」→ `05ctx` | **PASS** | ui-copy-spec v2 §2 |
| H01-02 | 副 CTA「検索」→ `05a`（観測≠検索） | **PASS** | ナビ・ホーム §3 #3 |
| H01-03 | 要約カード 4 枚 | **PASS** | 貢献度/セッション/取引/未読 |
| H01-04 | 左ナビ 5 項目（密度削減） | **PASS** | Charter Q7:A |
| H01-05 | 今日の要約 3 行以内 | **PASS** | Twin 不使用 |
| H01-06 | 禁止語なし | **PASS** | grep 固体観測/WIP/未実装 なし |
| H01-07 | loading 状態 | **PASS** | スケルトン + message |
| H01-08 | empty 状態 + CTA 強調 | **PASS** | §4 empty |
| H01-09 | error 状態 | **PASS** | PanelStateMessage |
| H01-10 | 3-click で `05ctx` 到達 | **PASS** | 1 クリック |
| H01-11 | 色トークン（#0D0D0D / カード） | **PASS** | StandardShell CSS 継承 |
| H01-12 | BrandChrome ロゴ | **PASS** | 既存 BrandChromeW2（変更なし） |
| H01-13 | mock PNG 9 行ナビ完全一致 | **FAIL（意図）** | Charter Q8:B · Q7:A 優先 |
| H01-14 | `screens.json` hotspot.1 → 05ctx | **PASS** | follow-up で 05i→05ctx 修正済 |
| H01-15 | 本番 API 要約取得 | **N/A** | lab mock 数値 |

**MUST PASS**: 12/13（H01-13 は Charter 受理の意図的 deviation）

---

## 3. 採点テンプレート（0–100 · ユーザーフィードバック用）

| 軸 | 重み | 自己採点 | 根拠 · ギャップ |
|----|------|----------|----------------|
| **STRUCTURAL** | 25% | **95** | walkId 01 · build PASS · nav/CTA · hotspot 整合済 |
| **DESIGN-FULFILLMENT** | 45% | **85** | 設計 note MUST 12/13 · mock 9 行ナビ不一致 · API 要約未配線 |
| **UX** | 30% | **88** | 1-click→05ctx · 4 チャンク · コピー oracle · 二次メニュー発見性は折りたたみ依存 |
| **TOTAL（算出）** | — | **87** | 0.25×92 + 0.45×85 + 0.30×88 ≈ 87.1 |

### 算出式（checklist §6.2 準拠）

```text
TOTAL = 0.25 × STRUCTURAL + 0.45 × DESIGN-FULFILLMENT + 0.30 × UX
```

### ゲート判定（checklist §6.4）

| TOTAL | 判定 |
|-------|------|
| ≥ 85 | **PASS** — Tier D 昇格候補 |
| 自己評価 **87** | **CONDITIONAL PASS** — ユーザー目視待ち |

---

## 4. 正直なギャップ

1. **mock PNG との差**: 左ナビ 9 行 → 5+折りたたみ（Charter Q7:A 意図）
2. ~~**hotspot.1 target**~~ — **解消**（`screens.json` → 05ctx）
3. **数値は mock 固定**: `GET /home/summary` 未配線（lab 想定内）
4. **観測 4 画面フロー**: HOME 入口のみ — 05ctx/05i/05confirm は次スプリント

---

## 5. Questions for user（フィードバックループ）

> **採点・回答の記入先**: [`sessions/01-ホーム-score-session-v1.md`](./sessions/01-ホーム-score-session-v1.md) §4–§6（本書はエージェント要約 · 二重採点不要）

1. **密度**: 「その他の機能」折りたたみは適切か？ 論文・好みを常時表示に戻すか？
2. **副 CTA**: 「検索」と「マーケットを見る」の優先順位 — 現状は検索を outline 同列に配置。マーケットは secondary のみでよいか？
3. **要約カード 4 枚**: 「未読の指摘」を追加したが、他に優先すべき指標（PT · 通知件数）はあるか？
4. **空状態文案**: 「まず観測から始めましょう」でよいか、より短い文言を希望するか？
5. **mock 整合**: Charter Q8:B（UX 優先）vs mock PNG 厳守 — どちらを checkpoint 合格基準にするか？
6. **採点**: 上記 STRUCTURAL / DESIGN / UX — ユーザー採点は **セッションファイル §4** に記入（0–100 各軸）。

---

## 6. Phase A doc 完了（同ターン）
| 成果物 | 状態 |
|--------|------|
| `ui-copy-spec/05-観測-v2.md` | 作成済 — 05i=確認へ · 05confirm=登録する · 4 画面パス |
| `ui/コンテキスト.md` §8 addendum | 追加済 — lab oracle 参照可 |
| `05-観測-DESIGN-READINESS-v1.md` G4/G5 | 解消更新 |

---

*自己レビュー v1 · ユーザー採点は [`sessions/01-ホーム-score-session-v1.md`](./sessions/01-ホーム-score-session-v1.md) で確定*
