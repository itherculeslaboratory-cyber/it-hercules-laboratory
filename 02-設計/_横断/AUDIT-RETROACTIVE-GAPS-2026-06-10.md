# 遡及監査 — 設計実装乖離ギャップ表（2026-06-10）

> **正本**: [`00-監査役-設計実装伴走ゲート-v1.md`](./00-監査役-設計実装伴走ゲート-v1.md)  
> **修復キュー**: [`00-完成定義と実行キュー-v1.md`](./00-完成定義と実行キュー-v1.md) POST-OSS / POST-B8  
> **機械検証**: `node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs`

---

## 根本原因（要約）

1. **Batch 8** — pytest smoke 緑 = キュー `[x]` だったが、DoD の persistence 列（GitHub / event_store）は未検証
2. **ADR-H-18 stays** — OSS 方針（ADR-H-21）と矛盾するまま DoD `stays ✓` が残存
3. **監査役 Batch 7** — 設計 doc **存在**のみ · 実装照合なし
4. **DELEGATED-IMPL-GO** — ログ追記のみ · 自動パリティチェックなし
5. **エージェント** — DoD 表を読まず `✓` 記入 · 実装 grep なし

---

## 偽完了一覧（正直な表）

| 機能 | マークされた完了 | 設計の主張 | 実装の実態 | テストの実態 | 修復 |
|------|-----------------|-----------|-----------|-------------|------|
| **#19** | DoD `✓` 2026-06-10 | GitHub BOARD / Discussions SSOT（`19-詳細設計` · `05-GitHub運用`） | `/api/v1/component-board` が `get_board_store()` 空時 **`get_mock_store()` フォールバック** · **libs に github 参照ゼロ** | `test_stays_verification` が **200 のみ** · `test_board_store.py` は JSONL ミラー（GitHub 非検証） | **POST-OSS-19** |
| **#06** | DoD `stays ✓` | ADR-H-21: **salvage-adapt** · market component | `get_market_store()` 実装あり（部分）· 旧 stays 判定のまま DoD 記載 | `test_stays_verification::test_market_stays_deep_link` **のみ**（200 のみ） | **POST-OSS-06** |
| **#07** | DoD `stays ✓` | ADR-H-21: board 全面実装 | `board_threads` が **mock_store フォールバック**（`main.py` L388） | stays test のみ · `test_board_store.py` は unit のみ | **POST-OSS-07** |
| **#14** | DoD `✓` | 貢献度専用 UI/API | `/api/v1/contribution` 要約 API のみ | `test_contribution.py` は store 単体 · UI route △ | **POST-OSS-14** |
| **#16** | DoD `stays ✓` | Builder · theme pack salvage | `theme_packs` が **mock_store**（`main.py` L569+） | `test_theme_tokens_stays` **のみ** | **POST-OSS-16** |
| **#17** | DoD `stays ✓` | 一般ユーザー routing UI | 専用 route 未整備 · settings のみ | stays test のみ | **POST-OSS-17** |
| **#05** | B8-Q-23 `[x]` smoke | solid commit · iot_switchbot · capture persist | E2E smoke のみ · solid 未統合 | `test_observation_e2e.py` smoke ✓ · `test_observation_solid.py` **不存在** | **POST-B8-01** · POST-OSS-05 |
| **横断** | POST-B8-03 `[ ]` だが B8 完走扱い | mock_store peel | templates · preferences · lineage · votes · theme · component-board で **mock 残存** | pytest 全体緑は **パリティと無関係** | **POST-B8-03** |

---

## ADR 矛盾の経緯

| ADR | 内容 | 影響した偽 ✓ |
|-----|------|-------------|
| **ADR-H-18** | #06/#07/#16/#17 = **stays**（civ-os deep link） | DoD `stays ✓` · POST-B8-05 `[x]` |
| **ADR-H-21** | OSS 公開で stays **廃止** · salvage-adapt 必須 | 2026-06-10 確定 · **既存 ✓ は無効化**（修復は POST-OSS） |

---

## 修復方針（実装は POST-OSS · 本表は governance）

| 優先 | アクション | 所有者 |
|------|-----------|--------|
| 1 | **L-PARITY** — `ihl-design-impl-parity-check.mjs` CI 常時緑をマージ条件に | CI |
| 2 | 偽 `✓` 行を DoD マトリクスで `△` + 注記に修正（次回実装セッション） | 実装 AI |
| 3 | POST-B8-03 mock peel → POST-OSS-06/07/16/17/19 の前提 | 実装 AI |
| 4 | 各 POST-OSS 完了時 **C1–C4 PASS** 証跡を伴走ゲートログに追記 | 監査役（機械+エージェント） |

---

## 機械検証スナップショット（初回実行 2026-06-10）

```bash
node 指示/it-hercules-laboratory/scripts/ihl-design-impl-parity-check.mjs
# → FAIL 9 · Features affected: 5 (#06 #07 #16 #17 #19)
```

| 機能 | FAIL チェック |
|------|--------------|
| **#06** | C2-stays-only |
| **#07** | C2-mock-store · C2-stays-only |
| **#16** | C2-mock-store · C2-stays-only |
| **#17** | C2-stays-only |
| **#19** | C2-mock-store · C2-github-impl · C3-test-weak |

---

## AUDIT-FAIL 起票済み（参照）

| ID | ファイル |
|----|----------|
| **#19** | [`AUDIT-FAIL-19.md`](./AUDIT-FAIL-19.md) |
| #06–#07, #16–#17 | 本表 · parity `C2-stays-only` / `C2-mock-store` |

---

*2026-06-10 · ユーザー危機対応 · 偽完了の隠蔽禁止*
