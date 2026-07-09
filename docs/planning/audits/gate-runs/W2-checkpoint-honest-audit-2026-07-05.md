# W2 Checkpoint — Honest Re-Audit（2026-07-05）

> **Trigger**: ユーザー報告 — マイページ不可視 · 監査未機能 · 機能欠落  
> **Scope**: `apps/ui-parts-lab-w2` のみ · 3100 非接触  
> **Prior wave**: Wave 5 — **55/55 PASS（撤回）**

---

## 1. 根本原因

| # | 問題 | 証拠 |
|---|------|------|
| R1 | **マイページ導線欠落** | `HomeCommandPanelW2.tsx` Q7:A 密度削減で PR/PRnotif が PRIMARY_NAV・HEADER_ACTIONS から除外 |
| R2 | **Lab サイドバーに PR クイックリンクなし** | `LabSidebar.tsx` は screens.json グループ列挙のみ · マイページが目立たない |
| R3 | **深葉 BrandChrome にプロフィールアイコンなし** | catalog `BrandChrome.tsx` はロゴのみ · Q5:B 未充足 |
| R4 | **Wave 5 rubber-stamp** | scorecard は build/parity 機械チェックのみ · **browser UX 未実施** で 55/55 PASS |
| R5 | **W2UniversalStatePanel 誤解** | dev 用 4 状態トグル · ユーザー向け機能変化に見えない |

---

## 2. Wave 5 撤回

Wave 5 gate run（[`W2-checkpoint-wave5-2026-07-05.md`](./W2-checkpoint-wave5-2026-07-05.md)）の **55/55 PASS は撤回**。

理由:
- G2「55 walkId scorecard PASS」は **ファイル存在 + 機械 parity** のみ
- **01 → PR クリック到達** · **PR 3 指標 UI 表示** の browser spot-check なし
- ユーザー可視要件（マイページ discoverability）を検証していない

---

## 3. 修正（2026-07-05 本セッション）

| ファイル | 変更 |
|----------|------|
| `src/w2/HomeCommandPanelW2.tsx` | PRIMARY_NAV に「マイページ」· HEADER に マイページ/通知 · 本文ボタン追加 |
| `src/components/LabSidebar.tsx` | 「マイページ」セクションに PR / PRnotif クイックリンク |
| `src/w2/BrandChromeW2.tsx` | 観測・マーケット深葉に 🔔通知 · 👤マイページ |
| `src/w2/W2ScreenRenderer.tsx` | 深葉 chrome を BrandChromeW2 に差替 |
| `src/index.css` | BrandChromeW2 アクションスタイル |

PR 画面本体: catalog override `ihl-profile-three-metrics` — **変更不要**（screenId 差分で metrics/notifications 描画済み）。

---

## 4. Scorecard 再評価

| walkId | Wave5 | Honest re-audit | 理由 |
|--------|-------|-----------------|------|
| **01** | PASS 98 | **FAIL 75** | マイページ導線欠落 · C<28 |
| **PR** | PASS 98 | **FAIL 83** | 到達不可 · discoverability FAIL |

他 53 walkId は **本セッション未再監査** — Wave5 PASS のままだが **browser UX 未検証の可能性あり**。

---

## 5. 検証手順（人間 / agent）

```text
1. cd apps/ui-parts-lab-w2 && npm run dev   # :3101
2. http://localhost:3101/s/01
   - 左ナビ「マイページ」表示 · クリック → /s/PR
   - ヘッダ「マイページ」「通知」表示
   - 本文「👤 マイページ」「🔔 通知」ボタン
3. http://localhost:3101/s/PR
   - カルマ / 貢献度 / マーケット評価 3 指標カード
   - 「🔔 通知」→ PRnotif
4. http://localhost:3101/s/05ctx または /s/06a
   - BrandChrome 右上に マイページ · 通知
5. Lab サイドバー「マイページ」→ PR / PRnotif
```

---

## 6. 残課題

- [ ] 01 · PR scorecard を修正反映後 **再 PASS**（browser UX 必須）
- [ ] Wave5 他 53 walkId の spot-check サンプリング
- [ ] W2UniversalStatePanel に「開発用」ラベル明示（ユーザー混乱防止）
- [ ] 3100 正本への nav 同期は **別ゲート**（本 PR スコープ外）

---

*正本: honest-reaudit · 3101 only · no commit*
