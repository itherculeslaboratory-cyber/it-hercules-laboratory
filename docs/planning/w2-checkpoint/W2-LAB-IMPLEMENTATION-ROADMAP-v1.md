# W2 LAB 実装ロードマップ v1

> **日付**: 2026-07-05  
> **執筆**: [W2 残画面 優先順位提案](42bf87be-1724-4834-ba4e-37349e609be9)  
> **手法**: [`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md) · 採点ループ  
> **HOME `01`**: ユーザー受理（~60）· **凍結**

---

## 1. SKIP — #05 観測

| 対象 | 理由 |
|------|------|
| **#05 全 walkId** | 本番 `apps/web` 完了 · 最難 · **ユーザー明示 skip** |
| lab `ObsRegistrationW2` | **凍結** — checkpoint 後の任意 pilot のみ |
| **`05a` 検索** | **再開** — design note [`05-検索-LAB-DESIGN-NOTE-v1.md`](./05-検索-LAB-DESIGN-NOTE-v1.md) · 登録 skip は維持 |

---

## 2. 推奨順（Top 5 次着手）

| # | 対象 | 種別 | 理由 |
|---|------|------|------|
| 1 | **`06` マーケット** | re-review | P2 プロトタイプ済 · design note 未 · Charter Q1–Q4 本丸 |
| 2 | **`PR` プロフィール** | re-review | 貢献度 `14` 導線 · `ProfileW2` 部分実装 |
| 3 | **`07` 掲示板** | fresh | HOME 左ナビ直結 · 遷移詳細比較的確定 |
| 4 | **`08` カルマ** | re-review | `KarmaSummaryW2` · `22` ショップ導線 |
| 5 | **`03` 血統** | fresh | `03met` 再監査優先 |

---

## 3. Waves

```text
Wave 0 — 01 HOME（受理・凍結）

Wave A — Nav Hubs
  06 マーケット · PR · 07 掲示板 · 08 カルマ · 12 設定

Wave B — Flows
  03 血統 · 09 論文 · 10 好み · 22 PT ショップ · 14（PR 内）

Wave C — Polish
  11 裁判 · 16 Builder · 13 機器 · screen-def 同期
```

---

## 4. 着手条件（全項目共通）

[`W2-DESIGN-DOC-PROCESSING-v1.md`](./W2-DESIGN-DOC-PROCESSING-v1.md) Pre-impl gate 10 項目 + design note § 対照表 **完了までコード禁止**。

**re-review**（06 · PR · 08）: 既存 `*W2.tsx` を対照表に載せ、agent invent 禁止。

---

## 5. 禁止

- #05 lab 改修 · `apps/web` · 3100 改変  
- HOME 左ナビへの貢献度 `14` 復活  
- 独立 `23` / `06soc` / `06lot-*` 復活  

---

*詳細 14 行表・3101 部分実装マップは subagent 監査ログ参照。*
