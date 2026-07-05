# 段 4 — IMPL-GO 手順 v1

> **ステータス**: **運用中** — 2026-07-05 · **M-084 3b Go 後**  
> **前提**: 設計レーン **3b 合格**（M-083 24/24 · M-084 人間 Go）  
> **正本**: [`00-マスター実行順-v1.md`](./00-マスター実行順-v1.md) §0 段 4 · [`00-M-084-3b-GATE-サマリー-v1.md`](./00-M-084-3b-GATE-サマリー-v1.md)

---

## 1. 段 4 とは

| 項目 | 内容 |
|------|------|
| **作業** | 設計 → 実装の **翻訳** + **契約オラクル**（`ihl-contract-oracle.mjs`）検証 |
| **解禁条件** | M-084 3b Go **+** 機能ごと **`#NN IMPL-GO`**（X-08=A） |
| **禁止** | IMPL-GO なしの新規 API / 本番配線 · 人間ゲート項目の勝手実装 |

---

## 2. 合図（機能単位）

```text
#05 観測 IMPL-GO
```

| 合図 | 効果 |
|------|------|
| **`#NN IMPL-GO`** | 当該機能のみ段 4 翻訳 + oracle 可 |
| **未合図機能** | design-only 継続可（他ファイル衝突なしなら並行 doc 可） |

**記録先**: チャット · [`docs/planning/STATUS.md`](../../docs/planning/STATUS.md)（任意 1 行）

---

## 3. P0 実装順（推奨）

| 順 | 機能 | 理由 |
|----|------|------|
| **1** | **#05 観測** | hooks IMPL-GAP · M-082 hook-001〜004 · reverse-rtm gap |
| **2** | **#06 マーケット** | システム維持費税 · ADR-H-38 §6.7 · 遷移設計 sync 済 |
| **3** | **#14 貢献度** | 研究軸 · ADR-H-38 · hook-001 換算 +5/+3 |

---

## 4. 1 機能あたりの実行手順

1. **IMPL-GO 合図** — 人間が `#NN IMPL-GO` を明示
2. **伴走監査** — [`.cursor/skills/ihl-design-impl-audit/SKILL.md`](../../.cursor/skills/ihl-design-impl-audit/SKILL.md) · C1–C4 + parity
3. **翻訳** — DET / MICRO / RTM → `apps/` · `packages/` · API 契約写し
4. **オラクル** — `node scripts/ihl-contract-oracle.mjs --feature NN` → PASS
5. **記録** — マスター §5 セッションログ 1 行 · STATUS 更新（任意）

---

## 5. ブロッカー（段 4 全体 · 機能 IMPL-GO でも触らない）

| 項目 | 正本 | 扱い |
|------|------|------|
| **#02 法務 binding** | X-22=A · F02-04 | ドラフト DET/MICRO 可 · **公開・同意記録 API は停止** |
| **GMO 本番鍵 · 実入金** | M-070/073 · `P0-NEXT-GMO-LIVE-EXEC` | 人間ゲート · mock/stub のみ |
| **SMTP 本番鍵** | M-072 · magic link | 人間ゲート · dev/staging のみ |

→ 詳細はマスター **ブロック G**

---

## 6. 関連 M-ID

| ID | 状態 | 備考 |
|----|------|------|
| **M-084** | [x] | 3b Go 2026-07-05 |
| **M-045** | [ ] | DESIGN-COVERAGE 正本昇格（任意 · レポートのみ） |
| **M-052** | [ ] | ScreenDef 正本 — 段 4 前 P1 |
| **M-070〜074** | [ ] | 本番 · 性能 · cutover — STATUS 正本 |

---

*2026-07-05 初版 — M-084 3b Go 後起票*
